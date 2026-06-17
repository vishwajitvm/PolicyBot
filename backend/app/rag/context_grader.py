from app.vectorstores.base_vector_store import VectorSearchResult


class ContextGrader:
    def grade(self, query: str, candidates: list[VectorSearchResult]) -> float:
        if not candidates:
            return 0.0
        terms = {term.lower() for term in query.split() if len(term) > 2}
        if not terms:
            return 0.5
        overlaps = []
        for candidate in candidates:
            text = candidate.text.lower()
            overlaps.append(sum(1 for term in terms if term in text) / len(terms))
        return min(1.0, sum(overlaps) / len(overlaps))
