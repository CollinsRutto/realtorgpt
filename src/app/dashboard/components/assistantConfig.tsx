import React from 'react';
import { 
  BarChart2, 
  Users, 
  Scale, 
  TrendingUp,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { AssistantConfig } from './types';

export const ASSISTANTS: AssistantConfig[] = [
  {
    type: 'market-research',
    name: 'Market Research Assistant',
    description: 'Helps with real estate market analysis and trends',
    icon: '📊',
    context: 'general' // Changed from 'realtor' to 'general'
  },
  {
    type: 'customer-support',
    name: 'Customer Support Assistant',
    description: 'Answers common customer questions about properties',
    icon: '🤝',
    context: 'general' // Changed from 'realtor' to 'general'
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
      description: 'General-purpose AI assistant for various tasks',
      icon: '🤖',
      context: 'general'
  },
  {
    type: 'education',
    name: 'Education & Training',
    description: 'Learn about real estate concepts and best practices',
    icon: <BookOpen size={18} />,
    context: 'education'
  }
];