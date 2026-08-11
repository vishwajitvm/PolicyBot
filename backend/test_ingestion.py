import asyncio
import httpx
import json

async def main():
    async with httpx.AsyncClient(timeout=60.0) as client:
        # Get local source
        resp = await client.get('http://localhost:8000/api/v1/sources')
        sources = resp.json().get('data', [])
        source_id = None
        for s in sources:
            if s.get('source_type') == 'local_folder':
                source_id = s.get('source_id')
                break
        if not source_id:
            print('No local source found')
            return
            
        print(f'Starting ingestion for source {source_id}...')
        resp = await client.post('http://localhost:8000/api/v1/ingestion/jobs', json={'source_id': source_id})
        job_id = resp.json().get('data', {}).get('job_id')
        print(f'Job ID: {job_id}')
        
        while True:
            resp = await client.get('http://localhost:8000/api/v1/ingestion/jobs')
            jobs = resp.json().get('data', [])
            job = next((j for j in jobs if j.get('job_id') == job_id), None)
            if not job:
                print('Job not found')
                break
            
            print(f"Status: {job.get('status')} - Phase: {job.get('phase')} - Progress: {job.get('progress_percent')}%")
            if job.get('status') in ['completed', 'failed', 'cancelled']:
                if job.get('status') == 'failed':
                    print('Errors:', job.get('errors'))
                break
            await asyncio.sleep(2)

asyncio.run(main())
