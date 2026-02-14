# Personal Portfolio Chatbot Backend

AI-powered chatbot with RAG (Retrieval-Augmented Generation) for portfolio showcase. Built with FastAPI, LangChain, and ChromaDB.

## 🎯 Features

- **Hybrid LLM Architecture**: Ollama for development, Gemini for production
- **RAG System**: ChromaDB vector store for intelligent context retrieval
- **Clean Architecture**: Modular design with clear separation of concerns
- **Easy Configuration**: Environment-based settings for different deployments
- **Cost-Optimized**: Free tier options for development and production

## 🏗️ Architecture

```
User Query → FastAPI → RAG Service → Vector DB (ChromaDB)
                     ↓
                 LLM Service → Ollama (dev) / Gemini (prod)
                     ↓
                 Response with Sources
```

## 📋 Prerequisites

- Python 3.10+
- [Ollama](https://ollama.com) (for local development)
- Google Gemini API key (for production, free tier available)

## 🚀 Quick Start

### 1. Install Ollama (for development)

```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Pull the model
ollama pull llama3.2
```

### 2. Clone and Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
```

### 3. Configure Environment

Edit `.env`:

```bash
# For development (using Ollama - FREE)
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3.2
ENVIRONMENT=development

# For production (using Gemini - FREE TIER)
# LLM_PROVIDER=gemini
# GEMINI_API_KEY=your-api-key-here
# ENVIRONMENT=production
```

### 4. Ingest Your Data

Add your personal information to `data/personal_data.json`, then:

```bash
python scripts/ingest_data.py
```

### 5. Run the Server

```bash
# Development
uvicorn app.main:app --reload

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Visit http://localhost:8000/docs for interactive API documentation.

## 📡 API Endpoints

### POST /api/chat

Chat with the AI assistant:

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are your technical skills?"
  }'
```

Response:
```json
{
  "response": "I have experience with Python, FastAPI, Vue.js...",
  "conversation_id": "uuid",
  "sources": ["technical_skills", "recent_projects"],
  "model_used": "ollama/llama3.2"
}
```

### GET /api/stats

Get knowledge base statistics:

```bash
curl http://localhost:8000/api/stats
```

## 🔄 Switching Between Ollama and Gemini

### Development (Ollama - Free)

```bash
# .env
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3.2  # or mistral, phi3, etc.
```

### Production (Gemini - Free Tier)

1. Get free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

2. Update `.env`:
```bash
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-pro
```

3. Restart the server

## 📁 Project Structure

```
chatbot-backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Settings management
│   ├── models.py            # Pydantic models
│   ├── routers/
│   │   └── chat.py          # Chat endpoints
│   └── services/
│       ├── llm_service.py   # LLM provider abstraction
│       └── rag_service.py   # Vector DB & retrieval
├── data/
│   └── personal_data.json   # Your portfolio data
├── scripts/
│   └── ingest_data.py       # Data ingestion script
├── chroma_db/               # Vector database (auto-created)
├── requirements.txt
├── .env.example
└── README.md
```

## 🎨 Customization

### Add More Data

Edit `data/personal_data.json`:

```json
[
  {
    "text": "Your information here...",
    "source": "source_identifier"
  }
]
```

Then re-run ingestion:
```bash
python scripts/ingest_data.py
```

### Change Models

**Ollama models:**
- `llama3.2` - Fast, good quality (recommended)
- `mistral` - Excellent performance
- `phi3` - Lightweight, very fast

**Gemini models:**
- `gemini-pro` - Best quality (free tier)
- `gemini-1.5-flash` - Faster, cheaper

### Adjust RAG Settings

In `app/routers/chat.py`, modify the `k` parameter:

```python
# Retrieve more/fewer context documents
context_docs = rag_service.retrieve(request.message, k=3)  # Default: 3
```

## 🚢 Deployment

### Railway (Recommended for backend)

1. Create `Procfile`:
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

2. Push to GitHub

3. Connect Railway to your repo

4. Set environment variables:
   - `LLM_PROVIDER=gemini`
   - `GEMINI_API_KEY=your-key`
   - `ENVIRONMENT=production`

### Render / Fly.io

Similar process - see their respective documentation.

## 💰 Cost Analysis

### Development
- **Ollama**: $0 (runs locally)
- **Total**: $0

### Production (Portfolio Demo)
- **Gemini Free Tier**: 60 requests/min
- **Estimated usage**: ~150 requests/month
- **Cost**: $0

### If Scaling Up
- **Gemini Pay-as-you-go**: ~$0.15/month for 500 requests
- Still very affordable!

## 🧪 Testing

```bash
# Test health check
curl http://localhost:8000/

# Test chat
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about yourself"}'

# Test stats
curl http://localhost:8000/api/stats
```

## 📝 Next Steps

1. **Add Notion Integration**: Fetch data from Notion database
2. **Implement Conversation Memory**: Track multi-turn conversations
3. **Add Rate Limiting**: Protect your API
4. **Streaming Responses**: Better UX with SSE
5. **LinkedIn Integration**: Auto-sync professional info

## 🤝 Frontend Integration

In your Nuxt 3 frontend:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      chatbotApiUrl: process.env.NUXT_PUBLIC_CHATBOT_API_URL || 'http://localhost:8000'
    }
  }
})
```

```typescript
// composables/useChatbot.ts
export const useChatbot = () => {
  const config = useRuntimeConfig()
  
  const sendMessage = async (message: string) => {
    return await $fetch(`${config.public.chatbotApiUrl}/api/chat`, {
      method: 'POST',
      body: { message }
    })
  }
  
  return { sendMessage }
}
```

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [LangChain Documentation](https://python.langchain.com/)
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [Ollama Models](https://ollama.com/library)
- [Google Gemini API](https://ai.google.dev/)

## 📄 License

MIT

---

**Built with ❤️ for showcasing tech lead skills**
