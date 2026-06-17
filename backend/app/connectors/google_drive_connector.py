from app.connectors.base_connector import BaseConnector, ConnectorDocument
from app.core.exceptions import NotConfiguredError


class GoogleDriveConnector(BaseConnector):
    async def scan(self) -> list[ConnectorDocument]:
        raise NotConfiguredError("Google Drive download/export connector is scaffolded but not implemented yet")
