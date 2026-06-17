from datetime import datetime

from pydantic import BaseModel


class QueryRequest(BaseModel):
    question: str
    session_id: str | None = None
    filters: dict | None = None


class Citation(BaseModel):
    document_id: str
    file_name: str
    file_path: str
    chunk_id: str
    page_number: int | None = None
    score: float
    created_at: datetime | None = None
    modified_at: datetime | None = None
    snippet: str


class QueryScores(BaseModel):
    retrieval_score: float
    freshness_score: float
    context_relevance_score: float
    citation_quality_score: float
    answer_confidence: float


class QueryResponse(BaseModel):
    answer: str
    citations: list[Citation]
    scores: QueryScores
    trace_id: str
    session_id: str
    model: str
    embedding_model: str
    vector_db: str
    latency_ms: int
