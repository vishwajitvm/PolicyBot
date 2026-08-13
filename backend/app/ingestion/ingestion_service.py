from app.core.time import get_current_time
from tracenest import logger
import asyncio
import time
from datetime import datetime, timezone
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
from app.ingestion.cancellation import get_cancellation_event, clear_cancellation_event
from app.models.document import Document
from app.models.ingestion_job import IngestionJob
from app.providers.base_embedding import BaseEmbeddingProvider
from app.vectorstores.base_vector_store import BaseVectorStore, VectorChunk
from app.websocket_manager import manager
from app.ingestion.langgraph_workflow import create_ingestion_graph


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
        self.job_service = IngestionJobService()
        self.workflow = create_ingestion_graph(self.embedding_provider, self.vector_store)
        logger.info(
            f"IngestionService initialized with embedding provider: {type(embedding_provider).__name__} "
            f"and vector store: {type(vector_store).__name__}"
        )

    def _timestamped_log(self, message: str) -> str:
        """Create a timestamped log message."""
        timestamp = get_current_time().strftime("%H:%M:%S")
        return f"[{timestamp}] {message}"

    async def _update_job_progress(self, job_id: str, **kwargs):
        """Update specific fields of an ingestion job."""
        kwargs["updated_at"] = get_current_time()
        await self.jobs.upsert_one({"job_id": job_id}, kwargs)
        
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

    async def _embed_and_index_batch(self, batch: list, document_id: str, source_id: str, metadata: dict, job_id: str, logs: list):
        """Process a batch of text chunks concurrently."""
        try:
            if not batch:
                return 0
                
            # Log a small snippet of the first chunk to the UI
            snippet = batch[0].text[:70].replace('\n', ' ')
            logs.append(f"Chunking preview ({len(batch)} chunks): '{snippet}...'")
            
            vectors = await self.embedding_provider.embed_texts([chunk.text for chunk in batch])
            vector_chunks = []
            
            for chunk_idx, (chunk, vector) in enumerate(zip(batch, vectors, strict=False)):
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
            
            await self.vector_store.upsert_chunks(vector_chunks)
            return len(batch)
        except Exception as e:
            logger.error(f"Batch embedding/indexing failed: {e}")
            raise e

    async def run_for_source(self, source_id: str, job_id: str = None) -> dict:
        job = None
        start_time = time.time()
        try:
            source = await self.sources.get(source_id)
            if not source:
                raise ValueError(f"Unknown source_id {source_id}")

            if job_id:
                job = await self.jobs.find_one({"job_id": job_id})
                if not job:
                    raise ValueError(f"Unknown job_id {job_id}")
            else:
                # Create job
                job = self.job_service.create(source_id).model_dump()
                job["source_name"] = source.get("name")
                job["status"] = "queued"
                job["phase"] = "queued"
                job["logs"] = [self._timestamped_log("Ingestion started")]
                await self.jobs.insert_one(job)

            await self._update_job_progress(
                job["job_id"],
                status="running",
                phase="discovering",
                progress_percent=0.0,
                started_at=get_current_time(),
                logs=job["logs"],
            )

            # Discovering phase
            if source["source_type"] == "local_folder":
                connector = LocalFolderConnector(source["metadata"]["folder_path"])
                files = await connector.scan()
            elif source["source_type"] == "google_drive":
                from app.connectors.google_drive_connector import GoogleDriveConnector
                # Pass source metadata config for Google Drive auth if implemented, otherwise it will mock/fail
                connector = GoogleDriveConnector(source["metadata"])
                files = await connector.scan()
            else:
                raise ValueError(f"Source type {source['source_type']} not supported")

            total_documents = len(files)
            
            await self._update_job_progress(
                job["job_id"],
                phase="loading_documents",
                progress_percent=5.0,
                total_documents=total_documents,
                logs=[*job["logs"], self._timestamped_log(f"Discovered {total_documents} files")],
            )

            processed_documents = 0
            skipped_documents = 0
            total_chunks = 0
            embedded_chunks = 0
            indexed_chunks = 0
            logs = job["logs"]
            errors = []

            for idx, item in enumerate(files):
                if get_cancellation_event(job["job_id"]).is_set():
                    raise asyncio.CancelledError("Job cancelled by user")
                file_start_time = time.time()
                current_file_name = item.path.name
                try:
                    await self._update_job_progress(
                        job["job_id"],
                        current_document=current_file_name,
                        phase="loading_documents",
                        logs=[*logs, self._timestamped_log(f"Loading {current_file_name}")],
                    )
                    logs = [*logs, self._timestamped_log(f"Loading {current_file_name}")]

                    content_hash = await self.hasher.file_hash(item.path)
                    existing = await self.documents.find_by_path(source_id, str(item.path))

                    metadata = self.metadata.extract(item.path, source, content_hash)
                    version = int(existing.get("version", 0)) + 1 if existing else 1
                    metadata["version"] = version
                    document_id = existing["document_id"] if existing else str(uuid4())

                    document = Document(document_id=document_id, **metadata).model_dump()
                    await self.documents.upsert_one({"document_id": document_id}, document)
                    await self.versions.insert_one({**document, "document_version_id": str(uuid4())})

                    # Run LangGraph Workflow for the document
                    initial_state = {
                        "job_id": job["job_id"],
                        "file_path": str(item.path),
                        "file_name": current_file_name,
                        "source_id": source_id,
                        "document_id": document_id,
                        "chunks": [],
                        "embedded_vectors": [],
                        "error": None,
                        "logs": [],
                        "total_documents": total_documents,
                        "processed_documents": processed_documents,
                        "embedded_chunks_count": 0,
                        "total_chunks_count": 0
                    }
                    
                    final_state = await self.workflow.ainvoke(initial_state)
                    
                    if final_state.get("error"):
                        raise Exception(final_state["error"])
                        
                    processed_total = final_state.get("embedded_chunks_count", 0)
                    embedded_chunks += processed_total
                    indexed_chunks += processed_total
                    total_chunks += final_state.get("total_chunks_count", 0)
                    
                    if final_state.get("logs"):
                        logs.extend(final_state["logs"])

                    logs = [*logs, self._timestamped_log(f"Successfully processed {current_file_name} with LangGraph")]
                    processed_documents += 1

                    overall_progress = 5.0 + (((processed_documents + skipped_documents) / total_documents) * 95.0)

                    docs_per_minute, _, docs_eta = await self._calculate_eta_and_speed(
                        start_time, processed_documents + skipped_documents, total_documents
                    )
                    chunks_per_minute, _, chunks_eta = await self._calculate_eta_and_speed(
                        start_time, indexed_chunks, total_chunks
                    )

                    await self._update_job_progress(
                        job["job_id"],
                        progress_percent=min(overall_progress, 99.0),
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

                except Exception as exc:
                    if isinstance(exc, asyncio.CancelledError):
                        raise
                    logger.error(f"Failed to ingest {item.path}")
                    error_msg = f"{item.path}: {exc}"
                    errors.append(error_msg)
                    logs = [*logs, self._timestamped_log(f"Error processing {current_file_name}: {exc}")]
                    await self._update_job_progress(
                        job["job_id"],
                        errors=errors,
                        logs=logs,
                    )

            elapsed_seconds = int(time.time() - start_time)
            finished_at = get_current_time()
            
            # If all failed, mark as failed instead of completed
            final_status = "completed" if processed_documents > 0 or skipped_documents > 0 else "failed"
            
            await self._update_job_progress(
                job["job_id"],
                status=final_status,
                phase="completed" if final_status == "completed" else "failed",
                progress_percent=100.0,
                finished_at=finished_at,
                elapsed_seconds=elapsed_seconds,
                estimated_remaining_seconds=0,
                logs=[*logs, self._timestamped_log("Ingestion loop finished")],
                errors=errors,
            )

            final_job = await self.jobs.get(job["job_id"])
            if final_job:
                if isinstance(final_job, dict):
                    final_job = IngestionJob(**final_job)
                return final_job.model_dump()
            return job

        except Exception as exc:
            logger.error(f"Failed to create/run ingestion job for source_id {source_id}")
            elapsed_seconds = int(time.time() - start_time)
            finished_at = get_current_time()

            if job is None:
                job = self.job_service.create(source_id).model_dump()
                job["job_id"] = str(uuid4())
                job["source_id"] = source_id
                job["source_name"] = None
                job["logs"] = [self._timestamped_log("Ingestion failed to start")]

            job_id = job.get("job_id")
            if job_id:
                try:
                    job_from_db = await self.jobs.get(job_id)
                    if job_from_db:
                        job = job_from_db
                except Exception:
                    pass
                
            if job.get("status") != "cancelled":
                job["status"] = "failed"
                job["phase"] = "failed"
                job["error"] = str(exc)
                job["errors"] = job.get("errors", []) + [str(exc)]
                job["finished_at"] = finished_at
                job["updated_at"] = finished_at
                
            if job_id:
                try:
                    await self.jobs.upsert_one({"job_id": job_id}, job)
                except Exception:
                    # If it wasn't in the DB yet, insert it
                    await self.jobs.insert_one(job)

            if job.get("status") == "cancelled":
                logger.info(f"Ingestion job cancelled explicitly: {job_id}")
            else:
                logger.error(f"Ingestion job failed: {job_id}")
            
            if job_id:
                from app.api.v1.ingestion import _sanitize_for_json
                await manager.send_update(job_id, _sanitize_for_json(job))
                
            return job
        finally:
            if job and job.get("job_id"):
                clear_cancellation_event(job["job_id"])