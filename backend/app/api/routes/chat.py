from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.models.chat import ChatRequest, ChatResponse, ChatSession
from app.services.chat_service import ChatService
import uuid

router = APIRouter()

chat_service = ChatService()

@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    try:
        if not request.session_id:
            request.session_id = str(uuid.uuid4())
        
        response = await chat_service.process_message(
            message=request.message,
            session_id=request.session_id,
            context=request.context
        )
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions", response_model=List[str])
async def get_sessions():
    try:
        sessions = await chat_service.get_all_sessions()
        return sessions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}", response_model=ChatSession)
async def get_session(session_id: str):
    try:
        session = await chat_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    try:
        result = await chat_service.delete_session(session_id)
        if not result:
            raise HTTPException(status_code=404, detail="Session not found")
        return {"message": "Session deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions/{session_id}/clear")
async def clear_session(session_id: str):
    try:
        result = await chat_service.clear_session(session_id)
        if not result:
            raise HTTPException(status_code=404, detail="Session not found")
        return {"message": "Session cleared successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))