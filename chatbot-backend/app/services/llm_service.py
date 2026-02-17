from abc import ABC, abstractmethod
from typing import List, Dict
import ollama
import google.generativeai as genai
from groq import Groq
from loguru import logger
from app.config import settings


class LLMProvider(ABC):
    """Abstract base class for LLM providers"""

    @abstractmethod
    def generate(self, prompt: str, context: List[str]) -> str:
        """Generate a response given a prompt and context"""
        pass

    @abstractmethod
    def get_model_name(self) -> str:
        """Return the model name being used"""
        pass


class OllamaProvider(LLMProvider):
    """Ollama LLM provider for local development"""

    def __init__(self, model: str = None, base_url: str = None):
        self.model = model or settings.ollama_model
        self.base_url = base_url or settings.ollama_base_url

    def generate(self, prompt: str, context: List[str]) -> str:
        """Generate response using Ollama"""

        # Build the full prompt with context
        context_text = "\n\n".join([f"Context {i+1}: {ctx}" for i, ctx in enumerate(context)])

        full_prompt = f"""You are a helpful AI assistant representing a person's portfolio.
Use the following context to answer questions accurately.

{context_text}

Question: {prompt}

Answer based on the context provided. If you cannot find relevant information in the context,
say so politely and provide a general response."""

        try:
            response = ollama.chat(
                model=self.model,
                messages=[{'role': 'user', 'content': full_prompt}]
            )
            return response['message']['content']
        except Exception as e:
            logger.exception("Ollama generation failed")
            raise Exception(f"Ollama generation failed: {str(e)}")

    def get_model_name(self) -> str:
        return f"ollama/{self.model}"


class GeminiProvider(LLMProvider):
    """Google Gemini LLM provider for production"""

    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or settings.gemini_api_key
        self.model_name = model or settings.gemini_model

        if not self.api_key:
            raise ValueError("Gemini API key is required")

        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(self.model_name)

    def generate(self, prompt: str, context: List[str]) -> str:
        """Generate response using Gemini"""

        # Build the full prompt with context
        context_text = "\n\n".join([f"Context {i+1}: {ctx}" for i, ctx in enumerate(context)])

        full_prompt = f"""You are a helpful AI assistant representing a person's portfolio.
Use the following context to answer questions accurately.

{context_text}

Question: {prompt}

Answer based on the context provided. If you cannot find relevant information in the context,
say so politely and provide a general response."""

        try:
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            logger.exception("Gemini generation failed")
            raise Exception(f"Gemini generation failed: {str(e)}")

    def get_model_name(self) -> str:
        return f"gemini/{self.model_name}"


class GroqProvider(LLMProvider):
    """Groq LLM provider — free tier with 14,400 RPD"""

    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or settings.groq_api_key
        self.model_name = model or settings.groq_model

        if not self.api_key:
            raise ValueError("Groq API key is required")

        self.client = Groq(api_key=self.api_key)

    def generate(self, prompt: str, context: List[str]) -> str:
        """Generate response using Groq"""

        context_text = "\n\n".join([f"Context {i+1}: {ctx}" for i, ctx in enumerate(context)])

        full_prompt = f"""You are a helpful AI assistant representing a person's portfolio.
Use the following context to answer questions accurately.

{context_text}

Question: {prompt}

Answer based on the context provided. If you cannot find relevant information in the context,
say so politely and provide a general response."""

        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": full_prompt}]
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.exception("Groq generation failed")
            raise Exception(f"Groq generation failed: {str(e)}")

    def get_model_name(self) -> str:
        return f"groq/{self.model_name}"


class LLMService:
    """Service to manage LLM provider selection"""

    def __init__(self):
        self.provider = self._initialize_provider()

    def _initialize_provider(self) -> LLMProvider:
        """Initialize the appropriate LLM provider based on settings"""

        if settings.llm_provider == "ollama":
            logger.info("Using Ollama with model: {}", settings.ollama_model)
            return OllamaProvider()
        elif settings.llm_provider == "gemini":
            logger.info("Using Gemini with model: {}", settings.gemini_model)
            return GeminiProvider()
        elif settings.llm_provider == "groq":
            logger.info("Using Groq with model: {}", settings.groq_model)
            return GroqProvider()
        else:
            raise ValueError(f"Unknown LLM provider: {settings.llm_provider}")

    def generate_response(self, prompt: str, context: List[str]) -> Dict[str, str]:
        """Generate a response using the configured provider"""

        response = self.provider.generate(prompt, context)

        return {
            "response": response,
            "model_used": self.provider.get_model_name()
        }


# Global LLM service instance
llm_service = LLMService()
