import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Trash2 } from 'lucide-react';
import AdRotator from './AdRotator';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  onTyping?: (isTyping: boolean) => void; // Make it optional with ?
  disabled?: boolean; // Add disabled prop for loading state
}

export default function SearchBar({ onSearch, onClear, onTyping, disabled = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading || disabled) return;
    
    setIsLoading(true);
    await onSearch(query);
    setQuery('');
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    // Check if onTyping is a function before calling it
    if (typeof onTyping === 'function') {
      onTyping(e.target.value.length > 0);
    }
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  const handleClear = () => {
    setQuery('');
    // Check if onTyping is a function before calling it
    if (typeof onTyping === 'function') {
      onTyping(false);
    }
    onClear();
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.focus();
    }
  };

  return (
    <div className="w-full">
      {isLoading && (
        <div className="mb-4">
          <div className="flex flex-col items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Get featured here...
            </p>
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
          
          {/* Ad Rotator Component */}
          <AdRotator isVisible={isLoading} />
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          {/* Recycle bin button to clear chat history */}
          <button
            type="button"
            onClick={onClear}
            className="absolute left-3 z-10 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Clear chat history"
          >
            <Trash2 size={18} />
          </button>
          
          <textarea
            ref={inputRef}
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about Kenyan real estate..."
            className="w-full p-4 pl-10 pr-24 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[56px] max-h-[150px] overflow-y-auto"
            disabled={isLoading || disabled}
          />
          
          <div className="absolute right-2 flex items-center space-x-1">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Clear input"
              >
                <X size={18} />
              </button>
            )}
            
            <button
              type="submit"
              disabled={!query.trim() || isLoading || disabled}
              className={`p-2 rounded-full ${
                !query.trim() || isLoading || disabled
                  ? 'text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                  : 'text-white bg-blue-500 hover:bg-blue-600'
              }`}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}