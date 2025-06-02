"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTabStore } from '@/store/tabStore';
import DraggableTab from './DraggableTab';
import { TabItem } from '@/store/tabStore';

interface TabAreaProps {
  id: string;
  type: 'section' | 'content';
  width: number;
  tabs: TabItem[];
  title?: string;
  canRemove?: boolean;
  rowId: string;
  sectionId: string;
}

const TabArea: React.FC<TabAreaProps> = ({
  id,
  type,
  width,
  tabs,
  title,
  canRemove = true,
  rowId,
  sectionId
}) => {
  const { activeTabId, removeTab, setActiveTab } = useTabStore();

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'content-area',
      id,
      isNewArea: false
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-none min-h-[200px] relative border-r border-gray-200
        ${isOver ? 'bg-gray-50' : 'bg-white'}
      `}
      style={{ width: `${width}%` }}
    >
      {/* 영역 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        {canRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => tabs.forEach(tab => removeTab(tab.id, tab.uniqueKey))}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 탭 목록 */}
    {/* 탭 목록 */}
    <div className="p-2">
        {tabs.map((tab) => (
          <DraggableTab
            key={tab.uniqueKey} // key를 uniqueKey로 변경
            id={tab.id}
            uniqueKey={tab.uniqueKey} // 탭의 실제 uniqueKey 전달
            title={tab.title}
            //icon={tab.icon}
            isActive={activeTabId === tab.id}
            onSelect={() => setActiveTab(tab.id, tab.uniqueKey)}
            onRemove={() => removeTab(tab.id, tab.uniqueKey)} // removeTab 함수 구현
            rowId={rowId}
            sectionId={sectionId}
          />
        ))}
      </div>
    {/* 컨텐츠 영역 */}
    {tabs.length > 0 && (
      <div className="p-4 border-t border-gray-100">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={activeTabId === tab.id ? 'block' : 'hidden'}
          >
            {tab.title} 컨텐츠
          </div>
        ))}
      </div>
    )}

      {/* 빈 영역 안내 */}
      {tabs.length === 0 && (
        <div className="flex items-center justify-center h-32 text-gray-400">
          탭을 이 영역으로 드래그하세요
        </div>
      )}
    </div>
  );
};

export default TabArea;