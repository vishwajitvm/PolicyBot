from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "PolicyBot Intelligence"
    app_env: str = "local"
    api_prefix: str = "/api/v1"
    backend_cors_origins_str: str = Field(
        default="http://localhost:5173,http://localhost:3000,http://localhost:8080,http://127.0.0.1:5173,http://127.0.0.1:3000,http://127.0.0.1:8080",
        alias="BACKEND_CORS_ORIGINS",
    )

    mongodb_uri: str = "mongodb://mongodb:27017"
    mongodb_db: str = "policybot"

    vector_db_provider: str = "qdrant"
    qdrant_url: str = "http://qdrant:6333"
    qdrant_collection: str = "policybot_chunks"
    qdrant_vector_size: int = 768

    llm_provider: str = "gemini"
    embedding_provider: str = "gemini"
    gemini_api_key: str = ""
    gemini_chat_model: str = "gemini-1.5-flash"
    gemini_embedding_model: str = "text-embedding-004"

    openai_api_key: str = ""
    openai_chat_model: str = ""
    openai_embedding_model: str = ""
    anthropic_api_key: str = ""
    anthropic_chat_model: str = ""
    ollama_base_url: str = "http://localhost:11434"
    ollama_chat_model: str = "llama3.1"
    ollama_embedding_model: str = "nomic-embed-text"

    pinecone_api_key: str = ""
    pinecone_index_name: str = ""
    chroma_host: str = ""
    chroma_port: str = ""

    google_client_id: str = ""
    google_client_secret: str = ""
    google_api_key: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/v1/google-drive/oauth/callback"
    google_drive_scopes: str = "https://www.googleapis.com/auth/drive.file"

    chunk_size: int = 1000
    chunk_overlap: int = 150
    top_k: int = 8
    rerank_top_k: int = 5
    trace_enabled: bool = True
    eval_enabled: bool = True
    log_level: str = "INFO"
    log_file_path: str = "logs/policybot.jsonl"
    log_max_bytes: int = 10 * 1024 * 1024

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def backend_cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins_str.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
