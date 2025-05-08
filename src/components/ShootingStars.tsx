import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

interface Star {
  id: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  direction: number;
  endX: number;
  endY: number;
  isLongStar?: boolean;
  isExtraLong?: boolean;
}

interface StarCreationParams {
  forceExtraLong?: boolean;
}

const ShootingStars: React.FC<{ delay?: number }> = ({ delay = 5 }) => {
  const [stars, setStars] = useState<Star[]>([]);
  const [mounted, setMounted] = useState(false);
  const extraLongIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { theme } = useTheme();
  const counterRef = useRef(0); // Add a counter to ensure unique keys

  const starColor = theme === 'dark' ? '#ffffff' : '#1a202c';
  const tailColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(26, 32, 44, 0.5)';

  const getStarCoordinates = (direction: number, extraDistance: number) => {
    const randomOffset = () => Math.random() * 20;
    const baseEnd = 100 + randomOffset() + extraDistance;
    const negativeEnd = -20 - randomOffset() - extraDistance;

    switch (direction) {
      case 0: // top-left to bottom-right
        return {
          startX: randomOffset(),
          startY: randomOffset(),
          endX: baseEnd,
          endY: baseEnd
        };
      case 1: // top-right to bottom-left
        return {
          startX: 80 + randomOffset(),
          startY: randomOffset(),
          endX: negativeEnd,
          endY: baseEnd
        };
      case 2: // bottom-left to top-right
        return {
          startX: randomOffset(),
          startY: 80 + randomOffset(),
          endX: baseEnd,
          endY: negativeEnd
        };
      case 3: // bottom-right to top-left
        return {
          startX: 80 + randomOffset(),
          startY: 80 + randomOffset(),
          endX: negativeEnd,
          endY: negativeEnd
        };
      default:
        return {
          startX: randomOffset(),
          startY: randomOffset(),
          endX: baseEnd,
          endY: baseEnd
        };
    }
  };

  const createShootingStar = ({ forceExtraLong = false }: StarCreationParams = {}): Star => {
    counterRef.current += 1; // Increment counter for unique ID
    const direction = Math.floor(Math.random() * 4);
    const isLongStar = Math.random() < 0.3;
    const isExtraLong = forceExtraLong || false;
    const extraDistance = isExtraLong ? 90 : (isLongStar ? 40 : 0);

    const { startX, startY, endX, endY } = getStarCoordinates(direction, extraDistance);

    return {
      id: `star-${Date.now()}-${counterRef.current}`, // Combine timestamp with counter for uniqueness
      x: startX,
      y: startY,
      size: Math.random() * 2 + (isExtraLong ? 3 : (isLongStar ? 2 : 1)),
      duration: Math.random() * 1.5 + (isExtraLong ? 2.5 : (isLongStar ? 1.5 : 0.5)),
      direction,
      endX,
      endY,
      isLongStar,
      isExtraLong
    };
  };

  const addStarWithTimeout = (star: Star) => {
    setStars(prev => [...prev, star]);
    setTimeout(() => {
      setStars(prev => prev.filter(s => s.id !== star.id));
    }, star.duration * 1000 + 100);
  };

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      addStarWithTimeout(createShootingStar());
    }, delay * 1000);

    extraLongIntervalRef.current = setInterval(() => {
      addStarWithTimeout(createShootingStar({ forceExtraLong: true }));
    }, 15000);

    return () => {
      clearInterval(interval);
      if (extraLongIntervalRef.current) clearInterval(extraLongIntervalRef.current);
    };
  }, [delay, mounted]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {stars.map((star) => {
        const angle = Math.atan2(star.endY - star.y, star.endX - star.x) * (180 / Math.PI);
        const tailLength = star.isExtraLong ? star.size * 90 : (star.isLongStar ? star.size * 40 : star.size * 15);
        const isLeftToRight = star.direction === 0 || star.direction === 2;
        const gradient = star.isExtraLong
          ? `linear-gradient(${angle}deg, ${starColor} 0%, ${tailColor} 20%, transparent 100%)`
          : (star.isLongStar 
            ? `linear-gradient(${angle}deg, ${starColor} 0%, ${tailColor} 30%, transparent 100%)`
            : `linear-gradient(${angle}deg, ${tailColor} 0%, transparent 80%)`);

        const headSize = star.isExtraLong ? star.size * 6 : (star.isLongStar ? star.size * 4 : star.size * 3);
        const headShadow = star.isExtraLong ? star.size * 8 : (star.isLongStar ? star.size * 4 : star.size * 2);

        return (
          <motion.div 
            key={star.id} 
            className="absolute"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${tailLength}px`,
              height: `${star.size}px`,
              background: gradient,
              borderRadius: '50%',
              transformOrigin: 'left center',
              zIndex: 10,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              x: [`${star.x}%`, `${star.endX}%`],
              y: [`${star.y}%`, `${star.endY}%`],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: star.duration,
              ease: "easeOut",
              times: [0, 0.1, 1]
            }}
          >
            {!isLeftToRight && (
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: `${headSize}px`,
                  height: `${headSize}px`,
                  backgroundColor: starColor,
                  boxShadow: `0 0 ${headShadow}px ${starColor}`,
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ShootingStars;