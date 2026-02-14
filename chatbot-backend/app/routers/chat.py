from fastapi import APIRouter, HTTPException
from app.models import ChatRequest, ChatResponse
from app.services.llm_service import llm_service
from app.services.rag_service import rag_service
import uuid


router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint that uses RAG to answer questions about the portfolio
    """
    try:
        # Retrieve relevant context from vector store
        context_docs = rag_service.retrieve(request.message, k=3)
        
        # Extract text and sources
        context_texts = [doc["text"] for doc in context_docs]
        sources = [doc["source"] for doc in context_docs]
        
        # Generate response using LLM
        result = llm_service.generate_response(
            prompt=request.message,
            context=context_texts
        )
        
        # Generate or use existing conversation ID
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        return ChatResponse(
            response=result["response"],
            conversation_id=conversation_id,
            sources=list(set(sources)),  # Remove duplicates
            model_used=result["model_used"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating response: {str(e)}"
        )


@router.get("/stats")
async def get_stats():
    """Get statistics about the knowledge base"""
    try:
        stats = rag_service.get_stats()
        return {
            "knowledge_base": stats,
            "llm_provider": llm_service.provider.get_model_name()
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching stats: {str(e)}"
        )
