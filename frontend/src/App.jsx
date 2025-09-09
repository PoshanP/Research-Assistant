import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Common/Layout';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import ChatPage from './pages/ChatPage';
import { DocumentProvider } from './contexts/DocumentContext';

function App() {
  return (
    <DocumentProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/chat/:documentId" element={<ChatPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </DocumentProvider>
  );
}

export default App;