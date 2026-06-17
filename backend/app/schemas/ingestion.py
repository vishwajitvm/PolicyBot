from datetime import datetime

from pydantic import BaseModel


class IngestionJobCreate(BaseModel):
    source_id: str


class IngestionJobOut(BaseModel):
    job_id: str
    source_id: str
    status: str
    total_documents: int = 0
    processed_documents: int = 0
    skipped_documents: int = 0
    errors: list[str] = []
    logs: list[str] = []
    created_at: datetime
    updated_at: datetime
