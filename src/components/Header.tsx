import React from 'react';
import { Home } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const { user, signOut, isLoading } = useAuth();

  return (
    <div className="w-full bg-[#131826] dark:bg-[#131826] p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Home className="text-white h-6 w-6" />
        <Link href="/" className="text-white font-bold text-xl">RealtorGPT</Link>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        {isLoading ? (
          <div className="w-20 h-8 bg-gray-700 animate-pulse rounded-full"></div>
        ) : user ? (
          <div className="flex items-center gap-3">
            <span className="text-white text-sm hidden md:inline-block">
              {user.email}
            </span>
            <Link 
              href="/dashboard"
              className="text-white bg-blue-600 hover:bg-blue-500 rounded-full px-4 py-1.5 text-sm transition-colors"
            >
              Dashboard
            </Link>
            <button 
              onClick={signOut}
              className="text-white bg-transparent border border-gray-600 rounded-full px-4 py-1.5 text-sm hover:bg-gray-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link 
            href="/signin" 
            className="text-white bg-transparent border border-gray-600 rounded-full px-4 py-1.5 text-sm hover:bg-gray-800 transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;