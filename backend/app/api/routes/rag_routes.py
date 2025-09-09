from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from typing import Optional, Dict, Any
from app.models.rag_models import (
    DocumentUploadResponse,
    QueryRequest,
    QueryResponse,
    SearchRequest,
    SearchResult,
    ConversationHistory,
    DocumentDeleteRequest,
    StatusResponse
)
from app.core.rag import RAGService
from app.config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/rag", tags=["RAG"])

rag_service = RAGService()


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    metadata: Optional[str] = None
):
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        file_size = 0
        contents = await file.read()
        file_size = len(contents) / (1024 * 1024)  # Convert to MB
        
        if file_size > settings.MAX_FILE_SIZE_MB:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum limit of {settings.MAX_FILE_SIZE_MB}MB"
            )
        
        result = rag_service.process_pdf_file(
            file_content=contents,
            file_name=file.filename,
            metadata={"file_size_mb": file_size} if not metadata else {"file_size_mb": file_size, "custom": metadata}
        )
        
        return DocumentUploadResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to upload document: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    try:
        result = rag_service.query_documents(
            question=request.question,
            session_id=request.session_id,
            use_conversation=request.use_conversation
        )
        
        return QueryResponse(**result)
        
    except Exception as e:
        logger.error(f"Failed to query documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search")
async def search_documents(request: SearchRequest):
    try:
        results = rag_service.search_similar_documents(
            query=request.query,
            k=request.k
        )
        
        return results
        
    except Exception as e:
        logger.error(f"Failed to search documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversation/{session_id}", response_model=ConversationHistory)
async def get_conversation_history(session_id: str):
    try:
        history = rag_service.get_conversation_history(session_id)
        
        return ConversationHistory(
            session_id=session_id,
            history=history
        )
        
    except Exception as e:
        logger.error(f"Failed to get conversation history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/conversation/{session_id}")
async def clear_conversation(session_id: str):
    try:
        rag_service.clear_conversation(session_id)
        return {"message": f"Conversation {session_id} cleared"}
        
    except Exception as e:
        logger.error(f"Failed to clear conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/document")
async def delete_document(request: DocumentDeleteRequest):
    try:
        result = rag_service.delete_document(request.document_id)
        return result
        
    except Exception as e:
        logger.error(f"Failed to delete document: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/documents/all")
async def clear_all_documents():
    try:
        result = rag_service.clear_all_documents()
        return result
        
    except Exception as e:
        logger.error(f"Failed to clear all documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status", response_model=StatusResponse)
async def get_rag_status():
    try:
        stats = rag_service.get_stats()
        return StatusResponse(**stats)
        
    except Exception as e:
        logger.error(f"Failed to get RAG status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/process-text")
async def process_text(
    text: str = Body(...),
    source: str = Body(...),
    metadata: Optional[Dict[str, Any]] = Body(None)
):
    try:
        result = rag_service.process_text(
            text=text,
            source=source,
            metadata=metadata
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to process text: {e}")
        raise HTTPException(status_code=500, detail=str(e))