#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Research Assistant RAG Backend...${NC}"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}Please edit .env file and add your OPENAI_API_KEY${NC}"
    exit 1
fi

# Check if OPENAI_API_KEY is set
if ! grep -q "OPENAI_API_KEY=sk-" .env; then
    echo -e "${RED}OPENAI_API_KEY not properly set in .env file${NC}"
    echo -e "${RED}Please add your OpenAI API key to the .env file${NC}"
    exit 1
fi

# Create chroma_db directory if it doesn't exist
mkdir -p chroma_db

# Start the server
echo -e "${GREEN}Starting FastAPI server...${NC}"
echo -e "${GREEN}API Documentation available at: http://localhost:8000/docs${NC}"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload