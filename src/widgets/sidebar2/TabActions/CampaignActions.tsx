import { FilterButtonForCampaign } from '@/components/shared/layout/comp/buttons/FilterButtonForCampaign';
import { SortButtonForCampaign } from '@/components/shared/layout/comp/buttons/SortButtonForCampaign';
import { FilterType } from '@/features/campaignManager/types/typeForSidebar2';
import { SortOption } from '@/store/storeForSideBarCampaignSort';

interface CampaignActionsProps {
  onFilter: (type: FilterType) => void;
  onSort: (option: SortOption) => void;
  selectedFilter: FilterType;
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