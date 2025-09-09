import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Home, Library, Github, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <header className="glass-effect sticky top-0 z-50 border-b border-dark-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <FileText className="h-8 w-8 text-accent-500" />
              </motion.div>
              <span className="text-xl font-bold text-gradient">
                Research Assistant
              </span>
            </Link>

            <nav className="flex items-center space-x-1">
              <NavLink to="/" isActive={isActive('/')} icon={Home}>
                Home
              </NavLink>
              <NavLink to="/library" isActive={isActive('/library')} icon={Library}>
                Library
              </NavLink>
            </nav>

            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-dark-200 transition-colors"
              >
                <Github className="h-5 w-5 text-gray-350" />
              </a>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-accent-500/10 border border-accent-500/30 rounded-full">
                <Sparkles className="h-4 w-4 text-accent-500" />
                <span className="text-sm text-accent-500 font-medium">AI Powered</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          {children}
        </div>
      </main>

      <footer className="glass-effect border-t border-dark-400 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-450 text-sm">
            <p>Built with React, FastAPI & LangChain</p>
            <p className="mt-1">© 2024 Research Assistant - Analyze papers with AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NavLink = ({ to, isActive, icon: Icon, children }) => {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-accent-500/20 text-accent-500 border border-accent-500/30'
          : 'text-gray-350 hover:bg-dark-200 hover:text-gray-100'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="font-medium">{children}</span>
    </Link>
  );
};

export default Layout;