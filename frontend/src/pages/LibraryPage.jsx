import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  FileText, 
  MessageSquare, 
  Clock, 
  Trash2, 
  Search,
  FolderOpen,
  Plus,
  ChevronRight
} from 'lucide-react';
import { useDocuments } from '../contexts/DocumentContext';
import PDFUploader from '../components/Upload/PDFUploader';

const LibraryPage = () => {
  const { documents, removeDocument, getConversation } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (e, docId) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDeletingId(docId);
    setTimeout(() => {
      removeDocument(docId);
      setDeletingId(null);
    }, 300);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-100 mb-2">
              Document Library
            </h1>
            <p className="text-gray-450">
              Manage and access all your uploaded research papers
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUploader(!showUploader)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Upload New</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {showUploader && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <PDFUploader />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-450" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-12"
          />
        </div>
      </motion.div>

      {filteredDocuments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="mx-auto w-24 h-24 rounded-full bg-dark-200 flex items-center justify-center mb-6">
            <FolderOpen className="h-12 w-12 text-gray-450" />
          </div>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">
            {searchQuery ? 'No documents found' : 'No documents yet'}
          </h3>
          <p className="text-gray-450 mb-6">
            {searchQuery 
              ? 'Try adjusting your search query' 
              : 'Upload your first research paper to get started'}
          </p>
          {!searchQuery && !showUploader && (
            <button
              onClick={() => setShowUploader(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Upload Document</span>
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredDocuments.map((doc, index) => {
              const messageCount = getConversation(doc.id).length;
              const isDeleting = deletingId === doc.id;

              return (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: isDeleting ? 0 : 1, 
                    y: 0,
                    scale: isDeleting ? 0.9 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.05,
                  }}
                >
                  <Link
                    to={`/chat/${doc.id}`}
                    className="block h-full"
                  >
                    <div className="card h-full flex flex-col hover-glow group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-accent-500/10 border border-accent-500/30 rounded-lg">
                          <FileText className="h-6 w-6 text-accent-500" />
                        </div>
                        <button
                          onClick={(e) => handleDelete(e, doc.id)}
                          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-dark-300 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>

                      <h3 className="font-semibold text-gray-100 mb-2 line-clamp-2">
                        {doc.name}
                      </h3>

                      <div className="space-y-2 text-sm text-gray-450 mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{format(new Date(doc.uploadedAt), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>{messageCount} messages</span>
                        </div>
                        {doc.size && (
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>{formatFileSize(doc.size)}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto pt-4 border-t border-dark-400">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-accent-500 font-medium">
                            Open Chat
                          </span>
                          <ChevronRight className="h-4 w-4 text-accent-500 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default LibraryPage;