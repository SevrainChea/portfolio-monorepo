import asyncio
import json
import uuid
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from loguru import logger
from app.models import ChatRequest, ChatResponse
from app.services.llm_service import llm_service
from app.services.rag_service import rag_service


router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint that uses RAG to answer questions about the portfolio
    """
    try:
        # Retrieve relevant context from vector store (filtered by relevance)
        context_docs = rag_service.retrieve(request.message, k=5)

        # Extract sources (relevance filtering may result in fewer docs)
        sources = [doc["source"] for doc in context_docs]

        # Generate response using LLM
        result = llm_service.generate_response(
            prompt=request.message,
            context=context_docs  # Pass full dicts with relevance scores
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
        logger.exception("Chat endpoint failed")
        logger.error(e)
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Streaming chat endpoint using Server-Sent Events
    Yields chunk events for each token, then a done event with metadata.
    """
    async def event_generator():
        try:
            # Retrieve context in a thread to avoid blocking the event loop
            context_docs = await asyncio.to_thread(
                rag_service.retrieve, request.message, 5
            )
            sources = list(set(doc["source"] for doc in context_docs))
            conversation_id = request.conversation_id or str(uuid.uuid4())
            model_used = llm_service.provider.get_model_name()

            async for token in llm_service.generate_response_stream(
                prompt=request.message,
                context=context_docs  # Pass full dicts with relevance scores
            ):
                event = json.dumps({"type": "chunk", "content": token})
                yield f"data: {event}\n\n"

            done_event = json.dumps({
                "type": "done",
                "conversation_id": conversation_id,
                "sources": sources,
                "model_used": model_used
            })
            yield f"data: {done_event}\n\n"

        except Exception as e:
            logger.exception("Streaming chat failed")
            error_event = json.dumps({"type": "error", "message": str(e)})
            yield f"data: {error_event}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
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
        logger.error(e)
        logger.exception("Stats endpoint failed")
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")
