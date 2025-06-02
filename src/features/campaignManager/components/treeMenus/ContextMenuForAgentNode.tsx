// src/features/campaignManager/components/treeMenus/ContextMenuForAgentNode.tsx
import React from "react";
import { useTabStore } from '@/store/tabStore';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  UserCog,
  PhoneCall,
  History,
  Settings
} from "lucide-react";
import { SkillAssignmentTab } from "./SkillAssignmentTab";

interface ContextMenuForAgentNodeProps {
  children: React.ReactNode;
  item: {
    type: string;
    id: string;
    label: string;
    tenantId: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  onManage: () => void;
}

export function ContextMenuForAgentNode({
  children,
  item,
  onEdit,
  onDelete,
  onManage,
}: ContextMenuForAgentNodeProps) {
  const addTab = useTabStore(state => state.addTab);
  const [menuKey, setMenuKey] = React.useState(0);
  const isCounselor = item.type === "counselor";
  const isTeam = item.type === "team";
  const isGroup = item.type === "group";

  // 02-17
  const handleSkillAssignment = () => {
    const { setCounselorSkillAssignmentInfo, removeTab, openedTabs } = useTabStore.getState();
  
    // 기존에 열린 탭 중 id가 500인 것 제거
    const existingTabs = openedTabs.filter(tab => tab.id === 500);
    existingTabs.forEach(tab => {
      removeTab(tab.id, tab.uniqueKey);
    });
  
    // 상담사 스킬 할당 정보 설정
    setCounselorSkillAssignmentInfo({
      tenantId: item.tenantId,
      counselorId: item.id,
      counselorName: item.label
    });
  
    // 새로운 탭 추가
    addTab({
      id: 500, // SkillAssignmentTab을 위한 ID
      uniqueKey: `skill-assignment-${item.id}-${Date.now()}`, // 유니크한 키 추가
      title: `상담사 스킬 할당 - ${item.label}`,
      icon: '',
      href: '/skill-assignment',
      content: null,
    });
  };
  
  

  return (
    <>
      <ContextMenu key={menuKey}>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-[150px]">
          {isCounselor && (
            <>
              <ContextMenuItem onClick={handleSkillAssignment}>
                <UserCog className="mr-2 h-4 w-4" />
                상담사 스킬 할당
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>
                <PhoneCall className="mr-2 h-4 w-4" />
                상담사 스킬 해제
              </ContextMenuItem>
            </>
          )}

          {isTeam && (
            <>
              <ContextMenuItem onClick={onManage}>
                <Settings className="mr-2 h-4 w-4" />
                팀 관리
              </ContextMenuItem>
              
              <ContextMenuItem>
                <History className="mr-2 h-4 w-4" />
                팀 이력
              </ContextMenuItem>
            </>
          )}

          {isGroup && (
            <>
              <ContextMenuItem onClick={onManage}>
                <Settings className="mr-2 h-4 w-4" />
                그룹 관리
              </ContextMenuItem>

              <ContextMenuItem>
                <History className="mr-2 h-4 w-4" />
                그룹 이력
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}