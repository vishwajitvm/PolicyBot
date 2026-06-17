from datetime import datetime
from pathlib import Path


class MetadataExtractor:
    def extract(self, path: Path, source: dict, content_hash: str) -> dict:
        stat = path.stat()
        modified = datetime.utcfromtimestamp(stat.st_mtime)
        return {
            "file_name": path.name,
            "file_path": str(path),
            "source_id": source["source_id"],
            "source_type": source["source_type"],
            "created_at": datetime.utcfromtimestamp(stat.st_ctime),
            "modified_at": modified,
            "version": 1,
            "content_hash": content_hash,
            "page_number": None,
            "section_title": None,
            "tags": [],
            "size_bytes": stat.st_size,
        }
