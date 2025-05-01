'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type UsageData = {
  currentMonth: {
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
    request_count: number;
  };
  dailyUsage: Array<{
    day: string;
    daily_total_tokens: number;
    daily_input_tokens: number;
    daily_output_tokens: number;
    request_count: number;
  }>;
};

export default function UsageDashboard() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsageData() {
      try {
        const response = await fetch('/api/usage');
        if (!response.ok) {
          throw new Error('Failed to fetch usage data');
        }
        const data = await response.json();
        setUsageData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchUsageData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error loading usage data: {error}</p>
      </div>
    );
  }

  if (!usageData) {
    return <div>No usage data available</div>;
  }

  // Format daily usage data for chart
  const chartData = usageData.dailyUsage.map(day => ({
    date: new Date(day.day).toLocaleDateString(),
    'Input Tokens': day.daily_input_tokens,
    'Output Tokens': day.daily_output_tokens,
    'Total Tokens': day.daily_total_tokens,
  })).reverse();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Usage Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-500 dark:text-blue-300">Total Tokens</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {usageData.currentMonth.total_tokens.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Current Month</p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-500 dark:text-green-300">Input Tokens</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {usageData.currentMonth.input_tokens.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Current Month</p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-500 dark:text-purple-300">Output Tokens</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {usageData.currentMonth.output_tokens.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Current Month</p>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-orange-500 dark:text-orange-300">API Calls</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {usageData.currentMonth.request_count.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Current Month</p>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Daily Usage (Last 30 Days)</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Input Tokens" fill="#3B82F6" />
            <Bar dataKey="Output Tokens" fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}