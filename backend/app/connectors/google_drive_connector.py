from app.connectors.base_connector import BaseConnector, ConnectorDocument
from app.core.exceptions import NotConfiguredError
from tracenest import logger

class GoogleDriveConnector(BaseConnector):
    def __init__(self, metadata: dict):
        self.metadata = metadata
        self.folder_id = metadata.get("folder_id")
        self.access_token = metadata.get("access_token") # We expect this from DB eventually

    async def scan(self) -> list[ConnectorDocument]:
        logger.info(f"Scanning Google Drive folder: {self.folder_id}")
        if not self.access_token:
            logger.warning("Google Drive connector is missing an access token. OAuth token storage is pending. Skipping scan.")
            # Yielding an empty list for now so the ingestion job completes without crashing,
            # allowing the user to trace the process gracefully.
            return []
            
        # In a real implementation:
        # 1. Use google-api-python-client to list files in self.folder_id
        # 2. Download files to a temp directory
        # 3. Return a list of ConnectorDocument pointing to the downloaded files.
        raise NotConfiguredError("Google Drive download/export connector requires Google API client implementation.")
