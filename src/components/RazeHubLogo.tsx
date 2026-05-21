import React from 'react';

interface RazeHubLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dark?: boolean;
}

export default function RazeHubLogo({ className = "", size = 'md', dark = false }: RazeHubLogoProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  return (
    <div className={`font-extrabold ${sizeClasses[size]} ${className} select-none flex items-center`}>
      <div className="flex items-center gap-1 sm:gap-0.5">
        {['R', 'A', 'Z', 'E'].map((letter, i) => (
          <span
            key={i}
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
            style={{
              fontWeight: 400,
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
            }}
          >
            {letter}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1 sm:gap-0.5 ml-4 sm:ml-1">
        {['H', 'U', 'B'].map((letter, i) => (
          <span
            key={i}
            className="text-foreground dark:text-white"
            style={{
              fontWeight: 400,
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
            }}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}
