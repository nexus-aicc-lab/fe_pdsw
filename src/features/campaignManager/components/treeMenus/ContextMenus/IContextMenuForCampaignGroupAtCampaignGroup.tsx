// src/features/campaignManager/components/menus/IContextMenuForCampaignGroupAtCampaignGroup.tsx
'use client';

import React, { useState } from "react";
import { useTabStore } from "@/store/tabStore";
import { useAvailableMenuStore } from "@/store/useAvailableMenuStore";
import { Separator } from "react-contexify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  StopCircle,
  Pencil,
  Trash2,
  PlusCircle,
  RefreshCcw,
} from "lucide-react";


interface IContextMenuForCampaignGroupAtCampaignGroupProps {
  node: any;
  setIsCampaignAddPopupOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setIsRenameDialogOpen: (open: boolean) => void;
  onBulkAction?: (actionKey: "start" | "complete" | "stop") => void;
}

const itemStyle: React.CSSProperties = {
  fontSize: "14px",
  padding: "7px 14px",
  borderRadius: "5px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
  transition: "background 0.15s",
};

const statusMap = {
  start: {
    code: "1",
    label: "시작",
    icon: <Play className="w-4 h-4 text-green-600" />,
  },
  complete: {
    code: "2",
    label: "멈춤",
    icon: <Pause className="w-4 h-4 text-yellow-600" />,
  },
  stop: {
    code: "3",
    label: "중지",
    icon: <StopCircle className="w-4 h-4 text-red-600" />,
  },
};

const IContextMenuForCampaignGroupAtCampaignGroup: React.FC<
  IContextMenuForCampaignGroupAtCampaignGroupProps
> = ({
  node,
  setIsCampaignAddPopupOpen,
  setIsDeleteDialogOpen,
  setIsRenameDialogOpen,
  onBulkAction,
}) => {
  const { addTabCurrentOnly } = useTabStore.getState();

  // 사용 가능한 메뉴 ID들을 스토어에서 가져오기
  const availableMenuIds = useAvailableMenuStore(
    (state) => state.availableMenuIdsForCampaignGroupTabCampaignGroup
  );

  // 결과 dialog 상태 관리
  const [resultDialog, setResultDialog] = useState({
    open: false,
    title: "",
    description: null as React.ReactNode,
    isError: false,
  });

  // 일괄 액션 메뉴 아이템
  const bulkActionItems = (["start", "complete", "stop"] as const).map((key, idx) => ({
    id: 39 + idx,
    group: 1,
    key: `bulk-${key}`,
    label: (
      <span className="flex items-center gap-2">
        {statusMap[key].icon}
        <span>캠페인 그룹 일괄 {statusMap[key].label}</span>
      </span>
    ),
    action: () => {
      if (onBulkAction) {
        onBulkAction(key);
      } 
      // else {
      //   setConfirmPopup({ open: true, actionKey: key });
      // }
    },
  }));

  // 메뉴 아이템 정의
  const menuItems = [
    {
      id: 38,
      group: 1,
      key: "bulk-update",
      label: (
        <span className="flex items-center gap-2">
          <Pencil className="w-4 h-4 text-gray-700" />
          <span>캠페인 그룹 일괄 수정</span>
        </span>
      ),
      action: () => {
        addTabCurrentOnly({
          id: 1,
          title: `캠페인 그룹 관리: ${node.name}`,
          uniqueKey: `groupBulkUpdate_${node.group_id}_${Date.now()}`,
          params: { groupId: node.group_id, groupName: node.name },
        });
      },
    },
    ...bulkActionItems,
    {
      id: 42,
      group: 2,
      key: "rename",
      label: (
        <span className="flex items-center gap-2">
          <Pencil className="w-4 h-4 text-gray-700" />
          <span>캠페인 그룹 이름 변경</span>
        </span>
      ),
      action: () => setIsRenameDialogOpen(true),
    },
    {
      id: 43,
      group: 2,
      key: "delete",
      label: (
        <span className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-500" />
          <span>캠페인 그룹 삭제</span>
        </span>
      ),
      action: () => setIsDeleteDialogOpen(true),
    },
    {
      id: 44,
      group: 3,
      key: "add-campaign",
      label: (
        <span className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-green-600" />
          <span>캠페인 그룹에 캠페인 추가</span>
        </span>
      ),
      action: () => setIsCampaignAddPopupOpen(true),
    },
    {
      id: 45,
      group: 3,
      key: "resend",
      label: (
        <span className="flex items-center gap-2">
          <RefreshCcw className="w-4 h-4 text-blue-500" />
          <span>캠페인 그룹 실시간 재발신</span>
        </span>
      ),
      action: () => {
        addTabCurrentOnly({
          id: 24,
          title: `재발신: ${node.name}`,
          uniqueKey: `groupResend_${node.group_id}_${Date.now()}`,
          params: { groupId: node.group_id, groupName: node.name },
        });
      },
    },
  ];

  const visibleMenuItems =
    availableMenuIds?.length > 0
      ? menuItems.filter((item) => availableMenuIds.includes(item.id))
      : [];

  if (visibleMenuItems.length === 0) return null;

  const renderMenuItems = () => {
    const elements: React.ReactElement[] = [];
    let currentGroup = -1;

    visibleMenuItems.forEach((item) => {
      if (currentGroup !== -1 && item.group !== currentGroup) {
        elements.push(<Separator key={`sep-${item.group}`} />);
      }
      elements.push(
        <div
          key={item.key}
          style={itemStyle}
          className="contexify-custom-item hover:bg-[#F5F7FA] transition"
          onClick={item.action}
        >
          {item.label}
        </div>
      );
      currentGroup = item.group;
    });

    return elements;
  };

  return (
    <>
      <div className="py-1 min-w-[220px]">{renderMenuItems()}</div>

      {/* {!onBulkAction && (
        <IConfirmPopupForMultiUpdateCampaignProgress
          open={confirmPopup.open}
          actionKey={confirmPopup.actionKey as "start" | "complete" | "stop"}
          items={campaignInfos}
          onConfirm={handleConfirmBulkAction}
          onCancel={() => setConfirmPopup({ open: false, actionKey: "" })}
        />
      )} */}

      <Dialog
        open={resultDialog.open}
        onOpenChange={() =>
          setResultDialog((prev) => ({ ...prev, open: false }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={resultDialog.isError ? "text-red-600" : ""}>
              {resultDialog.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">{resultDialog.description}</div>
          <DialogFooter className="sm:justify-end">
            <Button
              variant="default"
              onClick={() =>
                setResultDialog((prev) => ({ ...prev, open: false }))
              }
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IContextMenuForCampaignGroupAtCampaignGroup;
