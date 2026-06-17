from app.db.repositories.base_repository import BaseRepository


class ConfigRepository(BaseRepository):
    collection_name = "app_settings"
