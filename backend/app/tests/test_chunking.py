from app.ingestion.chunking import ChunkingService


def test_chunking_overlaps_text():
    service = ChunkingService(chunk_size=10, chunk_overlap=2)
    chunks = service.split("abcdefghijklmnopqrstuvwxyz")
    assert len(chunks) > 1
    assert chunks[0].text[-2:] == chunks[1].text[:2]
