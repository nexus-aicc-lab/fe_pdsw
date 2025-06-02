// src/features/campaignManager/components/data/baseTabs.ts
export const baseTabs = [
    { id: 'campaign', label: '캠페인', icon: '/tree-menu/campaign_icon_for_sidemenu.png' , iconWidth: 13, iconHeight: 13},
    { id: 'agent', label: '상담사', icon: '/tree-menu/ghost_icon_for_counselor_tab.png', iconWidth: 14, iconHeight: 14 },
    { id: 'campaign-group', label: '캠페인 그룹', icon: '/tree-menu/campain_group.png' , iconWidth: 12, iconHeight: 12 }
  ] as const;
  
  export type TabId = typeof baseTabs[number]['id'];