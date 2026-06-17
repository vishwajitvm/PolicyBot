from app.db.mongodb import MongoDB


INDEXES: dict[str, list[str]] = {
    "sources": ["source_id"],
    "documents": ["document_id", "source_id", "file_path", "content_hash", "modified_at"],
    "document_versions": ["document_id", "version"],
    "chunks": ["chunk_id", "document_id", "source_id"],
    "ingestion_jobs": ["job_id"],
    "query_sessions": ["session_id"],
    "query_traces": ["trace_id"],
    "eval_datasets": ["dataset_id"],
    "eval_runs": ["run_id"],
    "model_configs": ["provider"],
    "vector_store_configs": ["provider"],
    "app_settings": ["key"],
}


async def ensure_indexes(mongo: MongoDB) -> None:
    db = mongo.db()
    for collection, fields in INDEXES.items():
        for field in fields:
            await db[collection].create_index(field)
