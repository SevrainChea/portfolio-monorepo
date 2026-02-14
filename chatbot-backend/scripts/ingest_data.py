#!/usr/bin/env python3
"""
Script to ingest initial personal data into ChromaDB
Run this once to populate the vector store with your portfolio information
"""

import json
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.rag_service import rag_service


def load_personal_data(file_path: str = "data/personal_data.json"):
    """Load personal data from JSON file"""
    with open(file_path, 'r') as f:
        return json.load(f)


def main():
    print("🔄 Starting data ingestion...")
    
    # Load data
    try:
        documents = load_personal_data()
        print(f"📄 Loaded {len(documents)} documents from personal_data.json")
    except FileNotFoundError:
        print("❌ Error: personal_data.json not found in data/ directory")
        return
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON: {e}")
        return
    
    # Clear existing data (optional - comment out if you want to append)
    print("🗑️ Clearing existing data...")
    rag_service.clear()
    
    # Ingest documents
    rag_service.ingest_documents(documents)
    
    # Show stats
    stats = rag_service.get_stats()
    print(f"\n✅ Ingestion complete!")
    print(f"📊 Total documents in knowledge base: {stats['total_documents']}")
    
    # Test retrieval
    print("\n🔍 Testing retrieval with sample query...")
    test_query = "What are your technical skills?"
    results = rag_service.retrieve(test_query, k=2)
    
    print(f"\nQuery: '{test_query}'")
    print(f"Retrieved {len(results)} relevant documents:")
    for i, doc in enumerate(results, 1):
        print(f"\n{i}. Source: {doc['source']}")
        print(f"   Text: {doc['text'][:100]}...")


if __name__ == "__main__":
    main()
