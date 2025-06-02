
// src/features/campaignManager/components/menus/IContextMenuForCampaignGroupAtCampaignGroup.tsx
'use client';

import React, { useState } from "react";
import { useTabStore } from "@/store/tabStore";
import { useAvailableMenuStore } from "@/store/useAvailableMenuStore";
import { Separator } from "react-contexify";
// import { useApiForMultiUpdateCampaignProgressStatus } from "../hook/useApiForMultiUpdateCampaignProgressStatus";
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
  AlertTriangle,
  CheckCircle,
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

  // 캠페인 상태 일괄 변경 훅
  // const { updateCampaignsStatus } = useApiForMultiUpdateCampaignProgressStatus();

  // 멀티업데이트 팝업 상태
  // const [confirmPopup, setConfirmPopup] = useState<{
  //   open: boolean;
  //   actionKey: "start" | "complete" | "stop" | "";
  // }>({ open: false, actionKey: "" });

  // 결과 dialog 상태 관리
  const [resultDialog, setResultDialog] = useState({
    open: false,
    title: "",
    description: null as React.ReactNode,
    isError: false,
  });

  // 캠페인 그룹 내 캠페인 ID/이름/정보 배열 추출
  const campaignIds: string[] = node.campaignIds || [];
  const campaignInfos: { name: string; status: number }[] = node.campaignInfos || [];

  // 일괄 작업 실행
  // const handleConfirmBulkAction = async () => {
  //   const actionKey = confirmPopup.actionKey;
  //   if (!actionKey || !statusMap[actionKey]) return;

  //   try {
  //     const result = await updateCampaignsStatus(
  //       campaignIds,
  //       statusMap[actionKey].code
  //     );
  //     setConfirmPopup({ open: false, actionKey: "" });
  //     setResultDialog({
  //       open: true,
  //       title: `일괄 ${statusMap[actionKey].label} 결과`,
  //       description: (
  //         <div className="space-y-3">
  //           <div className="flex items-center">
  //             <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
  //             <span>
  //               총 <span className="font-semibold">{result?.totalCount}</span>개 캠페인 중{" "}
  //               <span className="font-semibold text-green-600">{result?.successCount}</span>개 성공,
  //               <span className={`font-semibold ${result?.failCount ? "text-red-600" : ""}`}>
  //                 {" "}
  //                 {result?.failCount ?? 0}
  //               </span>
  //               개 실패
  //             </span>
  //           </div>
  //           {result?.results && result.results.filter(r => !r.success).length > 0 && (
  //             <div className="flex items-start">
  //               <CheckCircle className="h-5 w-5 text-red-500 mt-1 mr-2" />
  //               <div>
  //                 <p className="font-medium">실패 캠페인:</p>
  //                 <p className="text-red-600">
  //                   {result.results.filter(r => !r.success).map(r => r.campaignId).join(", ")}
  //                 </p>
  //               </div>
  //             </div>
  //           )}
  //         </div>
  //       ),
  //       isError: false,
  //     });
  //   } catch (e: any) {
  //     setConfirmPopup({ open: false, actionKey: "" });
  //     setResultDialog({
  //       open: true,
  //       title: `일괄 ${statusMap[actionKey].label} 실패`,
  //       description: (
  //         <div className="flex items-start">
  //           <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
  //           <span>
  //             {e?.message || `일괄 ${statusMap[actionKey].label} 작업 중 오류가 발생했습니다.`}
  //           </span>
  //         </div>
  //       ),
  //       isError: true,
  //     });
  //   }
  // };

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
