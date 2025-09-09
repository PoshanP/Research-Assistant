# Research Assistant

A local web app for conversational Q&A with research papers using RAG (Retrieval-Augmented Generation).

## Tech Stack
- **Frontend**: React
- **Backend**: FastAPI + LangChain
- **PDF Processing**: PyMuPDF
- **Vector DB**: Chroma (local)
- **LLM**: OpenAI GPT-4 + Embeddings

## Project Goals
- Build React frontend with file upload and chat interface
- Create FastAPI backend with PDF processing pipeline
- Implement RAG system for document Q&A
- Use in-memory storage for documents and conversations
- Enable conversational interaction with research papers

## Key Features
- Upload large PDF research papers
- Extract and chunk text content intelligently
- Generate embeddings and store in local vector database
- Provide contextual answers with source citations
- Maintain conversation history during session

**Note**: Local development only. All data stored in-memory.

## Project Structure

```
/frontend
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Chat/        # Chat interface components
│   │   ├── Upload/      # File upload components
│   │   └── Common/      # Shared components
│   ├── services/        # API client services
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── styles/          # CSS/styling files
│   ├── App.jsx          # Main app component
│   └── index.jsx        # Entry point
├── package.json
└── vite.config.js       # Vite configuration

/backend
├── app/
│   ├── api/             # API endpoints
│   │   ├── routes/      # Route definitions
│   │   └── middleware/  # API middleware
│   ├── core/            # Core business logic
│   │   ├── pdf/         # PDF processing
│   │   ├── rag/         # RAG implementation
│   │   └── embeddings/  # Embedding generation
│   ├── models/          # Data models
│   ├── services/        # Business services
│   ├── utils/           # Utility functions
│   ├── config.py        # Configuration settings
│   └── main.py          # FastAPI app entry point
├── tests/               # Test files
├── requirements.txt     # Python dependencies
└── .env.example         # Environment variables template