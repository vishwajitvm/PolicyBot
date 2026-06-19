import logging
from typing import Any
from uuid import uuid5, NAMESPACE_URL

from app.core.config import Settings
from app.vectorstores.base_vector_store import BaseVectorStore, VectorChunk, VectorSearchResult

logger = logging.getLogger(__name__)


class QdrantVectorStore(BaseVectorStore):
    def __init__(self, settings: Settings):
        self.settings = settings
        self.client = None
        self._status_detail = "not initialized"

    def _load_client(self):
        if self.client is None:
            from qdrant_client import AsyncQdrantClient

            self.client = AsyncQdrantClient(url=self.settings.qdrant_url, timeout=5)
        return self.client

    async def ensure_collection(self) -> None:
        from qdrant_client.http import models

        client = self._load_client()
        collections = await client.get_collections()
        exists = any(c.name == self.settings.qdrant_collection for c in collections.collections)
        if not exists:
            await client.create_collection(
                collection_name=self.settings.qdrant_collection,
                vectors_config=models.VectorParams(
                    size=self.settings.qdrant_vector_size,
                    distance=models.Distance.COSINE,
                ),
            )
        else:
            # Collection exists, check if vector size matches
            collection_info = await client.get_collection(collection_name=self.settings.qdrant_collection)
            vector_size = collection_info.config.params.vectors.size
            if vector_size != self.settings.qdrant_vector_size:
                logger.warning(
                    f"Qdrant collection '{self.settings.qdrant_collection}' has vector size {vector_size} "
                    f"but configured size is {self.settings.qdrant_vector_size}. Recreating collection."
                )
                await client.delete_collection(collection_name=self.settings.qdrant_collection)
                await client.create_collection(
                    collection_name=self.settings.qdrant_collection,
                    vectors_config=models.VectorParams(
                        size=self.settings.qdrant_vector_size,
                        distance=models.Distance.COSINE,
                    ),
                )
        self._status_detail = None

    async def upsert_chunks(self, chunks: list[VectorChunk]) -> None:
        from qdrant_client.http import models
        import httpx

        if not chunks:
            return
        points = [
            models.PointStruct(
                id=str(uuid5(NAMESPACE_URL, chunk.chunk_id)),
                vector=chunk.vector,
                payload={
                    **chunk.payload,
                    "chunk_id": chunk.chunk_id,
                    "document_id": chunk.document_id,
                    "source_id": chunk.source_id,
                    "text": chunk.text,
                },
            )
            for chunk in chunks
        ]
        try:
            await self._load_client().upsert(self.settings.qdrant_collection, points=points)
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 400:
                try:
                    error_data = exc.response.json()
                    error_msg = error_data.get("status", {}).get("error", "")
                    if "Vector dimension error" in error_msg and "expected dim:" in error_msg and "got:" in error_msg:
                        # Extract expected and actual dimensions from the error message
                        import re
                        match = re.search(r'expected dim: (\d+), got: (\d+)', error_msg)
                        if match:
                            expected_dim = int(match.group(1))
                            actual_dim_from_error = int(match.group(2))
                            # Get actual dimension from our vectors
                            actual_dim = None
                            if chunks and len(chunks) > 0:
                                try:
                                    # Try to get the dimension from the first chunk's vector
                                    if hasattr(chunks[0], 'vector') and isinstance(chunks[0].vector, list):
                                        actual_dim = len(chunks[0].vector)
                                except Exception:
                                    pass

                            if actual_dim is not None:
                                # If the dimensions don't match what was in the error, use what we actually have
                                if actual_dim != actual_dim_from_error:
                                    logger.warning(
                                        f"Dimension mismatch in error message: expected {expected_dim}, got {actual_dim_from_error} "
                                        f"but actual vector dimension is {actual_dim}. Using actual dimension."
                                    )
                            else:
                                logger.warning("Could not determine actual vector dimension from chunks")
                                # Try to recover by recreating collection with correct dimension
                                logger.info(
                                    f"Recreating Qdrant collection '{self.settings.qdrant_collection}' with dimension {actual_dim} "
                                    f"to match embedding provider output"
                                )
                                await self._load_client().delete_collection(collection_name=self.settings.qdrant_collection)
                                await self._load_client().create_collection(
                                    collection_name=self.settings.qdrant_collection,
                                    vectors_config=models.VectorParams(
                                        size=actual_dim,
                                        distance=models.Distance.COSINE,
                                    ),
                                )
                                # Retry the operation
                                await self._load_client().upsert(self.settings.qdrant_collection, points=points)
                                return
                            else:
                                logger.warning("Could not determine actual vector dimension from chunks")
                except Exception as recover_exc:
                    logger.warning(f"Failed to auto-recover from vector dimension mismatch: {recover_exc}")
            # If we couldn't recover, raise an informative error
            try:
                error_data = exc.response.json()
                error_msg = error_data.get("status", {}).get("error", "")
                if "Vector dimension error" in error_msg and "expected dim:" in error_msg and "got:" in error_msg:
                    # Extract expected and actual dimensions from the error message
                    import re
                    match = re.search(r'expected dim: (\d+), got: (\d+)', error_msg)
                    if match:
                        expected_dim = match.group(1)
                        actual_dim = match.group(2)
                        raise Exception(
                            f"Vector dimension mismatch: Qdrant collection expects {expected_dim}-dimensional vectors, "
                            f"but embedding provider produced {actual_dim}-dimensional vectors. "
                            f"Please check your EMBEDDING_PROVIDER setting and ensure it matches your vector store configuration."
                        ) from exc
            except Exception:
                pass
            # Re-raise the original exception if we didn't handle it specifically
            raise

    async def search(
        self,
        query_vector: list[float],
        filters: dict[str, Any] | None = None,
        limit: int = 8,
    ) -> list[VectorSearchResult]:
        from qdrant_client.http import models
        import httpx

        q_filter = None
        if filters:
            q_filter = models.Filter(
                must=[
                    models.FieldCondition(key=key, match=models.MatchValue(value=value))
                    for key, value in filters.items()
                ]
            )
        try:
            points = await self._load_client().search(
                collection_name=self.settings.qdrant_collection,
                query_vector=query_vector,
                query_filter=q_filter,
                limit=limit,
                with_payload=True,
            )
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 400:
                try:
                    error_data = exc.response.json()
                    error_msg = error_data.get("status", {}).get("error", "")
                    if "Vector dimension error" in error_msg and "expected dim:" in error_msg and "got:" in error_msg:
                        # Extract expected and actual dimensions from the error message
                        import re
                        match = re.search(r'expected dim: (\d+), got: (\d+)', error_msg)
                        if match:
                            expected_dim = int(match.group(1))
                            actual_dim_from_error = int(match.group(2))
                            # Get actual dimension from our query vector
                            actual_dim = None
                            try:
                                if isinstance(query_vector, list):
                                    actual_dim = len(query_vector)
                            except Exception:
                                pass

                            if actual_dim is not None:
                                # If the dimensions don't match what was in the error, use what we actually have
                                if actual_dim != actual_dim_from_error:
                                    logger.warning(
                                        f"Dimension mismatch in error message: expected {expected_dim}, got {actual_dim_from_error} "
                                        f"but actual vector dimension is {actual_dim}. Using actual dimension."
                                    )
                            else:
                                logger.warning("Could not determine actual vector dimension from query vector")
                            # Try to recover by recreating collection with correct dimension
                            logger.info(
                                f"Recreating Qdrant collection '{self.settings.qdrant_collection}' with dimension {actual_dim} "
                                f"to match query vector dimension"
                            )
                            await self._load_client().delete_collection(collection_name=self.settings.qdrant_collection)
                            await self._load_client().create_collection(
                                collection_name=self.settings.qdrant_collection,
                                vectors_config=models.VectorParams(
                                    size=actual_dim,
                                    distance=models.Distance.COSINE,
                                ),
                            )
                            # Retry the operation
                            points = await self._load_client().search(
                                collection_name=self.settings.qdrant_collection,
                                query_vector=query_vector,
                                query_filter=q_filter,
                                limit=limit,
                                with_payload=True,
                            )
                            return [
                                VectorSearchResult(
                                    chunk_id=point.payload.get("chunk_id", ""),
                                    document_id=point.payload.get("document_id", ""),
                                    source_id=point.payload.get("source_id", ""),
                                    text=point.payload.get("text", ""),
                                    score=float(point.score),
                                    payload=point.payload or {},
                                )
                                for point in points
                            ]
                except Exception as recover_exc:
                    logger.warning(f"Failed to auto-recover from vector dimension mismatch: {recover_exc}")
            # If we couldn't recover, raise an informative error
            try:
                error_data = exc.response.json()
                error_msg = error_data.get("status", {}).get("error", "")
                if "Vector dimension error" in error_msg and "expected dim:" in error_msg and "got:" in error_msg:
                    # Extract expected and actual dimensions from the error message
                    import re
                    match = re.search(r'expected dim: (\d+), got: (\d+)', error_msg)
                    if match:
                        expected_dim = match.group(1)
                        actual_dim = match.group(2)
                        raise Exception(
                            f"Vector dimension mismatch: Qdrant collection expects {expected_dim}-dimensional vectors, "
                            f"but query vector has {actual_dim} dimensions. "
                            f"Please check your EMBEDDING_PROVIDER setting and ensure it matches your vector store configuration."
                        ) from exc
            except Exception:
                pass
            # Re-raise the original exception if we didn't handle it specifically
            raise
        return [
            VectorSearchResult(
                chunk_id=point.payload.get("chunk_id", ""),
                document_id=point.payload.get("document_id", ""),
                source_id=point.payload.get("source_id", ""),
                text=point.payload.get("text", ""),
                score=float(point.score),
                payload=point.payload or {},
            )
            for point in points
        ]

    async def delete_by_document_id(self, document_id: str) -> None:
        from qdrant_client.http import models

        await self._load_client().delete(
            collection_name=self.settings.qdrant_collection,
            points_selector=models.FilterSelector(
                filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="document_id",
                            match=models.MatchValue(value=document_id),
                        )
                    ]
                )
            ),
        )

    async def health(self) -> tuple[str, str | None]:
        try:
            await self._load_client().get_collections()
            return "ok", None
        except Exception as exc:
            return "unavailable", str(exc)
