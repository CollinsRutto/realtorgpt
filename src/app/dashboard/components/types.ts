import { ReactNode } from 'react';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string }>;
};

export type AssistantType = 'market-research' | 'customer-support' | 'legal-compliance' | 'sales-marketing' | 'general' | 'education';

export type HistoryItem = {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
  assistantType: AssistantType;
};

export type AssistantConfig = {
  type: AssistantType;
  name: string;
  description: string;
  icon: ReactNode;
  context: string;
};