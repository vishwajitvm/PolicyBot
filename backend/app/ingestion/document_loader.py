import csv
from pathlib import Path


class DocumentLoader:
    async def load_text(self, path: Path) -> str:
        suffix = path.suffix.lower()
        if suffix in {".txt", ".md"}:
            return path.read_text(encoding="utf-8", errors="ignore")
        if suffix == ".csv":
            with path.open("r", encoding="utf-8", errors="ignore", newline="") as handle:
                return "\n".join(", ".join(row) for row in csv.reader(handle))
        if suffix == ".pdf":
            from pypdf import PdfReader

            reader = PdfReader(str(path))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        if suffix == ".docx":
            from docx import Document

            doc = Document(str(path))
            return "\n".join(paragraph.text for paragraph in doc.paragraphs)
        return ""
