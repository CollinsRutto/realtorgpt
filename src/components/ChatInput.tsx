'use client';

import React, { useState } from 'react';
import { Trash2, Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onClearHistory?: () => void;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onClearHistory,
  placeholder = "Ask me anything about Kenyan real estate..."
}) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="relative flex items-center w-full max-w-3xl mx-auto">
      {/* Trash icon for clearing history */}
      {onClearHistory && (
        <button
          onClick={onClearHistory}
          className="absolute left-3 text-gray-400 hover:text-red-500 transition-colors z-10"
          aria-label="Clear chat history"
          type="button"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      )}
      
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${onClearHistory ? 'pl-12' : 'pl-4'} pr-12 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
      />
      
      <button
        onClick={handleSendMessage}
        className="absolute right-3 text-blue-500 hover:text-blue-700 transition-colors"
        aria-label="Send message"
        type="button"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ChatInput;