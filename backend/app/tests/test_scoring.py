from app.rag.scoring_service import ScoringService
from app.vectorstores.base_vector_store import VectorSearchResult


def test_scoring_composes_confidence():
    candidate = VectorSearchResult(chunk_id="c", document_id="d", source_id="s", text="x", score=0.8, payload={})
    scores = ScoringService().compose([candidate], {"selected_chunk_ids": ["c"]}, 0.7, 1.0)
    assert 0 < scores.answer_confidence <= 1
