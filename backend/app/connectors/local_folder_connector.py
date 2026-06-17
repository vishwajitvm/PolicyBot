import asyncio
from pathlib import Path

from app.connectors.base_connector import BaseConnector, ConnectorDocument
from app.core.constants import SUPPORTED_EXTENSIONS
from app.core.exceptions import NotFoundError


class LocalFolderConnector(BaseConnector):
    def __init__(self, folder_path: str):
        self.folder = Path(folder_path).expanduser()

    async def scan(self) -> list[ConnectorDocument]:
        if not self.folder.exists() or not self.folder.is_dir():
            raise NotFoundError(f"Local folder does not exist: {self.folder}")
        return await asyncio.to_thread(self._scan_sync)

    def _scan_sync(self) -> list[ConnectorDocument]:
        documents: list[ConnectorDocument] = []
        for path in self.folder.rglob("*"):
            if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS:
                stat = path.stat()
                documents.append(
                    ConnectorDocument(
                        path=path,
                        metadata={
                            "file_name": path.name,
                            "file_path": str(path),
                            "extension": path.suffix.lower(),
                            "modified_at_ts": stat.st_mtime,
                            "size_bytes": stat.st_size,
                            "source_type": "local_folder",
                        },
                    )
                )
        return documents
