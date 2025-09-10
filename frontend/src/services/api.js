import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default {
  // Document/RAG endpoints
  uploadDocument: (formData, config = {}) => {
    return api.post('/v1/rag/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    });
  },

  // Chat endpoints
  sendMessage: (message, sessionId = null) => {
    return api.post('/chat/message', {
      message: message,
      session_id: sessionId,
      context: []
    });
  },

  getSessions: () => {
    return api.get('/chat/sessions');
  },

  getSession: (sessionId) => {
    return api.get(`/chat/sessions/${sessionId}`);
  },

  deleteSession: (sessionId) => {
    return api.delete(`/chat/sessions/${sessionId}`);
  },

  clearSession: (sessionId) => {
    return api.post(`/chat/sessions/${sessionId}/clear`);
  },

  // RAG query endpoint
  queryDocuments: (query, sessionId) => {
    return api.post('/v1/rag/query', {
      collection_id: sessionId,
      query: query
    });
  },

  // Collection management
  deleteCollection: (collectionId) => {
    return api.delete(`/v1/rag/collection/${collectionId}`);
  },

  getCollectionInfo: (collectionId) => {
    return api.get(`/v1/rag/collection/${collectionId}/info`);
  }
};