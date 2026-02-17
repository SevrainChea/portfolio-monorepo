# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

Monorepo with two independent projects:

- `portfolio-frontend/` — Nuxt 3 + Vue 3 + TailwindCSS v4 single-page portfolio site
- `chatbot-backend/` — FastAPI Python backend with RAG-based chatbot

See `portfolio-frontend/CLAUDE.md` for detailed frontend guidance (design tokens, component patterns, etc.).

## Frontend Commands

Run from `portfolio-frontend/`. Package manager is **pnpm**.

```
pnpm dev        # Dev server at localhost:3000 (hot-reload)
pnpm build      # Production build
pnpm generate   # Static site generation
pnpm preview    # Preview production build
```

No test framework or linter configured. Formatting: Prettier with `prettier-plugin-tailwindcss`.

## Backend Commands

Run from `chatbot-backend/`. Uses Python with a virtual environment.

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python scripts/ingest_data.py      # Populate ChromaDB from data/personal_data.json
uvicorn app.main:app --reload      # Dev server at localhost:8000
```

Deployed to Railway via `Procfile`: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Backend Architecture

**FastAPI app** (`app/`) with clean service/router separation:

- `app/main.py` — App init, CORS middleware, startup/shutdown handlers
- `app/config.py` — Pydantic `BaseSettings` (env vars: `LLM_PROVIDER`, `GEMINI_API_KEY`, `CORS_ORIGINS`, etc.)
- `app/routers/chat.py` — `POST /api/chat` (non-streaming), `POST /api/chat/stream` (SSE streaming), `GET /api/stats`
- `app/services/llm_service.py` — Abstract `LLMProvider` with `OllamaProvider`, `GeminiProvider`, `GroqProvider`; each implements both `generate()` (sync) and `generate_stream()` (async generator). Factory selects based on `LLM_PROVIDER` env var
- `app/services/rag_service.py` — ChromaDB vector store; collection `portfolio_knowledge`; retrieves top-3 docs by default
- `data/personal_data.json` — Knowledge base (6 documents); re-ingest after editing via `ingest_data.py`

**RAG flow (streaming):** `POST /api/chat/stream` → `asyncio.to_thread(rag_service.retrieve)` → stream tokens via `StreamingResponse` (SSE) → final `done` event carries `conversation_id`, `sources`, `model_used`.

**RAG flow (non-streaming):** `POST /api/chat` → retrieve context (k=3) → inject into LLM prompt → return full `ChatResponse`.

**LLM strategy:** Ollama (local, no API key) for development; Groq (free tier, 14,400 RPD) for production. Switch via `LLM_PROVIDER=ollama|groq|gemini`.

**Async rules:** All `generate_stream` methods use async SDK clients (`ollama.AsyncClient`, `AsyncGroq`, `generate_content_async`). Blocking calls (ChromaDB) are wrapped with `asyncio.to_thread()`. Do NOT use sync clients inside `async def` endpoints.
