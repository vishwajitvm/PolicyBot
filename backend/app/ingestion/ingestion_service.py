import logging
import asyncio
import time
from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.connectors.local_folder_connector import LocalFolderConnector
from app.core.config import Settings
from app.db.repositories.chunk_repository import ChunkRepository
from app.db.repositories.document_repository import DocumentRepository
from app.db.repositories.document_version_repository import DocumentVersionRepository
from app.db.repositories.ingestion_job_repository import IngestionJobRepository
from app.db.repositories.source_repository import SourceRepository
from app.ingestion.chunking import ChunkingService
from app.ingestion.document_loader import DocumentLoader
from app.ingestion.hash_service import HashService
from app.ingestion.ingestion_job_service import IngestionJobService
from app.ingestion.metadata_extractor import MetadataExtractor
from app.models.document import Document
from app.models.ingestion_job import IngestionJob
from app.providers.base_embedding import BaseEmbeddingProvider
from app.vectorstores.base_vector_store import BaseVectorStore, VectorChunk
from app.websocket_manager import manager

logger = logging.getLogger(__name__)


class IngestionService:
    def __init__(
        self,
        db: AsyncIOMotorDatabase,
        settings: Settings,
        embedding_provider: BaseEmbeddingProvider,
        vector_store: BaseVectorStore,
    ):
        self.settings = settings
        self.embedding_provider = embedding_provider
        self.vector_store = vector_store
        self.sources = SourceRepository(db)
        self.documents = DocumentRepository(db)
        self.versions = DocumentVersionRepository(db)
        self.chunks = ChunkRepository(db)
        self.jobs = IngestionJobRepository(db)
        self.loader = DocumentLoader()
        self.hasher = HashService()
        self.metadata = MetadataExtractor()
        self.chunker = ChunkingService(settings.chunk_size, settings.chunk_overlap)
        self.job_service = IngestionJobService()
        # Log what embedding provider is being used for diagnostics
        logger.info(
            f"IngestionService initialized with embedding provider: {type(embedding_provider).__name__} "
            f"and vector store: {type(vector_store).__name__}"
        )

    def _timestamped_log(self, message: str) -> str:
        """Create a timestamped log message."""
        timestamp = datetime.utcnow().strftime("%H:%M:%S")
        return f"[{timestamp}] {message}"

    async def _update_job_progress(
        self,
        job_id: str,
        *,
        status: Optional[str] = None,
        phase: Optional[str] = None,
        progress_percent: Optional[float] = None,
        total_documents: Optional[int] = None,
        processed_documents: Optional[int] = None,
        skipped_documents: Optional[int] = None,
        total_chunks: Optional[int] = None,
        embedded_chunks: Optional[int] = None,
        indexed_chunks: Optional[int] = None,
        documents_per_minute: Optional[float] = None,
        chunks_per_minute: Optional[float] = None,
        current_document: Optional[str] = None,
        logs: Optional[List[str]] = None,
        errors: Optional[List[str]] = None,
        error: Optional[str] = None,
        started_at: Optional[datetime] = None,
        finished_at: Optional[datetime] = None,
        elapsed_seconds: Optional[int] = None,
        estimated_remaining_seconds: Optional[int] = None,
    ):
        """Update specific fields of an ingestion job."""
        update_dict = {}
        if status is not None:
            update_dict["status"] = status
        if phase is not None:
            update_dict["phase"] = phase
        if progress_percent is not None:
            update_dict["progress_percent"] = progress_percent
        if total_documents is not None:
            update_dict["total_documents"] = total_documents
        if processed_documents is not None:
            update_dict["processed_documents"] = processed_documents
        if skipped_documents is not None:
            update_dict["skipped_documents"] = skipped_documents
        if total_chunks is not None:
            update_dict["total_chunks"] = total_chunks
        if embedded_chunks is not None:
            update_dict["embedded_chunks"] = embedded_chunks
        if indexed_chunks is not None:
            update_dict["indexed_chunks"] = indexed_chunks
        if documents_per_minute is not None:
            update_dict["documents_per_minute"] = documents_per_minute
        if chunks_per_minute is not None:
            update_dict["chunks_per_minute"] = chunks_per_minute
        if current_document is not None:
            update_dict["current_document"] = current_document
        if logs is not None:
            update_dict["logs"] = logs
        if errors is not None:
            update_dict["errors"] = errors
        if error is not None:
            update_dict["error"] = error
        if started_at is not None:
            update_dict["started_at"] = started_at
        if finished_at is not None:
            update_dict["finished_at"] = finished_at
        if elapsed_seconds is not None:
            update_dict["elapsed_seconds"] = elapsed_seconds
        if estimated_remaining_seconds is not None:
            update_dict["estimated_remaining_seconds"] = estimated_remaining_seconds
        update_dict["updated_at"] = datetime.utcnow()

        if update_dict:
            await self.jobs.upsert_one({"job_id": job_id}, update_dict)
            # Notify WebSocket subscribers
            try:
                updated_job = await self.jobs.get(job_id)
                if updated_job:
                    if isinstance(updated_job, dict):
                        updated_job = IngestionJob(**updated_job)
                    await manager.send_update(job_id, updated_job.model_dump())
            except Exception as e:
                logger.error(f"Failed to send WebSocket update for job {job_id}: {e}")

    async def _calculate_eta_and_speed(
        self,
        start_time: float,
        processed_units: int,
        total_units: int,
    ) -> tuple[float, float, Optional[int]]:
        """Calculate units per minute and estimated remaining seconds."""
        if processed_units == 0:
            return 0.0, 0.0, None
        elapsed = time.time() - start_time
        units_per_minute = (processed_units / elapsed) * 60 if elapsed > 0 else 0.0
        if total_units > 0 and processed_units < total_units:
            remaining_units = total_units - processed_units
            estimated_remaining_seconds = (remaining_units / units_per_minute) * 60 if units_per_minute > 0 else None
        else:
            estimated_remaining_seconds = 0
        return units_per_minute, units_per_minute, estimated_remaining_seconds

    async def run_for_source(self, source_id: str) -> dict:
        job = None
        start_time = time.time()
        try:
            source = await self.sources.get(source_id)
            if not source:
                raise ValueError(f"Unknown source_id {source_id}")

            # Create job
            job = self.job_service.create(source_id).model_dump()
            job["source_name"] = source.get("name")
            job["status"] = "queued"
            job["phase"] = "queued"
            job["logs"] = [self._timestamped_log("Ingestion started")]
            await self.jobs.insert_one(job)

            # Update job to discovered phase
            await self._update_job_progress(
                job["job_id"],
                status="running",
                phase="discovering",
                progress_percent=0.0,
                started_at=datetime.utcnow(),
                logs=job["logs"],
            )

            # Discovering phase: scan for files
            if source["source_type"] != "local_folder":
                raise ValueError("Only local_folder ingestion is implemented in this MVP")
            connector = LocalFolderConnector(source["metadata"]["folder_path"])
            files = await connector.scan()
            total_documents = len(files)

            # Update after discovery
            await self._update_job_progress(
                job["job_id"],
                phase="loading_documents",
                progress_percent=5.0,  # Discovery complete: 5%
                total_documents=total_documents,
                logs=[*job["logs"], self._timestamped_log(f"Discovered {total_documents} files")],
            )

            # Initialize counters
            processed_documents = 0
            skipped_documents = 0
            total_chunks = 0
            embedded_chunks = 0
            indexed_chunks = 0
            logs = job["logs"]  # Start with existing logs
            errors = []

            # Process each file
            for idx, item in enumerate(files):
                file_start_time = time.time()
                current_file_name = item.path.name
                try:
                    # Update current document
                    await self._update_job_progress(
                        job["job_id"],
                        current_document=current_file_name,
                        phase="loading_documents",
                        logs=[*logs, self._timestamped_log(f"Loading {current_file_name}")],
                    )
                    logs = [*logs, self._timestamped_log(f"Loading {current_file_name}")]

                    # Load document
                    content_hash = await self.hasher.file_hash(item.path)
                    existing = await self.documents.find_by_path(source_id, str(item.path))
                    text = await self.loader.load_text(item.path)

                    # Parsing documents phase (metadata extraction)
                    await self._update_job_progress(
                        job["job_id"],
                        phase="parsing_documents",
                        logs=[*logs, self._timestamped_log(f"Parsing {current_file_name}")],
                    )
                    logs = [*logs, self._timestamped_log(f"Parsing {current_file_name}")]
                    metadata = self.metadata.extract(item.path, source, content_hash)
                    version = int(existing.get("version", 0)) + 1 if existing else 1
                    metadata["version"] = version
                    document_id = existing["document_id"] if existing else str(uuid4())

                    # Chunking phase
                    await self._update_job_progress(
                        job["job_id"],
                        phase="chunking",
                        logs=[*logs, self._timestamped_log(f"Chunking {current_file_name}")],
                    )
                    logs = [*logs, self._timestamped_log(f"Chunking {current_file_name}")]
                    chunks = self.chunker.split(text)
                    chunk_count = len(chunks)

                    # Update document in DB
                    document = Document(document_id=document_id, **metadata).model_dump()
                    await self.documents.upsert_one({"document_id": document_id}, document)
                    await self.versions.insert_one({**document, "document_version_id": str(uuid4())})

                    # Embedding phase
                    await self._update_job_progress(
                        job["job_id"],
                        phase="embedding",
                        logs=[*logs, self._timestamped_log(f"Generating embeddings for {chunk_count} chunks")],
                    )
                    logs = [*logs, self._timestamped_log(f"Generating embeddings for {chunk_count} chunks")]
                    vectors = await self.embedding_provider.embed_texts([chunk.text for chunk in chunks])

                    # Prepare vector chunks
                    vector_chunks: list[VectorChunk] = []
                    for chunk_idx, (chunk, vector) in enumerate(zip(chunks, vectors, strict=False)):
                        chunk_id = str(uuid4())
                        chunk_doc = {
                            "chunk_id": chunk_id,
                            "document_id": document_id,
                            "source_id": source_id,
                            "text": chunk.text,
                            "index": chunk.index,
                            "metadata": {**metadata, "chunk_index": chunk.index},
                        }
                        await self.chunks.upsert_one({"chunk_id": chunk_id}, chunk_doc)
                        vector_chunks.append(
                            VectorChunk(
                                chunk_id=chunk_id,
                                document_id=document_id,
                                source_id=source_id,
                                text=chunk.text,
                                vector=vector,
                                payload=chunk_doc["metadata"],
                            )
                        )

                    # Indexing phase
                    await self._update_job_progress(
                        job["job_id"],
                        phase="indexing",
                        logs=[*logs, self._timestamped_log(f"Indexing {chunk_count} chunks to vector store")],
                    )
                    logs = [*logs, self._timestamped_log(f"Indexing {chunk_count} chunks to vector store")]
                    await self.vector_store.upsert_chunks(vector_chunks)

                    # Update counters
                    unchanged = existing and existing.get("content_hash") == content_hash
                    if unchanged:
                        logs = [*logs, self._timestamped_log(f"Skipped unchanged file: {current_file_name} (ensuring vectors)")]
                        skipped_documents += 1
                    else:
                        logs = [*logs, self._timestamped_log(f"Indexed {current_file_name} with {chunk_count} chunks")]
                        processed_documents += 1

                    total_chunks += chunk_count
                    embedded_chunks += chunk_count  # Assuming all chunks get embedded
                    indexed_chunks += chunk_count   # Assuming all chunks get indexed

                    # Calculate progress based on documents processed
                    doc_progress = (processed_documents + skipped_documents) / total_documents if total_documents > 0 else 0
                    # Overall progress: discovery (5%) + loading (15%) + chunking (30%) + embedding (35%) + indexing (15%)
                    # We are in the processing phase (loading through indexing) which is 95% of total
                    # Within processing, we allocate:
                    #   loading: 15/95, parsing: 0? (we'll merge parsing into loading), chunking: 30/95, embedding: 35/95, indexing: 15/95
                    # For simplicity, we'll use the weighted progress as described in the prompt when total counts unknown,
                    # but we have total_documents now, so we can compute actual progress for documents.
                    # However, we also want to reflect chunk/embedding/indexing progress within a document.
                    # We'll compute a composite progress:
                    #   progress = 5% (discovery) +
                    #              (doc_progress * 90%)  [for loading through indexing, assuming 90% for these phases] +
                    #              (within current document progress * 10%)  [for the current document's chunking/embedding/indexing]
                    # But let's follow the prompt's weighted progress for when totals are unknown, and when known use actual document progress.
                    # We'll use:
                    #   If total_documents known: progress = 5% + (processed_documents / total_documents) * 95%
                    #   This assumes that each document takes equal time and the phases are sequential per document.
                    overall_progress = 5.0 + (doc_progress * 95.0)

                    # Calculate speeds and ETA based on documents processed
                    docs_per_minute, _, docs_eta = await self._calculate_eta_and_speed(
                        start_time, processed_documents + skipped_documents, total_documents
                    )
                    chunks_per_minute, _, chunks_eta = await self._calculate_eta_and_speed(
                        start_time, indexed_chunks, total_chunks
                    )

                    # Update job with progress
                    await self._update_job_progress(
                        job["job_id"],
                        progress_percent=min(overall_progress, 95.0),  # Cap at 95% until indexing done
                        total_documents=total_documents,
                        processed_documents=processed_documents,
                        skipped_documents=skipped_documents,
                        total_chunks=total_chunks,
                        embedded_chunks=embedded_chunks,
                        indexed_chunks=indexed_chunks,
                        documents_per_minute=round(docs_per_minute, 2),
                        chunks_per_minute=round(chunks_per_minute, 2),
                        estimated_remaining_seconds=int(docs_eta) if docs_eta is not None else None,
                        logs=logs,
                        errors=errors,
                    )
                    logs = [*logs]  # Keep logs reference updated

                except Exception as exc:
                    logger.exception("Failed to ingest %s", item.path)
                    error_msg = f"{item.path}: {exc}"
                    errors.append(error_msg)
                    logs = [*logs, self._timestamped_log(f"Error processing {current_file_name}: {exc}")]
                    # Update job with error
                    await self._update_job_progress(
                        job["job_id"],
                        errors=errors,
                        logs=logs,
                    )

            # After processing all files, move to completed phase
            elapsed_seconds = int(time.time() - start_time)
            finished_at = datetime.utcnow()

            # Final update
            await self._update_job_progress(
                job["job_id"],
                status="completed",
                phase="completed",
                progress_percent=100.0,
                finished_at=finished_at,
                elapsed_seconds=elapsed_seconds,
                estimated_remaining_seconds=0,
                logs=[*logs, self._timestamped_log("Ingestion completed")],
                errors=errors,
            )

            # Return the final job
            final_job = await self.jobs.get(job["job_id"])
            if final_job:
                if isinstance(final_job, dict):
                    final_job = IngestionJob(**final_job)
                return final_job.model_dump()
            return job

        except Exception as exc:
            logger.exception("Failed to create ingestion job for source_id %s", source_id)
            elapsed_seconds = int(time.time() - start_time)
            finished_at = datetime.utcnow()

            if job is None:
                job = self.job_service.create(source_id).model_dump()
                job["job_id"] = str(uuid4())
                job["source_id"] = source_id
                job["source_name"] = None
                job["logs"] = [self._timestamped_log("Ingestion failed to start")]
            else:
                job["source_name"] = source.get("name") if source else None
                # Ensure logs exist
                if not job.get("logs"):
                    job["logs"] = [self._timestamped_log("Ingestion failed to start")]

            # Update job with failed status and error information via _update_job_progress
            # This ensures WebSocket notifications are sent for failed jobs
            await self._update_job_progress(
                job["job_id"],
                status="failed",
                phase="failed",
                error=str(exc),  # Primary error message
                errors=[str(exc)],  # Error list
                updated_at=finished_at,
                logs=job.get("logs", []),
            )

            # Get the final job from database to return
            final_job = await self.jobs.get(job["job_id"])
            if final_job:
                if isinstance(final_job, dict):
                    final_job = IngestionJob(**final_job)
                return final_job.model_dump()
            return job