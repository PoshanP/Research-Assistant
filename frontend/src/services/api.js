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
  uploadDocument: (formData, config = {}) => {
    return api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    });
  },

  sendMessage: (documentId, message) => {
    return api.post('/chat', {
      document_id: documentId,
      message: message,
    });
  },

  getDocument: (documentId) => {
    return api.get(`/documents/${documentId}`);
  },

  deleteDocument: (documentId) => {
    return api.delete(`/documents/${documentId}`);
  },
};