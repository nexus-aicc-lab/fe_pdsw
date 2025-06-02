import FilterButtonForCounsellorGroup from '@/components/shared/layout/comp/buttons/FilterButtonForCounsellorGroup';
import SortButtonForCounsellorGroup from '@/components/shared/layout/comp/buttons/SortButtonForCounsellorGroup';
import { FilterType, SortType } from '@/features/campaignManager/types/typeForSidebar2';

interface CounsellorGroupActionsProps {
  onFilter: (type: FilterType) => void;
  onSort: (type: SortType) => void;
  selectedFilter: FilterType;
  selectedSort: SortType;
}

const CounsellorGroupActions = ({
  onFilter,
  onSort,
  selectedFilter,
  selectedSort
}: CounsellorGroupActionsProps) => {
  return (
    <div className="flex items-center gap-1">
      <FilterButtonForCounsellorGroup
        onFilter={onFilter}
        selectedFilter={selectedFilter}
      />
      <SortButtonForCounsellorGroup
        onSort={onSort}
        selectedSort={selectedSort}
      />
    </div>
  );
}

export default CounsellorGroupActions;