from abc import ABC, abstractmethod
from pathlib import Path


class ConnectorDocument:
    def __init__(self, path: Path, metadata: dict):
        self.path = path
        self.metadata = metadata


class BaseConnector(ABC):
    @abstractmethod
    async def scan(self) -> list[ConnectorDocument]:
        pass
