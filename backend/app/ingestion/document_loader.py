import csv
import asyncio
from pathlib import Path
from typing import AsyncGenerator

class DocumentLoader:
    async def load_chunks(self, path: Path) -> AsyncGenerator[str, None]:
        """Lazy load document content in chunks (e.g. pages or blocks) without blocking."""
        suffix = path.suffix.lower()
        if suffix in {".txt", ".md"}:
            text = await asyncio.to_thread(path.read_text, encoding="utf-8", errors="ignore")
            yield text
        elif suffix == ".csv":
            def read_csv():
                with path.open("r", encoding="utf-8", errors="ignore", newline="") as handle:
                    # Keep headers for context in each row? We can just return the raw text.
                    return "\n".join(", ".join(row) for row in csv.reader(handle))
            text = await asyncio.to_thread(read_csv)
            yield text
        elif suffix == ".pdf":
            import pypdf
            reader = await asyncio.to_thread(pypdf.PdfReader, str(path))
            num_pages = len(reader.pages)
            for i in range(num_pages):
                page = reader.pages[i]
                text = await asyncio.to_thread(page.extract_text)
                if text:
                    yield text
        elif suffix == ".docx":
            # Use unstructured to parse .docx files for better reliability
            from unstructured.partition.docx import partition_docx
            # partition_docx returns a list of elements; we join their text content.
            elements = await asyncio.to_thread(partition_docx, filename=str(path))
            # Extract text from each element, ignoring empty strings
            texts = [element.text for element in elements if getattr(element, "text", None)]
            # Yield the full concatenated text in chunks of up to 20 paragraphs
            batch = []
            for txt in texts:
                batch.append(txt)
                if len(batch) >= 20:
                    yield "\n".join(batch)
                    batch = []
            if batch:
                yield "\n".join(batch)
        else:
            yield ""
