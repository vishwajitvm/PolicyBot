from app.core.time import get_current_time
import asyncio
import os
import time
from typing import Dict, Any, List, TypedDict, Annotated
from datetime import datetime, timezone

from langchain_community.document_loaders import UnstructuredFileLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langgraph.graph import StateGraph, START, END

from tracenest import logger
from app.providers.base_embedding import BaseEmbeddingProvider
from app.vectorstores.base_vector_store import BaseVectorStore, VectorChunk
from app.ingestion.cancellation import get_cancellation_event
import uuid

# Define the State for LangGraph
class IngestionState(TypedDict):
    job_id: str
    file_path: str
    file_name: str
    source_id: str
    document_id: str
    chunks: List[Any]  # LangChain Documents
    embedded_vectors: List[VectorChunk]
    error: str | None
    logs: Annotated[List[str], lambda x, y: x + y] # Append only reducer
    total_documents: int
    processed_documents: int
    embedded_chunks_count: int
    total_chunks_count: int
    
def _timestamped_log(message: str) -> str:
    timestamp = get_current_time().strftime("%H:%M:%S")
    return f"[{timestamp}] {message}"

def check_cancellation(state: IngestionState):
    if get_cancellation_event(state["job_id"]).is_set():
        raise asyncio.CancelledError(f"Job {state['job_id']} cancelled by user.")

async def load_document_node(state: IngestionState):
    check_cancellation(state)
    logger.info(f"Loading document: {state['file_name']}")
    try:
        # Use Unstructured for robust parsing (PDFs, Docs, Excels, images)
        loader = UnstructuredFileLoader(state["file_path"], strategy="fast")
        # Load returns LangChain Document objects
        docs = loader.load()
        return {
            "chunks": docs, 
            "logs": [_timestamped_log(f"Loaded {state['file_name']} successfully with Unstructured")]
        }
    except Exception as e:
        err_msg = f"Error loading {state['file_name']}: {str(e)}"
        logger.error(err_msg)
        return {"error": err_msg, "logs": [_timestamped_log(err_msg)]}

async def chunk_document_node(state: IngestionState):
    check_cancellation(state)
    if state.get("error"):
        return {}
        
    logger.info(f"Chunking document: {state['file_name']}")
    try:
        # Advanced semantic/recursive chunking
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
            separators=["\n\n", "\n", " ", ""]
        )
        split_docs = text_splitter.split_documents(state["chunks"])
        
        # Format them back to simple strings or dicts for our custom embedder
        return {
            "chunks": split_docs,
            "total_chunks_count": len(split_docs),
            "logs": [_timestamped_log(f"Chunked {state['file_name']} into {len(split_docs)} segments")]
        }
    except Exception as e:
        err_msg = f"Error chunking {state['file_name']}: {str(e)}"
        logger.error(err_msg)
        return {"error": err_msg, "logs": [_timestamped_log(err_msg)]}

# We need a closure factory or class method to inject providers into nodes
class EmbedNodeFactory:
    def __init__(self, embedding_provider: BaseEmbeddingProvider, vector_store: BaseVectorStore):
        self.embedding_provider = embedding_provider
        self.vector_store = vector_store
        
    async def embed_and_index_node(self, state: IngestionState):
        check_cancellation(state)
        if state.get("error"):
            return {}
            
        chunks = state["chunks"]
        if not chunks:
            return {"logs": [_timestamped_log("No chunks to embed")]}
            
        logger.info(f"Embedding and indexing {len(chunks)} chunks for {state['file_name']}")
        
        embedded_count = 0
        vectors_to_insert = []
        
        try:
            # We process sequentially in small batches to respect free-tier RPM limits
            # The ingestion_service used 50, we will keep it the same but sequential
            batch_size = 50
            
            for i in range(0, len(chunks), batch_size):
                check_cancellation(state)
                batch_docs = chunks[i:i + batch_size]
                texts = [doc.page_content for doc in batch_docs]
                
                # Use our robust fallback provider to embed
                embeddings = await self.embedding_provider.embed_texts(texts)
                
                for j, (doc, vector) in enumerate(zip(batch_docs, embeddings)):
                    chunk_index = i + j
                    vector_chunk = VectorChunk(
                        chunk_id=str(uuid.uuid4()),
                        document_id=state["document_id"],
                        source_id=state["source_id"],
                        vector=vector,
                        text=doc.page_content,
                        payload={
                            "file_name": state["file_name"],
                            "chunk_index": chunk_index,
                            **doc.metadata
                        }
                    )
                    vectors_to_insert.append(vector_chunk)
                    
                # Index in Qdrant batch
                await self.vector_store.upsert_chunks(vectors_to_insert)
                embedded_count += len(batch_docs)
                vectors_to_insert = [] # reset for next batch
                
            return {
                "embedded_chunks_count": embedded_count,
                "logs": [_timestamped_log(f"Successfully embedded and indexed {embedded_count} chunks for {state['file_name']}")]
            }
        except Exception as e:
            err_msg = f"Error embedding/indexing {state['file_name']}: {str(e)}"
            logger.error(err_msg)
            return {"error": err_msg, "logs": [_timestamped_log(err_msg)]}


def create_ingestion_graph(embedding_provider: BaseEmbeddingProvider, vector_store: BaseVectorStore):
    """Creates the LangGraph state machine for document processing."""
    
    workflow = StateGraph(IngestionState)
    
    # Add nodes
    workflow.add_node("load", load_document_node)
    workflow.add_node("chunk", chunk_document_node)
    
    embed_factory = EmbedNodeFactory(embedding_provider, vector_store)
    workflow.add_node("embed", embed_factory.embed_and_index_node)
    
    # Define edges
    workflow.add_edge(START, "load")
    
    # Conditional routing: if error, end. Else continue.
    def route_after_load(state: IngestionState):
        if state.get("error"):
            return END
        return "chunk"
        
    workflow.add_conditional_edges("load", route_after_load)
    
    def route_after_chunk(state: IngestionState):
        if state.get("error"):
            return END
        return "embed"
        
    workflow.add_conditional_edges("chunk", route_after_chunk)
    workflow.add_edge("embed", END)
    
    return workflow.compile()
