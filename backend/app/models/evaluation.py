from datetime import datetime

from pydantic import BaseModel, Field


class EvaluationDataset(BaseModel):
    dataset_id: str
    name: str
    items: list[dict] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)


class EvaluationRun(BaseModel):
    run_id: str
    dataset_id: str
    accuracy: float = 0
    passed: int = 0
    failed: int = 0
    details: list[dict] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
