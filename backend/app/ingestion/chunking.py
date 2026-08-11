from pydantic import BaseModel
from pathlib import Path

class TextChunk(BaseModel):
    text: str
    index: int
    start: int
    end: int

class ChunkingService:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 150):
        if chunk_overlap >= chunk_size:
            raise ValueError("chunk_overlap must be smaller than chunk_size")
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

        # Optionally initialize specialized LangChain splitters here if available
        try:
            from langchain_text_splitters import RecursiveCharacterTextSplitter, MarkdownTextSplitter
            self.recursive_splitter = RecursiveCharacterTextSplitter(
                chunk_size=self.chunk_size,
                chunk_overlap=self.chunk_overlap,
                separators=["\n\n", "\n", " ", ""]
            )
            self.markdown_splitter = MarkdownTextSplitter(
                chunk_size=self.chunk_size,
                chunk_overlap=self.chunk_overlap
            )
            self.use_langchain = True
        except ImportError:
            self.use_langchain = False

    def split(self, text: str, file_path: str = "") -> list[TextChunk]:
        normalized = "\n".join(line.strip() for line in text.splitlines() if line.strip())
        if not normalized:
            return []

        suffix = Path(file_path).suffix.lower() if file_path else ""

        if self.use_langchain:
            if suffix == ".md":
                docs = self.markdown_splitter.create_documents([normalized])
            else:
                docs = self.recursive_splitter.create_documents([normalized])
            
            # Re-map LangChain docs to our TextChunk
            chunks = []
            start_idx = 0
            for i, doc in enumerate(docs):
                # We calculate approx start/end
                end_idx = start_idx + len(doc.page_content)
                chunks.append(TextChunk(text=doc.page_content, index=i, start=start_idx, end=end_idx))
                start_idx += (len(doc.page_content) - self.chunk_overlap)
            return chunks
        else:
            # Fallback simple splitter
            chunks: list[TextChunk] = []
            start = 0
            index = 0
            while start < len(normalized):
                end = min(start + self.chunk_size, len(normalized))
                chunks.append(TextChunk(text=normalized[start:end], index=index, start=start, end=end))
                if end == len(normalized):
                    break
                start = max(0, end - self.chunk_overlap)
                index += 1
            return chunks
