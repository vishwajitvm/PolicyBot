from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.query import QueryScores


class ChatSessionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)


class ChatSessionCreate(ChatSessionBase):
    pass


class ChatSessionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)


class ChatSessionOut(ChatSessionBase):
    id: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

    class Config:
        from_attributes = True


class ChatMessageBase(BaseModel):
    content: str


class ChatMessageCreate(BaseModel):
    question: str


class ChatMessageOut(BaseModel):
    id: str
    session_id: str
    role: str  # "user" or "assistant"
    content: str
    created_at: datetime
    trace_id: Optional[str] = None
    model: Optional[str] = None
    embedding_provider: Optional[str] = None
    vector_db: Optional[str] = None
    latency_ms: Optional[int] = None
    scores: Optional[QueryScores] = None

    class Config:
        from_attributes = True


class ChatSessionWithMessages(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    messages: List[ChatMessageOut]

    class Config:
        from_attributes = True