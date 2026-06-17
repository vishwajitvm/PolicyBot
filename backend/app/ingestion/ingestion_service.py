import logging
from datetime import datetime
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
from app.providers.base_embedding import BaseEmbeddingProvider
from app.vectorstores.base_vector_store import BaseVectorStore, VectorChunk

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

    async def run_for_source(self, source_id: str) -> dict:
        source = await self.sources.get(source_id)
        if not source:
            raise ValueError(f"Unknown source_id {source_id}")
        job = self.job_service.create(source_id).model_dump()
        job["status"] = "running"
        await self.jobs.insert_one(job)
        logs: list[str] = ["Ingestion started"]
        errors: list[str] = []
        processed = skipped = total = 0
        try:
            if source["source_type"] != "local_folder":
                raise ValueError("Only local_folder ingestion is implemented in this MVP")
            connector = LocalFolderConnector(source["metadata"]["folder_path"])
            files = await connector.scan()
            total = len(files)
            for item in files:
                try:
                    content_hash = await self.hasher.file_hash(item.path)
                    existing = await self.documents.find_by_path(source_id, str(item.path))
                    if existing and existing.get("content_hash") == content_hash:
                        skipped += 1
                        logs.append(f"Skipped unchanged file: {item.path.name}")
                        continue
                    text = await self.loader.load_text(item.path)
                    chunks = self.chunker.split(text)
                    metadata = self.metadata.extract(item.path, source, content_hash)
                    version = int(existing.get("version", 0)) + 1 if existing else 1
                    metadata["version"] = version
                    document_id = existing["document_id"] if existing else str(uuid4())
                    document = Document(document_id=document_id, **metadata).model_dump()
                    await self.documents.upsert_one({"document_id": document_id}, document)
                    await self.versions.insert_one({**document, "document_version_id": str(uuid4())})
                    vectors = await self.embedding_provider.embed_texts([chunk.text for chunk in chunks])
                    vector_chunks: list[VectorChunk] = []
                    for chunk, vector in zip(chunks, vectors, strict=False):
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
                    processed += 1
                    logs.append(f"Indexed {item.path.name} with {len(chunks)} chunks")
                except Exception as exc:
                    logger.exception("Failed to ingest %s", item.path)
                    errors.append(f"{item.path}: {exc}")
            status = "completed" if not errors else "completed_with_errors"
        except Exception as exc:
            status = "failed"
            errors.append(str(exc))
        job.update(
            {
                "status": status,
                "total_documents": total,
                "processed_documents": processed,
                "skipped_documents": skipped,
                "errors": errors,
                "logs": logs,
                "updated_at": datetime.utcnow(),
            }
        )
        await self.jobs.upsert_one({"job_id": job["job_id"]}, job)
        return job
