import asyncio
import httpx
import json

BASE_URL = "http://localhost:8000/api/v1"

async def test_apis():
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("Testing all APIs...")
        errors = 0

        async def check(method, url, **kwargs):
            nonlocal errors
            resp = await client.request(method, url, **kwargs)
            if resp.status_code >= 400:
                print(f"FAILED: {method} {url} -> {resp.status_code}")
                print(f"RESPONSE: {resp.text}")
                errors += 1
            else:
                body = resp.json()
                if not body.get("success", True):
                    print(f"FAILED (Business Error): {method} {url} -> {resp.status_code}")
                    print(f"RESPONSE: {resp.text}")
                    errors += 1
                else:
                    print(f"OK: {method} {url} -> {resp.status_code}")
            return resp

        # 1. Config
        await check("GET", f"{BASE_URL}/config")
        await check("PATCH", f"{BASE_URL}/config", json={"top_k": 5})

        # 2. Sources
        await check("GET", f"{BASE_URL}/sources")
        resp = await check("POST", f"{BASE_URL}/sources/local-folder", json={"name": "Test Source", "folder_path": "/app/data"})
        source_id = None
        if resp.status_code == 200 and resp.json().get("success"):
            source_id = resp.json().get("data", {}).get("source_id")

        resp = await check("POST", f"{BASE_URL}/sources/google-drive", json={"name": "Drive", "drive_item_id": "123", "folder_name": "folder", "oauth_token": "token"})

        # 3. Ingestion
        if source_id:
            await check("POST", f"{BASE_URL}/ingestion/jobs", json={"source_id": source_id})
        await check("GET", f"{BASE_URL}/ingestion/jobs")

        # 4. Chat Sessions
        resp = await check("POST", f"{BASE_URL}/chat/sessions", json={"title": "Test Chat"})
        session_id = None
        if resp.status_code == 200 and resp.json().get("success"):
            session_id = resp.json().get("data", {}).get("id")

        await check("GET", f"{BASE_URL}/chat/sessions")

        if session_id:
            await check("GET", f"{BASE_URL}/chat/sessions/{session_id}")
            await check("PATCH", f"{BASE_URL}/chat/sessions/{session_id}", json={"title": "Renamed Chat"})
            
            # Chat Messages
            msg_resp = await check("POST", f"{BASE_URL}/chat/sessions/{session_id}/messages", json={"question": "Hello world!"})
            
            # Get trace from message if exists
            if msg_resp.status_code == 200 and msg_resp.json().get("success"):
                assistant_msg = msg_resp.json().get("data", {}).get("assistant_message", {})
                msg_id = assistant_msg.get("id")
                if msg_id:
                    trace_resp = await check("GET", f"{BASE_URL}/chat/messages/{msg_id}/traces")
                    
            await check("DELETE", f"{BASE_URL}/chat/sessions/{session_id}")

        if source_id:
            await check("DELETE", f"{BASE_URL}/sources/{source_id}")

        print(f"Finished with {errors} errors.")

if __name__ == "__main__":
    asyncio.run(test_apis())
