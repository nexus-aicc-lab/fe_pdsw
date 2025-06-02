// src\components\shared\layout\utils\utils.ts

import { FilterType, SortType, TreeItem } from "@/features/campaignManager/types/typeForSidebar2";

/**
 * Sidebar에서 MouseMove 이벤트 핸들러
 * @param e - MouseEvent
 * @param isResizing - 리사이징 중인지 여부
 * @param setWidth - width를 업데이트하는 함수
 */
export const handleMouseMoveForSidebar = (e: MouseEvent, isResizing: boolean, setWidth: (width: number) => void) => {
  if (!isResizing) return;
  const newWidth = e.clientX;
  if (newWidth >= 200 && newWidth <= 600) {
    setWidth(newWidth);
  }
};

/**
 * Sidebar에서 MouseUp 이벤트 핸들러
 * @param setIsResizing - 리사이징 상태를 업데이트하는 함수
 */
export const handleMouseUpForSidebar = (setIsResizing: (isResizing: boolean) => void) => {
  setIsResizing(false);
};

// src/components/shared/layout/utils/utils.ts

/**
 * Sidebar 노드 토글 핸들러
 * @param nodeId - 토글할 노드 ID
 * @param expandedNodes - 현재 확장된 노드들의 집합
 * @param setExpandedNodes - 확장된 노드를 업데이트하는 함수
 */
export const handleNodeToggleForSidebar = (
  nodeId: string,
  expandedNodes: Set<string>,
  setExpandedNodes: (nodes: Set<string>) => void
) => {
  const newSet = new Set(expandedNodes);
  if (newSet.has(nodeId)) {
    newSet.delete(nodeId);
  } else {
    newSet.add(nodeId);
  }
  setExpandedNodes(newSet);
};

/**
 * Sidebar 노드 선택 핸들러
 * @param nodeId - 선택한 노드 ID
 * @param setSelectedNodeId - 선택된 노드를 업데이트하는 함수
 */
export const handleNodeSelectForSidebar = (
  nodeId: string,
  setSelectedNodeId: (id: string) => void
) => {
  setSelectedNodeId(nodeId);
};

/**
 * Sidebar 트리 아이템 필터링
 * @param items - 트리 아이템 목록
 * @param type - 필터 타입
 * @returns 필터링된 트리 아이템 목록
 */
export const processTreeItemsForSidebar = (items: TreeItem[], type: FilterType): TreeItem[] => {
  return items
    .map((item) => {
      const processed = { ...item };
      if (item.children) {
        processed.children = processTreeItemsForSidebar(item.children, type);
      }
      return processed;
    })
    .filter((item) => {
      if (type === 'all') return true;
      if (item.type === 'folder' && item.children && item.children.length > 0) return true;
      return item.status === type as 'started' | 'pending' | 'stopped';
    });
};

/**
 * Sidebar 정렬 처리
 * @param items - 트리 아이템 목록
 * @param type - 정렬 타입
 * @returns 정렬된 트리 아이템 목록
 */
export const sortTreeItemsForSidebar = (items: TreeItem[], type: SortType): TreeItem[] => {
  return items
    .map((item) => {
      const sorted = { ...item };
      if (item.children) {
        sorted.children = sortTreeItemsForSidebar(item.children, type);
      }
      return sorted;
    })
    .sort((a, b) => {
      if (type === 'name') {
        return a.label.localeCompare(b.label);
      }
      return a.id.localeCompare(b.id);
    });
};


// if (start_flag === 1) return 'started';      // 종료된 상태
// if (start_flag === 2) return 'pending';    // 대기 상태
// if (start_flag === 3) return 'stopped';     // 진행중 

// export const getStatusIcon = (start_flag?: number): string | null => {
//   switch (start_flag) {
//     case 1:
//       return 'started'; // 종료된 상태
//     case 2:
//       return 'pending'; // 대기 상태
//     case 3:
//       return 'stopped'; // 진행 중
//     default:
//       return null;
//   }
// };

// \nproject\fe_pdsw\src\components\shared\layout\utils\utils.ts
export const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'started':
      return '/sidebar-menu/tree_play.svg';
    case 'pending':
      return '/sidebar-menu/tree_pause.svg';
    case 'stopped':
      return '/sidebar-menu/tree_timeattp.png';
    case 'stoppedProgress':
      return '/sidebar-menu/tree_stop_progress.png';
    case 'pauseProgress':
      return '/sidebar-menu/tree_pause_progress.png';
    case 'timeset':
        return '/sidebar-menu/tree_timeset.png';
    case 'timeattp':
        return '/sidebar-menu/tree_timeattp.png';
    default:
      return null;
  }
};

export const getStatusIconWithStartFlag = (status?: number) => {
  switch (status) {
    case 1:
      return '/sidebar-menu/tree_play.svg'; // started
    case 2:
      return '/sidebar-menu/tree_pause.svg'; // pending
    case 3:
      return '/sidebar-menu/tree_stop.svg'; // stopped
    case 4:
    case 8:
    case 9:
      return '/sidebar-menu/tree_stop_progress.png'; // stoppedProgress
    case 5:
      return '/sidebar-menu/tree_pause_progress.png'; // pauseProgress
    case 6:
      return '/sidebar-menu/tree_timeset.png'; // timeset
    default:
      return null;
  }
};


