import React from "react";
import { useAvailableMenuStore } from "@/store/useAvailableMenuStore"; // Adjust path if needed

interface IContextMenuForTenantAtCampaignGroupProps {
  nodeName: string;
  onAddGroup: () => void;
}

// Menu items configuration with ID
const MENU_ITEMS = [
  {
    id: 37,
    label: "캠페인 그룹 추가",
    action: (nodeName: string, callback: () => void) => {
      // console.log(`캠페인 그룹 추가: ${nodeName}`);
      callback();
    }
  }
];

const IContextMenuForTenantAtCampaignGroup: React.FC<IContextMenuForTenantAtCampaignGroupProps> = ({
  nodeName,
  onAddGroup
}) => {
  // Get the allowed menu IDs from the Zustand store
  const availableMenuIds = useAvailableMenuStore(
    (state) => state.availableMenuIdsForCampaignGroupTabTenant
  );

  // Filter menu items based on whether they exist in the allowed menu IDs
  const visibleMenuItems = MENU_ITEMS.filter(item => 
    availableMenuIds.includes(item.id)
  );

  // If no menu items are visible, return null
  if (visibleMenuItems.length === 0) {
    return null;
  }

  return (
    <>
      {visibleMenuItems.map(item => (
        <div
          key={item.id}
          className="contexify-custom-item"
          onClick={() => item.action(nodeName, onAddGroup)}
        >
          {item.label}
        </div>
      ))}
    </>
  );
};

export default IContextMenuForTenantAtCampaignGroup;