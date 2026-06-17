from pydantic import BaseModel

from app.vectorstores.base_vector_store import VectorSearchResult


class RAGContext(BaseModel):
    question: str
    normalized_query: str
    candidates: list[VectorSearchResult] = []
    selected: list[VectorSearchResult] = []
    scores: dict = {}
    freshness_decision: dict = {}
