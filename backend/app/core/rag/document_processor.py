from typing import List, Dict, Any, Optional
import logging
import fitz  # PyMuPDF
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from app.config import settings
import hashlib
from datetime import datetime

logger = logging.getLogger(__name__)


class DocumentProcessor:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            length_function=len,
            separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""]
        )
    
    def process_pdf(self, file_path: str, file_name: str, metadata: Optional[Dict[str, Any]] = None) -> List[Document]:
        try:
            text = self._extract_text_from_pdf(file_path)
            
            if not text.strip():
                raise ValueError("No text content found in PDF")
            
            document_id = self._generate_document_id(file_name)
            
            base_metadata = {
                "source": file_name,
                "document_id": document_id,
                "file_type": "pdf",
                "processed_at": datetime.utcnow().isoformat(),
                "total_characters": len(text)
            }
            
            if metadata:
                base_metadata.update(metadata)
            
            chunks = self.text_splitter.split_text(text)
            
            documents = []
            for i, chunk in enumerate(chunks):
                chunk_metadata = base_metadata.copy()
                chunk_metadata.update({
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                    "chunk_size": len(chunk)
                })
                
                doc = Document(
                    page_content=chunk,
                    metadata=chunk_metadata
                )
                documents.append(doc)
            
            logger.info(f"Processed PDF into {len(documents)} chunks")
            return documents
            
        except Exception as e:
            logger.error(f"Failed to process PDF: {e}")
            raise
    
    def _extract_text_from_pdf(self, file_path: str) -> str:
        text = ""
        try:
            pdf_document = fitz.open(file_path)
            
            for page_num in range(pdf_document.page_count):
                page = pdf_document[page_num]
                page_text = page.get_text()
                
                if page_text:
                    text += f"\n--- Page {page_num + 1} ---\n"
                    text += page_text
            
            pdf_document.close()
            
            text = self._clean_text(text)
            logger.info(f"Extracted {len(text)} characters from PDF")
            return text
            
        except Exception as e:
            logger.error(f"Failed to extract text from PDF: {e}")
            raise
    
    def _clean_text(self, text: str) -> str:
        text = text.replace('\x00', '')
        text = ' '.join(text.split())
        
        lines = text.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            if line and len(line) > 1:
                cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines)
    
    def _generate_document_id(self, file_name: str) -> str:
        timestamp = datetime.utcnow().isoformat()
        unique_string = f"{file_name}_{timestamp}"
        return hashlib.md5(unique_string.encode()).hexdigest()
    
    def process_text(self, text: str, source: str, metadata: Optional[Dict[str, Any]] = None) -> List[Document]:
        try:
            document_id = self._generate_document_id(source)
            
            base_metadata = {
                "source": source,
                "document_id": document_id,
                "file_type": "text",
                "processed_at": datetime.utcnow().isoformat(),
                "total_characters": len(text)
            }
            
            if metadata:
                base_metadata.update(metadata)
            
            chunks = self.text_splitter.split_text(text)
            
            documents = []
            for i, chunk in enumerate(chunks):
                chunk_metadata = base_metadata.copy()
                chunk_metadata.update({
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                    "chunk_size": len(chunk)
                })
                
                doc = Document(
                    page_content=chunk,
                    metadata=chunk_metadata
                )
                documents.append(doc)
            
            logger.info(f"Processed text into {len(documents)} chunks")
            return documents
            
        except Exception as e:
            logger.error(f"Failed to process text: {e}")
            raise