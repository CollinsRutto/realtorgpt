import React from 'react';
import Image from 'next/image';

interface AIAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AIAvatar: React.FC<AIAvatarProps> = ({ size = 'md', className = '' }) => {
  const dimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 48, height: 48 },
  };

  return (
    <div className={`relative rounded-full overflow-hidden ${className}`} style={dimensions[size]}>
      <Image
        src="/ai-assistant.png" 
        alt="Kenyan Real Estate AI Assistant"
        width={dimensions[size].width}
        height={dimensions[size].height}
        className="object-cover"
        priority
      />
    </div>
  );
};

export default AIAvatar;