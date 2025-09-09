from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class DocumentUploadResponse(BaseModel):
    success: bool
    message: str
    document_id: str
    chunks_created: int
    document_ids: List[str]


class QueryRequest(BaseModel):
    question: str = Field(..., description="The question to ask about the documents")
    session_id: Optional[str] = Field(None, description="Session ID for conversation tracking")
    use_conversation: bool = Field(True, description="Whether to use conversation history")
    k: int = Field(5, description="Number of relevant documents to retrieve")


class QueryResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]
    question: str


class SearchRequest(BaseModel):
    query: str = Field(..., description="Search query")
    k: int = Field(5, description="Number of results to return")


class SearchResult(BaseModel):
    content: str
    metadata: Dict[str, Any]
    similarity_score: float


class ConversationHistory(BaseModel):
    session_id: str
    history: List[Dict[str, str]]


class DocumentDeleteRequest(BaseModel):
    document_id: str = Field(..., description="ID of the document to delete")


class StatusResponse(BaseModel):
    total_chunks: int
    active_sessions: int
    vector_store_status: str
    embedding_model: Optional[str]
    llm_model: Optional[str]
    error: Optional[str] = None