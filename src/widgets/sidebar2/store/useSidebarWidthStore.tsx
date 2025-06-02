"use client";

import { create } from "zustand";
import { TabId } from "@/widgets/sidebar2/data/baseTabs";

interface SidebarWidthState {
  // 상태
  width: number;
  isOpen: boolean;
  minWidth: number;
  maxWidth: number;
  tabWidths: Record<TabId, number>;
  currentTabId: TabId | null;
  isResizing: boolean;
  
  // 액션
  setWidth: (width: number) => void;
  setIsOpen: (isOpen: boolean) => void;
  setMinWidth: (width: number) => void;
  setMaxWidth: (width: number) => void;
  setTabWidth: (tabId: TabId, width: number) => void;
  setCurrentTabId: (tabId: TabId) => void;
  getTabWidth: (tabId: TabId) => number;
  setIsResizing: (isResizing: boolean) => void;
}

export const useSidebarWidthStore = create<SidebarWidthState>((set, get) => {
  // 헬퍼 함수: 변경된 값만 업데이트하여 불필요한 렌더링 방지
  const updateIfChanged = (stateUpdater: (state: SidebarWidthState) => Partial<SidebarWidthState>) => {
    const state = get();
    const updates = stateUpdater(state);
    const hasChanges = Object.entries(updates).some(
      ([key, value]) => state[key as keyof SidebarWidthState] !== value
    );
    if (hasChanges) {
      set(updates);
    }
  };

  return {
    // 초기 상태
    width: 240,
    isOpen: true,
    minWidth: 200,
    maxWidth: 400,
    currentTabId: "campaign",
    tabWidths: {
      "campaign": 240,
      "agent": 240,
      "campaign-group": 240,
    },
    isResizing: false,
    
    // 액션들
    setWidth: (width: number) => updateIfChanged((state) => {
      const clampedWidth = Math.max(state.minWidth, Math.min(state.maxWidth, width));
      if (state.width === clampedWidth) return {};
      return { width: clampedWidth };
    }),
    
    setIsOpen: (isOpen: boolean) => updateIfChanged((state) => {
      if (state.isOpen === isOpen) return {};
      return { isOpen };
    }),
    
    setMinWidth: (minWidth: number) => updateIfChanged((state) => {
      if (state.minWidth === minWidth) return {};
      return { minWidth };
    }),
    
    setMaxWidth: (maxWidth: number) => updateIfChanged((state) => {
      if (state.maxWidth === maxWidth) return {};
      return { maxWidth };
    }),
    
    setIsResizing: (isResizing: boolean) => updateIfChanged((state) => {
      if (state.isResizing === isResizing) return {};
      return { isResizing };
    }),
    
    setTabWidth: (tabId: TabId, width: number) => updateIfChanged((state) => {
      const clampedWidth = Math.max(state.minWidth, Math.min(state.maxWidth, width));
      if (state.tabWidths[tabId] === clampedWidth) {
        return {};
      }
      const newTabWidths = { ...state.tabWidths, [tabId]: clampedWidth };
      if (state.currentTabId === tabId) {
        return { tabWidths: newTabWidths, width: clampedWidth };
      } else {
        return { tabWidths: newTabWidths };
      }
    }),
    
    setCurrentTabId: (tabId: TabId) => updateIfChanged((state) => {
      if (state.currentTabId === tabId) return {};
      const tabWidth = state.tabWidths[tabId] || state.width;
      return { currentTabId: tabId, width: tabWidth };
    }),
    
    getTabWidth: (tabId: TabId) => {
      const state = get();
      const width = state.tabWidths[tabId] || state.width;
      return Math.max(state.minWidth, Math.min(state.maxWidth, width));
    },
  };
});
