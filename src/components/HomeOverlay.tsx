'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomeOverlay() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the overlay before
    const hasSeenOverlay = localStorage.getItem('hasSeenOverlay');
    
    if (!hasSeenOverlay) {
      setIsVisible(true);
      
      // Auto-hide after 5 seconds if user doesn't interact
      const timer = setTimeout(() => {
        setIsVisible(false);
        localStorage.setItem('hasSeenOverlay', 'true');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenOverlay', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-2xl w-full mx-4 p-8 rounded-2xl overflow-hidden"
          >
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {/* Subtle grid pattern */}
                <div className="absolute inset-0" style={{ 
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
                  backgroundSize: '40px 40px' 
                }}></div>
                
                {/* Glowing orb effect */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
              </div>
            </div>
            
            <div className="relative z-10 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                Your portal<br />
                to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-500">tomorrow's</span><br />
                financial.
              </h1>
              
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                Your Real estate AI powered research assistant on kenyan infomation.
              </p>
              
              <div className="flex justify-center">
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-full font-medium flex items-center gap-2 shadow-lg"
                    onClick={handleDismiss}
                  >
                    APPLY FOR THE WAITLIST
                    <ArrowRight size={18} />
                  </motion.button>
                </Link>
              </div>
              
              <button 
                onClick={handleDismiss}
                className="mt-8 text-gray-400 hover:text-white text-sm"
              >
                Skip intro
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}