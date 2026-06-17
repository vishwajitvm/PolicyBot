from app.core.config import Settings
from app.vectorstores.qdrant_store import QdrantVectorStore
from app.vectorstores.vector_store_factory import VectorStoreFactory


def test_vector_store_factory_returns_qdrant():
    store = VectorStoreFactory(Settings(vector_db_provider="qdrant")).create()
    assert isinstance(store, QdrantVectorStore)
