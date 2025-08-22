"use client";

import { TreeNodeProps } from "@/components/shared/layout/SidebarPresenter";
import { ContextMenuForCampaignForCampaignTab } from "./ContextMenuForCampaignForCampaignTab";
import { FileText } from "lucide-react";
import { useTabStore } from "@/store/tabStore";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { FolderContextMenu } from "./FolderContextMenuForTreeNode";
import Image from "next/image";
import clsx from "clsx";
import { useTreeMenuStore } from "@/store/storeForSsideMenuCampaignTab";
import { useMainStore } from "@/store/mainStore";
import { useCampainManagerStore } from "@/store/campainManagerStore";
import { IRootNodeContextMenu } from "./ContextMenus/ICampaignTabRootNodeContextMenu";
import { TreeItem } from "../../types/typeForSidebar2";
import { getStatusIconWithStartFlag } from "@/components/shared/layout/utils/utils";
import { CampaignScheDuleListDataResponse, CampaignSkillUpdateRequest } from '@/features/campaignManager/types/campaignManagerIndex';
import { CampaignInfoInsertRequest } from '@/features/campaignManager/hooks/useApiForCampaignManagerInsert';
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import { useCampaignDialStatusStore } from "@/store/campaignDialStatusStore";

export function TreeNodeForCampaignTab({
  item,
  level,
  expandedNodes,
  selectedNodeId,
  getStatusIcon,
  onNodeToggle,
  onNodeSelect,
  compact = false,
}: TreeNodeProps) {
  // const { skilIdsForCampaignTreeMenu, viewMode, selectedNodeType, setSelectedNodeType } = useTreeMenuStore();
  // const {
  //   simulateHeaderMenuClick,
  //   setCampaignIdForUpdateFromSideMenu,
  //   setCampaignIdForCopyCampaign,
  //   addTab,
  //   addTabCurrentOnly,
  //   campaignIdForUpdateFromSideMenu
  // } = useTabStore();

  // ----- After -----
  // useTreeMenuStore: selector 로 읽기 전용 값만, 액션은 getState()로
  const skilIdsForCampaignTreeMenu = useTreeMenuStore(state => state.skilIdsForCampaignTreeMenu);
  const viewMode = useTreeMenuStore(state => state.viewMode);
  const selectedNodeType = useTreeMenuStore(state => state.selectedNodeType);
  const setSelectedNodeType = useTreeMenuStore.getState().setSelectedNodeType;

  // useTabStore: selector 로 읽기 전용 값만, 액션은 getState()로
  const campaignIdForUpdateFromSideMenu = useTabStore(state => state.campaignIdForUpdateFromSideMenu);

  const {
    setCampaignIdForUpdateFromSideMenu,
    setCampaignIdForCopyCampaign,
    addTab,
    addTabCurrentOnly
  } = useTabStore.getState();

  const { setCopyCampaignManagerInfo, setCopyCampaignInfo, setCopyTenantId, setCopyCampaignSchedule, setCopyCampaignSkills } = useCampainManagerStore();

  const { campaigns } = useMainStore();
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      campaignIdForUpdateFromSideMenu &&
      campaignIdForUpdateFromSideMenu === item.id &&
      item.type === "campaign"
    ) {
      onNodeSelect(item.id);
      setSelectedNodeType(item.type);

      if (nodeRef.current) {
        setTimeout(() => {
          nodeRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }, 100);
      }
    }
  }, [campaignIdForUpdateFromSideMenu, item.id, item.type, onNodeSelect, setSelectedNodeType]);

  // const currentCampaign = campaigns?.find((c: any) => c.campaign_id === Number(item.id));
  // const isTenantFolder = item.type === "folder" && level === 1;
  // const isRootNode = item.label.toLowerCase() === "nexus";

  // const currentStatus = currentCampaign
  //   ? (() => {
  //     switch (currentCampaign.campaign_status) {
  //       case 1: return "started";
  //       case 2: return "pending";
  //       case 3: return "stopped";
  //       default: return item.status;
  //     }
  //   })()
  //   : item.status;

  // const updatedItem = { ...item, status: currentStatus };

  // 캠페인 ID → 상태 맵 생성
  // const campaignStatusMap = useMemo(() => {
  //   const map = new Map<string, "started" | "pending" | "stopped">();
  //   campaigns?.forEach(campaign => {
  //     let status: "started" | "pending" | "stopped" = 'stopped';
  //     switch (campaign.campaign_status) {
  //       case 1: status = 'started'; break;
  //       case 2: status = 'pending'; break;
  //       case 3: status = 'stopped'; break;
  //     }
  //     map.set(campaign.campaign_id.toString(), status);
  //   });
  //   return map;
  // }, [campaigns]);

  // 현재 캠페인의 상태 확인
  const currentCampaign = campaigns?.find((c: any) => c.campaign_id === Number(item.id));
  const isTenantFolder = item.type === "folder" && level === 1;
  const isRootNode = item.label.toLowerCase() === "nexus" && item.type === "folder" && level === 0;
  // const isRootNode = item.type !== "folder" && item.type !== "campaign";


  const currentStatus = currentCampaign
    ? (() => {
      switch (currentCampaign.campaign_status) {
        case 1: return "started";
        case 2: return "pending";
        case 3: return "stopped";
        default: return item.status;
      }
    })()
    : item.status;

  const updatedItem = { ...item, status: currentStatus };

  const campaignDialStatus = useCampaignDialStatusStore(state => state.campaignDialStatus);
  
  // campaignDialStatus에서 캠페인 ID에 해당하는 상태를 찾음 (멈춤중, 중지중, 시작중에 대한 일시적 상태)
  // 그 외의 상태는 기존 currentCampaign?.start_flag를 사용
  const currentCampaignDialStatus = campaignDialStatus.find((dialStatus) => dialStatus.campaign_id === item.id);

  const hasChildren = !!item.children?.length;
  const isExpanded = expandedNodes.has(item.id);
  // ✅ 타입도 같이 체크
  const isSelected = selectedNodeId === item.id && selectedNodeType === item.type;
  // const statusIcon = item.type === "campaign" ? getStatusIcon(currentStatus) : null;

  // const statusIcon = item.type === "campaign" ? getStatusIconWithStartFlag(currentCampaign?.start_flag) : null;

  // store에 저장된게 있으면 그걸넣고 없어서 null이면 기존 currentCampaign?.start_flag를 넣음
  const statusIcon = item.type === "campaign" ? getStatusIconWithStartFlag(currentCampaignDialStatus ? Number(currentCampaignDialStatus.status) : currentCampaign?.start_flag) : null;

  const handleClick = useCallback(() => {
    onNodeSelect(item.id);
    setSelectedNodeType(item.type);
    // setCampaignIdForUpdateFromSideMenu(item.id);
    if (item.type === "campaign") {
      setCampaignIdForCopyCampaign(item.id);
    }
    if (hasChildren) onNodeToggle(item.id);
  }, [item.id, item.type, hasChildren, onNodeSelect]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    // e.preventDefault(); // 기본 브라우저 컨텍스트 메뉴를 막음
    onNodeSelect(item.id);
    setSelectedNodeType(item.type);
  }, [item.id, item.type, onNodeSelect, setSelectedNodeType]);

  const handleDoubleClick = useCallback(() => {
    if (item.type !== "campaign") return;

    // openSingleTabAtCurrentSection 함수 사용
    const tabInfo = {
      id: 2,
      uniqueKey: `2-${Date.now()}`,
      title: `캠페인 관리`,
      content: null,
      params: { campaignId: item.id, campaignName: item.label, campaignType: item.type },
      menuId: 2, // id와 동일한 값으로 설정하거나 적절한 menuId를 지정
      icon: "",  // 적절한 아이콘 경로를 지정하거나 빈 문자열을 사용
      href: ""   // 적절한 href를 지정하거나 빈 문자열을 사용
    };

    // 현재 섹션에 단일 탭으로 추가
    useTabStore.getState().openSingleTabAtCurrentSection(2, tabInfo);

    // 부가 상태 업데이트 (기존과 동일)
    setCampaignIdForUpdateFromSideMenu(item.id);
    setSelectedNodeType(item.type);
  }, [item, setCampaignIdForUpdateFromSideMenu, setSelectedNodeType]);

  const onHandleCampaignCopy = useCallback(() => {
    setCopyCampaignManagerInfo({} as CampaignInfoInsertRequest);
    setCopyCampaignInfo({} as MainDataResponse);
    setCopyTenantId('');
    setCopyCampaignSchedule({} as CampaignScheDuleListDataResponse);
    setCopyCampaignSkills({} as CampaignSkillUpdateRequest);
    setCampaignIdForUpdateFromSideMenu(item.id);
    setCampaignIdForCopyCampaign(item.id);
    setSelectedNodeType(item.type);
    addTab({ id: 130, uniqueKey: "130", title: "캠페인 복사", icon: "", href: "", content: null });
  }, [item.id, item.type, setCampaignIdForUpdateFromSideMenu, setCampaignIdForCopyCampaign, addTab, setSelectedNodeType]);

  if (item.visible === false) return null;

  const iconSize = compact ? 10 : 14;
  const expandIconSize = compact ? 10 : 12;

  const getNodeIcon = () => {
    if (item.type === "folder") {
      return level === 0 ? (
        <Image src="/tree-menu/organization.png" alt="조직" width={14} height={12} className="flex-shrink-0" />
      ) : (
        <Image src="/tree-menu/folder.png" alt="그룹" width={14} height={12} className="flex-shrink-0" />
      );
    }
    if (item.type === "campaign") {
      return statusIcon ? (
        <Image src={statusIcon} alt="status" width={12} height={12} className="flex-shrink-0" />
      ) : (
        <FileText className={`${compact ? 'h-4 w-4' : 'h-4 w-4'} text-gray-400 flex-shrink-0`} />
      );
    }
    return <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />;
  };

  const nodeStyle = clsx(
    "flex items-center hover:bg-[#FFFAEE] cursor-pointer transition-colors duration-150",
    // "bg-[#FFFAEE]" ==> 로그아웃시 (tabStroe가 초기화될시 선택 효과 css 제거)
    { "bg-[#FFFAEE]": campaignIdForUpdateFromSideMenu !== null && isSelected, "px-2 py-0.5": !compact, "px-1 py-0.5": compact },
    item.type === "folder" ? "folder-node" : "campaign-node",
    "tree-item"
  );

  const textStyle = clsx(
    "text-555 truncate",
    { "font-medium": isSelected, "text-lg": !compact, "text-sm": compact },
  );

  const nodeContent = (
    <div className="flex items-center w-full gap-1">
      {item.type === "folder" && hasChildren ? (
        isExpanded ? (
          <Image
            src="/tree-menu/minus_for_tree.png"
            alt="접기"
            width={12}
            height={12}
            className="flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); onNodeToggle(item.id); }}
          />
        ) : (
          <Image
            src="/tree-menu/plus_icon_for_tree.png"
            alt="펼치기"
            width={12}
            height={12}
            className="flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); onNodeToggle(item.id); }}
          />
        )
      ) : (
        <span className="w-3" />
      )}
      {getNodeIcon()}
      <span className={textStyle}>
        {(item.type === "folder" && !isTenantFolder) && `[1]`} 
        {(isTenantFolder || item.type === "campaign") && ` [${item.id}]`}
        {item.label} 
      </span>
    </div>
  );

  const indentSize = compact ? 12 : 16;
  const paddingLeft = `${level * indentSize + (compact ? 6 : 8)}px`;


  return (
    <div className="select-none">
      {(() => {
        if (isRootNode) {
          return (
            <ContextMenu>
              <ContextMenuTrigger>
                <div ref={nodeRef} className={nodeStyle} onClick={handleClick} style={{ paddingLeft }}>
                  {nodeContent}
                </div>
              </ContextMenuTrigger>
              <IRootNodeContextMenu item={updatedItem} />
            </ContextMenu>
          );
        }

        if (item.type === "folder") {
          return (
            <ContextMenu>
              <ContextMenuTrigger>
                <div ref={nodeRef} className={nodeStyle} onClick={handleClick} style={{ paddingLeft }}>
                  {nodeContent} 
                </div>
              </ContextMenuTrigger>
              <FolderContextMenu item={updatedItem} />
            </ContextMenu>
          );
        }

        return (
          <ContextMenuForCampaignForCampaignTab
            item={updatedItem}
            onEdit={() => console.log("Edit:", item)}
            onMonitor={() => console.log("Monitor:", item)}
            onHandleCampaignCopy={onHandleCampaignCopy}
            tenantIdForCampaignTab={item.tenantId}
          >
            <div
              ref={nodeRef}
              className={nodeStyle}
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
              style={{ paddingLeft }}
            >
              {nodeContent} 
            </div>
          </ContextMenuForCampaignForCampaignTab>
        );
      })()}

      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {item.children?.map((child: TreeItem) => (
            <TreeNodeForCampaignTab
              key={child.id}
              item={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              selectedNodeId={selectedNodeId}
              getStatusIcon={getStatusIcon}
              onNodeToggle={onNodeToggle}
              onNodeSelect={onNodeSelect}
              compact={compact}
            />
          ))}
        </div>
      )}
    </div>
  );

}
