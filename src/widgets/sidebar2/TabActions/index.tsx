"use client";

import { FilterType } from '@/features/campaignManager/types/typeForSidebar2';
import IFilterButtonForCampaignGroupTabHeader from './IFilterButtonForCampaignGroupTabHeader';
import { SortOption, useTreeMenuStore } from '@/store/storeForSsideMenuCampaignTab';
import IFilterButtonForCampaignTabHeader from '@/components/shared/layout/comp/buttons/IFilterButtonForCampaignTabHeader';
import { SortButtonForCampaign } from '@/components/shared/layout/comp/buttons/SortButtonForCampaign';
import OptionButtonsForSideMenuAgentTab from '@/components/shared/layout/comp/buttons/OptionButtonsForSideMenuAgentTab';

interface TabActionsProps {
  tabId: string;
  onFilter?: (type: FilterType) => void;
  // These props are for backward compatibility
  onSort?: (type: any) => void;
  selectedFilter?: FilterType;
  selectedSort?: any;
}

export function TabActions({
  tabId,
  onFilter,
  onSort,
  selectedFilter,
  selectedSort
}: TabActionsProps) {
  // 통합 스토어에서 정렬 상태와 setter 가져오기
  const { campaignSort, setCampaignSort } = useTreeMenuStore();

  // 정렬 옵션 선택 처리
  const handleSort = (option: SortOption) => {
    // 통합 스토어 상태 업데이트
    setCampaignSort(option);

    // 이전 버전 호환성을 위한 onSort prop 처리 (있는 경우)
    if (onSort) {
      onSort(option.type);
    }
  };

  switch (tabId) {
    case 'campaign':
      return (
        <div className="flex items-center gap-[10px]">
          <IFilterButtonForCampaignTabHeader />
          <SortButtonForCampaign />
        </div>
      );
    case 'agent':
      return (
        <div className="flex items-center gap-[10px]">
          <OptionButtonsForSideMenuAgentTab />
        </div>
      );
    case 'campaign-group':
      return (
        <div className="flex items-center gap-[8px]">
          <IFilterButtonForCampaignGroupTabHeader />
        </div>
      );
    default:
      return null;
  }
}