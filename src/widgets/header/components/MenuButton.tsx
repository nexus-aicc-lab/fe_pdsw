"use client";

import React from 'react';
import Image from 'next/image';
import { useTabStore } from '@/store/tabStore';
import { MenuItem } from '@/widgets/header/model/menuItems';

interface MenuButtonProps {
  item: MenuItem;
}

const MenuButton: React.FC<MenuButtonProps> = ({ item }) => {
  const { addTab, openedTabs, duplicateTab, activeTabId } = useTabStore();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.ctrlKey && openedTabs.some(tab => tab.id === item.id)) {
      duplicateTab(item.id);
    } else if (!openedTabs.some(tab => tab.id === item.id)) {
      addTab({ ...item, uniqueKey: item.uniqueKey ?? '', content: item.content ?? null });
    }
  };

  const isActive = activeTabId === item.id;
  const isOpened = openedTabs.some(tab => tab.id === item.id);

  return (
    <button
      onClick={handleClick}
      className={`
        flex flex-col items-center justify-center gap-0 py-2 px-3
        min-w-[80px] h-[80px]
        hover:bg-gray-100/50
        transition-colors
        ${isActive ? 'bg-gray-100' : isOpened ? 'bg-slate-50' : 'bg-transparent'}
      `}
    >
        {isOpened ? (
            <div className="absolute top-0 right-0 w-3 h-3 bg-blue-600 rounded-full"></div>
        ) : "닫혀 있음"}   
      <div className="flex items-center justify-center w-9 h-9">
        <Image
          src={item.icon}
          alt={item.title}
          width={36}
          height={36}
          className="object-contain"
          priority
        />
      </div>
      <span className={`
        text-xs mt-1 whitespace-nowrap
        ${isActive ? 'text-blue-600 font-medium' : isOpened ? 'text-gray-800' : 'text-gray-600'}
      `}>
        {item.title}
      </span>
    </button>
  );
};

export default MenuButton;