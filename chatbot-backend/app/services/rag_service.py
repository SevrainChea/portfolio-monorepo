from typing import List, Dict
import chromadb
from chromadb.config import Settings as ChromaSettings
from loguru import logger
from app.config import settings
import hashlib


RELEVANCE_THRESHOLD = 0.2


class RAGService:
    """Retrieval-Augmented Generation service using ChromaDB"""
    
    def __init__(self):
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path=settings.chroma_persist_directory,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="portfolio_knowledge",
            metadata={"description": "Personal portfolio information"}
        )
        
        logger.info("ChromaDB initialized with {} documents", self.collection.count())
    
    def ingest_documents(self, documents: List[Dict[str, str]]) -> None:
        """
        Ingest documents into the vector store
        
        Args:
            documents: List of dicts with 'text' and 'source' keys
        """
        if not documents:
            return
        
        texts = [doc["text"] for doc in documents]
        sources = [doc["source"] for doc in documents]
        
        # Generate unique IDs based on content hash
        ids = [
            hashlib.md5(f"{text[:100]}".encode()).hexdigest() 
            for text in texts
        ]
        
        # Add to collection
        self.collection.add(
            documents=texts,
            metadatas=[{"source": source} for source in sources],
            ids=ids
        )
        
        logger.info("Ingested {} documents", len(documents))
    
    def retrieve(self, query: str, k: int = 5) -> List[Dict[str, str]]:
        """
        Retrieve relevant documents for a query

        Args:
            query: Search query
            k: Number of results to retrieve before filtering

        Returns:
            List of dicts with 'text', 'source', and 'relevance' keys
        """
        if self.collection.count() == 0:
            return []

        results = self.collection.query(
            query_texts=[query],
            n_results=min(k, self.collection.count())
        )

        # Format results and filter by relevance threshold
        documents = []
        if results["documents"] and results["documents"][0]:
            distances = results["distances"][0] if results.get("distances") else []
            for i, doc in enumerate(results["documents"][0]):
                # Convert cosine distance to similarity score (cosine distance range is [0, 2])
                distance = distances[i] if i < len(distances) else 2.0
                relevance = (2 - distance) / 2  # Normalize to [0, 1]

                # Filter by relevance threshold
                if relevance >= RELEVANCE_THRESHOLD:
                    documents.append({
                        "text": doc,
                        "source": results["metadatas"][0][i]["source"] if results["metadatas"] else "unknown",
                        "relevance": round(relevance, 2)
                    })

        return documents
    
    def clear(self) -> None:
        """Clear all documents from the collection"""
        self.client.delete_collection("portfolio_knowledge")
        self.collection = self.client.get_or_create_collection(
            name="portfolio_knowledge",
            metadata={"description": "Personal portfolio information"}
        )
        logger.info("Cleared all documents")
    
    def get_stats(self) -> Dict[str, int]:
        """Get collection statistics"""
        return {
            "total_documents": self.collection.count()
        }


# Global RAG service instance
rag_service = RAGService()
