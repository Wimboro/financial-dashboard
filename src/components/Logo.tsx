import React, { useState, useEffect } from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  animated?: boolean;
  onClick?: () => void;
  loading?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  className = '', 
  animated = true,
  onClick,
  loading = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12 sm:h-16 sm:w-16',
    large: 'h-20 w-20 sm:h-24 sm:w-24',
  };

  const animationClass = animated && isLoaded 
    ? 'animate-fade-in scale-100 rotate-0' 
    : animated 
      ? 'opacity-0 scale-90 rotate-[-10deg]' 
      : '';

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        flex-shrink-0 rounded-lg overflow-hidden shadow-md 
        bg-white dark:bg-slate-700 p-1 
        ${animationClass}
        transition-all duration-500 ease-in-out
        ${onClick && !loading ? 'cursor-pointer hover:shadow-lg active:scale-95' : ''}
        ${loading ? 'animate-pulse' : ''}
        ${className}
      `}
      onClick={loading ? undefined : onClick}
      title={loading ? "Loading data..." : onClick ? "Click to refresh data" : "Financial Dashboard Logo"}
    >
      <div className="relative w-full h-full">
        <img 
          src="/logo.webp" 
          alt="Financial Dashboard Logo" 
          className={`h-full w-full object-contain transition-transform duration-300 ${loading ? 'opacity-50' : 'hover:scale-110'}`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // prevent infinite loop
            target.src = '/financial.svg'; 
          }}
          onLoad={() => setIsLoaded(true)}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-sky-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo; 