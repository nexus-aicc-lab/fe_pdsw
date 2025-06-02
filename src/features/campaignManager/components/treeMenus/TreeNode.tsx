// "use client";

// import { TreeNodeProps } from "@/components/shared/layout/SidebarPresenter";
// import { ContextMenuForCampaignForCampaignTab } from "./ContextMenuForCampaignForCampaignTab";
// import { FileText } from "lucide-react";
// import { useTabStore } from "@/store/tabStore";
// import { useCallback } from "react";
// import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
// import { FolderContextMenu } from "./FolderContextMenuForTreeNode";
// import Image from "next/image";
// import clsx from "clsx";
// import { useTreeMenuStore } from "@/store/storeForSsideMenuCampaignTab";

// export function TreeNode({
//   item,
//   level,
//   expandedNodes,
//   selectedNodeId,
//   getStatusIcon,
//   onNodeToggle,
//   onNodeSelect,
//   compact = false, // 컴팩트 모드 기본값 추가
// }: TreeNodeProps) {
//   const { skilIdsForCampaignTreeMenu, viewMode } = useTreeMenuStore(); // 통합 스토어 사용
//   const {
//     simulateHeaderMenuClick,
//     setCampaignIdForUpdateFromSideMenu,
//     setCampaignIdForCopyCampaign,
//     addTab,
//   } = useTabStore();

//   // Create all callback hooks regardless of visibility
//   const handleClick = useCallback(() => {
//     const hasChildren = item.type === "campaign" ? false : (item.children && item.children.length > 0);
//     onNodeSelect(item.id);
//     if (hasChildren) {
//       onNodeToggle(item.id);
//     }
//   }, [item.id, item.type, item.children, onNodeSelect, onNodeToggle]);

//   const handleContextMenu = useCallback(() => {
//     onNodeSelect(item.id);
//   }, [item.id, onNodeSelect]);

//   const handleDoubleClick = useCallback(() => {
//     if (item.type !== "campaign") return;
//     simulateHeaderMenuClick(2);
//     setCampaignIdForUpdateFromSideMenu(item.id);
//   }, [item, simulateHeaderMenuClick, setCampaignIdForUpdateFromSideMenu]);

//   const handleEdit = useCallback(() => {
//     console.log("Edit clicked:", { id: item.id, label: item.label, type: item.type });
//   }, [item.id, item.label, item.type]);
  
//   const handleMonitor = useCallback(() => {
//     console.log("Monitor clicked:", { id: item.id, label: item.label, type: item.type });
//   }, [item.id, item.label, item.type]);
  
//   const onHandleCampaignCopy = useCallback(() => {
//     console.log("Copy clicked:", { id: item.id, label: item.label, type: item.type });
//     setCampaignIdForUpdateFromSideMenu(item.id);
//     setCampaignIdForCopyCampaign(item.id);
//     addTab({
//       id: 130,
//       uniqueKey: "130",
//       title: "캠페인 복사",
//       icon: "",
//       href: "",
//       content: null,
//     });
//   }, [item, setCampaignIdForUpdateFromSideMenu, setCampaignIdForCopyCampaign, addTab]);

//   // Return null after creating all hooks if item should not be visible
//   if (item.visible === false) {
//     return null;
//   }

//   // 캠페인 타입일 경우 hasChildren은 항상 false로 처리
//   const hasChildren = item.type === "campaign" ? false : (item.children && item.children.length > 0);
//   const isExpanded = expandedNodes.has(item.id);
//   const isSelected = selectedNodeId === item.id;
//   const statusIcon = item.type === "campaign" ? getStatusIcon(item.status) : null;

//   // 아이콘 크기 조정 (컴팩트 모드일 경우 더 작게)
//   const iconSize = compact ? 10 : 14;
//   const expandIconSize = compact ? 10 : 12;

//   // 노드 아이콘 가져오기
//   const getNodeIcon = () => {
//     if (item.type === "folder") {
//       return level === 0 ? (
//         <Image
//           src="/tree-menu/organization.png"
//           alt="조직"
//           width={14}
//           height={12}
//           className="flex-shrink-0"
//         />
//       ) : (
//         <Image
//           src="/tree-menu/folder.png"
//           alt="그룹"
//           width={14}
//           height={12}
//           className="flex-shrink-0"
//         />
//       );
//     }
    
//     if (item.type === "campaign") {
//       return statusIcon ? (
//         <Image src={statusIcon} alt="status" width={12} height={12} className="flex-shrink-0" />
//       ) : (
//         <FileText className={`${compact ? 'h-4 w-4' : 'h-4 w-4'} text-gray-400 flex-shrink-0`} />
//       );
//     }
    
//     return <FileText className={`${compact ? 'h-4 w-4' : 'h-4 w-4'} text-gray-400 flex-shrink-0`} />;
//   };

//   // 노드 클래스 - 컴팩트 모드일 경우 더 작은 패딩 적용
//   const nodeStyle = clsx(
//     "flex items-center hover:bg-[#FFFAEE] cursor-pointer transition-colors duration-150",
//     {
//       "bg-[#FFFAEE]": isSelected,
//       "px-2 py-0.5": !compact, // 기본 패딩
//       "px-1 py-0.5": compact,  // 컴팩트 모드 패딩
//     },
//     item.type === "folder" ? "folder-node" : "campaign-node",
//     "tree-item"
//   );

//   // 텍스트 스타일 - 컴팩트 모드일 경우 더 작은 폰트
//   const textStyle = clsx(
//     "text-555 truncate",
//     {
//       "font-medium": isSelected,
//       "text-lg": !compact,
//       "text-sm": compact
//     },
//   );

//   // 공통된 노드 내용 컴포넌트
//   const nodeContent = (
//     <div className="flex items-center w-full gap-1">
//       {hasChildren ? (
//         isExpanded ? (
//           <Image
//             src="/tree-menu/minus_for_tree.png"
//             alt="접기"
//             width={12}
//             height={12}
//             className="flex-shrink-0"
//           />
//         ) : (
//           <Image
//             src="/tree-menu/plus_icon_for_tree.png"
//             alt="펼치기"
//             width={12}
//             height={12}
//             className="flex-shrink-0"
//           />
//         )
//       ) : (
//         <span className="w-3" />
//       )}
//       {getNodeIcon()}
//       <span className={textStyle}>
//         {item.label}
//       </span>
//     </div>
//   );

//   // 레벨 인덴트 계산 - 컴팩트 모드일 경우 더 작은 인덴트
//   const indentSize = compact ? 12 : 16;
//   const paddingLeft = `${level * indentSize + (compact ? 6 : 8)}px`;

//   return (
//     <div className="select-none">
//       {item.type === "folder" ? (
//         <ContextMenu>
//           <ContextMenuTrigger>
//             <div
//               className={nodeStyle}
//               onClick={handleClick}
//               onContextMenu={handleContextMenu}
//               style={{ paddingLeft }}
//             >
//               {nodeContent} 
//             </div>
//           </ContextMenuTrigger>
//           <FolderContextMenu item={item} />
//         </ContextMenu>
//       ) : (
//         <ContextMenuForCampaignForCampaignTab
//           item={item}
//           onEdit={handleEdit}
//           onMonitor={handleMonitor}
//           onHandleCampaignCopy={onHandleCampaignCopy}
//         >
//           <div
//             className={nodeStyle}
//             onClick={handleClick}
//             onDoubleClick={handleDoubleClick}
//             onContextMenu={handleContextMenu}
//             style={{ paddingLeft }}
//           >
//             {nodeContent}
//           </div>
//         </ContextMenuForCampaignForCampaignTab>
//       )}

//       {hasChildren && isExpanded && (
//         <div className="space-y-0.5">
//           {item.children?.map((child: typeof item) => (
//             <TreeNode
//               key={child.id}
//               item={child}
//               level={level + 1}
//               expandedNodes={expandedNodes}
//               selectedNodeId={selectedNodeId}
//               getStatusIcon={getStatusIcon}
//               onNodeToggle={onNodeToggle}
//               onNodeSelect={onNodeSelect}
//               compact={compact}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { TreeNodeProps } from "@/components/shared/layout/SidebarPresenter";
import { ContextMenuForCampaignForCampaignTab } from "./ContextMenuForCampaignForCampaignTab";
import { FileText } from "lucide-react";
import { useTabStore } from "@/store/tabStore";
import { useCallback, useEffect } from "react";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { FolderContextMenu } from "./FolderContextMenuForTreeNode";
import Image from "next/image";
import clsx from "clsx";
import { useTreeMenuStore } from "@/store/storeForSsideMenuCampaignTab";

export function TreeNodeForCampaignTab({
  item,
  level,
  expandedNodes,
  selectedNodeId,
  getStatusIcon,
  onNodeToggle,
  onNodeSelect,
  compact = false, // 컴팩트 모드 기본값 추가
}: TreeNodeProps) {
  const { selectedNodeType, viewMode } = useTreeMenuStore(); // 통합 스토어 사용
  const {
    simulateHeaderMenuClick,
    setCampaignIdForUpdateFromSideMenu,
    setCampaignIdForCopyCampaign,
    addTab,
  } = useTabStore();

  // 중요: 폴더 타입일 경우에는 children 배열을 확인, 캠페인 타입일 경우에는 항상 false
  // 이 부분이 + 및 - 버튼 표시에 영향을 줌
  const hasChildren = item.type === "campaign" 
    ? false 
    : Boolean(item.children && item.children.length > 0);

  const isExpanded = expandedNodes.has(item.id);
  const isSelected = selectedNodeId === item.id;
  const statusIcon = item.type === "campaign" ? getStatusIcon(item.status) : null;

  // 디버깅 - 자식 노드 목록 로깅
  useEffect(() => {
    if (hasChildren && item.type === "folder" && level === 1) { // 테넌트 폴더만 확인
      console.log(`폴더 ${item.label} 자식 노드 목록:`, 
        item.children?.map((child: typeof item) => `${child.label}(${child.type})`));
    }
  }, [item, hasChildren, level]);

  const handleClick = useCallback(() => {
    onNodeSelect(item.id);
    if (hasChildren) {
      console.log(`노드 클릭: ${item.id} (${item.label}), 자식: ${item.children?.length || 0}`);
      onNodeToggle(item.id);
    }
  }, [item, hasChildren, onNodeSelect, onNodeToggle]);

  const handleContextMenu = useCallback(() => {
    onNodeSelect(item.id);
  }, [item.id, onNodeSelect]);

  const handleDoubleClick = useCallback(() => {
    if (item.type !== "campaign") return;
    simulateHeaderMenuClick(2);
    setCampaignIdForUpdateFromSideMenu(item.id);
  }, [item, simulateHeaderMenuClick, setCampaignIdForUpdateFromSideMenu]);

  const handleEdit = useCallback(() => {
    console.log("Edit clicked:", { id: item.id, label: item.label, type: item.type });
  }, [item.id, item.label, item.type]);
  
  const handleMonitor = useCallback(() => {
    console.log("Monitor clicked:", { id: item.id, label: item.label, type: item.type });
  }, [item.id, item.label, item.type]);
  
  const onHandleCampaignCopy = useCallback(() => {
    console.log("Copy clicked:", { id: item.id, label: item.label, type: item.type });
    setCampaignIdForUpdateFromSideMenu(item.id);
    setCampaignIdForCopyCampaign(item.id);
    addTab({
      id: 130,
      uniqueKey: "130",
      title: "캠페인 복사",
      icon: "",
      href: "",
      content: null,
    });
  }, [item, setCampaignIdForUpdateFromSideMenu, setCampaignIdForCopyCampaign, addTab]);

  // 아이템이 명시적으로 보이지 않게 설정된 경우 렌더링하지 않음
  if (item.visible === false) {
    return null;
  }

  // 아이콘 크기 조정 (컴팩트 모드일 경우 더 작게)
  const iconSize = compact ? 10 : 14;
  const expandIconSize = compact ? 10 : 12;

  // 노드 아이콘 가져오기
  const getNodeIcon = () => {
    if (item.type === "folder") {
      return level === 0 ? (
        <Image
          src="/tree-menu/organization.png"
          alt="조직"
          width={14}
          height={12}
          className="flex-shrink-0"
        />
      ) : (
        <Image
          src="/tree-menu/folder.png"
          alt="그룹"
          width={14}
          height={12}
          className="flex-shrink-0"
        />
      );
    }
    
    if (item.type === "campaign") {
      return statusIcon ? (
        <Image src={statusIcon} alt="status" width={12} height={12} className="flex-shrink-0" />
      ) : (
        <FileText className={`${compact ? 'h-4 w-4' : 'h-4 w-4'} text-gray-400 flex-shrink-0`} />
      );
    }
    
    return <FileText className={`${compact ? 'h-4 w-4' : 'h-4 w-4'} text-gray-400 flex-shrink-0`} />;
  };

  // 노드 클래스 - 컴팩트 모드일 경우 더 작은 패딩 적용
  const nodeStyle = clsx(
    "flex items-center hover:bg-[#FFFAEE] cursor-pointer transition-colors duration-150",
    {
      "bg-[#FFFAEE]": isSelected,
      "px-2 py-0.5": !compact, // 기본 패딩
      "px-1 py-0.5": compact,  // 컴팩트 모드 패딩
    },
    item.type === "folder" ? "folder-node" : "campaign-node",
    "tree-item"
  );

  // 텍스트 스타일 - 컴팩트 모드일 경우 더 작은 폰트
  const textStyle = clsx(
    "text-555 truncate",
    {
      "font-medium": isSelected,
      "text-lg": !compact,
      "text-sm": compact
    },
  );

  // 공통된 노드 내용 컴포넌트
  const nodeContent = (
    <div className="flex items-center w-full gap-1">
      {hasChildren ? (
        isExpanded ? (
          <Image
            src="/tree-menu/minus_for_tree.png"
            alt="접기"
            width={12}
            height={12}
            className="flex-shrink-0"
          />
        ) : (
          <Image
            src="/tree-menu/plus_icon_for_tree.png"
            alt="펼치기"
            width={12}
            height={12}
            className="flex-shrink-0"
          />
        )
      ) : (
        <span className="w-3" />
      )}
      {getNodeIcon()}
      <span className={textStyle}>
        {item.label}
      </span>
    </div>
  );

  // 레벨 인덴트 계산 - 컴팩트 모드일 경우 더 작은 인덴트
  const indentSize = compact ? 12 : 16;
  const paddingLeft = `${level * indentSize + (compact ? 6 : 8)}px`;

  return (
    <div className="select-none">
      {item.type === "folder" ? (
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={nodeStyle}
              onClick={handleClick}
              onContextMenu={handleContextMenu}
              style={{ paddingLeft }}
            >
              {nodeContent}
            </div>
          </ContextMenuTrigger>
          <FolderContextMenu item={item} />
        </ContextMenu>
      ) : (
        <ContextMenuForCampaignForCampaignTab
          item={item}
          tenantIdForCampaignTab={item.tenantId || ''}
          onEdit={handleEdit}
          onMonitor={handleMonitor}
          onHandleCampaignCopy={onHandleCampaignCopy}
        >
          <div
            className={nodeStyle}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            style={{ paddingLeft }}
          >
            {nodeContent}
          </div>
        </ContextMenuForCampaignForCampaignTab>
      )}

      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {item.children?.map((child: typeof item) => {
            // 테넌트 정렬에서도 캠페인을 항상 표시
            return (
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
            );
          })}
        </div>
      )}
    </div>
  );
}