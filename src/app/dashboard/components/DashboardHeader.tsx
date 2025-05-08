import React from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  user: any;
  onSignOut: () => void;
}

export default function DashboardHeader({ user, onSignOut }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 shadow-lg rounded-b-2xl mx-4 mt-4 mb-2 px-4 sm:px-6 py-3 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
        <Link href="/" className="flex items-center gap-2 mb-2 sm:mb-0">
          <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">RealtorGPT</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 hidden md:inline-block truncate max-w-[150px] lg:max-w-xs">
            {user?.email}
          </span>
          <button 
            onClick={onSignOut}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full text-white bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-md hover:scale-105 transition-transform"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}