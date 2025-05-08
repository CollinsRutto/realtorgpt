import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Message, HistoryItem, AssistantType } from './types';
import { ASSISTANTS } from './assistantConfig';

export function useChat() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<AssistantType>('general');

  // Load chat history on initial render
  useEffect(() => loadChatHistory(), []);

  // Load chat history from localStorage with security
  const loadChatHistory = useCallback(() => {
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      if (!savedHistory) return;
      
      if (!savedHistory.startsWith('[') || !savedHistory.endsWith(']')) {
        throw new Error('Invalid format');
      }
      
      const parsedHistory = JSON.parse(savedHistory, (key, value) => {
        if (key === 'timestamp') return new Date(value);
        if (typeof value === 'string' && (key === 'content' || key === 'title')) {
          return value
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, 'removed:');
        }
        return value;
      });
      
      if (!Array.isArray(parsedHistory)) throw new Error('Invalid structure');
      
      const validHistory = parsedHistory.filter(item => 
        item && typeof item === 'object' && typeof item.id === 'string' && Array.isArray(item.messages)
      );
      
      setHistory(validHistory);
    } catch (error) {
      console.error('History load error:', error);
      toast.error('Failed to load chat history');
      localStorage.removeItem('chatHistory');
    }
  }, []);

  // Save history to localStorage
  const saveHistory = useCallback((newHistory: HistoryItem[]) => {
    try {
      if (!Array.isArray(newHistory)) throw new Error('Invalid format');
      
      const trimmedHistory = newHistory.slice(0, 50).map(item => ({
        ...item,
        messages: item.messages.slice(-50)
      }));
      
      const serialized = JSON.stringify(trimmedHistory);
      
      if (serialized.length > 4 * 1024 * 1024) {
        throw new Error('History too large');
      }
      
      localStorage.setItem('chatHistory', serialized);
    } catch (error) {
      console.error('History save error:', error);
      toast.error('Failed to save chat history');
      try { localStorage.removeItem('chatHistory'); } 
      catch (e) { console.error('Clear failed:', e); }
    }
  }, []);

  const handleSelectThread = useCallback((threadId: string) => {
    const thread = history.find(item => item.id === threadId);
    if (thread) {
      setSelectedThreadId(threadId);
      setMessages(thread.messages);
      setSelectedAssistant(thread.assistantType);
    }
  }, [history]);

  const saveConversation = useCallback((conversationMessages: Message[]) => {
    if (!conversationMessages || conversationMessages.length < 2) return;
    
    const userMessages = conversationMessages.filter(msg => msg.role === 'user');
    if (userMessages.length === 0) return;
    
    const title = userMessages[0].content.length > 30 
      ? `${userMessages[0].content.substring(0, 30)}...` 
      : userMessages[0].content;
    
    if (selectedThreadId) {
      const updatedHistory = history.map(item => 
        item.id === selectedThreadId 
          ? { ...item, messages: [...conversationMessages], timestamp: new Date(), assistantType: selectedAssistant } 
          : item
      );
      setHistory(updatedHistory);
      saveHistory(updatedHistory);
    } else {
      const newThread: HistoryItem = {
        id: `thread-${Date.now()}`,
        title,
        timestamp: new Date(),
        messages: [...conversationMessages],
        assistantType: selectedAssistant
      };
      
      const updatedHistory = [newThread, ...history];
      setHistory(updatedHistory);
      saveHistory(updatedHistory);
      setSelectedThreadId(newThread.id);
    }
  }, [selectedThreadId, selectedAssistant, history, saveHistory]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query?.trim()) return;
    
    const sanitizedQuery = query
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, 'removed:');
    
    // Create deep copy of messages to avoid mutation issues
    const userMessage: Message = { role: 'user', content: sanitizedQuery };
    const updatedMessages = [...messages, userMessage];
    
    // Update UI immediately with user message
    setMessages(updatedMessages);
    setChatLoading(true);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    try {
      // Create a shallow copy for the API request
      const messageHistory = updatedMessages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const currentAssistant = ASSISTANTS.find(a => a.type === selectedAssistant) || ASSISTANTS[4];
      
      const response = await fetch('/api/deno-deepseek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: sanitizedQuery,
          messageHistory,
          context: currentAssistant.context || 'general'
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result || typeof result.response !== 'string') {
        throw new Error('Invalid response format');
      }
      
      // Create assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response,
        sources: result.sources
      };
      
      // Create new array for final messages
      const finalMessages = [...updatedMessages, assistantMessage];
      
      // Update state with new messages
      setMessages(finalMessages);
      
      // Save conversation with new messages
      saveConversation(finalMessages);
    } catch (error) {
      console.error('Query error:', error);
      
      let errorContent = 'Sorry, I encountered an error. Please try again later.';
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        errorContent = 'Request timed out. Please try again or simplify your query.';
        toast.error('Request timed out');
      } else if (error instanceof Error) {
        toast.error('Failed to get response');
      }
      
      // Create error message
      const errorMessage: Message = { role: 'assistant', content: errorContent };
      
      // Create new array for final messages with error
      const finalMessages = [...updatedMessages, errorMessage];
      
      // Update state with error message
      setMessages(finalMessages);
      
      // Save conversation with error message
      saveConversation(finalMessages);
    } finally {
      setChatLoading(false);
    }
  }, [messages, selectedAssistant, saveConversation]);

  const handleNewChat = useCallback(() => {
    setSelectedThreadId(null);
    setMessages([]);
    setSelectedAssistant('general');
  }, []);

  const handleDeleteThread = useCallback((threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter(item => item.id !== threadId);
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
    
    if (selectedThreadId === threadId) handleNewChat();
    toast.success('Conversation deleted');
  }, [selectedThreadId, handleNewChat, history, saveHistory]);

  return {
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
    loadChatHistory
  };
}