from pydantic import BaseModel, Field
from typing import Optional


class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    message: str = Field(..., min_length=1, max_length=500, description="User's message")
    conversation_id: Optional[str] = Field(None, description="Optional conversation ID for context")


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    response: str = Field(..., description="AI assistant's response")
    conversation_id: str = Field(..., description="Conversation ID for tracking")
    sources: list[str] = Field(default_factory=list, description="Source documents used")
    model_used: str = Field(..., description="Which LLM model was used")


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    llm_provider: str
    environment: str
