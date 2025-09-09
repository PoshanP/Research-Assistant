from typing import List, Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.schema import Document, BaseMessage
from app.config import settings
from app.core.rag.vector_store import VectorStoreManager
import logging

logger = logging.getLogger(__name__)


class RAGChain:
    def __init__(self, vector_store_manager: VectorStoreManager):
        self.vector_store_manager = vector_store_manager
        self.llm = self._initialize_llm()
        self.memory = self._initialize_memory()
        self.chain = None
        self._setup_chain()
    
    def _initialize_llm(self):
        return ChatOpenAI(
            model=settings.OPENAI_MODEL,
            temperature=settings.TEMPERATURE,
            openai_api_key=settings.OPENAI_API_KEY,
            max_tokens=settings.MAX_CONTEXT_LENGTH
        )
    
    def _initialize_memory(self):
        return ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            output_key="answer"
        )
    
    def _setup_chain(self):
        system_template = """You are an expert research assistant specializing in analyzing academic papers and research documents. 
        Use the following pieces of context to answer the question at the end. 
        If you don't know the answer based on the context, just say that you don't know, don't try to make up an answer.
        Always cite the source document when providing information from it.
        
        Context: {context}
        
        Chat History: {chat_history}
        
        Question: {question}
        
        Provide a detailed, well-structured answer based on the research papers provided. Include relevant citations and page references when available."""
        
        qa_prompt = PromptTemplate(
            template=system_template,
            input_variables=["context", "chat_history", "question"]
        )
        
        retriever = self.vector_store_manager.get_retriever()
        
        self.chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=retriever,
            memory=self.memory,
            combine_docs_chain_kwargs={"prompt": qa_prompt},
            return_source_documents=True,
            verbose=True
        )
    
    def query(self, question: str, chat_history: Optional[List[tuple]] = None) -> Dict[str, Any]:
        try:
            if chat_history:
                for human, ai in chat_history:
                    self.memory.chat_memory.add_user_message(human)
                    self.memory.chat_memory.add_ai_message(ai)
            
            response = self.chain({"question": question})
            
            sources = []
            for doc in response.get("source_documents", []):
                sources.append({
                    "content": doc.page_content[:200] + "...",
                    "metadata": doc.metadata,
                    "source": doc.metadata.get("source", "Unknown"),
                    "chunk_index": doc.metadata.get("chunk_index", 0)
                })
            
            return {
                "answer": response["answer"],
                "sources": sources,
                "question": question
            }
            
        except Exception as e:
            logger.error(f"Failed to process query: {e}")
            raise
    
    def clear_memory(self):
        self.memory.clear()
        logger.info("Cleared conversation memory")
    
    def get_conversation_history(self) -> List[Dict[str, str]]:
        messages = self.memory.chat_memory.messages
        history = []
        
        for i in range(0, len(messages), 2):
            if i + 1 < len(messages):
                history.append({
                    "human": messages[i].content,
                    "ai": messages[i + 1].content
                })
        
        return history


class SimpleRAGChain:
    def __init__(self, vector_store_manager: VectorStoreManager):
        self.vector_store_manager = vector_store_manager
        self.llm = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            temperature=settings.TEMPERATURE,
            openai_api_key=settings.OPENAI_API_KEY
        )
    
    def query(self, question: str, k: int = settings.TOP_K_RESULTS) -> Dict[str, Any]:
        try:
            relevant_docs = self.vector_store_manager.similarity_search_with_score(
                query=question,
                k=k
            )
            
            context = "\n\n".join([doc.page_content for doc, _ in relevant_docs])
            
            prompt = f"""You are an expert research assistant. Based on the following context from research papers, 
            provide a comprehensive answer to the question. Include citations when referencing specific information.
            
            Context:
            {context}
            
            Question: {question}
            
            Answer:"""
            
            response = self.llm.predict(prompt)
            
            sources = []
            for doc, score in relevant_docs:
                sources.append({
                    "content": doc.page_content[:200] + "...",
                    "metadata": doc.metadata,
                    "source": doc.metadata.get("source", "Unknown"),
                    "relevance_score": float(score)
                })
            
            return {
                "answer": response,
                "sources": sources,
                "question": question
            }
            
        except Exception as e:
            logger.error(f"Failed to process simple query: {e}")
            raise