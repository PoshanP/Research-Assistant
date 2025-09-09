from typing import List, Optional, Dict, Any
import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.schema import Document
import logging
from app.config import settings

logger = logging.getLogger(__name__)


class VectorStoreManager:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            model=settings.OPENAI_EMBEDDING_MODEL,
            openai_api_key=settings.OPENAI_API_KEY
        )
        self.collection_name = settings.CHROMA_COLLECTION_NAME
        self.persist_directory = settings.CHROMA_PERSIST_DIRECTORY
        self.vector_store = None
        self._initialize_store()
    
    def _initialize_store(self):
        try:
            chroma_settings = ChromaSettings(
                persist_directory=self.persist_directory,
                anonymized_telemetry=False
            )
            
            self.vector_store = Chroma(
                collection_name=self.collection_name,
                embedding_function=self.embeddings,
                persist_directory=self.persist_directory,
                client_settings=chroma_settings
            )
            logger.info(f"Initialized Chroma vector store at {self.persist_directory}")
        except Exception as e:
            logger.error(f"Failed to initialize vector store: {e}")
            raise
    
    def add_documents(
        self,
        documents: List[Document],
        ids: Optional[List[str]] = None,
        metadata: Optional[List[Dict[str, Any]]] = None
    ) -> List[str]:
        try:
            if metadata:
                for doc, meta in zip(documents, metadata):
                    doc.metadata.update(meta)
            
            ids = self.vector_store.add_documents(documents=documents, ids=ids)
            logger.info(f"Added {len(documents)} documents to vector store")
            return ids
        except Exception as e:
            logger.error(f"Failed to add documents: {e}")
            raise
    
    def similarity_search(
        self,
        query: str,
        k: int = settings.TOP_K_RESULTS,
        filter: Optional[Dict[str, Any]] = None
    ) -> List[Document]:
        try:
            results = self.vector_store.similarity_search(
                query=query,
                k=k,
                filter=filter
            )
            logger.info(f"Found {len(results)} similar documents for query")
            return results
        except Exception as e:
            logger.error(f"Failed to search documents: {e}")
            raise
    
    def similarity_search_with_score(
        self,
        query: str,
        k: int = settings.TOP_K_RESULTS,
        filter: Optional[Dict[str, Any]] = None
    ) -> List[tuple[Document, float]]:
        try:
            results = self.vector_store.similarity_search_with_score(
                query=query,
                k=k,
                filter=filter
            )
            logger.info(f"Found {len(results)} similar documents with scores")
            return results
        except Exception as e:
            logger.error(f"Failed to search documents with score: {e}")
            raise
    
    def delete_collection(self):
        try:
            if self.vector_store:
                self.vector_store.delete_collection()
                logger.info("Deleted vector store collection")
        except Exception as e:
            logger.error(f"Failed to delete collection: {e}")
            raise
    
    def clear_documents(self, document_id: Optional[str] = None):
        try:
            if document_id:
                collection = self.vector_store._collection
                collection.delete(where={"document_id": document_id})
                logger.info(f"Deleted documents with document_id: {document_id}")
            else:
                self.delete_collection()
                self._initialize_store()
                logger.info("Cleared all documents from vector store")
        except Exception as e:
            logger.error(f"Failed to clear documents: {e}")
            raise
    
    def get_retriever(self, search_kwargs: Optional[Dict[str, Any]] = None):
        if not search_kwargs:
            search_kwargs = {"k": settings.TOP_K_RESULTS}
        
        return self.vector_store.as_retriever(search_kwargs=search_kwargs)