from app.db.repositories.base_repository import BaseRepository


class ChunkRepository(BaseRepository):
    collection_name = "chunks"
