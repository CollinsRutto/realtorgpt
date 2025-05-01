'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from '@/components/ChatMessage';
import LoadingAnimation from '@/components/LoadingAnimation';
import SearchBar from '@/components/SearchBar';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  BarChart2, 
  Users, 
  Scale, 
  TrendingUp,
  MessageSquare,
  Trash2,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { getDeepSeekService } from '@/utils/deepseekService';
import { toast } from 'sonner';

// Type definitions
type Message = {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string }>;
};

type AssistantType = 'market-research' | 'customer-support' | 'legal-compliance' | 'sales-marketing' | 'general';

type HistoryItem = {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
  assistantType: AssistantType;
};

type AssistantConfig = {
  type: AssistantType;
  name: string;
  description: string;
  icon: React.ReactNode;
  context: string;
};

const ASSISTANTS: AssistantConfig[] = [
  {
    type: 'market-research',
    name: 'Market Research',
    description: 'Get insights on market trends and property valuations',
    icon: <BarChart2 size={18} />,
    context: 'market-research'
  },
  {
    type: 'customer-support',
    name: 'Customer Support',
    description: 'Help with client inquiries and scheduling',
    icon: <Users size={18} />,
    context: 'customer-support'
  },
  {
    type: 'legal-compliance',
    name: 'Legal & Compliance',
    description: 'Guidance on real estate regulations',
    icon: <Scale size={18} />,
    context: 'legal-compliance'
  },
  {
    type: 'sales-marketing',
    name: 'Sales & Marketing',
    description: 'Strategies for property marketing',
    icon: <TrendingUp size={18} />,
    context: 'sales-marketing'
  },
  {
    type: 'general',
    name: 'General Assistant',
    description: 'Versatile assistant for all questions',
    icon: <MessageSquare size={18} />,
    context: 'realtor'
  }
];

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAssistantSelector, setShowAssistantSelector] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<AssistantType>('general');
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current assistant config
  const currentAssistant = ASSISTANTS.find(a => a.type === selectedAssistant) || ASSISTANTS[4];

  // Load user session and chat history
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/signin');
        return;
      }

      setUser(session.user);
      loadChatHistory();
      setLoading(false);

      // Show welcome toast if new session
      if (window.location.search.includes('signin=success')) {
        window.history.replaceState({}, '', '/dashboard');
        toast.success('Successfully signed in!');
      }
    };

    checkSession();
  }, [router]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save chat history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(history));
    }
  }, [history]);

  const loadChatHistory = useCallback(() => {
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory, (key, value) => {
          if (key === 'timestamp') return new Date(value);
          return value;
        });
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast.error('Failed to load chat history');
    }
  }, []);

  const handleSelectThread = useCallback((threadId: string) => {
    const thread = history.find(item => item.id === threadId);
    if (thread) {
      setSelectedThreadId(threadId);
      setMessages(thread.messages);
      setSelectedAssistant(thread.assistantType);
      setShowAssistantSelector(false);
    }
  }, [history]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query?.trim()) return;
    
    const updatedMessages = [...messages, { role: 'user', content: query }];
    setMessages(updatedMessages);
    setChatLoading(true);
    
    try {
      const messageHistory = updatedMessages
        .slice(-5)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      const deepseekService = getDeepSeekService();
      const result = await deepseekService.queryWithFallback(
        query, 
        messageHistory, 
        currentAssistant.context
      );
      
      const newMessage = {
        role: 'assistant' as const,
        content: result.response,
        sources: result.sources
      };
      
      const finalMessages = [...updatedMessages, newMessage];
      setMessages(finalMessages);
      saveConversation(finalMessages);
    } catch (error) {
      console.error('Query error:', error);
      toast.error('Failed to get response');
      
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again later.'
      };
      
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveConversation(finalMessages);
    } finally {
      setChatLoading(false);
    }
  }, [messages, currentAssistant.context]);

  const saveConversation = useCallback((conversationMessages: Message[]) => {
    if (conversationMessages.length < 2) return;
    
    const userMessages = conversationMessages.filter(msg => msg.role === 'user');
    if (userMessages.length === 0) return;
    
    const firstUserMessage = userMessages[0].content;
    const title = firstUserMessage.length > 30 
      ? `${firstUserMessage.substring(0, 30)}...` 
      : firstUserMessage;
    
    if (selectedThreadId) {
      setHistory(prev => prev.map(item => 
        item.id === selectedThreadId 
          ? { 
              ...item, 
              messages: conversationMessages, 
              timestamp: new Date(),
              assistantType: selectedAssistant
            } 
          : item
      ));
    } else {
      const newThread: HistoryItem = {
        id: `thread-${Date.now()}`,
        title,
        timestamp: new Date(),
        messages: conversationMessages,
        assistantType: selectedAssistant
      };
      
      setHistory(prev => [newThread, ...prev]);
      setSelectedThreadId(newThread.id);
    }
  }, [selectedThreadId, selectedAssistant]);

  const handleNewChat = useCallback(() => {
    setSelectedThreadId(null);
    setMessages([]);
    setShowAssistantSelector(true);
  }, []);

  const handleDeleteThread = useCallback((threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== threadId));
    
    if (selectedThreadId === threadId) {
      handleNewChat();
    }

    toast.success('Conversation deleted');
  }, [selectedThreadId, handleNewChat]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  }, [router]);

  const selectAssistant = useCallback((type: AssistantType) => {
    setSelectedAssistant(type);
    setShowAssistantSelector(false);
    toast.success(`Assistant set to ${ASSISTANTS.find(a => a.type === type)?.name}`);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white">
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 shadow-lg rounded-b-2xl mx-4 mt-4 mb-2 px-6 py-3 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">RealtorGPT</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 dark:text-gray-300 hidden md:inline-block">
              {user?.email}
            </span>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-full text-white bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-md hover:scale-105 transition-transform"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden px-4 pb-4">
        {/* Sidebar */}
        <motion.div 
          layout
          className={`relative bg-white/70 dark:bg-gray-800/70 border-r border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl my-2 mr-4 backdrop-blur-md transition-all duration-300 ${
            sidebarCollapsed ? 'w-16' : 'w-72 md:w-80'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 flex items-center justify-between">
              {!sidebarCollapsed && (
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-wide">Conversations</h2>
              )}
              <button 
                onClick={toggleSidebar}
                className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white/40 dark:bg-gray-700/40"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>
            
            <div className="p-2">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl shadow-md hover:scale-105 transition-transform"
              >
                <Plus size={18} />
                {!sidebarCollapsed && <span>New Chat</span>}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleSelectThread(item.id)}
                  className={`flex items-center p-2 rounded-xl cursor-pointer mb-2 group transition-all ${
                    selectedThreadId === item.id 
                      ? 'bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 shadow-lg' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700/60'
                  }`}
                >
                  {!sidebarCollapsed ? (
                    <>
                      <div className="flex-1 truncate">
                        <div className="flex items-center gap-2">
                          {ASSISTANTS.find(a => a.type === item.assistantType)?.icon}
                          <span className="truncate text-gray-700 dark:text-gray-300 font-medium">
                            {item.title}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {item.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteThread(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                        aria-label="Delete conversation"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="w-full flex justify-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center text-base font-bold text-blue-700 dark:text-blue-300 shadow">
                        {item.title.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Floating Action Button for New Chat */}
            <button
              onClick={handleNewChat}
              className="absolute bottom-6 right-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-10"
              style={{ display: sidebarCollapsed ? 'block' : 'none' }}
              aria-label="New Chat"
            >
              <Plus size={24} />
            </button>
          </div>
        </motion.div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden rounded-2xl shadow-xl bg-white/70 dark:bg-gray-900/80 backdrop-blur-md">
          <AnimatePresence>
            {showAssistantSelector ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8 border-b border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-2xl font-extrabold mb-6 text-gray-900 dark:text-gray-100 tracking-tight">Choose an Assistant</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ASSISTANTS.map((assistant) => (
                    <motion.div
                      key={assistant.type}
                      whileHover={{ scale: 1.04, boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectAssistant(assistant.type)}
                      className="p-6 border border-gray-200 dark:border-gray-700 rounded-2xl cursor-pointer bg-white/80 dark:bg-gray-800/80 hover:bg-gradient-to-r hover:from-blue-100 hover:via-purple-100 hover:to-pink-100 dark:hover:from-blue-900/30 dark:hover:via-purple-900/30 dark:hover:to-pink-900/30 shadow-md transition-all"
                    >
                      <div className="flex items-center mb-3">
                        <div className="mr-4 p-3 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-full text-blue-600 dark:text-blue-400 shadow">
                          {assistant.icon}
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{assistant.name}</h3>
                      </div>
                      <p className="text-base text-gray-600 dark:text-gray-400">{assistant.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
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
                    onClick={() => setShowAssistantSelector(true)}
                    className="ml-auto text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Change
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="max-w-3xl mx-auto">
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

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 rounded-b-2xl">
                  <div className="max-w-3xl mx-auto">
                    <SearchBar 
                      onSearch={handleSearch} 
                      disabled={chatLoading}
                    />
                  </div>
                </div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}