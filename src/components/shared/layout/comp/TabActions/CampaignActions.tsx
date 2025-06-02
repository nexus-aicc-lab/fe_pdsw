import { FilterType } from '@/features/campaignManager/types/typeForSidebar2';
import { FilterButtonForCampaign } from '../buttons/FilterButtonForCampaign';
import { SortButtonForCampaign } from '../buttons/SortButtonForCampaign';
import { SortOption } from '@/store/storeForSideBarCampaignSort';

interface CampaignActionsProps {
  onFilter: (type: FilterType) => void;
  // Update to use SortOption instead of just SortType
  onSort: (option: SortOption) => void;
  selectedFilter: FilterType;
  // Update to use SortOption instead of just SortType
  selectedSort: SortOption;
}

export function CampaignActions({
  onFilter,
  onSort,
  selectedFilter,
  selectedSort
}: CampaignActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <FilterButtonForCampaign 
        onFilter={onFilter}
        selectedFilter={selectedFilter}
      />
      <SortButtonForCampaign />
    </div>
  );
}