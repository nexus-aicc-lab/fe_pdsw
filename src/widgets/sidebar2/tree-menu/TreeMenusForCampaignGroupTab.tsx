// "use client";

// import { useEffect, useState, useCallback, memo, useMemo, useRef } from "react";
// import { useAuthStore } from "@/store/authStore";
// import { useSideMenuCampaignGroupTabStore } from "@/store/storeForSideMenuCampaignGroupTab";
// import { useApiForGetTreeDataForCampaignGroupTab } from "@/features/campaignManager/hooks/useApiForGetTreeDataForCampaignGroupTab";
// import { TreeNodeForSideBarCampaignGroupTab } from "@/features/campaignManager/components/treeMenus/TreeNodeForSideBarCampaignGroupTab";
// import SearchBarForSideMenuForCampaignGroupTab from "@/features/campaignManager/components/treeMenus/searchbar/SearchBarForSideMenuForCampaignGroupTab";

// // Memoize the tree node component
// const MemoizedTreeNode = memo(TreeNodeForSideBarCampaignGroupTab);

// // Define selectors outside the component
// const selectTreeData = (state: any) => state.treeData;
// const selectExpandedNodes = (state: any) => state.expandedNodes;
// const selectSelectedNodeId = (state: any) => state.selectedNodeId;
// const selectToggleNode = (state: any) => state.toggleNode;
// const selectSelectNode = (state: any) => state.selectNode;
// const selectExpandTenantAndGroup = (state: any) => state.expandTenantAndGroup;
// const selectRemoveCampaignFromGroup = (state: any) => state.removeCampaignFromGroup;
// const selectTenantId = (state: any) => state.tenant_id;

// // Create a memoized loading state component
// const LoadingState = memo(() => (
//   <div className="p-4 text-center text-gray-500">데이터를 불러오는 중...</div>
// ));
// LoadingState.displayName = 'LoadingState';

// // Create a memoized error state component
// // Define interface for ErrorState props
// interface ErrorStateProps {
//   message?: string;
// }

// const ErrorState = memo(({ message }: ErrorStateProps) => (
//   <div className="p-4 text-center text-red-500">오류 발생: {message}</div>
// ));
// ErrorState.displayName = 'ErrorState';

// // Create a memoized empty state component
// const EmptyState = memo(() => (
//   <div className="p-4 text-center text-gray-500">표시할 데이터가 없습니다</div>
// ));
// EmptyState.displayName = 'EmptyState';

// // Create a memoized search bar component
// const SearchBarWrapper = memo(() => (
//   <div className="flex items-center border-b">
//     <SearchBarForSideMenuForCampaignGroupTab />
//   </div>
// ));
// SearchBarWrapper.displayName = 'SearchBarWrapper';

// // Main component that uses React.memo to prevent unnecessary renders
// export const TreeMenusForCampaignGroupTab = memo(function TreeMenusForCampaignGroupTab() {
//   // Use a ref for logging to avoid re-renders
//   const hasLoggedRef = useRef(false);

//   const [forceUpdate, setForceUpdate] = useState(0);

//   // Use individual selectors to minimize re-renders
//   const tenant_id = useAuthStore(selectTenantId);
//   const { isLoading, error } = useApiForGetTreeDataForCampaignGroupTab(tenant_id);

//   // Only get the state values you need
//   const treeData = useSideMenuCampaignGroupTabStore(selectTreeData);
//   const expandedNodes = useSideMenuCampaignGroupTabStore(selectExpandedNodes);
//   const selectedNodeId = useSideMenuCampaignGroupTabStore(selectSelectedNodeId);
//   const toggleNode = useSideMenuCampaignGroupTabStore(selectToggleNode);
//   const selectNode = useSideMenuCampaignGroupTabStore(selectSelectNode);
//   const expandTenantAndGroup = useSideMenuCampaignGroupTabStore(selectExpandTenantAndGroup);
//   const removeCampaignFromGroup = useSideMenuCampaignGroupTabStore(selectRemoveCampaignFromGroup);
//   const [hasInitiallyExpanded, setHasInitiallyExpanded] = useState(false);


//   console.log("캡페인 그룹탭 트리 데이터", treeData);


//   // Log only once with useEffect instead of on every render
//   useEffect(() => {
//     if (!hasLoggedRef.current) {
//       console.log("TreeMenusForCampaignGroupTab 렌더링", treeData);
//       hasLoggedRef.current = true;
//     }
//   }, [treeData]);

//   // Memoize the handlers to prevent new function instances on every render
//   const handleForceUpdate = useCallback(() => {
//     setForceUpdate(prev => prev + 1);
//     // Reset logging ref to allow a new log entry
//     hasLoggedRef.current = false;
//   }, []);

//   const handleRemoveCampaignFromGroup = useCallback((campaignId: string | number) => {
//     const id = typeof campaignId === 'string' ? campaignId : campaignId.toString();
//     removeCampaignFromGroup(id);
//     handleForceUpdate();
//     console.log(`캠페인 ID ${id}가 그룹 트리에서 제거됨`);
//   }, [removeCampaignFromGroup, handleForceUpdate]);

//   // Set global objects only when values actually change
//   useEffect(() => {
//     window.campaignGroupTreeData = treeData;
//     window.campaignGroupTreeForceUpdate = handleForceUpdate;
//     window.removeCampaignFromGroupTree = handleRemoveCampaignFromGroup;

//     return () => {
//       delete window.campaignGroupTreeData;
//       delete window.campaignGroupTreeForceUpdate;
//       delete window.removeCampaignFromGroupTree;
//     };
//   }, [treeData, handleForceUpdate, handleRemoveCampaignFromGroup]);

//   // Effect for expansion, with proper dependencies
//   useEffect(() => {
//     if (treeData && treeData.length > 0) {
//       expandTenantAndGroup();
//       setHasInitiallyExpanded(true);

//     }
//   }, [treeData, expandTenantAndGroup, hasInitiallyExpanded]);

//   // Define type for tree node
//   interface TreeNode {
//     id: string | number;
//     name: string;
//     type: "tenant" | "group" | "campaign" | "root";
//     [key: string]: any; // Allow other properties
//   }

//   // Memoize the tree nodes to prevent unnecessary recalculation
//   const treeNodes = useMemo(() => {
//     if (!treeData || treeData.length === 0) return null;

//     return treeData.map((node: TreeNode) => {
//       // Convert node to have string id and ensure type is valid
//       const nodeWithStringId = {
//         ...node,
//         id: String(node.id),
//         type: node.type as "tenant" | "group" | "campaign" | "root"
//       };

//       return (
//         <MemoizedTreeNode
//           key={`${node.id}-${forceUpdate}`}
//           node={nodeWithStringId}
//           level={0}
//           expandedNodes={expandedNodes}
//           selectedNodeId={selectedNodeId}
//           onNodeToggle={toggleNode}
//           onNodeSelect={selectNode}
//         />
//       );
//     });
//   }, [treeData, forceUpdate, expandedNodes, selectedNodeId, toggleNode, selectNode]);

//   // Return early for loading, error, and empty states
//   if (isLoading) {
//     return (
//       <div className="flex flex-col h-full">
//         <SearchBarWrapper />
//         <LoadingState />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col h-full">
//         <SearchBarWrapper />
//         <ErrorState message={error.message} />
//       </div>
//     );
//   }

//   if (!treeData || treeData.length === 0) {
//     return (
//       <div className="flex flex-col h-full">
//         <SearchBarWrapper />
//         <EmptyState />
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full">
//       <SearchBarWrapper />
//       <div className="flex flex-grow overflow-y-auto min-h-0 tree-node">
//         <div className="w-full">
//           {treeNodes}
//         </div>
//       </div>
//     </div>
//   );
// });

// // TypeScript type declarations for Window
// declare global {
//   interface Window {
//     campaignGroupTreeData?: any;
//     campaignGroupTreeForceUpdate?: () => void;
//     removeCampaignFromGroupTree?: (campaignId: string | number) => void;
//   }
// }

"use client";

import { useEffect, useState, useCallback, memo, useMemo, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useSideMenuCampaignGroupTabStore } from "@/store/storeForSideMenuCampaignGroupTab";
import { useApiForGetTreeDataForCampaignGroupTab } from "@/features/campaignManager/hooks/useApiForGetTreeDataForCampaignGroupTab";
import { TreeNodeForSideBarCampaignGroupTab } from "@/features/campaignManager/components/treeMenus/TreeNodeForSideBarCampaignGroupTab";
import SearchBarForSideMenuForCampaignGroupTab from "@/features/campaignManager/components/treeMenus/searchbar/SearchBarForSideMenuForCampaignGroupTab";

// Memoize the tree node component
const MemoizedTreeNode = memo(TreeNodeForSideBarCampaignGroupTab);

// Define selectors outside the component
const selectTreeData = (state: any) => state.treeData;
const selectExpandedNodes = (state: any) => state.expandedNodes;
const selectSelectedNodeId = (state: any) => state.selectedNodeId;
const selectToggleNode = (state: any) => state.toggleNode;
const selectSelectNode = (state: any) => state.selectNode;
const selectExpandTenantAndGroup = (state: any) => state.expandTenantAndGroup;
const selectRemoveCampaignFromGroup = (state: any) => state.removeCampaignFromGroup;
const selectTenantId = (state: any) => state.tenant_id;

// Create a memoized loading state component
const LoadingState = memo(() => (
  <div className="p-4 text-center text-gray-500">데이터를 불러오는 중...</div>
));
LoadingState.displayName = 'LoadingState';

// Create a memoized error state component
interface ErrorStateProps {
  message?: string;
}

const ErrorState = memo(({ message }: ErrorStateProps) => (
  <div className="p-4 text-center text-red-500">오류 발생: {message}</div>
));
ErrorState.displayName = 'ErrorState';

// Create a memoized empty state component
const EmptyState = memo(() => (
  <div className="p-4 text-center text-gray-500">표시할 데이터가 없습니다</div>
));
EmptyState.displayName = 'EmptyState';

// Create a memoized search bar component
const SearchBarWrapper = memo(() => (
  <div className="flex items-center border-b">
    <SearchBarForSideMenuForCampaignGroupTab />
  </div>
));
SearchBarWrapper.displayName = 'SearchBarWrapper';

// Main component that uses React.memo to prevent unnecessary renders
export const TreeMenusForCampaignGroupTab = memo(function TreeMenusForCampaignGroupTab() {
  // Use a ref for logging to avoid re-renders
  const hasLoggedRef = useRef(false);
  const hasInitiallyExpandedRef = useRef(false); // ✅ ref로 변경

  // forceUpdate 제거 - 필요시에만 사용
  // const [forceUpdate, setForceUpdate] = useState(0);

  // Use individual selectors to minimize re-renders
  const tenant_id = useAuthStore(selectTenantId);
  const { isLoading, error } = useApiForGetTreeDataForCampaignGroupTab(tenant_id);

  // Only get the state values you need
  const treeData = useSideMenuCampaignGroupTabStore(selectTreeData);
  const expandedNodes = useSideMenuCampaignGroupTabStore(selectExpandedNodes);
  const selectedNodeId = useSideMenuCampaignGroupTabStore(selectSelectedNodeId);
  const toggleNode = useSideMenuCampaignGroupTabStore(selectToggleNode);
  const selectNode = useSideMenuCampaignGroupTabStore(selectSelectNode);
  const expandTenantAndGroup = useSideMenuCampaignGroupTabStore(selectExpandTenantAndGroup);
  const removeCampaignFromGroup = useSideMenuCampaignGroupTabStore(selectRemoveCampaignFromGroup);

  // console.log("캠페인 그룹탭 트리 데이터", treeData);

  // Log only once with useEffect instead of on every render
  useEffect(() => {
    if (!hasLoggedRef.current) {
      console.log("TreeMenusForCampaignGroupTab 렌더링", treeData);
      hasLoggedRef.current = true;
    }
  }, [treeData]);

  // 필요시에만 사용할 forceUpdate 함수
  const handleForceUpdate = useCallback(() => {
    // 상태 기반 업데이트 대신 store의 refetch 함수 사용 권장
    console.log("Force update 요청됨");
    // 실제로는 store의 데이터를 다시 가져오는 것이 더 안전
  }, []);

  const handleRemoveCampaignFromGroup = useCallback((campaignId: string | number) => {
    const id = typeof campaignId === 'string' ? campaignId : campaignId.toString();
    removeCampaignFromGroup(id);
    // handleForceUpdate(); // ✅ 제거
    console.log(`캠페인 ID ${id}가 그룹 트리에서 제거됨`);
  }, [removeCampaignFromGroup]);

  // Set global objects only when values actually change
  useEffect(() => {
    window.campaignGroupTreeData = treeData;
    window.campaignGroupTreeForceUpdate = handleForceUpdate;
    window.removeCampaignFromGroupTree = handleRemoveCampaignFromGroup;

    return () => {
      delete window.campaignGroupTreeData;
      delete window.campaignGroupTreeForceUpdate;
      delete window.removeCampaignFromGroupTree;
    };
  }, [treeData, handleForceUpdate, handleRemoveCampaignFromGroup]);

  // ✅ 수정된 초기 확장 로직
  useEffect(() => {
    if (treeData && treeData.length > 0 && !hasInitiallyExpandedRef.current) {
      expandTenantAndGroup();
      hasInitiallyExpandedRef.current = true;
      console.log("초기 확장 실행됨");
    }
  }, [treeData, expandTenantAndGroup]); // ✅ dependency에서 hasInitiallyExpanded 제거

  // Define type for tree node
  interface TreeNode {
    id: string | number;
    name: string;
    type: "tenant" | "group" | "campaign" | "root";
    [key: string]: any; // Allow other properties
  }

  // Memoize the tree nodes to prevent unnecessary recalculation
  const treeNodes = useMemo(() => {
    if (!treeData || treeData.length === 0) return null;

    return treeData.map((node: TreeNode) => {
      // Convert node to have string id and ensure type is valid
      const nodeWithStringId = {
        ...node,
        id: String(node.id),
        type: node.type as "tenant" | "group" | "campaign" | "root"
      };

      return (
        <MemoizedTreeNode
          key={node.id} // ✅ forceUpdate 제거
          node={nodeWithStringId}
          level={0}
          expandedNodes={expandedNodes}
          selectedNodeId={selectedNodeId}
          onNodeToggle={toggleNode}
          onNodeSelect={selectNode}
        />
      );
    });
  }, [treeData, expandedNodes, selectedNodeId, toggleNode, selectNode]); // ✅ forceUpdate 제거

  // Return early for loading, error, and empty states
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <SearchBarWrapper />
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <SearchBarWrapper />
        <ErrorState message={error.message} />
      </div>
    );
  }

  if (!treeData || treeData.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <SearchBarWrapper />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SearchBarWrapper />
      <div className="flex flex-grow overflow-y-auto min-h-0 tree-node">
        <div className="w-full">
          {treeNodes}
        </div>
      </div>
    </div>
  );
});

// TypeScript type declarations for Window
declare global {
  interface Window {
    campaignGroupTreeData?: any;
    campaignGroupTreeForceUpdate?: () => void;
    removeCampaignFromGroupTree?: (campaignId: string | number) => void;
  }
}