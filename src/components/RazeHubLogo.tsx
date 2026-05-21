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
    <div className={`font-extrabold ${sizeClasses[size]} ${className} select-none`}>
      <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
        style={{
          letterSpacing: '0.15em',
          fontWeight: 800
        }}>
        RAZE
      </span>
      <span className="text-foreground dark:text-white ml-2"
        style={{
          letterSpacing: '0.15em',
          fontWeight: 800
        }}>
        HUB
      </span>
    </div>
  );
}
