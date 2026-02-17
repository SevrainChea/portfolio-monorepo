from abc import ABC, abstractmethod
from typing import List, Dict, AsyncGenerator
import ollama
import google.generativeai as genai
from groq import Groq, AsyncGroq
from loguru import logger
from app.config import settings

SYSTEM_PROMPT = """You are a helpful AI assistant representing Sevrain CHEA's portfolio.

**Guidelines:**
- ONLY use the provided context to answer questions
- If information is not in the context, clearly say so
- Format answers with structure: use short paragraphs and bullet points for key details
- Be concise—avoid verbose explanations
- When listing items (skills, projects, etc.), use bullets with brief descriptions"""


class LLMProvider(ABC):
    """Abstract base class for LLM providers"""

    def _build_prompt(self, prompt: str, context: List[Dict[str, str]]) -> str:
        """Build the user message with formatted context (system prompt handled separately).

        Args:
            prompt: The user question/request
            context: List of context dicts with keys: 'text' (required), 'relevance' (optional), 'source' (optional)

        Returns:
            Formatted prompt string with context sections and question
        """
        context_text = "\n\n".join([
            f"Context {i+1} [relevance: {ctx.get('relevance', 'N/A')} | from: {ctx.get('source', 'unknown')}]:\n{ctx.get('text', '[No text provided]')}"
            for i, ctx in enumerate(context)
        ])
        return f"""{context_text}

Question: {prompt}"""

    @abstractmethod
    def generate(self, prompt: str, context: List[Dict[str, str]]) -> str:
        """Generate a response given a prompt and context"""
        pass

    @abstractmethod
    async def generate_stream(self, prompt: str, context: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        """Stream tokens as an async generator"""
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

    def generate(self, prompt: str, context: List[Dict[str, str]]) -> str:
        """Generate response using Ollama"""
        full_prompt = self._build_prompt(prompt, context)

        try:
            response = ollama.chat(
                model=self.model,
                messages=[
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user', 'content': full_prompt}
                ]
            )
            return response['message']['content']
        except Exception as e:
            logger.exception("Ollama generation failed")
            raise Exception(f"Ollama generation failed: {str(e)}")

    async def generate_stream(self, prompt: str, context: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        full_prompt = self._build_prompt(prompt, context)

        try:
            client = ollama.AsyncClient(host=self.base_url)
            async for chunk in await client.chat(
                model=self.model,
                messages=[
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user', 'content': full_prompt}
                ],
                stream=True
            ):
                content = chunk['message']['content']
                if content:
                    yield content
        except Exception as e:
            logger.exception("Ollama streaming failed")
            raise Exception(f"Ollama streaming failed: {str(e)}")

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
        self.model = genai.GenerativeModel(
            self.model_name,
            system_instruction=SYSTEM_PROMPT
        )

    def generate(self, prompt: str, context: List[Dict[str, str]]) -> str:
        """Generate response using Gemini"""
        full_prompt = self._build_prompt(prompt, context)

        try:
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            logger.exception("Gemini generation failed")
            raise Exception(f"Gemini generation failed: {str(e)}")

    async def generate_stream(self, prompt: str, context: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        full_prompt = self._build_prompt(prompt, context)

        try:
            response = await self.model.generate_content_async(full_prompt, stream=True)
            async for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            logger.exception("Gemini streaming failed")
            raise Exception(f"Gemini streaming failed: {str(e)}")

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
        self.async_client = AsyncGroq(api_key=self.api_key)

    def generate(self, prompt: str, context: List[Dict[str, str]]) -> str:
        """Generate response using Groq"""
        full_prompt = self._build_prompt(prompt, context)

        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": full_prompt}]
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.exception("Groq generation failed")
            raise Exception(f"Groq generation failed: {str(e)}")

    async def generate_stream(self, prompt: str, context: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        full_prompt = self._build_prompt(prompt, context)

        try:
            stream = await self.async_client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": full_prompt}],
                stream=True
            )
            async for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
        except Exception as e:
            logger.exception("Groq streaming failed")
            raise Exception(f"Groq streaming failed: {str(e)}")

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

    def generate_response(self, prompt: str, context: List[Dict[str, str]]) -> Dict[str, str]:
        """Generate a response using the configured provider"""

        response = self.provider.generate(prompt, context)

        return {
            "response": response,
            "model_used": self.provider.get_model_name()
        }

    async def generate_response_stream(self, prompt: str, context: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        """Stream tokens from the configured provider"""
        async for token in self.provider.generate_stream(prompt, context):
            yield token


# Global LLM service instance
llm_service = LLMService()
