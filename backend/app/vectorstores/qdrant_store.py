from typing import Any
from uuid import uuid5, NAMESPACE_URL

from app.core.config import Settings
from app.vectorstores.base_vector_store import BaseVectorStore, VectorChunk, VectorSearchResult


class QdrantVectorStore(BaseVectorStore):
    def __init__(self, settings: Settings):
        self.settings = settings
        self.client = None
        self._status_detail = "not initialized"

    def _load_client(self):
        if self.client is None:
            from qdrant_client import AsyncQdrantClient

            self.client = AsyncQdrantClient(url=self.settings.qdrant_url, timeout=5)
        return self.client

    async def ensure_collection(self) -> None:
        from qdrant_client.http import models

        client = self._load_client()
        collections = await client.get_collections()
        exists = any(c.name == self.settings.qdrant_collection for c in collections.collections)
        if not exists:
            await client.create_collection(
                collection_name=self.settings.qdrant_collection,
                vectors_config=models.VectorParams(
                    size=self.settings.qdrant_vector_size,
                    distance=models.Distance.COSINE,
                ),
            )
        self._status_detail = None

    async def upsert_chunks(self, chunks: list[VectorChunk]) -> None:
        from qdrant_client.http import models

        if not chunks:
            return
        points = [
            models.PointStruct(
                id=str(uuid5(NAMESPACE_URL, chunk.chunk_id)),
                vector=chunk.vector,
                payload={
                    **chunk.payload,
                    "chunk_id": chunk.chunk_id,
                    "document_id": chunk.document_id,
                    "source_id": chunk.source_id,
                    "text": chunk.text,
                },
            )
            for chunk in chunks
        ]
        await self._load_client().upsert(self.settings.qdrant_collection, points=points)

    async def search(
        self,
        query_vector: list[float],
        filters: dict[str, Any] | None = None,
        limit: int = 8,
    ) -> list[VectorSearchResult]:
        from qdrant_client.http import models

        q_filter = None
        if filters:
            q_filter = models.Filter(
                must=[
                    models.FieldCondition(key=key, match=models.MatchValue(value=value))
                    for key, value in filters.items()
                ]
            )
        points = await self._load_client().search(
            collection_name=self.settings.qdrant_collection,
            query_vector=query_vector,
            query_filter=q_filter,
            limit=limit,
            with_payload=True,
        )
        return [
            VectorSearchResult(
                chunk_id=point.payload.get("chunk_id", ""),
                document_id=point.payload.get("document_id", ""),
                source_id=point.payload.get("source_id", ""),
                text=point.payload.get("text", ""),
                score=float(point.score),
                payload=point.payload or {},
            )
            for point in points
        ]

    async def delete_by_document_id(self, document_id: str) -> None:
        from qdrant_client.http import models

        await self._load_client().delete(
            collection_name=self.settings.qdrant_collection,
            points_selector=models.FilterSelector(
                filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="document_id",
                            match=models.MatchValue(value=document_id),
                        )
                    ]
                )
            ),
        )

    async def health(self) -> tuple[str, str | None]:
        try:
            await self._load_client().get_collections()
            return "ok", None
        except Exception as exc:
            return "unavailable", str(exc)
