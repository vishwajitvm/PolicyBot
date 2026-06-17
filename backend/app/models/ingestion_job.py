from datetime import datetime

from pydantic import BaseModel, Field


class IngestionJob(BaseModel):
    job_id: str
    source_id: str
    status: str = "queued"
    total_documents: int = 0
    processed_documents: int = 0
    skipped_documents: int = 0
    errors: list[str] = []
    logs: list[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
