from pydantic import BaseModel


class RuntimeConfig(BaseModel):
    llm_provider: str
    chat_model: str
    embedding_provider: str
    embedding_model: str
    vector_db_provider: str
    chunk_size: int
    chunk_overlap: int
    top_k: int
    rerank_top_k: int


class ConfigPatch(BaseModel):
    llm_provider: str | None = None
    chat_model: str | None = None
    embedding_provider: str | None = None
    embedding_model: str | None = None
    vector_db_provider: str | None = None
    chunk_size: int | None = None
    chunk_overlap: int | None = None
    top_k: int | None = None
    rerank_top_k: int | None = None
