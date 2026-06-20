from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class IngestionJob(BaseModel):
    job_id: str
    source_id: str
    source_name: Optional[str] = None
    status: str = "queued"  # queued, running, completed, failed, cancelled
    phase: str = "queued"   # discovering, loading_documents, parsing_documents, chunking, embedding, indexing, completed
    progress_percent: float = 0.0
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    elapsed_seconds: Optional[int] = None
    estimated_remaining_seconds: Optional[int] = None
    total_documents: int = 0
    processed_documents: int = 0
    skipped_documents: int = 0
    total_chunks: int = 0
    embedded_chunks: int = 0
    indexed_chunks: int = 0
    documents_per_minute: float = 0.0
    chunks_per_minute: float = 0.0
    errors: List[str] = []
    logs: List[str] = []
    error: Optional[str] = None  # failure reason
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
