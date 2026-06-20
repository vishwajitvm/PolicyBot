from app.db.repositories.base_repository import BaseRepository


class ChatMessageRepository(BaseRepository):
    collection_name = "chat_messages"