"use client";

import { TabId } from "@/widgets/sidebar2/data/baseTabs";
import Image from 'next/image'

interface BottomTabsForSideMenuProps {
  selectedTabId: TabId;
  onTabChange: (tabId: TabId) => void;
}

const tabsConfig = [
  {
    id: "campaign" as TabId,
    label: "캠페인",
    icons: {
      default: "/tree-menu/campaign_icon_for_sidemenu.png",
      selected: "/tree-menu/campaign_icon_for_sidemenu_selected.png"
    },
    alt: "캠페인 아이콘",
    iconWidth: 13,
    iconHeight: 13
  },
  {
    id: "agent" as TabId,
    label: "상담사",
    icons: {
      default: "/tree-menu/ghost_icon_for_counselor_tab.png",
      selected: "/tree-menu/ghost_icon_for_counselor_tab_selected.png"
    },
    alt: "상담사 아이콘",
    iconWidth: 14,
    iconHeight: 14
  },
  {
    id: "campaign-group" as TabId,
    label: "캠페인 그룹",
    icons: {
      default: "/tree-menu/campain_group.png",
      selected: "/tree-menu/campain_group_selected.png"
    },
    alt: "캠페인 그룹 아이콘",
    iconWidth: 12,
    iconHeight: 12
  }
];

export function BottomTabsForSideMenu({ selectedTabId, onTabChange }: BottomTabsForSideMenuProps) {
  return (
    <div className="flex-none">
      {tabsConfig.map((tab) => (
        <button
          key={tab.id}
          className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center gap-2 border-t
            ${
              selectedTabId === tab.id
                ? "bg-[#F1FBFC] text-[#02AFBF]"
                : "text-[#444] hover:bg-gray-50 hover:text-gray-800"
            }`}
          onClick={() => onTabChange(tab.id)}
        >
          <Image 
              src={selectedTabId === tab.id ? tab.icons.selected : tab.icons.default} 
              alt={tab.alt} 
              width={tab.iconWidth} 
              height={tab.iconHeight} 
            />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}