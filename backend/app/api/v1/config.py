from tracenest import logger
from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.common import ApiResponse
from app.schemas.config import ConfigPatch, RuntimeConfig
from pydantic import BaseModel
import os
import re

class ApiKeyUpdate(BaseModel):
    provider: str
    key: str


router = APIRouter()


def runtime_config() -> RuntimeConfig:
    try:
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
    except Exception as exc:
        logger.error("Failed to build runtime config")
        # Return a default config or raise? We'll raise to be caught by the outer try-except in the route handlers.
        raise


@router.get("/config", response_model=ApiResponse)
async def get_config() -> ApiResponse:
    try:
        return ApiResponse(data=runtime_config().model_dump(), message="Configuration retrieved")
    except Exception as exc:
        logger.error("Failed to get configuration")
        return ApiResponse(success=False, message=str(exc))


@router.patch("/config", response_model=ApiResponse)
async def patch_config(_: ConfigPatch) -> ApiResponse:
    try:
        return ApiResponse(
            data=runtime_config().model_dump(),
            message="Runtime config endpoint is wired; persistable live updates require config repository promotion.",
        )
    except Exception as exc:
        logger.error("Failed to patch configuration")
        return ApiResponse(success=False, message=str(exc))

@router.post("/config/keys")
async def update_keys(body: ApiKeyUpdate):
    try:
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
        
        # Map provider to env key
        key_map = {
            "gemini": "GEMINI_API_KEY",
            "openai": "OPENAI_API_KEY",
            "mistral": "MISTRAL_API_KEY",
            "groq": "GROQ_API_KEY",
            "deepseek": "DEEPSEEK_API_KEY",
            "huggingface": "HUGGINGFACE_API_KEY",
            "nvidia": "NVIDIA_API_KEY"
        }
        
        env_key = key_map.get(body.provider.lower())
        if not env_key:
            return ApiResponse(success=False, message="Invalid provider")
            
        # Update .env file
        if os.path.exists(env_path):
            with open(env_path, 'r') as f:
                content = f.read()
                
            if f"{env_key}=" in content:
                content = re.sub(rf"{env_key}=.*", f"{env_key}={body.key}", content)
            else:
                content += f"\n{env_key}={body.key}\n"
                
            with open(env_path, 'w') as f:
                f.write(content)
                
            # Reload settings
            get_settings.cache_clear()
            get_settings()
            
        return {"success": True}
    except Exception as exc:
        logger.error(f"Failed to update API key: {exc}")
        return {"success": False, "message": str(exc)}
