// src/app/main/comp/TabRowMenu.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTabStore } from "@/store/tabStore";

interface TabRowMenuProps {
  rowId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TabRowMenu: React.FC<TabRowMenuProps> = ({ rowId, isOpen, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { closeAllTabs, closeOtherTabs } = useTabStore();

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // 다른 탭 닫기 (현재 활성화된 탭 빼고 모두 닫기)
  const handleCloseOtherTabs = () => {
    const { rows } = useTabStore.getState();
    const row = rows.find(r => r.id === rowId);
    
    if (row) {
      row.sections.forEach(section => {
        if (section.activeTabKey) {
          closeOtherTabs(rowId, section.id, section.activeTabKey);
        }
      });
    }
    onClose();
  };

  // 모든 탭 닫기
  const handleCloseAllTabs = () => {
    const { rows } = useTabStore.getState();
    const row = rows.find(r => r.id === rowId);
    
    if (row) {
      row.sections.forEach(section => {
        closeAllTabs(rowId, section.id);
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute p-2 right-[0px] z-20 mt-1 w-[150px] rounded-[3px] shadow-lg bg-white ring-1 ring-black ring-opacity-5"
      style={{ top: '27px' }}
    >
      <div className="">
        <button
          onClick={handleCloseOtherTabs}
          className="block px-2 py-1.5 text-sm text-[#333] hover:bg-[#F4F6F9] w-full text-left rounded-[3px]"
        >
          다른 탭 닫기
        </button>
        <button
          onClick={handleCloseAllTabs}
          className="block px-2 py-1.5 text-sm text-[#333] hover:bg-[#F4F6F9] w-full text-left rounded-[3px]"
        >
          모든 탭 닫기
        </button>
      </div>
    </div>
  );
};

export default TabRowMenu;