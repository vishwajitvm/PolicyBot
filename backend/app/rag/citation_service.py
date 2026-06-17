from app.schemas.query import Citation
from app.vectorstores.base_vector_store import VectorSearchResult


class CitationService:
    def build(self, contexts: list[VectorSearchResult]) -> list[Citation]:
        citations: list[Citation] = []
        for item in contexts:
            payload = item.payload or {}
            citations.append(
                Citation(
                    document_id=item.document_id,
                    file_name=payload.get("file_name", "Unknown document"),
                    file_path=payload.get("file_path", ""),
                    chunk_id=item.chunk_id,
                    page_number=payload.get("page_number"),
                    score=item.score,
                    created_at=payload.get("created_at"),
                    modified_at=payload.get("modified_at"),
                    snippet=item.text[:280],
                )
            )
        return citations

    def quality(self, citations: list[Citation]) -> float:
        if not citations:
            return 0.0
        complete = sum(1 for item in citations if item.document_id and item.chunk_id and item.snippet)
        return complete / len(citations)
