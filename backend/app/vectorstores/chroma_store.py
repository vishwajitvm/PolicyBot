from typing import Any

from app.core.exceptions import NotConfiguredError
from app.vectorstores.base_vector_store import BaseVectorStore, VectorChunk, VectorSearchResult


class ChromaVectorStore(BaseVectorStore):
    async def ensure_collection(self) -> None:
        raise NotConfiguredError("Chroma adapter skeleton is present but not implemented yet")

    async def upsert_chunks(self, chunks: list[VectorChunk]) -> None:
        raise NotConfiguredError("Chroma adapter skeleton is present but not implemented yet")

    async def search(self, query_vector: list[float], filters: dict[str, Any] | None = None, limit: int = 8) -> list[VectorSearchResult]:
        raise NotConfiguredError("Chroma adapter skeleton is present but not implemented yet")

    async def delete_by_document_id(self, document_id: str) -> None:
        raise NotConfiguredError("Chroma adapter skeleton is present but not implemented yet")
