#!/usr/bin/env python3
"""
Test script for RAG implementation
Run this after setting up your .env file with OPENAI_API_KEY
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.core.rag import RAGService
from app.config import settings


def test_rag_service():
    print(f"Testing RAG Service...")
    print(f"OpenAI Model: {settings.OPENAI_MODEL}")
    print(f"Embedding Model: {settings.OPENAI_EMBEDDING_MODEL}")
    print(f"Chroma Directory: {settings.CHROMA_PERSIST_DIRECTORY}")
    
    # Initialize RAG service
    try:
        rag_service = RAGService()
        print("✅ RAG Service initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize RAG Service: {e}")
        return
    
    # Test text processing
    try:
        sample_text = """
        This is a sample research paper about artificial intelligence.
        Machine learning has revolutionized many fields including computer vision,
        natural language processing, and robotics. Deep learning models have
        achieved state-of-the-art performance on various benchmarks.
        """
        
        result = rag_service.process_text(
            text=sample_text,
            source="test_document.txt"
        )
        print(f"✅ Text processing successful: {result['chunks_created']} chunks created")
    except Exception as e:
        print(f"❌ Failed to process text: {e}")
        return
    
    # Test querying
    try:
        query_result = rag_service.query_documents(
            question="What has machine learning revolutionized?",
            session_id="test_session"
        )
        print(f"✅ Query successful")
        print(f"   Answer: {query_result['answer'][:200]}...")
    except Exception as e:
        print(f"❌ Failed to query documents: {e}")
        return
    
    # Test search
    try:
        search_results = rag_service.search_similar_documents(
            query="artificial intelligence",
            k=3
        )
        print(f"✅ Search successful: Found {len(search_results)} similar documents")
    except Exception as e:
        print(f"❌ Failed to search documents: {e}")
        return
    
    # Get stats
    try:
        stats = rag_service.get_stats()
        print(f"✅ Stats retrieved:")
        print(f"   Total chunks: {stats['total_chunks']}")
        print(f"   Active sessions: {stats['active_sessions']}")
        print(f"   Vector store status: {stats['vector_store_status']}")
    except Exception as e:
        print(f"❌ Failed to get stats: {e}")
    
    # Clean up
    try:
        rag_service.clear_all_documents()
        print("✅ Cleanup successful")
    except Exception as e:
        print(f"❌ Failed to cleanup: {e}")
    
    print("\n✅ All tests passed!")


if __name__ == "__main__":
    # Check if .env file exists
    env_file = backend_dir / ".env"
    if not env_file.exists():
        print("⚠️  .env file not found. Creating from .env.example...")
        example_env = backend_dir / ".env.example"
        if example_env.exists():
            print("Please copy .env.example to .env and add your OPENAI_API_KEY")
            sys.exit(1)
    
    # Check if OPENAI_API_KEY is set
    if not settings.OPENAI_API_KEY:
        print("❌ OPENAI_API_KEY not set in .env file")
        print("Please add your OpenAI API key to the .env file")
        sys.exit(1)
    
    test_rag_service()