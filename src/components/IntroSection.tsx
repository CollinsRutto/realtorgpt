import React from 'react';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const IntroSection: React.FC = () => {
  return (
    <motion.div 
      className="w-full bg-transparent dark:bg-transparent p-3 sm:p-6 mb-4 sm:mb-6 flex flex-col items-center text-center"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 sm:mb-4 flex items-center justify-center bg-blue-500 dark:bg-blue-600">
        <Home className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
      </div>
      
      <h2 className="text-xl sm:text-2xl font-bold text-blue-500 mb-2">Kenyan Real Estate AI Assistant</h2>
      
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-2xl">
        Get fast, real-time information about properties, market trends, and <strong>real estate research</strong> 
        for Kenya with our AI assistant. All responses include informed sources when available.
      </p>
      
      <div className="text-xs sm:text-sm bg-amber-50/50 dark:bg-amber-900/10 rounded-md p-3 sm:p-4 text-amber-800 dark:text-amber-200 max-w-2xl w-full">
        <p className="italic">
          All responses are based on publicly available online information, and AI may generate inaccuracies. <b>Verify details</b> with a certified real estate agent and legal professional before making any decisions.
        </p>
      </div>
    </motion.div>
  );
};

export default IntroSection;