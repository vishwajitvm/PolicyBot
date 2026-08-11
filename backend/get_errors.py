import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        resp = await client.get('http://localhost:8000/api/v1/ingestion/jobs')
        jobs = resp.json().get('data', [])
        for job in jobs[-5:]:
            print(f"Job: {job.get('job_id')}")
            print(f"Status: {job.get('status')}")
            print(f"Errors: {job.get('errors')}")
            print("-" * 20)

asyncio.run(main())
