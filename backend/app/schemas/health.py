from pydantic import BaseModel


class DependencyHealth(BaseModel):
    status: str
    detail: str | None = None


class HealthResponse(BaseModel):
    app: str
    environment: str
    status: str
    mongodb: DependencyHealth
    vector_store: DependencyHealth
