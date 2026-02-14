# 🚀 Quick Start Guide - Personal Portfolio Chatbot

## What You Just Got

A complete **FastAPI backend** with hybrid LLM support (Ollama + Gemini) and RAG system.

## File Structure Created

```
chatbot-backend/
├── app/                      # Main application
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Environment configuration
│   ├── models.py            # Pydantic models
│   ├── routers/
│   │   └── chat.py          # Chat API endpoints
│   └── services/
│       ├── llm_service.py   # Ollama/Gemini abstraction
│       └── rag_service.py   # ChromaDB vector store
├── data/
│   └── personal_data.json   # Your portfolio data (EDIT THIS!)
├── scripts/
│   └── ingest_data.py       # Data ingestion script
├── requirements.txt         # Python dependencies
├── .env.example            # Environment template
├── README.md               # Full documentation
├── Procfile                # Railway deployment
├── setup.sh               # Auto-setup script
└── .gitignore
```

## Installation (5 minutes)

### Option 1: Automated Setup (Recommended)

```bash
# Make setup script executable (if not already)
chmod +x setup.sh

# Run it
./setup.sh
```

This will:
- ✅ Check for Python 3.10+
- ✅ Check for Ollama (or skip if using Gemini)
- ✅ Create virtual environment
- ✅ Install dependencies
- ✅ Setup .env file
- ✅ Ingest sample data

### Option 2: Manual Setup

```bash
# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Setup environment
cp .env.example .env

# 4. Install Ollama (for development)
# Visit: https://ollama.com
ollama pull llama3.2

# 5. Ingest data
python scripts/ingest_data.py
```

## Running the Server

```bash
# Development (with auto-reload)
uvicorn app.main:app --reload

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Server will start at: **http://localhost:8000**

API Docs: **http://localhost:8000/docs**

## Testing It Out

### 1. Health Check
```bash
curl http://localhost:8000/
```

Expected response:
```json
{
  "status": "healthy",
  "llm_provider": "ollama",
  "environment": "development"
}
```

### 2. Ask a Question
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are your technical skills?"}'
```

Expected response:
```json
{
  "response": "I have experience with Python, FastAPI, Vue.js...",
  "conversation_id": "uuid-here",
  "sources": ["technical_skills"],
  "model_used": "ollama/llama3.2"
}
```

### 3. Get Stats
```bash
curl http://localhost:8000/api/stats
```

## Customizing Your Data

1. **Edit** `data/personal_data.json` with your actual information
2. **Re-run** ingestion: `python scripts/ingest_data.py`
3. **Test** your chatbot with questions about yourself

### Sample Data Format

```json
[
  {
    "text": "I am a software engineer with 5 years of experience...",
    "source": "profile"
  },
  {
    "text": "My skills include Python, React, AWS...",
    "source": "skills"
  }
]
```

## Switching Between Ollama and Gemini

### Development (Ollama - FREE)

In `.env`:
```bash
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3.2
ENVIRONMENT=development
```

### Production (Gemini - FREE TIER)

1. Get API key: https://makersuite.google.com/app/apikey

2. In `.env`:
```bash
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-api-key-here
ENVIRONMENT=production
```

3. Restart server

## Deploying to Railway

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Connect Railway**
   - Go to railway.app
   - "New Project" → "Deploy from GitHub"
   - Select your repo

3. **Set Environment Variables**
   ```
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=your-key
   ENVIRONMENT=production
   ALLOWED_ORIGINS=https://yourportfolio.vercel.app
   ```

4. **Deploy!** Railway auto-detects the Procfile

Your backend will be live at: `https://your-app.railway.app`

## Integrating with Your Nuxt Frontend

In your Nuxt project:

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

```vue
<!-- components/ChatBot.vue -->
<script setup>
const config = useRuntimeConfig()

const sendMessage = async (message: string) => {
  const response = await $fetch(`${config.public.chatbotApiUrl}/api/chat`, {
    method: 'POST',
    body: { message }
  })
  return response
}
</script>
```

## Cost Breakdown

### Development
- Ollama: **$0** (runs locally)
- Total: **$0**

### Production
- Gemini Free Tier: 60 req/min (plenty for portfolio)
- Railway: $5 credit/month (enough for small app)
- Total: **~$0-5/month**

## Troubleshooting

### Ollama not working?
```bash
# Check if Ollama is running
ollama list

# Pull model if missing
ollama pull llama3.2

# Test it
ollama run llama3.2 "Hello"
```

### ChromaDB errors?
```bash
# Delete the database and re-ingest
rm -rf chroma_db/
python scripts/ingest_data.py
```

### CORS errors from frontend?
Update `ALLOWED_ORIGINS` in `.env`:
```bash
ALLOWED_ORIGINS=http://localhost:3000,https://yoursite.com
```

## Next Steps

1. ✅ **Customize your data** in `data/personal_data.json`
2. ✅ **Test locally** with different questions
3. ✅ **Add Notion integration** (see README for guide)
4. ✅ **Deploy to Railway**
5. ✅ **Connect your Nuxt frontend**
6. ✅ **Showcase in your portfolio!**

## Pro Tips for Portfolio

1. **Add to your README**:
   - Architecture diagram
   - Tech stack badges
   - Live demo link
   - Screenshots/GIFs

2. **Mention in interviews**:
   - "Implemented RAG system with ChromaDB"
   - "Used hybrid LLM strategy to optimize costs"
   - "Built production-ready API with FastAPI"
   - "Deployed microservices architecture"

3. **Show the code**:
   - Clean abstraction (LLM provider pattern)
   - Type safety (Pydantic models)
   - Proper error handling
   - Documentation

## Support

Questions? Check:
- Full README.md for detailed docs
- /docs endpoint for API documentation
- FastAPI/LangChain official docs

---

**You're ready to build! 🎉**

Run `uvicorn app.main:app --reload` and start chatting!
