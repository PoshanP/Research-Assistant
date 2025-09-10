from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class ChatMessage(BaseModel):
    role: MessageRole
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)
    
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    context: Optional[List[ChatMessage]] = []
    
class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: datetime = Field(default_factory=datetime.now)
    sources: Optional[List[str]] = []
    
class ChatSession(BaseModel):
    session_id: str
    messages: List[ChatMessage] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)