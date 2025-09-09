# Research Assistant RAG Backend

A FastAPI backend implementing RAG (Retrieval-Augmented Generation) using LangChain, Chroma, and OpenAI.

## Features

- **PDF Document Processing**: Upload and process research papers
- **Intelligent Chunking**: Smart text splitting with configurable chunk size and overlap
- **Vector Storage**: Chroma vector database for efficient similarity search
- **Conversational Q&A**: Context-aware responses with conversation history
- **Source Citations**: Answers include references to source documents
- **Session Management**: Track multiple conversation sessions
- **OpenAI Integration**: Uses GPT-4 for generation and text-embedding-3-small for embeddings

## Setup

### 1. Install Dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your OpenAI API key:

```bash
cp .env.example .env
```

Edit `.env` and set:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run the Server

```bash
# Using the startup script
./run.sh

# Or manually
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

## API Endpoints

### Document Management

- `POST /api/v1/rag/upload` - Upload a PDF document
- `POST /api/v1/rag/process-text` - Process raw text
- `DELETE /api/v1/rag/document` - Delete a specific document
- `DELETE /api/v1/rag/documents/all` - Clear all documents

### Querying

- `POST /api/v1/rag/query` - Query documents with conversation context
- `POST /api/v1/rag/search` - Search for similar documents

### Conversation Management

- `GET /api/v1/rag/conversation/{session_id}` - Get conversation history
- `DELETE /api/v1/rag/conversation/{session_id}` - Clear conversation

### System

- `GET /api/v1/rag/status` - Get system status and statistics
- `GET /health` - Health check endpoint

## Testing

Run the test script to verify the installation:

```bash
python test_rag.py
```

## Architecture

```
backend/
├── app/
│   ├── api/
│   │   └── routes/
│   │       └── rag_routes.py      # API endpoints
│   ├── core/
│   │   └── rag/
│   │       ├── vector_store.py    # Chroma vector store management
│   │       ├── document_processor.py # PDF/text processing
│   │       ├── rag_chain.py       # LangChain RAG implementation
│   │       └── rag_service.py     # Main RAG service
│   ├── models/
│   │   └── rag_models.py          # Pydantic models
│   ├── config.py                  # Configuration
│   └── main.py                    # FastAPI app
├── requirements.txt
├── .env.example
└── test_rag.py                    # Test script
```

## Configuration

Key settings in `.env`:

- `OPENAI_MODEL`: GPT model for generation (default: gpt-4-turbo-preview)
- `OPENAI_EMBEDDING_MODEL`: Embedding model (default: text-embedding-3-small)
- `CHUNK_SIZE`: Text chunk size (default: 1000)
- `CHUNK_OVERLAP`: Overlap between chunks (default: 200)
- `TOP_K_RESULTS`: Number of similar documents to retrieve (default: 5)
- `MAX_FILE_SIZE_MB`: Maximum upload file size (default: 50MB)

## Development

The backend uses:
- **FastAPI** for the REST API
- **LangChain** for RAG orchestration
- **Chroma** for vector storage (local, persistent)
- **OpenAI** for LLM and embeddings
- **PyMuPDF** for PDF processing

All data is stored locally in the `chroma_db` directory.