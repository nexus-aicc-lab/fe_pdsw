// src\widgets\sidebar2\index.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import Image from "next/image";
import { Resizable } from "re-resizable";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { baseTabs, TabId } from "@/widgets/sidebar2/data/baseTabs";

import { TabActions } from "./TabActions";

import { TreeMenusForCampaigns } from "@/widgets/sidebar2/tree-menu/TreeMenusForCampaigns";
import { TreeMenusForAgentTab } from "@/widgets/sidebar2/tree-menu/TreeMenusForAgentTab";
import { TreeMenusForCampaignGroupTab } from "@/widgets/sidebar2/tree-menu/TreeMenusForCampaignGroupTab";

import { BottomTabsForSideMenu } from "@/widgets/sidebar2/footer/BottomTabsForSideMenu";

import { useSidebarWidthStore } from "./store/useSidebarWidthStore";

const MemoTabActions = memo(TabActions);
MemoTabActions.displayName = "MemoTabActions";

export default function Sidebar2() {
  const {
    width,
    isOpen,
    minWidth,
    maxWidth,
    setWidth,
    setIsOpen,
    setTabWidth,
    setCurrentTabId,
  } = useSidebarWidthStore(
    useShallow((s) => ({
      width: s.width,
      isOpen: s.isOpen,
      minWidth: s.minWidth,
      maxWidth: s.maxWidth,
      setWidth: s.setWidth,
      setIsOpen: s.setIsOpen,
      setTabWidth: s.setTabWidth,
      setCurrentTabId: s.setCurrentTabId,
    }))
  );

  const [selectedTab, setSelectedTab] = useState<TabId>("campaign");

  useEffect(() => {
    setCurrentTabId(selectedTab);
  }, [selectedTab, setCurrentTabId]);

  const toggleSidebar = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  const onTabChange = useCallback((tabId: TabId) => {
    setSelectedTab(tabId);
  }, []);

  const tabInfo = useMemo(() => {
    const t = baseTabs.find((b) => b.id === selectedTab)!;
    return {
      icon: t.icon,
      label: t.label,
      w: t.iconWidth,
      h: t.iconHeight,
    };
  }, [selectedTab]);

  
  const TreeSection = useMemo(() => {
    switch (selectedTab) {
      case "campaign":
        return <TreeMenusForCampaigns />;
      case "agent":
        return <TreeMenusForAgentTab />;
      case "campaign-group":
        return <TreeMenusForCampaignGroupTab />;
    }
  }, [selectedTab]);

  return (
    <div className="flex h-full bg-white border-r relative">
      {isOpen && (
        <Resizable
          defaultSize={{ width, height: "100%" }}
          size={{ width, height: "100%" }}
          minWidth={minWidth}
          maxWidth={maxWidth}
          enable={{ right: true }}
          onResizeStop={(_, __, ref) => {
            const newWidth = parseInt(ref.style.width, 10);
            setWidth(newWidth);
            setTabWidth(selectedTab, newWidth);
          }}
          handleComponent={{
            right: (
              <div
                className="w-[2px] h-full bg-transparent hover:bg-[#5BC2C1] transition-colors duration-200"
                style={{
                  cursor: "col-resize",
                  position: "absolute",
                  top: 0,
                  right: 0,
                  zIndex: 30,
                }}
              />
            ),
          }}
          className="relative z-10"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-2 border-b">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Image src={tabInfo.icon} alt={tabInfo.label} width={tabInfo.w} height={tabInfo.h} />
                {tabInfo.label}
              </div>
              <MemoTabActions tabId={selectedTab} />
            </div>

            <div className="flex-1 overflow-y-auto">{TreeSection}</div>

            <div className={`transition-transform duration-300 ${!isOpen ? "scale-x-0 origin-left" : ""}`}>
              <BottomTabsForSideMenu selectedTabId={selectedTab} onTabChange={onTabChange} />
            </div>
          </div>
        </Resizable>
      )}

      {/* 토글 버튼 */}
      <button
        onClick={toggleSidebar}
        className="sidebar-button z-20 relative"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );
}
