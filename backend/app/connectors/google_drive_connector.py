from app.connectors.base_connector import BaseConnector, ConnectorDocument
from app.core.exceptions import NotConfiguredError
from app.core.config import get_settings
from tracenest import logger
import httpx
import uuid
import tempfile
from pathlib import Path

class GoogleDriveConnector(BaseConnector):
    def __init__(self, metadata: dict):
        self.metadata = metadata
        # Handle cases where folder_id might still be a full URL if it bypassed the frontend regex
        raw_id = metadata.get("folder_id") or metadata.get("id") or ""
        import re
        match = re.search(r'[-\w]{25,}', raw_id)
        self.folder_id = match.group(0) if match else raw_id
        self.api_key = get_settings().google_api_key

    async def scan(self) -> list[ConnectorDocument]:
        logger.info(f"Scanning Google Drive folder: {self.folder_id}")
        if not self.api_key:
            raise NotConfiguredError("Google Drive connector is missing an API key. Please set GOOGLE_API_KEY in .env.")
            
        temp_dir = Path(tempfile.gettempdir()) / f"drive_sync_{uuid.uuid4().hex}"
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        documents = []
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            query = f"'{self.folder_id}' in parents and trashed=false"
            url = f"https://www.googleapis.com/drive/v3/files"
            params = {
                "q": query,
                "key": self.api_key,
                "fields": "files(id, name, mimeType)"
            }
            
            response = await client.get(url, params=params)
            if response.status_code != 200:
                logger.error(f"Failed to list Drive files: {response.text}")
                raise Exception(f"Google Drive API error: {response.status_code}")
                
            files = response.json().get("files", [])
            logger.info(f"Found {len(files)} files in Google Drive folder.")
            
            for file_info in files:
                file_id = file_info["id"]
                file_name = file_info["name"]
                mime_type = file_info["mimeType"]
                
                if mime_type == "application/vnd.google-apps.folder":
                    continue
                    
                download_url = None
                export_mime = None
                ext = ""
                
                if mime_type == "application/vnd.google-apps.document":
                    download_url = f"https://www.googleapis.com/drive/v3/files/{file_id}/export"
                    export_mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    ext = ".docx" if not file_name.endswith(".docx") else ""
                elif mime_type == "application/vnd.google-apps.spreadsheet":
                    download_url = f"https://www.googleapis.com/drive/v3/files/{file_id}/export"
                    export_mime = "text/csv"
                    ext = ".csv" if not file_name.endswith(".csv") else ""
                else:
                    download_url = f"https://www.googleapis.com/drive/v3/files/{file_id}"
                
                req_params = {"key": self.api_key}
                if export_mime:
                    req_params["mimeType"] = export_mime
                else:
                    req_params["alt"] = "media"
                    
                logger.info(f"Downloading {file_name}...")
                
                file_resp = await client.get(download_url, params=req_params, follow_redirects=True)
                if file_resp.status_code == 200:
                    local_path = temp_dir / f"{file_name}{ext}"
                    with open(local_path, "wb") as f:
                        f.write(file_resp.content)
                        
                    documents.append(ConnectorDocument(path=local_path, metadata=file_info))
                else:
                    logger.warning(f"Failed to download {file_name}: {file_resp.text}")

        return documents
