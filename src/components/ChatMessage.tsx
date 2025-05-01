import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Home } from 'lucide-react';

interface Source {
  title: string;
  url: string;
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, sources = [] }) => {
  const isAssistant = role === 'assistant';
  
  return (
    <motion.div
      className={`flex mb-3 sm:mb-4 ${isAssistant ? 'justify-start' : 'justify-end'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isAssistant && (
        <div className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 bg-blue-500 dark:bg-blue-600 flex items-center justify-center">
          <Home className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-[85%] sm:max-w-[80%] ${
        isAssistant 
          ? 'text-gray-800 dark:text-gray-200 prose dark:prose-invert' 
          : 'bg-blue-500 dark:bg-blue-600 text-white p-2 sm:p-3 rounded-lg'
      }`}>
        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm">
          <ReactMarkdown>
            {content}
          </ReactMarkdown>
        </div>
        
        {isAssistant && sources && sources.length > 0 && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Sources:
            <ol className="list-decimal ml-4 sm:ml-5 mt-1">
              {sources.map((source, index) => (
                <li key={index} className="mb-1">
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {source.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
      
      {!isAssistant && (
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 ml-2 flex-shrink-0 text-xs sm:text-sm">
          You
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;