import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Send,
  Loader2,
  FileText,
  User,
  Bot,
  ArrowLeft,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useDocuments } from '../contexts/DocumentContext';
import api from '../services/api';

const ChatPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { getDocument, getConversation, addMessage, clearConversation } = useDocuments();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const document = getDocument(documentId);
  const conversation = getConversation(documentId);

  useEffect(() => {
    if (!document) {
      navigate('/library');
    }
  }, [document, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    addMessage(documentId, {
      role: 'user',
      content: userMessage,
    });

    try {
      const response = await api.sendMessage(document.documentId, userMessage);
      
      addMessage(documentId, {
        role: 'assistant',
        content: response.data.response,
        sources: response.data.sources,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage(documentId, {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, messageId) => {
    navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      clearConversation(documentId);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  if (!document) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="glass-effect border-b border-dark-400 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/library"
              className="p-2 hover:bg-dark-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-350" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent-500/10 border border-accent-500/30 rounded-lg">
                <FileText className="h-5 w-5 text-accent-500" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-100 line-clamp-1">
                  {document.name}
                </h2>
                <p className="text-sm text-gray-450">
                  {conversation.length} messages
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearChat}
              className="p-2 hover:bg-dark-200 rounded-lg transition-colors"
              title="Clear conversation"
            >
              <RefreshCw className="h-5 w-5 text-gray-350" />
            </button>
            <button
              onClick={() => navigate('/library')}
              className="p-2 hover:bg-dark-200 rounded-lg transition-colors"
              title="Back to library"
            >
              <Trash2 className="h-5 w-5 text-gray-350" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {conversation.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="mx-auto w-20 h-20 rounded-full bg-accent-500/10 border border-accent-500/30 flex items-center justify-center mb-6">
                <Sparkles className="h-10 w-10 text-accent-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-100 mb-3">
                Ready to explore your research
              </h3>
              <p className="text-gray-450 max-w-md mx-auto">
                Ask questions about the paper, request summaries, or dive deep into specific sections.
              </p>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  "What are the key findings of this paper?",
                  "Can you summarize the methodology?",
                  "What are the main contributions?",
                  "Explain the results section",
                ].map((suggestion, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setMessage(suggestion)}
                    className="text-left p-4 bg-dark-200 border border-dark-400 rounded-lg hover:border-accent-500/50 transition-colors"
                  >
                    <p className="text-sm text-gray-350">{suggestion}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {conversation.map((msg, index) => (
              <motion.div
                key={msg.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user' 
                      ? 'bg-accent-500/20 border border-accent-500/30' 
                      : 'bg-dark-200 border border-dark-400'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="h-4 w-4 text-accent-500" />
                    ) : (
                      <Bot className="h-4 w-4 text-gray-350" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className={`message-bubble ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    style={vscDarkPlus}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className="bg-dark-300 px-1.5 py-0.5 rounded text-accent-400 text-sm" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                    
                    {msg.role === 'assistant' && (
                      <div className="mt-2 flex items-center space-x-2">
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="p-1.5 text-gray-450 hover:text-gray-100 hover:bg-dark-200 rounded transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex space-x-3 max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-dark-200 border border-dark-400 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-gray-350" />
                </div>
                <div className="assistant-message message-bubble">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-accent-500" />
                    <span className="text-gray-450">Thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="glass-effect border-t border-dark-400 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask about the research paper..."
                className="input-field resize-none pr-12"
                rows="1"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 bg-accent-500 text-dark-950 rounded-lg hover:bg-accent-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-450 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;