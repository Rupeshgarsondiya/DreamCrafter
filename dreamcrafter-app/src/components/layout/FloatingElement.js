import React from 'react';
import { Cloud, Star, Sparkles } from 'lucide-react';

const FloatingElement = ({ element = { type: 'cloud' } }) => {
  // Add safety check
  if (!element || !element.type) {
    return null; // or return a default element
  }
  
  const IconComponent = { 
    cloud: Cloud, 
    star: Star, 
    sparkle: Sparkles 
  }[element.type];
  
  const colors = { 
    cloud: 'text-blue-200', 
    star: 'text-yellow-200', 
    sparkle: 'text-pink-200' 
  };
    return (
    <div
      className="absolute pointer-events-none z-0"
      style={{
        left: `${element.x}%`,
        top: `${element.y}%`,
        width: `${element.size}px`,
        height: `${element.size}px`,
        opacity: element.opacity,
        animationDelay: `${element.delay}s`,
        animationDuration: `${element.speed + 2}s`
      }}
    >
      <div className="dream-float">
        <IconComponent 
          className={`w-full h-full ${colors[element.type]} sparkle-animation`} 
        />
      </div>
    </div>
  );
};

export default FloatingElement;
