import React, { createContext, useContext, useState, useEffect } from 'react';

const DocumentContext = createContext();

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [conversations, setConversations] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedDocs = localStorage.getItem('documents');
    const savedConvos = localStorage.getItem('conversations');
    
    if (savedDocs) {
      setDocuments(JSON.parse(savedDocs));
    }
    if (savedConvos) {
      setConversations(JSON.parse(savedConvos));
    }
  }, []);

  const addDocument = (doc) => {
    const newDoc = {
      ...doc,
      id: Date.now().toString(),
      uploadedAt: new Date().toISOString(),
    };
    
    const updatedDocs = [...documents, newDoc];
    setDocuments(updatedDocs);
    localStorage.setItem('documents', JSON.stringify(updatedDocs));
    
    return newDoc;
  };

  const removeDocument = (docId) => {
    const updatedDocs = documents.filter(doc => doc.id !== docId);
    setDocuments(updatedDocs);
    localStorage.setItem('documents', JSON.stringify(updatedDocs));
    
    const updatedConvos = { ...conversations };
    delete updatedConvos[docId];
    setConversations(updatedConvos);
    localStorage.setItem('conversations', JSON.stringify(updatedConvos));
  };

  const getDocument = (docId) => {
    return documents.find(doc => doc.id === docId);
  };

  const addMessage = (docId, message) => {
    const docConversations = conversations[docId] || [];
    const updatedConversations = {
      ...conversations,
      [docId]: [...docConversations, {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      }],
    };
    
    setConversations(updatedConversations);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
  };

  const getConversation = (docId) => {
    return conversations[docId] || [];
  };

  const clearConversation = (docId) => {
    const updatedConversations = {
      ...conversations,
      [docId]: [],
    };
    
    setConversations(updatedConversations);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
  };

  const value = {
    documents,
    currentDocument,
    conversations,
    isLoading,
    setIsLoading,
    setCurrentDocument,
    addDocument,
    removeDocument,
    getDocument,
    addMessage,
    getConversation,
    clearConversation,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};