import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

interface StarFieldProps {
  starCount?: number;
}

const StarField: React.FC<StarFieldProps> = ({ starCount = 100 }) => {
  const [stars, setStars] = useState<Star[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Set initial dimensions
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Handle window resize
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Generate stars
    const newStars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100, // percentage
        y: Math.random() * 100, // percentage
        size: Math.random() * 2 + 1, // 1-3px
        opacity: Math.random() * 0.7 + 0.3, // 0.3-1
        duration: Math.random() * 20 + 10, // 10-30s
        delay: Math.random() * -20, // random start time
      });
    }
    setStars(newStars);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [starCount, mounted]);

  if (!mounted) return null;

  // Determine background and star colors based on theme
  const bgColor = theme === 'dark' ? '#0a0a0a' : '#f0f4f8';
  const starColor = theme === 'dark' ? '#ffffff' : '#1a202c';
  const starOpacityMultiplier = theme === 'dark' ? 1 : 0.7; // Reduce opacity in light mode for better contrast

  return (
    <div className="fixed inset-0 overflow-hidden z-[-1] transition-colors duration-300" style={{ backgroundColor: bgColor }}>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity * starOpacityMultiplier,
            backgroundColor: starColor,
          }}
          animate={{
            x: [0, Math.random() * 20 - 10],
            y: [0, Math.random() * 20 - 10],
            opacity: [
              star.opacity * starOpacityMultiplier, 
              star.opacity * 0.5 * starOpacityMultiplier, 
              star.opacity * starOpacityMultiplier
            ],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
            delay: star.delay,
          }}
        />
      ))}
      
      {/* Add a few larger, brighter stars with pulse animation */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`bright-star-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 2 + 2}px`,
            height: `${Math.random() * 2 + 2}px`,
            backgroundColor: starColor,
          }}
          animate={{
            opacity: [
              0.7 * starOpacityMultiplier, 
              1 * starOpacityMultiplier, 
              0.7 * starOpacityMultiplier
            ],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default StarField;