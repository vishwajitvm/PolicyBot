from app.db.repositories.base_repository import BaseRepository


class ChatSessionRepository(BaseRepository):
    collection_name = "chat_sessions"