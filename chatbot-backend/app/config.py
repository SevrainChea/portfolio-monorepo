from pydantic_settings import BaseSettings
from typing import Literal


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # LLM Configuration
    llm_provider: Literal["ollama", "gemini", "groq"] = "ollama"
    ollama_model: str = "llama3.2"
    ollama_base_url: str = "http://localhost:11434"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash-lite"
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"
    
    # Application Settings
    environment: Literal["development", "production"] = "development"
    debug: bool = True
    
    # Notion Integration
    notion_api_key: str = ""
    notion_database_id: str = ""
    
    # CORS
    allowed_origins: str = "http://localhost:3000"
    
    # Vector Store
    chroma_persist_directory: str = "./chroma_db"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def is_production(self) -> bool:
        return self.environment == "production"
    
    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]


# Global settings instance
settings = Settings()
