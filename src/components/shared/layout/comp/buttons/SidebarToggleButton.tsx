// src\components\shared\layout\comp\buttons\SidebarToggleButton.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function SidebarToggleButton({ isOpen, onClick }: SidebarToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="absolute -right-0 top-25 w-7 h-9 flex items-center justify-center
                bg-white border border-gray-300 rounded-lg shadow-sm
                hover:bg-gray-100 hover:border-gray-400
                transition-all duration-300 ease-in-out z-30"
    >
      {isOpen ? (
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
}