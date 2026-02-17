# FIRST — before other app imports
from app.logging_config import setup_logging
setup_logging()

import time
from loguru import logger
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on {} {}", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    ms = (time.perf_counter() - start) * 1000
    logger.info("{} {} {} {:.1f}ms", request.method, request.url.path, response.status_code, ms)
    return response


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
    logger.info("Starting Personal Portfolio Chatbot API")
    logger.info("Environment: {}", settings.environment)
    logger.info("LLM Provider: {}", settings.llm_provider)
    logger.info("CORS Origins: {}", settings.cors_origins)


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler"""
    logger.info("Shutting down Personal Portfolio Chatbot API")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
