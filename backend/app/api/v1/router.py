from fastapi import APIRouter

from app.api.v1 import config, evaluation, google_drive, health, ingestion, logs, query, sources, traces, chat

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(config.router)
api_router.include_router(sources.router)
api_router.include_router(ingestion.router)
api_router.include_router(query.router)
api_router.include_router(traces.router)
api_router.include_router(evaluation.router)
api_router.include_router(google_drive.router)
api_router.include_router(logs.router)
api_router.include_router(chat.router)