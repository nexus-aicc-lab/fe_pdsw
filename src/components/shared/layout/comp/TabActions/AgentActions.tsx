import { SortType } from '@/features/campaignManager/types/typeForSidebar2';
import SortButtonForAgent from '../buttons/OptionButtonsForSideMenuAgentTab';

interface AgentActionsProps {
  onSort: (type: SortType) => void;
  selectedSort: SortType;
}

export function AgentActions({
  onSort,
  selectedSort
}: AgentActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <SortButtonForAgent />
    </div>
  );
}