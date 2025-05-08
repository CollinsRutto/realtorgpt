import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from '@/components/ChatMessage';
import LoadingAnimation from '@/components/LoadingAnimation';
import SearchBar from '@/components/SearchBar';
import { Message, AssistantConfig } from './types';

interface ChatAreaProps {
  messages: Message[];
  chatLoading: boolean;
  currentAssistant: AssistantConfig;
  onSearch: (query: string) => void;
  onClearChat: () => void;
  onChangeAssistant: () => void;
}

export default function ChatArea({
  messages,
  chatLoading,
  currentAssistant,
  onSearch,
  onClearChat,
  onChangeAssistant
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden rounded-2xl shadow-xl bg-white/70 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center bg-white/80 dark:bg-gray-900/80 rounded-t-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-full text-blue-600 dark:text-blue-400 shadow">
            {currentAssistant.icon}
          </div>
          <h2 className="font-bold text-xl text-gray-900 dark:text-gray-100">
            {currentAssistant.name}
          </h2>
        </div>
        <button 
          onClick={onChangeAssistant}
          className="ml-auto text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
        >
          Change
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <div className="max-w-3xl mx-auto p-8">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Start a conversation with {currentAssistant.name}
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {currentAssistant.description}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ChatMessage
                    role={message.role}
                    content={message.content}
                    sources={message.sources}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
          {chatLoading && <LoadingAnimation />}
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 rounded-b-2xl">
        <div className="max-w-3xl mx-auto">
          <SearchBar 
            onSearch={onSearch} 
            onClear={onClearChat}
            disabled={chatLoading}
          />
        </div>
      </div>
    </div>
  );
}