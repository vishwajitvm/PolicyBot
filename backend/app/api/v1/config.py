from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.common import ApiResponse
from app.schemas.config import ConfigPatch, RuntimeConfig

router = APIRouter()


def runtime_config() -> RuntimeConfig:
    settings = get_settings()
    return RuntimeConfig(
        llm_provider=settings.llm_provider,
        chat_model=settings.gemini_chat_model,
        embedding_provider=settings.embedding_provider,
        embedding_model=settings.gemini_embedding_model,
        vector_db_provider=settings.vector_db_provider,
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        top_k=settings.top_k,
        rerank_top_k=settings.rerank_top_k,
    )


@router.get("/config", response_model=ApiResponse)
async def get_config() -> ApiResponse:
    return ApiResponse(data=runtime_config().model_dump())


@router.patch("/config", response_model=ApiResponse)
async def patch_config(_: ConfigPatch) -> ApiResponse:
    return ApiResponse(
        data=runtime_config().model_dump(),
        message="Runtime config endpoint is wired; persistable live updates require config repository promotion.",
    )
