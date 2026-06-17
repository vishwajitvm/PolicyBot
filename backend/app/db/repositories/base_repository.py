from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase


class BaseRepository:
    collection_name: str

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db[self.collection_name]

    async def insert_one(self, document: dict[str, Any]) -> dict[str, Any]:
        await self.collection.insert_one(document)
        return document

    async def find_one(self, query: dict[str, Any]) -> dict[str, Any] | None:
        return await self.collection.find_one(query, {"_id": 0})

    async def find_many(self, query: dict[str, Any] | None = None, limit: int = 100) -> list[dict[str, Any]]:
        cursor = self.collection.find(query or {}, {"_id": 0}).limit(limit)
        return [item async for item in cursor]

    async def upsert_one(self, key: dict[str, Any], document: dict[str, Any]) -> dict[str, Any]:
        await self.collection.update_one(key, {"$set": document}, upsert=True)
        return document

    async def delete_one(self, query: dict[str, Any]) -> int:
        result = await self.collection.delete_one(query)
        return result.deleted_count
