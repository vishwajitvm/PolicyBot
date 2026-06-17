from app.core.config import Settings
from app.core.exceptions import NotConfiguredError
from app.vectorstores.base_vector_store import BaseVectorStore
from app.vectorstores.chroma_store import ChromaVectorStore
from app.vectorstores.mongo_vector_store import MongoVectorStore
from app.vectorstores.pinecone_store import PineconeVectorStore
from app.vectorstores.qdrant_store import QdrantVectorStore


class VectorStoreFactory:
    def __init__(self, settings: Settings):
        self.settings = settings

    def create(self) -> BaseVectorStore:
        provider = self.settings.vector_db_provider.lower()
        if provider == "qdrant":
            return QdrantVectorStore(self.settings)
        if provider == "pinecone":
            return PineconeVectorStore()
        if provider == "chroma":
            return ChromaVectorStore()
        if provider in {"mongo", "mongodb", "atlas"}:
            return MongoVectorStore()
        raise NotConfiguredError(f"Unsupported vector store provider: {provider}")
