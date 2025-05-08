'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Ad, getAllAds, trackClick } from '@/utils/adManager';

interface AdRotatorProps {
  isVisible: boolean;
}

export default function AdRotator({ isVisible }: AdRotatorProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [displayedAds, setDisplayedAds] = useState(getAllAds());
  
  // Shuffle ads on component mount
  useEffect(() => {
    // Fisher-Yates shuffle algorithm
    const shuffleAds = (array: Ad[]) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };
    
    setDisplayedAds(shuffleAds(getAllAds()));
  }, []);
  
  // Rotate through ads every 3 seconds
  useEffect(() => {
    if (!isVisible || displayedAds.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentAdIndex(prevIndex => 
        prevIndex === displayedAds.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isVisible, displayedAds]);
  
  if (!isVisible || displayedAds.length === 0) return null;
  
  const currentAd = displayedAds[currentAdIndex];
  
  return (
    <div className="w-full max-w-md mx-auto my-6">
              <p className="text-xs text-gray-400 mb-2 text-center">Sponsored</p>
      <p className="text-xs text-gray-400 mb-2 text-center">Advertise Your Property with us today</p>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAd.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-lg overflow-hidden shadow-lg"
        >
          <a 
            href={currentAd.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block relative aspect-[16/9]" 
            onClick={() => trackClick(currentAd.id)} 
          > 
            <Image 
              src={currentAd.src}
              alt={currentAd.alt} 
              fill 
              sizes="(max-width: 768px) 100vw, 400px" 
              className="object-cover"
              onError={(e) => {
                console.error(`Failed to load image: ${currentAd.src}`);
                // Set a fallback image
                e.currentTarget.src = "/fallback-ad.jpg";
              }}
            /> 
          </a>
          
          {/* Ad indicators */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {displayedAds.map((_, index) => (
              <div 
                key={index} 
                className={`w-1.5 h-1.5 rounded-full ${
                  index === currentAdIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}