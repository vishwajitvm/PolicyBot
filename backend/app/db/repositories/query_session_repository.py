from app.db.repositories.base_repository import BaseRepository


class QuerySessionRepository(BaseRepository):
    collection_name = "query_sessions"
