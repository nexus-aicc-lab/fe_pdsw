import { useState } from 'react';
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { useTabStore } from "@/store/tabStore";
import {
  Edit,
  Copy,
  Activity,
  Trash2,
  Monitor,
  Settings,
  Search,
  List,
  Clock,
  History,
  Shield,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApiForCampaignStatusUpdate } from "@/features/campaignManager/hooks/useApiForCampaignStatusUpdate";
import BlackListCountPopup from '@/features/campaignManager/components/popups/BlackListCountPopup';

export type CampaignStatus = 'started' | 'pending' | 'stopped';

export enum TabIds {
  CAMPAIGN_EDIT = 2,
  CAMPAIGN_PROGRESS = 21,
  REBROADCAST = 20,
  AGENT_MONITOR = 22,
}

// 캠페인 현재 상태는 disabled 처리
export interface CampaignContextMenuProps {
  item: {
    id: string;
    label: string;
    status: CampaignStatus;
  };
  onEdit: () => void;
  onDelete: () => void;
  onMonitor: () => void;
  onHandleCampaignCopy: () => void;
  // onStatusChange?: (campaignId: string, status: CampaignStatus) => void;
}

export const CampaignContextMenu = ({
  item,
  onEdit,
  onDelete,
  onMonitor,
  onHandleCampaignCopy,
  // onStatusChange,
}: CampaignContextMenuProps) => {
  const [isBlacklistPopupOpen, setIsBlacklistPopupOpen] = useState(false);

  const {
    openCampaignManagerForUpdate,
    setCampaignIdForUpdateFromSideMenu,
    simulateHeaderMenuClick,
    addTab
  } = useTabStore();

  const { mutate: updateCampaignStatus, isPending } = useApiForCampaignStatusUpdate({
    onSuccess: (data, variables) => {
      
      // onStatusChange?.(variables.campaign_id, variables.status);
    },
    onError: (error) => {
      // console.error("캠페인 상태 업데이트 실패:", error);
    },
  });

  // const handleEditMenuClick = () => {
  //   simulateHeaderMenuClick(TabIds.CAMPAIGN_EDIT, item.id, item.label);
  //   setCampaignIdForUpdateFromSideMenu(item.id);
  // };

  // const handleProgressInfoClick = () => {
  //   simulateHeaderMenuClick(TabIds.CAMPAIGN_PROGRESS, item.id, item.label);
  // };

  const handleEditMenuClick = () => {
    simulateHeaderMenuClick(TabIds.CAMPAIGN_EDIT);
    setCampaignIdForUpdateFromSideMenu(item.id);
  };

  const handleProgressInfoClick = () => {
    simulateHeaderMenuClick(TabIds.CAMPAIGN_PROGRESS);
  };


  const handleRebroadcastClick = () => {
    addTab({
      id: TabIds.REBROADCAST,
      uniqueKey: `${TabIds.REBROADCAST}-${Date.now()}`,
      title: '예약 재발신',
      icon: '',
      href: '',
      content: null,
    });
  };

  const handleMonitorClick = () => {
    addTab({
      id: TabIds.AGENT_MONITOR,
      uniqueKey: `${TabIds.AGENT_MONITOR}-${Date.now()}`,
      title: '상담사 상태 모니터링',
      icon: '',
      href: '',
      content: null,
    });
  };

  const statusToNumber = {
    stopped: 0,
    started: 1,
    pending: 2
  };

  const handleChangeForCampaignStatus = (newStatus: CampaignStatus) => {
    if (item.status === newStatus || isPending) return;

    updateCampaignStatus({ campaign_id: +item.id, campaign_status: statusToNumber[newStatus] });
  };

  const handleBlacklistCountClick = () => {
    // 컨텍스트 메뉴를 명시적으로 닫음
    document.body.click(); // 컨텍스트 메뉴를 강제로 닫음
    // 약간의 딜레이 후 팝업을 엶
    setTimeout(() => {
      setIsBlacklistPopupOpen(true);
    }, 100);
  };
  return (
    <>
      <ContextMenuContent className="w-[150px]">
        <ContextMenuItem onClick={handleEditMenuClick}>
          <Edit className="mr-2 h-4 w-4" />
          캠페인 수정
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Search className="mr-2 h-4 w-4" />
            시작구분: {item.id}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem
              onClick={() => handleChangeForCampaignStatus('started')}
              className={cn(
                item.status === 'started' && "opacity-50 cursor-not-allowed",
                "flex items-center"
              )}
              disabled={item.status === 'started' || isPending}
            >
              <Clock className={cn(
                "mr-2 h-4 w-4",
                item.status === 'started' && "text-green-500"
              )} />
              시작
              {item.status === 'started' && " (현재)"}
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => handleChangeForCampaignStatus('pending')}
              className={cn(
                item.status === 'pending' && "opacity-50 cursor-not-allowed",
                "flex items-center"
              )}
              disabled={item.status === 'pending' || isPending}
            >
              <List className={cn(
                "mr-2 h-4 w-4",
                item.status === 'pending' && "text-yellow-500"
              )} />
              멈춤
              {item.status === 'pending' && " (현재)"}
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => handleChangeForCampaignStatus('stopped')}
              className={cn(
                item.status === 'stopped' && "opacity-50 cursor-not-allowed",
                "flex items-center"
              )}
              disabled={item.status === 'stopped' || isPending}
            >
              <History className={cn(
                "mr-2 h-4 w-4",
                item.status === 'stopped' && "text-red-500"
              )} />
              중지
              {item.status === 'stopped' && " (현재)"}
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem onClick={handleProgressInfoClick}>
          <Settings className="mr-2 h-4 w-4" />
          캠페인 진행정보
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={handleRebroadcastClick}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          예약 재발신
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={onHandleCampaignCopy}>
          <Copy className="mr-2 h-4 w-4" />
          캠페인 복사
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={onDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          캠페인 리스트 삭제
        </ContextMenuItem>

        <ContextMenuItem onClick={handleMonitorClick}>
          <Activity className="mr-2 h-4 w-4" />
          상담사 상태 모니터
        </ContextMenuItem>

        <ContextMenuItem onClick={handleBlacklistCountClick}>
          <Shield className="mr-2 h-4 w-4" />
          블랙리스트 건수 조회
        </ContextMenuItem>
      </ContextMenuContent>
      <BlackListCountPopup />
    </>
  );
};
