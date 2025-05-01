'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import UsageDashboard from '@/components/UsageDashboard';
import { ArrowLeft } from 'lucide-react';

export default function UsagePage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
        
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
          Usage & Billing
        </h1>
        
        <UsageDashboard />
      </div>
    </div>
  );
}