import asyncio
import os
import sys

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.mongodb import mongodb
from app.core.config import get_settings
from httpx import AsyncClient

async def wipe_db():
    settings = get_settings()
    print("Connecting to MongoDB...")
    await mongodb.connect(settings)
    
    db = mongodb.db()
    
    print("Deleting documents from MongoDB collections...")
    collections = ["ingestion_jobs", "documents", "document_versions"]
    for coll in collections:
        result = await db[coll].delete_many({})
        print(f"  - Deleted {result.deleted_count} items from {coll}")
    
    print("\nConnecting to Qdrant...")
    async with AsyncClient() as client:
        # Delete collection in Qdrant
        qdrant_url = settings.qdrant_url or "http://localhost:6333"
        collection_name = settings.qdrant_collection
        
        # Check if collection exists
        res = await client.get(f"{qdrant_url}/collections/{collection_name}")
        if res.status_code == 200:
            print(f"Deleting collection {collection_name} in Qdrant...")
            res = await client.delete(f"{qdrant_url}/collections/{collection_name}")
            if res.status_code == 200:
                print("  - Successfully deleted Qdrant collection.")
            else:
                print(f"  - Failed to delete Qdrant collection: {res.text}")
        else:
            print(f"  - Qdrant collection {collection_name} does not exist. Skipping.")

    await mongodb.close()
    print("\nWipe complete!")

if __name__ == "__main__":
    asyncio.run(wipe_db())
