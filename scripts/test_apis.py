import requests
import json
import time
import os

BASE_URL = "http://localhost:8000/api/v1"

def print_result(name, res):
    if res.status_code == 200:
        print(f"✅ {name}: PASS")
    else:
        print(f"❌ {name}: FAIL ({res.status_code}) -> {res.text}")

def run_tests():
    print("Testing PolicyBot APIs...")
    # 1. Health
    r = requests.get(f"{BASE_URL}/health")
    print_result("Health", r)

    # 2. Config
    r = requests.get(f"{BASE_URL}/config")
    print_result("Config", r)

    # 3. Chat Session Create
    r = requests.post(f"{BASE_URL}/chat/sessions", json={"title": "Test Session"})
    print_result("Chat Session Create", r)
    if r.status_code == 200:
        session_id = r.json()["data"]["id"]
        
        # List sessions
        r2 = requests.get(f"{BASE_URL}/chat/sessions")
        print_result("Chat Sessions List", r2)
        
        # Delete session
        r3 = requests.delete(f"{BASE_URL}/chat/sessions/{session_id}")
        print_result("Chat Session Delete", r3)

    # 4. Ingestion Jobs
    r = requests.get(f"{BASE_URL}/ingestion/jobs")
    print_result("Ingestion Jobs List", r)

    # 5. Dashboard Stats
    r = requests.get(f"{BASE_URL}/dashboard/stats")
    print_result("Dashboard Stats", r)

if __name__ == "__main__":
    run_tests()
