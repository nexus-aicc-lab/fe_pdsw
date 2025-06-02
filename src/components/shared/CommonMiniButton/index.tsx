// CommonMiniButton.jsx
import React from 'react';

interface CommonMiniButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const CommonMiniButton = ({ 
  onClick, 
  title, 
  children, 
  className = "" 
}: CommonMiniButtonProps) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center p-0.5 text-xs border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300 ${className}`}
    >
      {children}
    </button>
  );
};

export default CommonMiniButton;