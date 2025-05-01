import React, { useState, KeyboardEvent, useEffect } from 'react';
import { Send, Trash } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear?: () => void;
  onTyping?: (isTyping: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onClear, onTyping }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setQuery('');
      // Notify parent that user is no longer typing
      onTyping && onTyping(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    
    // Notify parent component about typing state
    onTyping && onTyping(newValue.length > 0);
  };

  // Reset typing state when component unmounts
  useEffect(() => {
    return () => {
      onTyping && onTyping(false);
    };
  }, [onTyping]);

  return (
    <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-b-lg transition-colors">
      <form onSubmit={handleSubmit} className="flex items-center gap-1 sm:gap-2">
        {onClear && (
          <button 
            type="button"
            onClick={onClear}
            className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Trash size={18} className="sm:w-5 sm:h-5" />
          </button>
        )}
        
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about Kenyan real estate..."
          className="flex-grow py-2 sm:py-3 px-3 sm:px-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 text-gray-700 dark:text-gray-200 transition-colors text-sm sm:text-base"
        />
        
        <button
          type="submit"
          disabled={!query.trim()}
          className={`p-2 sm:p-3 rounded-full transition-colors ${
            query.trim() 
              ? 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
          }`}
        >
          <Send size={18} className="sm:w-5 sm:h-5" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;