#!/bin/bash

echo "🚀 Personal Portfolio Chatbot - Quick Setup"
echo "==========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10 or higher."
    exit 1
fi

echo "✅ Python 3 found"

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "⚠️  Ollama is not installed."
    echo "   Install it from: https://ollama.com"
    echo "   Or continue with Gemini API (you'll need an API key)"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Ollama found"
    
    # Check if llama3.2 is available
    if ! ollama list | grep -q "llama3.2"; then
        echo "📥 Pulling llama3.2 model..."
        ollama pull llama3.2
    else
        echo "✅ llama3.2 model already available"
    fi
fi

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo "✅ Dependencies installed"

# Setup .env file
if [ ! -f ".env" ]; then
    echo "⚙️  Setting up .env file..."
    cp .env.example .env
    echo "✅ .env file created (edit it with your API keys if needed)"
else
    echo "✅ .env file already exists"
fi

# Run data ingestion
echo ""
echo "📊 Ingesting sample data..."
python scripts/ingest_data.py

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit data/personal_data.json with your information"
echo "2. Re-run: python scripts/ingest_data.py"
echo "3. Start server: uvicorn app.main:app --reload"
echo ""
echo "Or just run: uvicorn app.main:app --reload to start now!"
