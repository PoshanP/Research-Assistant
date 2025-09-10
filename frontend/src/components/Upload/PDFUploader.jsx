import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useDocuments } from '../../contexts/DocumentContext';
import api from '../../services/api';

const PDFUploader = () => {
  const navigate = useNavigate();
  const { addDocument, setIsLoading } = useDocuments();
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      setError('Please upload a valid PDF file (max 50MB)');
      return;
    }

    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setUploadStatus(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize: 50 * 1024 * 1024,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setUploadProgress(0);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const simulateProgress = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await api.uploadDocument(formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      clearInterval(simulateProgress);
      setUploadProgress(100);

      const newDoc = addDocument({
        name: selectedFile.name,
        size: selectedFile.size,
        documentId: response.data.document_id,
        pageCount: response.data.page_count || 0,
      });

      setUploadStatus('success');

      setTimeout(() => {
        navigate('/library');
      }, 1500);

    } catch (err) {
      console.error('Upload failed:', err);
      setUploadStatus('error');
      setError(err.response?.data?.detail || 'Failed to upload document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadStatus(null);
    setUploadProgress(0);
    setError(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300
          ${isDragActive 
            ? 'border-accent-500 bg-accent-500/10' 
            : 'border-dark-400 hover:border-dark-500 bg-dark-100/50'
          }
          ${selectedFile ? 'cursor-default' : 'cursor-pointer'}
        `}
      >
        <input {...getInputProps()} disabled={selectedFile !== null} />
        
        <div className="p-12">
          {!selectedFile ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ y: isDragActive ? -10 : 0 }}
                transition={{ duration: 0.2 }}
                className="mx-auto w-20 h-20 rounded-full bg-accent-500/10 border border-accent-500/30 flex items-center justify-center mb-6"
              >
                <Upload className="h-10 w-10 text-accent-500" />
              </motion.div>
              
              <h3 className="text-xl font-semibold text-gray-100 mb-2">
                {isDragActive ? 'Drop your PDF here' : 'Upload Research Paper'}
              </h3>
              <p className="text-gray-450 mb-4">
                Drag and drop your PDF file here, or click to browse
              </p>
              <p className="text-sm text-gray-450">
                Maximum file size: 50MB
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="file-selected"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between p-4 bg-dark-200 rounded-lg border border-dark-400">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-accent-500" />
                    <div>
                      <p className="font-medium text-gray-100">{selectedFile.name}</p>
                      <p className="text-sm text-gray-450">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  {uploadStatus !== 'uploading' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-450" />
                    </button>
                  )}
                </div>

                {uploadStatus === 'uploading' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-450">Uploading...</span>
                      <span className="text-accent-500 font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-dark-300 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-gradient-to-r from-accent-400 to-accent-500"
                      />
                    </div>
                  </div>
                )}

                {uploadStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center space-x-2 text-green-500"
                  >
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Upload successful! Redirecting to chat...</span>
                  </motion.div>
                )}

                {uploadStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center space-x-2 text-red-500"
                  >
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                {!uploadStatus && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpload();
                    }}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <Upload className="h-5 w-5" />
                    <span>Start Processing</span>
                  </motion.button>
                )}

                {uploadStatus === 'uploading' && (
                  <button
                    disabled
                    className="w-full btn-primary flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed"
                  >
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {error && !selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
        >
          <div className="flex items-center space-x-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PDFUploader;