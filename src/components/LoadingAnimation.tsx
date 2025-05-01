import React from 'react';
import { motion } from 'framer-motion';

interface LoadingAnimationProps {
  message?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  message = "Searching Kenyan real estate knowledge..." 
}) => {
  return (
    <motion.div 
      className="flex items-center my-4 ml-11"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="flex items-center">
        <motion.div 
          className="mr-3 relative w-5 h-5"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "linear"
          }}
        >
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full" />
        </motion.div>
        
        <span className="text-gray-600 dark:text-gray-300 text-sm">{message}</span>
      </motion.div>
    </motion.div>
  );
};

export default LoadingAnimation;