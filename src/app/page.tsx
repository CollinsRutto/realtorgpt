'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import Header from '@/components/Header';
import StarField from '@/components/StarField';
import ChatMessage from '@/components/ChatMessage';
import LoadingAnimation from '@/components/LoadingAnimation';
import QueryCategories from '@/components/QueryCategories';
import SearchBar from '@/components/SearchBar';
import IntroSection from '@/components/IntroSection';
import { getDeepSeekService } from '@/utils/deepseekService';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string }>;
};

export default function ChatPage() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const shouldShowIntro = showIntro && !isTyping && messages.length === 0;

  const handleSearch = async (query: string) => {
    if (!query?.trim()) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setLoading(true);
    
    try {
      // Format recent conversation history for the API
      const messageHistory = messages
        .slice(-5)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      // Use the deepseek service with fallback
      const deepseekService = getDeepSeekService();
      const result = await deepseekService.queryWithFallback(query, messageHistory, 'general');
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.response
      }]);
    } catch (error) {
      console.error('Query error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSelect = (question: string) => {
    handleSearch(question);
    setShowCategories(false);
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowIntro(true);
  };

  const toggleCategories = () => {
    setShowCategories(prev => !prev);
  };

  const handleBackClick = () => {
    setShowCategories(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <StarField starCount={150} />
      
      <Header />
      
      <motion.main 
        className="flex-grow flex flex-col p-4 max-w-4xl mx-auto w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex-grow overflow-y-auto mb-4">
          <AnimatePresence>
            {shouldShowIntro && (
              <motion.div
                key="intro"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <IntroSection />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <ChatMessage
                  role={message.role}
                  content={message.content}
                  sources={message.sources}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
          {loading && <LoadingAnimation />}
        </div>

        {showCategories ? (
          <QueryCategories 
            onQuestionSelect={handleQuestionSelect} 
            onBackClick={handleBackClick} 
          />
        ) : (
          <SearchBar 
            onSearch={handleSearch} 
            onClear={handleClearChat} 
            onTyping={setIsTyping}
          />
        )}

        {!showCategories && (
          <div className="p-2 bg-transparent flex justify-center">
            <button 
              onClick={toggleCategories}
              className="text-blue-500 dark:text-blue-400 flex items-center gap-1 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span>Popular Questions</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 8.5L2 4.5H10L6 8.5Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        )}
      </motion.main>
    </div>
  );
}