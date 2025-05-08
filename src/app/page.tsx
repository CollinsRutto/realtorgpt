'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import StarField from '@/components/StarField';
import Header from '@/components/Header';
import { useTheme } from 'next-themes';
import ShootingStars from '@/components/ShootingStars';
import ChatPage from './chat/page';

// Feature Card Component
const FeatureCard = ({ icon, title, description, color, delay }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'blue' | 'purple' | 'pink';
  delay: number;
}) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  const gradientBg = {
    blue: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    purple: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
    pink: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)'
  };
  
  const lineGradient = {
    blue: 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)',
    purple: 'linear-gradient(90deg, #a78bfa 0%, #8b5cf6 100%)',
    pink: 'linear-gradient(90deg, #f472b6 0%, #ec4899 100%)'
  };
  
  return (
    <motion.div 
      className={`bg-white/10 backdrop-blur-sm p-6 rounded-xl overflow-hidden relative ${theme === 'dark' ? 'text-white' : 'text-gray-800'} border border-transparent hover:border-opacity-30 transition-all duration-300`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br opacity-20 -z-10"
        style={{ background: gradientBg[color] }}
        animate={{ opacity: isHovered ? 0.4 : 0.2, scale: isHovered ? 1.05 : 1 }}
        transition={{ duration: 0.3 }}
      />
      
      <motion.div 
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg"
        style={{ backgroundColor: `rgba(${color === 'blue' ? '59, 130, 246' : color === 'purple' ? '139, 92, 246' : '236, 72, 153'}, 0.2)` }}
        whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>
      
      <motion.h3 
        className={`text-xl font-bold mb-3 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
        animate={{ scale: isHovered ? 1.05 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {title}
      </motion.h3>
      <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        {description}
      </p>
      
      <motion.div 
        className="w-full h-1 absolute bottom-0 left-0"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        style={{ background: lineGradient[color], transformOrigin: 'left' }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ quote, author, role, delay }: {
  quote: string;
  author: string;
  role: string;
  delay: number;
}) => (
  <motion.div
    className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg relative overflow-hidden"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -5 }}
  >
    <div className="absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl" />
    <div className="absolute bottom-0 left-0 w-20 h-20 -ml-10 -mb-10 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl" />
    
    <p className="text-gray-700 dark:text-gray-300 italic mb-4 relative z-10">"{quote}"</p>
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
        {author.charAt(0)}
      </div>
      <div className="ml-3">
        <p className="font-semibold text-gray-800 dark:text-white">{author}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
      </div>
    </div>
  </motion.div>
);

// Icon Components
const IconClipboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const IconHome = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const IconLightning = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// Main HomePage Component
const HomePage = () => {
  // For single-page apps that just render the ChatPage
  if (typeof window !== 'undefined' && window.location.pathname === '/') {
    return <ChatPage />;
  }

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ 
    target: ref, 
    offset: ["start start", "end start"] 
  });
  
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const [scrollIndicatorVisible, setScrollIndicatorVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrollIndicatorVisible(window.scrollY <= 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" ref={ref}>
      <StarField starCount={200} />
      <ShootingStars delay={5} />
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20" 
        style={{ y: bgY }}
      />
      
      <Header />
      
      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div style={{ y, opacity, scale }} className="text-center max-w-3xl mx-auto">
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-gray-900 dark:text-white leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="block mb-2">Unlock Real Estate</span>
            <motion.span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 inline-block"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Research Instantly
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your AI partner for navigating the Kenyan property market. Get data-driven insights, expert advice, and instant answers to all your real estate questions.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link 
                href="/chat"
                className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-full font-medium text-base sm:text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Start Chatting Now
                <ArrowRight className="ml-2" size={20} />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link 
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-white/20 backdrop-blur-sm text-gray-800 dark:text-white rounded-full font-medium text-base sm:text-lg shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
              >
                Go to Dashboard
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Scroll indicator */}
          <AnimatePresence>
            {scrollIndicatorVisible && (
              <motion.div 
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Scroll to explore</p>
                <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <ChevronDown className="text-gray-600 dark:text-gray-400" size={24} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {/* Features Section */}
      <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-white/5 dark:to-black/5">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How RealtorGPT Helps You
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Our AI-powered platform provides comprehensive real estate assistance tailored to the Kenyan market
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard 
              icon={<IconClipboard />}
              title="Market Intelligence"
              description="Access real-time trends, pricing data, and neighborhood insights across Kenya."
              color="blue"
              delay={0.1}
            />
            <FeatureCard 
              icon={<IconHome />}
              title="Property Guidance"
              description="Navigate buying, selling, or investing with AI-powered analysis and guidance."
              color="purple"
              delay={0.2}
            />
            <FeatureCard 
              icon={<IconLightning />}
              title="Instant Expertise"
              description="Get clear, concise answers to complex real estate questions, 24/7."
              color="pink"
              delay={0.3}
            />
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Join other satisfied users who are transforming their real estate experience
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestimonialCard 
              quote="RealtorGPT helped me find the perfect neighborhood in Nairobi based on my budget and preferences. The insights were spot on!"
              author="James Kimani"
              role="First-time Homebuyer"
              delay={0.1}
            />
            <TestimonialCard 
              quote="As a real estate agent, this tool has become indispensable. I can quickly answer client questions with accurate market data."
              author="Sarah Odhiambo"
              role="Real Estate Agent"
              delay={0.2}
            />
            <TestimonialCard 
              quote="The investment analysis feature helped me identify high-growth areas in Mombasa that I wouldn't have considered otherwise."
              author="David Mwangi"
              role="Property Investor"
              delay={0.3}
            />
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm p-8 sm:p-12 rounded-2xl border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your Real Estate Experience?
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join other users who are making smarter property decisions with RealtorGPT.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block"
          >
            <Link 
              href="/chat"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Get Started for Free
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} RealtorGPT. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
