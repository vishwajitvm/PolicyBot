from app.vectorstores.base_vector_store import VectorSearchResult


class PromptBuilder:
    def build(self, question: str, contexts: list[VectorSearchResult]) -> str:
        context_block = "\n\n".join(
            f"[{idx + 1}] {item.payload.get('file_name', 'document')} ({item.chunk_id})\n{item.text}"
            for idx, item in enumerate(contexts)
        )
        return (
            "Answer the user using only the supplied policy context. Cite the bracketed sources. "
            "Prefer newer policy documents when content conflicts.\n\n"
            f"Question: {question}\n\nContext:\n{context_block}"
        )
