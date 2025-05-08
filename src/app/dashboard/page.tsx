'use client';

import React, { useState, useEffect } from 'react';
import { useChat } from './components/useChat';
import ChatArea from './components/ChatArea';
import Sidebar from './components/Sidebar';
import DashboardLayout from './components/DashboardLayout';
import AssistantSelector from './components/AssistantSelector';
import Header from '@/components/Header';
import { Menu, X, ArrowLeft } from 'lucide-react';
import { ASSISTANTS } from './components/assistantConfig';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const {
    history,
    messages,
    selectedThreadId,
    selectedAssistant,
    chatLoading,
    handleSearch,
    handleSelectThread,
    handleNewChat,
    handleDeleteThread,
    setSelectedAssistant,
  } = useChat();

  // Find the current assistant configuration based on the selected type
  const currentAssistant = ASSISTANTS.find(a => a.type === selectedAssistant) || ASSISTANTS[0];

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showAssistantSelector, setShowAssistantSelector] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(!showMobileSidebar);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleChangeAssistant = () => {
    setShowAssistantSelector(true);
  };

  const handleAssistantSelected = (type: typeof selectedAssistant) => {
    setSelectedAssistant(type);
    setShowAssistantSelector(false);
  };

  const handleBackToChat = () => {
    setShowAssistantSelector(false);
  };

  return (
    <DashboardLayout>
      {/* Header similar to chat page */}
      <Header />
      
      <div className="flex-1 flex relative h-[calc(100vh-64px)] overflow-hidden">
        {/* Mobile hamburger menu button - moved to floating position */}
        {isMobile && (
          <motion.button 
            onClick={toggleSidebar}
            className="fixed left-6 z-50 p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full text-white shadow-lg"
            whileTap={{ scale: 0.9 }}
            animate={{ rotate: showMobileSidebar ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {showMobileSidebar ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        )}
        
        {/* Sidebar - shown/hidden based on mobile state */}
        {(!isMobile || showMobileSidebar) && (
          <motion.div 
            className={`${isMobile ? 'fixed inset-0 z-40' : 'relative'}`}
            initial={isMobile ? { x: -300 } : {}}
            animate={isMobile ? { x: 0 } : {}}
            exit={isMobile ? { x: -300 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Overlay with fade animation */}
            {isMobile && (
              <motion.div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowMobileSidebar(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
            
            {/* Sidebar content with slide animation */}
            <motion.div 
              className={`${isMobile ? 'absolute left-0 top-0 h-full z-50 w-72' : 'relative'}`}
              initial={isMobile ? { x: -300 } : {}}
              animate={isMobile ? { x: 0 } : {}}
              exit={isMobile ? { x: -300 } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Sidebar
                history={history}
                selectedThreadId={selectedThreadId}
                sidebarCollapsed={sidebarCollapsed}
                toggleSidebar={toggleSidebar}
                handleNewChat={() => {
                  handleNewChat();
                  if (isMobile) {
                    setShowMobileSidebar(false);
                  }
                  setShowAssistantSelector(false);
                }}
                handleSelectThread={(threadId) => {
                  handleSelectThread(threadId);
                  if (isMobile) {
                    setShowMobileSidebar(false);
                  }
                  setShowAssistantSelector(false);
                }}
                handleDeleteThread={handleDeleteThread}
              />
            </motion.div>
          </motion.div>
        )}
        
        {/* Main content area - remove top padding to account for hamburger removal */}
        <div className="flex-1 flex flex-col p-4 h-full">
          {showAssistantSelector ? (
            <div className="mb-4 bg-white/70 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-xl p-6 h-full">
              <div className="flex items-center mb-6">
                <button 
                  onClick={handleBackToChat}
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Chat</span>
                </button>
                <h2 className="text-xl font-bold text-center flex-1">
                  Select an Assistant
                </h2>
              </div>
              <AssistantSelector
                onSelectAssistant={handleAssistantSelected}
              />
            </div>
          ) : (
            <div className="flex-1 h-full">
              <ChatArea
                messages={messages}
                chatLoading={chatLoading}
                currentAssistant={currentAssistant}
                onSearch={handleSearch}
                onClearChat={handleNewChat}
                onChangeAssistant={handleChangeAssistant}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}