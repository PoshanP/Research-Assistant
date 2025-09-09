from typing import List, Dict, Any, Optional
import logging
import os
import tempfile
from app.core.rag.vector_store import VectorStoreManager
from app.core.rag.document_processor import DocumentProcessor
from app.core.rag.rag_chain import RAGChain, SimpleRAGChain
from app.config import settings

logger = logging.getLogger(__name__)


class RAGService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RAGService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self.vector_store_manager = VectorStoreManager()
        self.document_processor = DocumentProcessor()
        self.rag_chain = RAGChain(self.vector_store_manager)
        self.simple_chain = SimpleRAGChain(self.vector_store_manager)
        self.conversation_history = {}
        self._initialized = True
        logger.info("RAG Service initialized")
    
    def process_pdf_file(self, file_content: bytes, file_name: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                tmp_file.write(file_content)
                tmp_file_path = tmp_file.name
            
            documents = self.document_processor.process_pdf(
                file_path=tmp_file_path,
                file_name=file_name,
                metadata=metadata
            )
            
            document_ids = self.vector_store_manager.add_documents(documents)
            
            os.unlink(tmp_file_path)
            
            return {
                "success": True,
                "message": f"Successfully processed {file_name}",
                "document_id": documents[0].metadata.get("document_id"),
                "chunks_created": len(documents),
                "document_ids": document_ids
            }
            
        except Exception as e:
            logger.error(f"Failed to process PDF file: {e}")
            if 'tmp_file_path' in locals() and os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
            raise
    
    def process_text(self, text: str, source: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        try:
            documents = self.document_processor.process_text(
                text=text,
                source=source,
                metadata=metadata
            )
            
            document_ids = self.vector_store_manager.add_documents(documents)
            
            return {
                "success": True,
                "message": f"Successfully processed text from {source}",
                "document_id": documents[0].metadata.get("document_id"),
                "chunks_created": len(documents),
                "document_ids": document_ids
            }
            
        except Exception as e:
            logger.error(f"Failed to process text: {e}")
            raise
    
    def query_documents(
        self,
        question: str,
        session_id: Optional[str] = None,
        use_conversation: bool = True
    ) -> Dict[str, Any]:
        try:
            if use_conversation and session_id:
                if session_id not in self.conversation_history:
                    self.conversation_history[session_id] = []
                
                chat_history = self.conversation_history[session_id]
                response = self.rag_chain.query(question, chat_history)
                
                self.conversation_history[session_id].append(
                    (question, response["answer"])
                )
            else:
                response = self.simple_chain.query(question)
            
            return response
            
        except Exception as e:
            logger.error(f"Failed to query documents: {e}")
            raise
    
    def search_similar_documents(self, query: str, k: int = settings.TOP_K_RESULTS) -> List[Dict[str, Any]]:
        try:
            results = self.vector_store_manager.similarity_search_with_score(query, k)
            
            formatted_results = []
            for doc, score in results:
                formatted_results.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "similarity_score": float(score)
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Failed to search documents: {e}")
            raise
    
    def clear_conversation(self, session_id: str):
        if session_id in self.conversation_history:
            del self.conversation_history[session_id]
            logger.info(f"Cleared conversation for session {session_id}")
    
    def get_conversation_history(self, session_id: str) -> List[Dict[str, str]]:
        if session_id not in self.conversation_history:
            return []
        
        return [
            {"question": q, "answer": a}
            for q, a in self.conversation_history[session_id]
        ]
    
    def delete_document(self, document_id: str):
        try:
            self.vector_store_manager.clear_documents(document_id)
            logger.info(f"Deleted document {document_id}")
            return {"success": True, "message": f"Document {document_id} deleted"}
        except Exception as e:
            logger.error(f"Failed to delete document: {e}")
            raise
    
    def clear_all_documents(self):
        try:
            self.vector_store_manager.clear_documents()
            self.conversation_history.clear()
            logger.info("Cleared all documents and conversations")
            return {"success": True, "message": "All documents cleared"}
        except Exception as e:
            logger.error(f"Failed to clear all documents: {e}")
            raise
    
    def get_stats(self) -> Dict[str, Any]:
        try:
            collection = self.vector_store_manager.vector_store._collection
            count = collection.count()
            
            return {
                "total_chunks": count,
                "active_sessions": len(self.conversation_history),
                "vector_store_status": "connected",
                "embedding_model": settings.OPENAI_EMBEDDING_MODEL,
                "llm_model": settings.OPENAI_MODEL
            }
        except Exception as e:
            logger.error(f"Failed to get stats: {e}")
            return {
                "total_chunks": 0,
                "active_sessions": len(self.conversation_history),
                "vector_store_status": "error",
                "error": str(e)
            }