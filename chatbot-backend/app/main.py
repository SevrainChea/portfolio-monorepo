from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models import HealthResponse
from app.routers import chat

# Initialize FastAPI app
app = FastAPI(
    title="Personal Portfolio Chatbot API",
    description="AI-powered chatbot with RAG for portfolio showcase",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router)


@app.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        llm_provider=settings.llm_provider,
        environment=settings.environment
    )


@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    print("🚀 Starting Personal Portfolio Chatbot API")
    print(f"📍 Environment: {settings.environment}")
    print(f"🤖 LLM Provider: {settings.llm_provider}")
    print(f"🔓 CORS Origins: {settings.cors_origins}")


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler"""
    print("👋 Shutting down Personal Portfolio Chatbot API")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
