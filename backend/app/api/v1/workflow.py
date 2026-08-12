from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import os

from app.core.config import get_settings
from app.schemas.common import ApiResponse

router = APIRouter(tags=["workflow"])

class WorkflowUpdate(BaseModel):
    llm_fallback_providers: List[str]
    embedding_fallback_providers: List[str]

@router.get("/config")
async def get_workflow_config():
    settings = get_settings()
    llm_str = getattr(settings, "llm_fallback_providers", "")
    emb_str = getattr(settings, "embedding_fallback_providers", "")
    
    llms = [p.strip() for p in llm_str.split(",")] if llm_str else ["gemini", "openai", "ollama"]
    embs = [p.strip() for p in emb_str.split(",")] if emb_str else ["gemini", "openai", "huggingface"]
    
    return ApiResponse(data={
        "llm_fallback_providers": llms,
        "embedding_fallback_providers": embs
    })

@router.post("/config")
async def update_workflow_config(config: WorkflowUpdate):
    settings = get_settings()
    
    llm_str = ",".join(config.llm_fallback_providers)
    emb_str = ",".join(config.embedding_fallback_providers)
    
    # Update in memory
    settings.llm_fallback_providers = llm_str
    settings.embedding_fallback_providers = emb_str
    
    # Update .env file
    env_path = os.path.join(os.getcwd(), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            lines = f.readlines()
            
        with open(env_path, "w") as f:
            for line in lines:
                if line.startswith("LLM_FALLBACK_PROVIDERS="):
                    f.write(f"LLM_FALLBACK_PROVIDERS={llm_str}\n")
                elif line.startswith("EMBEDDING_FALLBACK_PROVIDERS="):
                    f.write(f"EMBEDDING_FALLBACK_PROVIDERS={emb_str}\n")
                else:
                    f.write(line)
                    
    return ApiResponse(message="Workflow configuration updated successfully.")
