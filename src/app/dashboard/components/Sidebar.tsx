import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { HistoryItem } from './types';
import { ASSISTANTS } from './assistantConfig';

interface SidebarProps {
  history: HistoryItem[];
  selectedThreadId: string | null;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  handleNewChat: () => void;
  handleSelectThread: (threadId: string) => void;
  handleDeleteThread: (threadId: string, e: React.MouseEvent) => void;
}

export default function Sidebar({
  history,
  selectedThreadId,
  sidebarCollapsed,
  toggleSidebar,
  handleNewChat,
  handleSelectThread,
  handleDeleteThread
}: SidebarProps) {
  // Determine if we're in mobile view based on the sidebarCollapsed state
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <motion.div 
      layout
      className={`relative bg-white/70 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl rounded-l-2xl h-full transition-all duration-300 ${
        sidebarCollapsed && !isMobileView ? 'w-16' : 'w-72'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 flex items-center justify-between">
          {(!sidebarCollapsed || isMobileView) && (
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-wide">Conversations</h2>
          )}
          {!isMobileView && (
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <motion.div
                animate={{ rotate: sidebarCollapsed ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </motion.div>
            </button>
          )}
        </div>
        
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Plus size={18} />
            {(!sidebarCollapsed || isMobileView) && <span className="font-medium">New Chat</span>}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
          <AnimatePresence>
            {history.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleSelectThread(item.id)}
                className={`flex items-center p-3 rounded-xl cursor-pointer mb-2 group transition-all ${
                  selectedThreadId === item.id 
                    ? 'bg-gray-100 dark:bg-gray-800 shadow-lg' 
                    : 'hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
                }`}
              >
                {(!sidebarCollapsed || isMobileView) ? (
                  <>
                    <div className="flex-1 truncate">
                      <div className="flex items-center gap-2">
                        <div className="text-blue-600 dark:text-blue-400">
                          {ASSISTANTS.find(a => a.type === item.assistantType)?.icon}
                        </div>
                        <span className="truncate text-gray-900 dark:text-gray-300 font-medium">
                          {item.title}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.timestamp.toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteThread(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                      aria-label="Delete conversation"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <div className="w-full flex justify-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-base font-bold text-blue-600 dark:text-blue-400 shadow">
                      {item.title.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {history.length === 0 && (!sidebarCollapsed || isMobileView) && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Start a new chat to begin</p>
            </div>
          )}
        </div>
        
        {/* Floating Action Button for New Chat in collapsed mode */}
        <AnimatePresence>
          {sidebarCollapsed && !isMobileView && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={handleNewChat}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all"
              aria-label="New Chat"
            >
              <Plus size={24} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}