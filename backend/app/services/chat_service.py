from typing import List, Optional, Dict
from datetime import datetime
from app.models.chat import ChatMessage, ChatResponse, ChatSession, MessageRole
from app.core.rag import RAGService
import uuid
import logging

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        self.sessions: Dict[str, ChatSession] = {}
        self.rag_service = RAGService()
    
    async def process_message(
        self, 
        message: str, 
        session_id: str, 
        context: Optional[List[ChatMessage]] = None
    ) -> ChatResponse:
        
        if session_id not in self.sessions:
            self.sessions[session_id] = ChatSession(
                session_id=session_id,
                messages=[]
            )
        
        session = self.sessions[session_id]
        
        user_message = ChatMessage(
            role=MessageRole.USER,
            content=message
        )
        session.messages.append(user_message)
        
        try:
            # Use RAG service to generate response
            assistant_response, sources = await self._generate_response_with_rag(message, session_id)
        except Exception as e:
            logger.error(f"Error using RAG service: {e}")
            # Fallback to simple response if RAG fails
            assistant_response = await self._generate_response(message, session.messages)
            sources = []
        
        assistant_message = ChatMessage(
            role=MessageRole.ASSISTANT,
            content=assistant_response
        )
        session.messages.append(assistant_message)
        
        session.updated_at = datetime.now()
        
        return ChatResponse(
            response=assistant_response,
            session_id=session_id,
            sources=sources
        )
    
    async def _generate_response_with_rag(self, message: str, session_id: str) -> tuple[str, List[str]]:
        """Generate response using RAG service"""
        try:
            # Use the correct method name from RAGService
            result = self.rag_service.query_documents(
                question=message,
                session_id=session_id,
                use_conversation=True
            )
            
            if result and result.get("answer"):
                sources = []
                if result.get("sources"):
                    sources = [s.get("metadata", {}).get("source", "") for s in result["sources"] if s.get("metadata")]
                return result["answer"], sources
        except Exception as e:
            logger.warning(f"RAG query failed: {e}")
        
        # Fallback response
        return f"I'll help you with your research query: {message}. Please upload documents first to enable RAG-based responses.", []
    
    async def _generate_response(self, message: str, history: List[ChatMessage]) -> str:
        return f"I'll help you with: {message}. Please upload research papers to enable document-based responses."
    
    async def get_session(self, session_id: str) -> Optional[ChatSession]:
        return self.sessions.get(session_id)
    
    async def get_all_sessions(self) -> List[str]:
        return list(self.sessions.keys())
    
    async def delete_session(self, session_id: str) -> bool:
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False
    
    async def clear_session(self, session_id: str) -> bool:
        if session_id in self.sessions:
            self.sessions[session_id].messages = []
            self.sessions[session_id].updated_at = datetime.now()
            return True
        return False