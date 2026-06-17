from pydantic import BaseModel


class Chunk(BaseModel):
    chunk_id: str
    document_id: str
    source_id: str
    text: str
    index: int
    metadata: dict = {}
