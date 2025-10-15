"use client";

import { Building } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { Menu, useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { TreeNode } from "@/features/campaignManager/types/typeForCampaignGroupForSideBar";
import AddCampaignGroupDialog from "./dialog/AddCampaignGroupDialog";
import { useTabStore } from "@/store/tabStore";
import { useCampainManagerStore } from '@/store/campainManagerStore';
import CampaignAddPopup from '@/features/campaignManager/components/popups/CampaignAddPopup';
import { createPortal } from "react-dom";
import IDialogForUpdateCampaignGroupName from "./dialog/IDialogForUpdateCampaignGroupName";
import { toast } from "react-toastify";
import { useApiForDeleteCampaignGroup } from "@/features/campaignManager/hooks/useApiForDeleteCampaignGroup";
import { IContextMenuForCampaignForCampaignGroup, CampaignStatus } from "./ContextMenus/IContextMenuForCampaignForCampaignGroup";
import IContextMenuForCampaignGroupAtCampaignGroup from "./ContextMenus/IContextMenuForCampaignGroupAtCampaignGroup";
import IContextMenuForTenantAtCampaignGroup from "./ContextMenus/IContextMenuForTenantAtCampaignGroup";
import { useSideMenuCampaignGroupTabStore } from "@/store/storeForSideMenuCampaignGroupTab";
import IDialogButtonForDeleteCampaignGroup from "@/widgets/sidebar2/dialog/IDialogButtonForDeleteCampaignGroup";
import { useApiForMultiUpdateCampaignProgressStatus } from "../treeMenus/hook/useApiForMultiUpdateCampaignProgressStatus";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import IConfirmPopupForMultiUpdateCampaignProgress from "../popups/IConfirmPopupForMultiUpdateCampaignProgress";
// Portal Provider 사용을 위한 import
import { usePortal } from "@/features/campaignManager/components/treeMenus/provider/usePortal";
import { getStatusIconWithStartFlag } from "@/components/shared/layout/utils/utils";
import { useCampaignDialStatusStore } from "@/store/campaignDialStatusStore";

interface TreeNodeProps {
  node: TreeNode;
  level: number;
  expandedNodes: Set<string>;
  selectedNodeId?: string;
  onNodeToggle: (nodeId: string) => void;
  onNodeSelect: (nodeId: string) => void;
}

const getStatusIcon = (status?: number) => {
  switch (status) {
    case 1:
      return '/sidebar-menu/tree_play.svg';
    case 2:
      return '/sidebar-menu/tree_pause.svg';
    case 3:
      return '/sidebar-menu/tree_stop.svg';
    default:
      return null;
  }
};

const getStatusFromFlag = (flag?: number): CampaignStatus => {
  switch (flag) {
    case 1: return 'started';
    case 2: return 'pending';
    case 3: return 'stopped';
    default: return 'stopped';
  }
};

export function TreeNodeForSideBarCampaignGroupTab({
  node,
  level,
  expandedNodes,
  selectedNodeId,
  onNodeToggle,
  onNodeSelect,
}: TreeNodeProps) {
  // Portal Provider 훅 사용
  const { openStartPopup } = usePortal();

  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [isCampaignAddPopupOpen, setIsCampaignAddPopupOpen] = useState(false);
  const [bulkResultDialog, setBulkResultDialog] = useState<{ open: boolean; title: string; message: React.ReactNode }>({ open: false, title: "", message: "" });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const recentlyClosedDialogRef = useRef(false);
  const { refetchTreeDataForCampaignGroupTab, setSelectedNodeId } = useSideMenuCampaignGroupTabStore();
  const { setCampaignGroupManagerInit } = useCampainManagerStore();
  const nodeRef = useRef<HTMLDivElement>(null);
  // const { campaignIdForUpdateFromSideMenu, setCampaignIdForUpdateFromSideMenu } = useTabStore();
  const campaignIdForUpdateFromSideMenu = useTabStore(state => state.campaignIdForUpdateFromSideMenu);
  const setCampaignIdForUpdateFromSideMenu = useTabStore(state => state.setCampaignIdForUpdateFromSideMenu);
  const [isBrowser, setIsBrowser] = useState(false);

  const [isBulkUpdatePopupOpen, setIsBulkUpdatePopupOpen] = useState(false);
  // isStartPopupOpen 상태 제거 - Portal Provider로 관리됨
  const [bulkActionKey, setBulkActionKey] = useState<"start" | "complete" | "stop" | "">("");

  const campaignDialStatus = useCampaignDialStatusStore(state => state.campaignDialStatus);

  // step1 
  // campaignDialStatus에서 캠페인 ID에 해당하는 상태를 찾음 (멈춤중, 중지중, 시작중에 대한 일시적 상태)
  // 그 외의 상태는 기존 currentCampaign?.start_flag를 사용
  const currentCampaignDialStatus = campaignDialStatus.find((dialStatus) => dialStatus.campaign_id === node.id);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Extract all campaign IDs from this group (string[])
  const campaignIds = useMemo(() => {
    if (node.type === "group" && node.children && Array.isArray(node.children)) {
      return node.children
        .filter(child => child.type === "campaign" && child.campaign_id)
        .map(child => String(child.campaign_id));
    }
    return [];
  }, [node.type, node.children]);

  // 캠페인 정보 배열 (이름+상태+캠페인ID)
  const campaignInfos = useMemo(() => {
    if (node.type === "group" && node.children && Array.isArray(node.children)) {
      return node.children
        .filter(child => child.type === "campaign")
        .map(child => ({
          name: child.name,
          status: typeof child.start_flag === "number" ? child.start_flag : 0, // undefined 방지
          campaign_id: child.campaign_id?.toString()
        }));
    }
    return [];
  }, [node.type, node.children]);

  const { mutate: deleteCampaignGroup, isPending: isDeleting } = useApiForDeleteCampaignGroup({
    onSuccess: () => {
      toast.success("캠페인 그룹이 삭제되었습니다.");
      setIsDeleteDialogOpen(false);
      refetchTreeDataForCampaignGroupTab();
      setCampaignGroupManagerInit(true);
    },
    onError: (error) => {
      alert(`캠페인 그룹 삭제 실패: ${error.message}`);
    }
  });

  const { updateCampaignsStatus } = useApiForMultiUpdateCampaignProgressStatus();

  const tenantMenuId = `tenant-menu-${node.id}`;
  const groupMenuId = `group-menu-${node.id}`;

  const { show: showTenantMenu } = useContextMenu({ id: tenantMenuId });
  const { show: showGroupMenu } = useContextMenu({ id: groupMenuId });

  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = campaignIdForUpdateFromSideMenu === node.campaign_id?.toString() || selectedNodeId === node.id;

  useEffect(() => {
    if (node.type === "group" && hasChildren) {
      // for debug
      // console.log(`그룹 노드 ${node.name}에 캠페인 ${node.children?.length}개 있음, 확장 상태: ${isExpanded}`);
    }
  }, [node, hasChildren, isExpanded]);

  const handleClick = useCallback(() => {
    onNodeSelect(node.id);          // ← store.set(selectedNodeId)
    if (hasChildren) {
      onNodeToggle(node.id);        // ← store.set(expandedNodes)
    }
    if (node.type === "campaign") {
      setCampaignIdForUpdateFromSideMenu(node.campaign_id?.toString() || "");
      handleDoubleClickCampaign();
    }

    if (node.type === "group") {
      const { addTabCurrentOnly } = useTabStore.getState();
      addTabCurrentOnly({
        id: 1,
        title: `캠페인 그룹 관리: ${node.name}`,
        uniqueKey: `groupBulkUpdate_${node.group_id}_${Date.now()}`,
        params: {
          groupId: node.group_id,
          groupName: node.name,
        },
      });
    }

    // node.type === "campaign"
    //   ? handleDoubleClickCampaign
    //   : node.type === "group"
    //     ? handleDoubleClickGroup
    //     : undefined

  }, [onNodeToggle, node, onNodeSelect, hasChildren, setCampaignIdForUpdateFromSideMenu]);


  const handleContextMenuEvent = (e: React.MouseEvent) => {
    e.preventDefault();
    onNodeSelect(node.id);
    if (node.type === "tenant") {
      showTenantMenu({ event: e });
    } else if (node.type === "group") {
      showGroupMenu({ event: e });
    }
  };

  const handleCloseAddGroupDialog = useCallback(() => {
    setIsAddGroupDialogOpen(false);
    recentlyClosedDialogRef.current = true;
    setTimeout(() => {
      recentlyClosedDialogRef.current = false;
      setCampaignGroupManagerInit(true);
    }, 300);
  }, [setCampaignGroupManagerInit]);

  // 캠페인 이름 수정 후 리패치 처리
  const handleCloseRenameDialog = useCallback(async () => {
    setIsRenameDialogOpen(false);
    recentlyClosedDialogRef.current = true;
    setTimeout(() => {
      recentlyClosedDialogRef.current = false;
    }, 300);
    setCampaignGroupManagerInit(true);
    await refetchTreeDataForCampaignGroupTab();
  }, [setCampaignGroupManagerInit, refetchTreeDataForCampaignGroupTab]);

  const handleRenameSuccess = useCallback(() => {
    // 필요한 경우 리렌더링이나 데이터 갱신 로직 추가
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    recentlyClosedDialogRef.current = true;
    setTimeout(() => {
      recentlyClosedDialogRef.current = false;
    }, 300);
  }, []);

  const confirmDelete = useCallback(() => {
    if (node && node.group_id) {
      deleteCampaignGroup(node.group_id);
    }
  }, [node, deleteCampaignGroup]);

  const handleAddGroup = useCallback((groupName: string, groupCode: string) => {
    // 실제 그룹 추가 로직 구현 필요
    // console.log("새 그룹 추가:", {
    //   tenantId: node.tenant_id,
    //   tenantName: node.name,
    //   groupName,
    //   groupCode,
    // });
  }, [node.tenant_id, node.name]);

  // 수정된 handleBulkAction 함수
  const handleBulkAction = useCallback((actionKey: "start" | "complete" | "stop") => {
    setBulkActionKey(actionKey);

    if (actionKey === "start") {
      // Portal Provider를 사용하여 팝업 열기
      openStartPopup(campaignInfos, async () => {
        try {
          const statusMap = { start: "1", complete: "2", stop: "3" };

          // API 호출
          const result = await updateCampaignsStatus(campaignIds, statusMap[actionKey]);
          // console.log("캠페인 시작 업데이트 결과:", result);

          // 작업 완료 후 트리 데이터 갱신 - Portal Provider에서 처리됨
          setTimeout(() => {
            refetchTreeDataForCampaignGroupTab();
          }, 100);

          return result;
        } catch (error) {
          // console.error("캠페인 시작 오류:", error);
          throw error;
        }
      });
    } else {
      setIsBulkUpdatePopupOpen(true);
    }
  }, [openStartPopup, campaignInfos, campaignIds, updateCampaignsStatus, refetchTreeDataForCampaignGroupTab]);

  // 일괄 팝업에서 확인 시 - 수정된 버전 (start 액션은 Portal Provider에서 처리)
  const handleConfirmBulk = useCallback(async () => {
    try {
      const statusMap = { start: "1", complete: "2", stop: "3" };

      if (bulkActionKey === "") {
        throw new Error("액션 키가 없습니다");
      }

      // start 액션은 더 이상 여기서 처리하지 않음 (Portal Provider에서 처리)
      // 시작이 아닌 경우(complete, stop) 기존 로직 유지
      setIsBulkUpdatePopupOpen(false);
      const result = await updateCampaignsStatus(campaignIds, statusMap[bulkActionKey]);

      // 결과 다이얼로그 표시
      setBulkResultDialog({
        open: true,
        title: "일괄 처리 결과",
        message: (
          <div>
            <p>총 {result.totalCount}개 중 {result.successCount}개 처리 완료, {result.failCount}개 실패</p>
          </div>
        )
      });

      // complete, stop 액션에는 트리 데이터 갱신 가능
      await refetchTreeDataForCampaignGroupTab();
      return result;
    } catch (e: any) {
      // console.error("캠페인 상태 업데이트 오류:", e);
      setBulkResultDialog({
        open: true,
        title: "처리 중 오류",
        message: (
          <div className="text-red-500">
            <p>{e.message || "알 수 없는 오류가 발생했습니다."}</p>
          </div>
        )
      });
      throw e;
    }
  }, [bulkActionKey, campaignIds, updateCampaignsStatus, refetchTreeDataForCampaignGroupTab]);

  const getNodeStyle = useCallback(() => {
    let baseStyle = `flex items-center hover:bg-[#FFFAEE] px-2 py-0.5 cursor-pointer transition-colors duration-150`;
    if (isSelected) {
      baseStyle += " bg-[#FFFAEE] text-555";
    }
    if (node.type === "campaign") {
      baseStyle += isSelected ? "" : " text-green-600";
    }
    return baseStyle;
  }, [isSelected, node.type]);

  const renderIcon = useCallback(() => {
    switch (node.type?.toLowerCase()) {
      case "root":
        return <Image src="/tree-menu/organization.png" alt="조직" width={14} height={12} />;
      case "tenant":
        return <Image src="/tree-menu/folder.png" alt="폴더" width={14} height={12} />;
      case "group":
        return <Image src="/tree-menu/folder2.png" alt="폴더2" width={15} height={12} />;
      case "campaign":
        return <span></span>;
      default:
        return <Building className="h-4 w-4 text-gray-500" />;
    }
  }, [node.type]);

  const renderAllDialogs = useCallback(() => {
    if (!isBrowser) return null;

    return (
      <>
        {isAddGroupDialogOpen && createPortal(
          <AddCampaignGroupDialog
            isOpen={isAddGroupDialogOpen}
            onClose={handleCloseAddGroupDialog}
            tenantId={node.tenant_id ? node.tenant_id : 0}
            tenantName={node.name}
            onAddGroup={handleAddGroup}
          />,
          document.body
        )}

        {isCampaignAddPopupOpen && createPortal(
          <CampaignAddPopup
            isOpen={isCampaignAddPopupOpen}
            groupId={node.group_id || 0}
            groupName={node.name || ''}
            onClose={() => setIsCampaignAddPopupOpen(false)}
            tenantId={node.tenant_id || 0}
          />,
          document.body
        )}

        {isBulkUpdatePopupOpen && createPortal(
          <IConfirmPopupForMultiUpdateCampaignProgress
            open={isBulkUpdatePopupOpen}
            actionKey={bulkActionKey}
            items={campaignInfos}
            onConfirm={handleConfirmBulk}
            onCancel={() => { setIsBulkUpdatePopupOpen(false); setBulkActionKey(""); }}
          />,
          document.body
        )}

        {/* isStartPopupOpen 부분 제거 - Portal Provider에서 관리 */}

        {bulkResultDialog.open && createPortal(
          <Dialog open={bulkResultDialog.open} onOpenChange={() => setBulkResultDialog(prev => ({ ...prev, open: false }))}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{bulkResultDialog.title}</DialogTitle>
              </DialogHeader>
              <div className="py-2">{bulkResultDialog.message}</div>
              <DialogFooter className="sm:justify-end">
                <Button variant="default" onClick={() => setBulkResultDialog(prev => ({ ...prev, open: false }))}>확인</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>,
          document.body
        )}

        {isDeleteDialogOpen && createPortal(
          <IDialogButtonForDeleteCampaignGroup
            isOpen={isDeleteDialogOpen}
            groupName={node.name}
            onCancel={handleCloseDeleteDialog}
            onDelete={confirmDelete}
            isDeleting={isDeleting}
          />,
          document.body
        )}

        {isRenameDialogOpen && node.group_id !== undefined && createPortal(
          <IDialogForUpdateCampaignGroupName
            isOpen={isRenameDialogOpen}
            onClose={handleCloseRenameDialog}
            groupId={node.group_id}
            tenantId={node?.tenant_id || 0}
            currentGroupName={node?.name || ''}
            onSuccess={handleRenameSuccess}
          />,
          document.body
        )}
      </>
    );
  }, [
    isBrowser, isAddGroupDialogOpen, isCampaignAddPopupOpen, isBulkUpdatePopupOpen,
    bulkResultDialog, isDeleteDialogOpen, isRenameDialogOpen,
    node, bulkActionKey, campaignInfos, handleCloseAddGroupDialog, handleCloseDeleteDialog,
    handleCloseRenameDialog, handleRenameSuccess, handleConfirmBulk, confirmDelete, handleAddGroup
  ]);

  const handleDoubleClickCampaign = useCallback(() => {
    if (node.type !== "campaign") return;

    const { addTabCurrentOnly, setCampaignIdForUpdateFromSideMenu } = useTabStore.getState();

    addTabCurrentOnly({
      id: 2,
      uniqueKey: "2",
      title: `캠페인 관리 ${node.campaign_id}`,
      content: null,
      params: {
        campaignId: node.campaign_id?.toString(),
        campaignName: node.name,
        campaignType: node.type,
      },
    });
    setSelectedNodeId(node.id);
    setCampaignIdForUpdateFromSideMenu(node.campaign_id?.toString() || "");
  }, [node, setSelectedNodeId]);

  // 캠페인 그룹 노드 더블 클릭 시 캠페인 그룹 일괄 수정 동작
  const handleDoubleClickGroup = useCallback(() => {
    if (node.type !== "group") return;
    const { addTabCurrentOnly } = useTabStore.getState();
    addTabCurrentOnly({
      id: 1,
      title: `캠페인 그룹 관리: ${node.name}`,
      uniqueKey: `groupBulkUpdate_${node.group_id}_${Date.now()}`,
      params: {
        groupId: node.group_id,
        groupName: node.name,
      },
    });
  }, [node]);

  const renderNodeUI = useCallback(() => (
    <div
      ref={nodeRef}
      className={getNodeStyle()}
      onClick={handleClick}
      // onClick={
      //   node.type === "campaign"
      //     ? handleDoubleClickCampaign
      //     : node.type === "group"
      //       ? handleDoubleClickGroup
      //       : undefined
      // }
      onContextMenu={node.type === "campaign" ? undefined : handleContextMenuEvent}
      style={{ paddingLeft: `${level * 16 + 8}px` }}
    >
      <div className="flex items-center w-full gap-2">
        {hasChildren ? (
          isExpanded ? (
            <Image src="/tree-menu/minus_for_tree.png" alt="접기" width={12} height={12} />
          ) : (
            <Image src="/tree-menu/plus_icon_for_tree.png" alt="펼치기" width={12} height={12} />
          )
        ) : (
          <span className="w-3" />
        )}
        {renderIcon()}
        <span className={`flex text-sm ${isSelected ? "font-medium text-555" : "text-555"}`}>
          {node.type === "campaign" && typeof currentCampaignDialStatus?.status === "number" ? (
            getStatusIconWithStartFlag(currentCampaignDialStatus.status) ? (
              <Image
                src={getStatusIconWithStartFlag(currentCampaignDialStatus.status) as string}
                alt="상태"
                width={12}
                height={8}
                className="mr-1 object-contain"
              />
            ) : null
          ) : (
            getStatusIconWithStartFlag(typeof node.start_flag === "number" ? node.start_flag : undefined) ? (
              <Image
                src={getStatusIconWithStartFlag(typeof node.start_flag === "number" ? node.start_flag : undefined) as string}
                alt="상태"
                width={12}
                height={8}
                className="mr-1 object-contain"
              />
            ) : null
          )}

          {node.type === "group" && `[${node.group_id}]`}
          {node.type === "campaign" && `[${node.campaign_id}]`}
          {node.name}
        </span>
      </div>
    </div>
  ), [
    getNodeStyle,
    handleClick,
    handleDoubleClickCampaign,
    handleDoubleClickGroup,
    handleContextMenuEvent,
    hasChildren,
    isExpanded,
    isSelected,
    level,
    node,
    renderIcon,
    currentCampaignDialStatus,
  ]);

  const handleEditCampaign = useCallback(() => {
    const { simulateHeaderMenuClick, setCampaignIdForUpdateFromSideMenu } = useTabStore.getState();
    simulateHeaderMenuClick(2);
    setCampaignIdForUpdateFromSideMenu(node.campaign_id?.toString() || "");
  }, [node.campaign_id]);

  const handleMonitorCampaign = useCallback(() => {
    const { addMultiTab, setActiveTab } = useTabStore.getState();
    const _uniqueKey = `monitor-${Date.now()}`;
    setActiveTab(22, _uniqueKey);
    addMultiTab({
      id: 22,
      uniqueKey: _uniqueKey,
      title: `상담사 상태 모니터 - ${node.name}`,
      icon: '',
      href: '',
      content: null,
      campaignId: node.campaign_id?.toString()
    });
  }, [node.name, node.campaign_id]);

  const handleCopyCampaign = useCallback(() => {
    // console.log(`캠페인 복사: ${node.name} (ID: ${node.campaign_id})`);
    toast.info("캠페인 복사 기능이 준비 중입니다.");
  }, [node.name, node.campaign_id]);

  const renderNodeWithProperContextMenu = useCallback(() => {
    if (node.type === "campaign") {
      const campaignItem = {
        id: node.campaign_id,
        label: node.name,
        type: node.type,
        status: getStatusFromFlag(node.start_flag)
      };

      return (
        <IContextMenuForCampaignForCampaignGroup
          item={campaignItem}
          onEdit={handleEditCampaign}
          onMonitor={handleMonitorCampaign}
          onHandleCampaignCopy={handleCopyCampaign}
          tenantIdForCampaignTab={node.tenant_id}
        >
          {renderNodeUI()}
        </IContextMenuForCampaignForCampaignGroup>
      );
    }
    return renderNodeUI();
  }, [node, renderNodeUI, handleEditCampaign, handleMonitorCampaign, handleCopyCampaign]);

  useEffect(() => {
    // Only process this effect for campaign nodes
    if (node.type === "campaign") {
      // If this campaign matches the selected campaign ID, select it
      if (campaignIdForUpdateFromSideMenu &&
        node.campaign_id?.toString() === campaignIdForUpdateFromSideMenu) {

        setSelectedNodeId(node.id);

        // Scroll to this node
        if (nodeRef.current) {
          setTimeout(() => {
            nodeRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest'
            });
          }, 100);
        }
      }
    }
  }, [campaignIdForUpdateFromSideMenu, node.id, node.campaign_id, node.type, setSelectedNodeId]);

  return (
    <div className="select-none" data-node-type={node.type} data-node-id={node.id}>
      {renderNodeWithProperContextMenu()}

      {/* 테넌트 노드 컨텍스트 메뉴 */}
      <Menu id={tenantMenuId} className="compact-menu">
        <IContextMenuForTenantAtCampaignGroup
          nodeName={node.name}
          onAddGroup={() => setIsAddGroupDialogOpen(true)}
        />
      </Menu>

      {/* 그룹 노드 컨텍스트 메뉴 - 캠페인 ID/이름/상태 배열 포함된 노드 전달 */}
      <Menu id={groupMenuId} className="compact-menu">
        <IContextMenuForCampaignGroupAtCampaignGroup
          node={{
            ...node,
            campaignIds: campaignIds,
            campaignInfos: campaignInfos // 컨텍스트 메뉴에도 전달
          }}
          setIsCampaignAddPopupOpen={setIsCampaignAddPopupOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          setIsRenameDialogOpen={setIsRenameDialogOpen}
          onBulkAction={handleBulkAction}
        />
      </Menu>

      {hasChildren && isExpanded && (
        <div className="children-container">
          {node.children?.map((child) => (
            <TreeNodeForSideBarCampaignGroupTab
              key={child.id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              selectedNodeId={selectedNodeId}
              onNodeToggle={onNodeToggle}
              onNodeSelect={onNodeSelect}
            />
          ))}
        </div>
      )}

      {renderAllDialogs()}

      <style jsx>{`
        .compact-menu {
          font-size: 20px;
          padding: 4px;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .compact-menu .react-contexify__item {
          padding: 4px 8px;
          min-height: auto;
          transition: background-color 0.2s ease;
        }
        .compact-menu .react-contexify__item:hover {
          background-color: #f3f3f3;
        }
      `}</style>
    </div>
  );
}