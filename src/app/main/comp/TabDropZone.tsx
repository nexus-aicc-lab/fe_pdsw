"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useTabStore } from '@/store/tabStore';

interface TabDropZoneProps {
  children: React.ReactNode;
}

const TabDropZone: React.FC<TabDropZoneProps> = ({ children }) => {
  const { rows, openedTabs } = useTabStore();  // rows를 가져옴
  
  // 첫 번째 row의 sections를 사용
  const firstRowSections = rows[0]?.sections || [];
  const isDisabled = firstRowSections.length === 1 && openedTabs.length === 1;
  
  const { setNodeRef, isOver } = useDroppable({
    id: 'main-drop-zone',
    data: {
      type: 'dropzone'
    },
    disabled: isDisabled
  });

  return (
    <div 
      ref={setNodeRef}
      className={`
        w-full h-full rounded-lg
        ${isOver && !isDisabled ? 'bg-gray-100 border-2 border-dashed border-gray-300' : ''}
        transition-colors duration-200
      `}
    >
      {children}
    </div>
  );
};

export default TabDropZone;