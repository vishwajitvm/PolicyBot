from app.rag.freshness_resolver import FreshnessResolver
from app.vectorstores.base_vector_store import VectorSearchResult


def test_freshness_resolver_prefers_latest_version():
    old = VectorSearchResult(chunk_id="old", document_id="d1", source_id="s", text="old", score=0.99, payload={"modified_at": "2024-01-01", "version": 1})
    new = VectorSearchResult(chunk_id="new", document_id="d2", source_id="s", text="new", score=0.8, payload={"modified_at": "2025-01-01", "version": 2})
    selected, decision = FreshnessResolver().resolve([old, new])
    assert selected[0].chunk_id == "new"
    assert decision["strategy"] == "prefer_latest_valid_document"
