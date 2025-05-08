import React from 'react';
import { Home, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
import { useState } from 'react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="w-full bg-[#131826] dark:bg-[#131826] p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Home className="text-white h-6 w-6" />
        <Link href="/" className="text-white font-bold text-xl">RealtorGPT</Link>
      </div>
      
      {/* Mobile menu button */}
      <button 
        className="md:hidden text-white p-1"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Desktop navigation */}
      <div className="hidden md:flex items-center gap-4">
        <ThemeToggle />
        <Link href="/dashboard" className="text-white hover:text-gray-300 transition">
          Dashboard
        </Link>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#131826] z-50 p-4 flex flex-col gap-3 md:hidden shadow-lg">
          <Link 
            href="/chat" 
            className="text-white bg-blue-600 hover:bg-blue-500 rounded-full px-4 py-2 text-center transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Chat Now
          </Link>
          
          <div className="flex justify-center py-2">
            <ThemeToggle />
          </div>
          
          <Link 
            href="/dashboard"
            className="text-white bg-blue-600 hover:bg-blue-500 rounded-full px-4 py-2 text-center transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
        </div>
      )}
    </div>
  );
};

export default Header;