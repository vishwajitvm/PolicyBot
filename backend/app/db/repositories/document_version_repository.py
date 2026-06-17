from app.db.repositories.base_repository import BaseRepository


class DocumentVersionRepository(BaseRepository):
    collection_name = "document_versions"
