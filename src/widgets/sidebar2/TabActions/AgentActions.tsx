import OptionButtonsForSideMenuAgentTab from '@/components/shared/layout/comp/buttons/OptionButtonsForSideMenuAgentTab';
import { SortType } from '@/features/campaignManager/types/typeForSidebar2';

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
      <OptionButtonsForSideMenuAgentTab />
    </div>
  );
}