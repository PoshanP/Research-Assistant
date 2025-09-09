import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Zap, Brain, Shield, ArrowRight } from 'lucide-react';
import PDFUploader from '../components/Upload/PDFUploader';

const HomePage = () => {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process and analyze research papers in seconds',
    },
    {
      icon: Brain,
      title: 'AI-Powered',
      description: 'Advanced RAG system for intelligent Q&A',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your documents stay local and private',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-gradient">Unlock Insights</span>
          <span className="text-gray-100"> from Research Papers</span>
        </h1>
        <p className="text-xl text-gray-350 max-w-3xl mx-auto">
          Upload your PDF research papers and engage in intelligent conversations.
          Our AI-powered RAG system helps you understand complex research in minutes.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-12"
      >
        <PDFUploader />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            className="card hover-glow group cursor-pointer"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-accent-500/10 border border-accent-500/30 rounded-lg group-hover:bg-accent-500/20 transition-colors">
                <feature.icon className="h-6 w-6 text-accent-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-350">
                  {feature.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-center"
      >
        <div className="inline-flex items-center space-x-2 text-gray-450">
          <FileText className="h-5 w-5" />
          <span>Supports PDF files up to 50MB</span>
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;