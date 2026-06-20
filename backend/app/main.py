import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.exceptions import PolicyBotError, policybot_exception_handler, unhandled_exception_handler
from app.core.logging import configure_logging
from app.db.indexes import ensure_indexes
from app.db.mongodb import mongodb
from app.vectorstores.vector_store_factory import VectorStoreFactory

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    app.state.settings = settings
    configure_logging(settings.log_level, settings.log_file_path, settings.log_max_bytes)
    app.state.vector_store = VectorStoreFactory(settings).create()
    try:
        await mongodb.connect(settings)
        await ensure_indexes(mongodb)
        logger.info("MongoDB connected")
    except Exception as exc:
        mongodb.status_detail = str(exc)
        logger.warning("MongoDB unavailable: %s", exc)
    try:
        await app.state.vector_store.ensure_collection()
        logger.info("Vector store initialized")
    except Exception as exc:
        logger.warning("Vector store unavailable: %s", exc)
    yield
    await mongodb.close()


settings = get_settings()
app = FastAPI(title=settings.app_name, lifespan=lifespan)

# Configure CORS
allowed_origins = list(settings.backend_cors_origins or [])

# Add common development origins if not already present
development_origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
for origin in development_origins:
    if origin not in allowed_origins:
        allowed_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["*"],
)
app.add_exception_handler(PolicyBotError, policybot_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)
app.include_router(api_router, prefix=settings.api_prefix)
