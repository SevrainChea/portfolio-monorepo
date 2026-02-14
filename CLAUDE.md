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
- `app/routers/chat.py` — `POST /api/chat`, `GET /api/stats`
- `app/services/llm_service.py` — Abstract `LLMProvider` with `OllamaProvider` (local/dev) and `GeminiProvider` (cloud/prod) implementations; factory selects based on `LLM_PROVIDER` env var
- `app/services/rag_service.py` — ChromaDB vector store; collection `portfolio_knowledge`; retrieves top-3 docs by default
- `data/personal_data.json` — Knowledge base (6 documents); re-ingest after editing via `ingest_data.py`

**RAG flow:** `POST /api/chat` → retrieve context (k=3 from ChromaDB) → inject into LLM prompt → return response with sources.

**LLM strategy:** Ollama (local, no API key) for development; Gemini (free tier) for production. Switch via `LLM_PROVIDER=ollama|gemini`.
