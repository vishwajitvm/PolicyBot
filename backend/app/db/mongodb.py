from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import Settings


class MongoDB:
    client: AsyncIOMotorClient | None = None
    database: AsyncIOMotorDatabase | None = None
    status_detail: str | None = "not initialized"

    async def connect(self, settings: Settings) -> None:
        self.client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=1500)
        self.database = self.client[settings.mongodb_db]
        await self.client.admin.command("ping")
        self.status_detail = None

    async def close(self) -> None:
        if self.client:
            self.client.close()
        self.client = None
        self.database = None
        self.status_detail = "closed"

    def db(self) -> AsyncIOMotorDatabase:
        if self.database is None:
            raise RuntimeError("MongoDB is not connected")
        return self.database

    async def health(self) -> tuple[str, str | None]:
        if self.client is None:
            return "unavailable", self.status_detail
        try:
            await self.client.admin.command("ping")
            return "ok", None
        except Exception as exc:
            return "unavailable", str(exc)


mongodb = MongoDB()
