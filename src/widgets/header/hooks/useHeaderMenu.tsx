// C:\Users\terec\fe_pdsw\src\widgets\header\hooks\useHeaderMenu.tsx
import { MenuItem } from '../model/menuItems';
import { useTabStore } from '@/store/tabStore';

export const useHeaderMenu = () => {
  const {
    addTab,
    removeTab,
    openedTabs,
    duplicateTab,
    setActiveTab,
    setCampaignIdForUpdateFromSideMenu
  } = useTabStore();

  const handleMenuClick = (item: MenuItem, options: { ctrlKey?: boolean } = {}) => {
    if (options.ctrlKey) {
      duplicateTab(item.id);
    } else {
      // 해당 아이템의 이전 탭들을 모두 찾아서 제거
      const existingTabs = openedTabs.filter(tab => tab.id === item.id);
      existingTabs.forEach(tab => {
        removeTab(tab.id, tab.uniqueKey);
      });
  
      // 새로운 탭 추가
      const newTabKey = `${item.id}-${Date.now()}`;
      const newTab = {
        ...item,
        uniqueKey: newTabKey,
        content: item.content || null
      };
      addTab(newTab);
  
      // 탭을 추가한 후 활성 탭 설정
      setActiveTab(item.id, newTabKey);
    }
    
    setCampaignIdForUpdateFromSideMenu(null);
  };

  return {
    handleMenuClick
  };
};