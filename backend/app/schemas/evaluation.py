from pydantic import BaseModel


class DatasetCreate(BaseModel):
    name: str
    items: list[dict] = []


class DatasetUpdate(BaseModel):
    name: str
    items: list[dict] = []


class EvaluationRunCreate(BaseModel):
    dataset_id: str


class EvaluationRunOut(BaseModel):
    run_id: str
    dataset_id: str
    accuracy: float
    passed: int
    failed: int
    details: list[dict] = []
