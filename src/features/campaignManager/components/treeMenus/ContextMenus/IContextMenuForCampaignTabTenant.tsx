"use client";

import React from 'react';
import { CommonMenuItem } from '@/components/shared/CommonContextMenu';
import { TreeNode } from "@/features/campaignManager/types/typeForCampaignGroupForSideBar";

interface IContextMenuForCampaignTabTenantProps {
  node: TreeNode;
  setIsAddGroupDialogOpen: (isOpen: boolean) => void;
}

const IContextMenuForCampaignTabTenant: React.FC<IContextMenuForCampaignTabTenantProps> = ({
  node,
  setIsAddGroupDialogOpen
}) => {
  return (
    <CommonMenuItem
      onClick={() => {
        console.log(`캠페인 그룹 추가: ${node.name}`);
        setIsAddGroupDialogOpen(true);
      }}
    >
      캠페인 그룹 추가
    </CommonMenuItem>
  );
};

export default IContextMenuForCampaignTabTenant;