"use client";

import { useCallback } from "react";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { useTabStore } from "@/store/tabStore";
import { TreeItem } from "@/features/campaignManager/types/typeForSidebar2";
import { useAuthStore } from "@/store";

interface RootNodeContextMenuProps {
  item: TreeItem;
}

export function IRootNodeContextMenu({ item }: RootNodeContextMenuProps) {
  const { addTab } = useTabStore();
  const { session_key } = useAuthStore();

  const handleExpandAll = useCallback(() => {
    if (typeof (window as any).expandAllNodes === 'function') {
      (window as any).expandAllNodes();
    }
  }, []);

  const handleCollapseAll = useCallback(() => {
    if (typeof (window as any).expandTenantsOnly === 'function') {
      (window as any).expandTenantsOnly();
    }
  }, []);

  const handleAgentStatusMonitor = useCallback(() => {
    addTab({
      id: 22,
      uniqueKey: `monitor-center-${item.id}-${Date.now()}`,
      title: "상담사 상태 모니터",
      icon: "",
      href: "",
      content: null,
      params: {
        sessionKey: session_key,
        campaignId: 0,
        tenantId: "A",
      }
    });
  }, [addTab, session_key]);

  return (
    <ContextMenuContent className="w-48">
      <ContextMenuItem onSelect={handleAgentStatusMonitor}>
        상담사 상태 모니터
      </ContextMenuItem>

      
    </ContextMenuContent>
  );
}