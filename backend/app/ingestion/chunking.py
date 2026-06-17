from pydantic import BaseModel


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

    def split(self, text: str) -> list[TextChunk]:
        normalized = "\n".join(line.strip() for line in text.splitlines() if line.strip())
        if not normalized:
            return []
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
