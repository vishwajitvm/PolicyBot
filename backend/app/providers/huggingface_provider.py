from app.core.config import Settings
from app.core.exceptions import NotConfiguredError
from app.providers.base_embedding import BaseEmbeddingProvider
from typing import List
from tracenest import logger

class HuggingFaceProvider(BaseEmbeddingProvider):
    provider_name = "huggingface"

    def __init__(self, settings: Settings):
        self.settings = settings
        self.embedding_model = getattr(settings, "huggingface_embedding_model", "all-MiniLM-L6-v2")
        self._embeddings = None

    def _get_embeddings(self):
        if self._embeddings is None:
            try:
                from langchain_huggingface import HuggingFaceEmbeddings
                logger.info(f"Loading HuggingFace model: {self.embedding_model}")
                self._embeddings = HuggingFaceEmbeddings(model_name=self.embedding_model)
            except ImportError as e:
                raise NotConfiguredError("langchain-huggingface package is not installed") from e
        return self._embeddings

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        embeddings = self._get_embeddings()
        return embeddings.embed_documents(texts)

    async def embed_query(self, query: str) -> List[float]:
        embeddings = self._get_embeddings()
        return embeddings.embed_query(query)
