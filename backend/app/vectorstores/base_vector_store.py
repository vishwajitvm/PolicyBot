from abc import ABC, abstractmethod
from typing import Any

from pydantic import BaseModel


class VectorChunk(BaseModel):
    chunk_id: str
    document_id: str
    source_id: str
    text: str
    vector: list[float]
    payload: dict[str, Any]


class VectorSearchResult(BaseModel):
    chunk_id: str
    document_id: str
    source_id: str
    text: str
    score: float
    payload: dict[str, Any]


class BaseVectorStore(ABC):
    @abstractmethod
    async def ensure_collection(self) -> None:
        pass

    @abstractmethod
    async def upsert_chunks(self, chunks: list[VectorChunk]) -> None:
        pass

    @abstractmethod
    async def search(
        self,
        query_vector: list[float],
        filters: dict[str, Any] | None = None,
        limit: int = 8,
    ) -> list[VectorSearchResult]:
        pass

    @abstractmethod
    async def delete_by_document_id(self, document_id: str) -> None:
        pass

    async def health(self) -> tuple[str, str | None]:
        return "unknown", "health check not implemented"
