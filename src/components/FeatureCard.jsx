import React from 'react';
import { motion } from 'framer-motion';

export default function FeatureCard({ icon, title, description, color = 'blue' }) {
  // Use consistent styling that works for both server and client
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-sm p-6 rounded-xl overflow-hidden relative text-white"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div 
        className="absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6 opacity-10 rounded-full" 
        style={{ 
          background: `radial-gradient(circle, var(--color-${color}-500) 0%, transparent 70%)` 
        }}
      />
      
      <motion.div 
        className="mb-4 text-blue-500"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {icon}
      </motion.div>
      
      <motion.h3 
        className="text-xl font-bold mb-3 text-center text-white"
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {title}
      </motion.h3>
      
      <p className="text-center text-gray-300">
        {description}
      </p>
    </motion.div>
  );
}


//## 2. Fixing React Hydration Error in FeatureCard Component

//The hydration error occurs because the server and client are rendering different content. Here's the fixed component: