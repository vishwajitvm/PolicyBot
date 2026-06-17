from motor.motor_asyncio import AsyncIOMotorDatabase

from app.providers.base_embedding import BaseEmbeddingProvider
from app.vectorstores.base_vector_store import BaseVectorStore, VectorSearchResult


class RetrievalService:
    def __init__(self, embedding_provider: BaseEmbeddingProvider, vector_store: BaseVectorStore, db: AsyncIOMotorDatabase):
        self.embedding_provider = embedding_provider
        self.vector_store = vector_store
        self.db = db

    async def vector_search(self, query: str, filters: dict | None, top_k: int) -> list[VectorSearchResult]:
        query_vector = await self.embedding_provider.embed_query(query)
        return await self.vector_store.search(query_vector, filters=filters, limit=top_k)

    async def keyword_search(self, query: str, limit: int) -> list[VectorSearchResult]:
        cursor = self.db["chunks"].find({"$text": {"$search": query}}, {"_id": 0}).limit(limit)
        try:
            docs = [item async for item in cursor]
        except Exception:
            docs = []
        return [
            VectorSearchResult(
                chunk_id=doc["chunk_id"],
                document_id=doc["document_id"],
                source_id=doc["source_id"],
                text=doc["text"],
                score=0.45,
                payload=doc.get("metadata", {}),
            )
            for doc in docs
        ]
