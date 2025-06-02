// 2. src/app/main/comp/TabMenuForMainPage.tsx
"use client";

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useTabStore } from '@/store/tabStore';
import { useRef, useEffect } from 'react';

const TabMenuForMainPage = () => {
  const { openedTabs, activeTabId, removeTab, setActiveTab } = useTabStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTabId && scrollContainerRef.current) {
      const activeTab = scrollContainerRef.current.querySelector(`[data-tab-id="${activeTabId}"]`);
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [activeTabId]);

  if (openedTabs.length === 0) return null;

  return (
    <div className="bg-white border-b">
      <div className="container px-2">
        <div 
          ref={scrollContainerRef}
          className="flex space-x-1 overflow-x-auto py-2 scrollbar-hide"
        >
          {openedTabs.map((tab) => (
            <div 
              key={tab.id} 
              data-tab-id={tab.id}
              className="relative flex items-center shrink-0"
            >
              <Button
                variant={activeTabId === tab.id ? "default" : "ghost"}
                className={`
                  group flex items-center space-x-2 rounded-md pr-8 pl-3 py-2
                  transition-colors duration-200
                  ${activeTabId === tab.id 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'hover:bg-gray-100'}
                `}
                onClick={() => setActiveTab(tab.id, tab.uniqueKey)}
              >
                {/* <div className="w-4 h-4 relative">
                  <Image
                    src={tab.icon}
                    alt={tab.title}
                    fill
                    className="object-contain"
                  />
                </div> */}
                <span className="text-sm whitespace-nowrap">{tab.title}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTab(tab.id, tab.uniqueKey);
                }}
                className={`
                  absolute right-1 p-1 rounded-full
                  transition-colors duration-200
                  ${activeTabId === tab.id 
                    ? 'text-white hover:bg-green-600' 
                    : 'text-gray-500 hover:bg-gray-200'}
                `}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabMenuForMainPage;