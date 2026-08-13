from datetime import datetime
from pathlib import Path


from app.core.time import get_current_time

class MetadataExtractor:
    def extract(self, path: Path, source: dict, content_hash: str) -> dict:
        stat = path.stat()
        tz = get_current_time().tzinfo
        modified = datetime.fromtimestamp(stat.st_mtime, tz=tz)
        return {
            "file_name": path.name,
            "file_path": str(path),
            "source_id": source["source_id"],
            "source_type": source["source_type"],
            "created_at": datetime.fromtimestamp(stat.st_ctime, tz=tz),
            "modified_at": modified,
            "version": 1,
            "content_hash": content_hash,
            "page_number": None,
            "section_title": None,
            "tags": [],
            "size_bytes": stat.st_size,
        }
