
// src/store/storeForSideMenuCampaignGroupTab.ts
import { create } from 'zustand';
import { TreeNode } from '@/features/campaignManager/types/typeForCampaignGroupForSideBar';
import { scrollToNode } from '@/components/shared/layout/utils/scrollUtils';
import { QueryClient } from '@tanstack/react-query';
import { apiForCombinedTenantAndCampaignGroup, transformToTreeData } from '@/features/preferences/api/apiForCampaignGroup';

// Keep track of the queryClient instance outside the store
let queryClientInstance: QueryClient | null = null;

// Function to set the queryClient instance (to be called from your app setup)
export const setQueryClientForStore = (queryClient: QueryClient) => {
  queryClientInstance = queryClient;
};

// Define sort types
export type SortField = "name" | "id";
export type SortDirection = "asc" | "desc";
export type NodeType = "all" | "tenant" | "group" | "campaign";

interface SideMenuCampaignGroupTabState {
  // Tree data
  treeData: TreeNode[];
  originalTreeData: TreeNode[]; // Store original data for sorting
  isLoading: boolean;
  error: Error | null;
  tenant_id: number;

  // UI state
  expandedNodes: Set<string>;
  selectedNodeId: string | undefined;

  // Sort state
  sortField: SortField;
  sortDirection: SortDirection;
  selectedNodeType: NodeType; // Track which node type is being sorted
  currentExpansionMode: 'tenant' | 'group' | 'all' | null;

  // State setter functions
  setTreeData: (treeData: TreeNode[]) => void;
  setOriginalTreeData: (treeData: TreeNode[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  setTenantId: (tenant_id: number) => void;
  setExpandedNodes: (nodes: Set<string>) => void;
  setSelectedNodeId: (nodeId: string | undefined) => void;

  // Cache invalidation and refetch
  refetchTreeDataForCampaignGroupTab: (tenant_id?: number) => Promise<void>;

  // Actions
  toggleNode: (nodeId: string) => void;
  selectNode: (nodeId: string) => void;
  expandAllNodes: () => void;
  collapseAllNodes: () => void;
  resetSelection: () => void;

  // Expansion actions with precise control
  expandTenantOnly: () => void;
  expandTenantAndGroup: () => void;
  expandAllLevels: () => void;

  // Sort actions
  applySort: (field: SortField, direction: SortDirection) => void;
  sortByNodeType: (nodeType: NodeType, field: SortField, direction: SortDirection) => void;

  // Helper functions
  expandNodePath: (nodeId: string) => void;

  // Search functionality
  searchNode: (searchTerm: string) => string | undefined;

  // Helper actions for node manipulation
  addCampaignToGroup: (groupId: string, campaign: TreeNode) => void;
  removeCampaignFromGroup: (campaignId: string) => void;
  updateNodeName: (nodeId: string, newName: string) => void;
  updateCampaignStatus: (campaignId: string, status: number) => void;
}

export const useSideMenuCampaignGroupTabStore = create<SideMenuCampaignGroupTabState>((set, get) => ({
  // Initial state
  treeData: [],
  originalTreeData: [],
  isLoading: false,
  error: null,
  expandedNodes: new Set(),
  selectedNodeId: undefined,
  sortField: "name",
  sortDirection: "asc",
  selectedNodeType: "all",
  currentExpansionMode: null,
  tenant_id: 0,

  // State setter functions
  setTreeData: (treeData: TreeNode[]) => {
    set({
      treeData,
      originalTreeData: JSON.parse(JSON.stringify(treeData)) // Deep copy
    });
  },

  setOriginalTreeData: (originalTreeData: TreeNode[]) => {
    set({ originalTreeData });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: Error | null) => {
    set({ error });
  },

  setTenantId: (tenant_id: number) => {
    set({ tenant_id });
  },

  setExpandedNodes: (expandedNodes: Set<string>) => {
    set({ expandedNodes });
  },

  setSelectedNodeId: (selectedNodeId: string | undefined) => {
    set({ selectedNodeId });
  },

  // Cache invalidation and refetch function with backward compatibility
  refetchTreeDataForCampaignGroupTab: async (tenant_id?: number) => {
    const state = get();
    const targetTenantId = tenant_id !== undefined ? tenant_id : state.tenant_id;

    // Validate tenant ID
    if (targetTenantId === undefined || targetTenantId === null) {
      console.error("테넌트 ID가 없습니다.");
      set({ error: new Error("테넌트 ID가 없습니다.") });
      return;
    }

    // Store current UI state before invalidation
    const currentExpandedNodes = state.expandedNodes;
    const currentSelectedNodeId = state.selectedNodeId;

    set({ isLoading: true });

    try {
      // Check if we have the QueryClient instance
      if (queryClientInstance) {
        // Modern approach: Use React Query cache invalidation
        console.log("Using React Query invalidation for refetch");
        await queryClientInstance.invalidateQueries({
          queryKey: ['campaignTreeDataForCampaignGroupTab', targetTenantId]
        });
      } else {
        // Fallback approach: Use direct API call for backward compatibility
        console.log("Fallback: Using direct API call for refetch");

        try {
          const combinedData = await apiForCombinedTenantAndCampaignGroup(targetTenantId);
          const transformedData = transformToTreeData(combinedData);

          set({
            treeData: transformedData,
            originalTreeData: JSON.parse(JSON.stringify(transformedData)),
            isLoading: false
          });
        } catch (error) {
          console.error("트리 데이터 다시 가져오기 오류:", error);
          set({
            error: error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다'),
            isLoading: false
          });
          return;
        }
      }

      // Ensure we preserve the UI state after refetch
      set({
        expandedNodes: currentExpandedNodes,
        selectedNodeId: currentSelectedNodeId,
        isLoading: false
      });
    } catch (error) {
      console.error("캠페인 그룹 트리 데이터 캐시 무효화 오류:", error);
      set({
        error: error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다'),
        isLoading: false
      });
    }
  },

  // Node toggle
  toggleNode: (nodeId: string) => {
    set(state => {
      const newExpandedNodes = new Set(state.expandedNodes);
      if (newExpandedNodes.has(nodeId)) {
        newExpandedNodes.delete(nodeId);
      } else {
        newExpandedNodes.add(nodeId);
      }
      return { expandedNodes: newExpandedNodes };
    });
  },

  // Node selection
  selectNode: (nodeId: string) => {
    set({ selectedNodeId: nodeId });
  },

  // Precise expansion functions
  expandTenantOnly: () => {
    set(state => {
      const { treeData } = state;
      const tenantNodes = new Set<string>();

      // Only add root nodes and tenants
      treeData.forEach(rootNode => {
        tenantNodes.add(rootNode.id); // Root node

        if (rootNode.children) {
          rootNode.children.forEach(node => {
            if (node.type === 'tenant') {
              tenantNodes.add(node.id);
              // Do NOT add any children of tenants
            }
          });
        }
      });

      return {
        expandedNodes: tenantNodes,
        currentExpansionMode: 'tenant'
      };
    });
  },

  expandTenantAndGroup: () => {
    set(state => {
      const { treeData } = state;
      const expandedNodes = new Set<string>();

      // Helper function to process nodes
      const processNodes = (nodes: TreeNode[], level = 0) => {
        nodes.forEach(node => {
          // Add root nodes
          if (level === 0 || node.type === 'tenant') {
            expandedNodes.add(node.id);
          }

          // Add group nodes but not their children
          if (node.type === 'group') {
            expandedNodes.add(node.id);
            // Do NOT process children of groups
            return;
          }

          // Process children for root and tenant nodes only
          if ((level === 0 || node.type === 'tenant') && node.children) {
            processNodes(node.children, level + 1);
          }
        });
      };

      processNodes(treeData);
      return {
        expandedNodes: expandedNodes,
        currentExpansionMode: 'group'
      };
    });
  },

  expandAllLevels: () => {
    set(state => {
      const { treeData } = state;
      const allNodes = new Set<string>();

      // Add all nodes
      const collectAllNodes = (nodes: TreeNode[]) => {
        nodes.forEach(node => {
          allNodes.add(node.id);
          if (node.children) {
            collectAllNodes(node.children);
          }
        });
      };

      collectAllNodes(treeData);
      return {
        expandedNodes: allNodes,
        currentExpansionMode: 'all'
      };
    });
  },

  expandAllNodes: () => {
    set(state => {
      const allNodeIds = new Set<string>();

      // Helper function to collect all node IDs recursively
      const collectNodeIds = (nodes: TreeNode[]) => {
        nodes.forEach(node => {
          allNodeIds.add(node.id);
          if (node.children && node.children.length > 0) {
            collectNodeIds(node.children);
          }
        });
      };

      collectNodeIds(state.treeData);
      return { expandedNodes: allNodeIds };
    });
  },

  collapseAllNodes: () => {
    // Only keep top-level nodes expanded
    set(state => {
      const topLevelNodes = new Set<string>();
      state.treeData.forEach(node => {
        if (node.type === 'root') {
          topLevelNodes.add(node.id);
        }
      });
      return { expandedNodes: topLevelNodes };
    });
  },

  resetSelection: () => {
    set({ selectedNodeId: undefined });
  },

  // Helper function to expand all nodes in the path to a given node
  expandNodePath: (nodeId: string) => {
    const { treeData } = get();
    const newExpandedNodes = new Set(get().expandedNodes);

    // Helper function to find node path and expand
    const findAndExpandPath = (nodes: TreeNode[], targetId: string, path: TreeNode[] = []): boolean => {
      for (const node of nodes) {
        const currentPath = [...path, node];

        if (node.id === targetId) {
          // Found the node, expand all nodes in the path
          currentPath.forEach(pathNode => {
            newExpandedNodes.add(pathNode.id);
          });
          return true;
        }

        if (node.children && node.children.length > 0) {
          if (findAndExpandPath(node.children, targetId, currentPath)) {
            return true;
          }
        }
      }
      return false;
    };

    findAndExpandPath(treeData, nodeId);
    set({ expandedNodes: newExpandedNodes });
  },

  // Sort functionality
  applySort: (field, direction) => {
    set(state => {
      const { originalTreeData } = state;

      // Create a deep copy of the original data
      const clonedData = JSON.parse(JSON.stringify(originalTreeData));

      // Apply sorting with new parameters
      const sortedData = sortTreeData(clonedData, field, direction);

      return {
        sortField: field,
        sortDirection: direction,
        treeData: sortedData
      };
    });
  },

  // Method to sort by node type
  sortByNodeType: (nodeType, field, direction) => {
    set(state => {
      const { originalTreeData } = state;

      // Create a deep copy of the original data
      const clonedData = JSON.parse(JSON.stringify(originalTreeData));

      // Apply sorting with specified node type
      const sortedData = sortTreeDataByNodeType(clonedData, nodeType, field, direction);

      // Maintain current expansion state
      return {
        sortField: field,
        sortDirection: direction,
        selectedNodeType: nodeType,
        treeData: sortedData
      };
    });
  },

  // Helper function to find a node by ID recursively
  addCampaignToGroup: (groupId: string, campaign: TreeNode) => {
    set(state => {
      const newTreeData = [...state.treeData];
      const newOriginalData = [...state.originalTreeData];

      // Helper function to find and update the group
      const addToGroup = (nodes: TreeNode[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];

          if (node.id === groupId) {
            // Found the group, add the campaign
            if (!node.children) {
              node.children = [];
            }
            node.children.push(campaign);
            return true;
          }

          // Recursively search in children
          if (node.children && node.children.length > 0) {
            if (addToGroup(node.children)) {
              return true;
            }
          }
        }
        return false;
      };

      // Add to both tree data and original data
      addToGroup(newTreeData);
      // Create a deep copy of the campaign for original data
      addToGroup(newOriginalData);

      return {
        treeData: newTreeData,
        originalTreeData: newOriginalData
      };
    });
  },

  removeCampaignFromGroup: (campaignId: string) => {
    set(state => {
      console.log(`캠페인 ID ${campaignId} 제거 시작`);

      // 트리 데이터 복제
      const newTreeData = JSON.parse(JSON.stringify(state.treeData));
      const newOriginalData = JSON.parse(JSON.stringify(state.originalTreeData));

      // 재귀적으로 트리 순회하며 캠페인 노드 제거
      const removeFromTree = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.reduce<TreeNode[]>((result, node) => {
          // 캠페인이고 campaign_id가 일치하면 제외 (중요: id가 아닌 campaign_id로 비교)
          if (node.type === 'campaign' && node.campaign_id?.toString() === campaignId) {
            console.log(`캠페인 노드 찾음(제거): ID=${node.campaign_id}, name=${node.name}`);
            return result; // 이 노드는 제외
          }

          // 자식 노드가 있으면 재귀적으로 처리
          if (node.children && node.children.length > 0) {
            const childrenBefore = node.children.length;
            const filteredChildren = removeFromTree(node.children);
            const childrenAfter = filteredChildren.length;

            if (childrenBefore !== childrenAfter) {
              console.log(`노드 ${node.name}에서 자식이 제거됨`);
            }

            result.push({ ...node, children: filteredChildren });
          } else {
            result.push(node);
          }

          return result;
        }, []);
      };

      // 새 트리 데이터 생성
      const updatedTreeData = removeFromTree(newTreeData);
      const updatedOriginalData = removeFromTree(newOriginalData);

      return {
        treeData: updatedTreeData,
        originalTreeData: updatedOriginalData
      };
    });
  },

  updateNodeName: (nodeId: string, newName: string) => {
    set(state => {
      const newTreeData = [...state.treeData];
      const newOriginalData = [...state.originalTreeData];

      // Helper function to find and update node name
      const updateName = (nodes: TreeNode[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];

          if (node.id === nodeId) {
            node.name = newName;
            return true;
          }

          // Recursively search in children
          if (node.children && node.children.length > 0) {
            if (updateName(node.children)) {
              return true;
            }
          }
        }
        return false;
      };

      // Update name in both tree data and original data
      updateName(newTreeData);
      updateName(newOriginalData);

      return {
        treeData: newTreeData,
        originalTreeData: newOriginalData
      };
    });
  },

  // Search for a node by name and return its ID if found
  searchNode: (searchTerm: string) => {
    const state = get();
    const term = searchTerm.toLowerCase().trim();

    if (!term) return undefined;

    // Helper function to search nodes recursively
    const findNode = (nodes: TreeNode[]): string | undefined => {
      for (const node of nodes) {
        // Check if node name contains search term
        if (node.name.toLowerCase().includes(term)) {
          return node.id;
        }

        // Recursively search children
        if (node.children && node.children.length > 0) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    // Find matching node
    const foundNodeId = findNode(state.treeData);

    if (foundNodeId) {
      // Ensure all parent nodes are expanded
      const expandParents = (nodes: TreeNode[], targetId: string, path: TreeNode[] = []): boolean => {
        for (const node of nodes) {
          const currentPath = [...path, node];

          if (node.id === targetId) {
            // Found the node, expand all nodes in the path
            currentPath.forEach(pathNode => {
              state.expandedNodes.add(pathNode.id);
            });
            return true;
          }

          if (node.children && node.children.length > 0) {
            if (expandParents(node.children, targetId, currentPath)) {
              return true;
            }
          }
        }
        return false;
      };

      // Set expanded nodes to include all parents of the found node
      expandParents(state.treeData, foundNodeId);

      // Update the state with the new expanded nodes and selected node
      set({
        expandedNodes: new Set(state.expandedNodes),
        selectedNodeId: foundNodeId
      });

      // Scroll to the node
      scrollToNode(foundNodeId);
    }

    return foundNodeId;
  },

  // updateCampaignStatus: (campaignId: string, status: number) => {

  //   set(state => {
  //     const newTreeData = JSON.parse(JSON.stringify(state.treeData));
  //     const newOriginalData = JSON.parse(JSON.stringify(state.originalTreeData));

  //     const updateStatusInTree = (nodes: TreeNode[]): boolean => {
  //       for (let i = 0; i < nodes.length; i++) {
  //         const node = nodes[i];

  //         // campaign_id로 비교하도록 수정
  //         if (node.type === 'campaign' && (node.id === campaignId || node.campaign_id?.toString() === campaignId)) {
  //           node.start_flag = status;
  //           return true;
  //         }

  //         if (node.children && node.children.length > 0) {
  //           if (updateStatusInTree(node.children)) {
  //             return true;
  //           }
  //         }
  //       }
  //       return false;
  //     };

  //     updateStatusInTree(newTreeData);
  //     updateStatusInTree(newOriginalData);

  //     return {
  //       treeData: newTreeData,
  //       originalTreeData: newOriginalData
  //     };
  //   });

  // },

  updateCampaignStatus: (campaignId: string, status: number) => {

    set(state => {
      const newTreeData = JSON.parse(JSON.stringify(state.treeData));
      const newOriginalData = JSON.parse(JSON.stringify(state.originalTreeData));

      const updateStatusInTree = (nodes: TreeNode[]): boolean => {
        let found = false;

        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];

          // 캠페인 ID가 일치하면 상태 업데이트
          if (node.type === 'campaign' && (node.id === campaignId || node.campaign_id?.toString() === campaignId)) {
            node.start_flag = status;
            found = true;
            // 여기서 return하지 않고 계속 검색
          }

          // 자식 노드가 있으면 재귀적으로 검색
          if (node.children && node.children.length > 0) {
            // 자식 노드에서 찾은 결과를 OR 연산으로 누적
            const foundInChildren = updateStatusInTree(node.children);
            found = found || foundInChildren;
          }
        }

        return found;
      };

      updateStatusInTree(newTreeData);
      updateStatusInTree(newOriginalData);

      return {
        treeData: newTreeData,
        originalTreeData: newOriginalData
      };
    });
  },

}));

// Helper function for sorting tree data
function sortTreeData(
  treeData: TreeNode[],
  field: SortField,
  direction: SortDirection
): TreeNode[] {
  // Create a deep copy to avoid modifying the original
  const sortedData = JSON.parse(JSON.stringify(treeData));

  // Helper function to sort nodes recursively
  const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
    // Sort current level
    nodes.sort((a, b) => {
      let comparison = 0;

      if (field === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (field === "id") {
        // Use appropriate ID field based on node type
        const aId = a.type === "campaign" ? a.campaign_id :
          a.type === "group" ? a.group_id :
            a.type === "tenant" ? a.tenant_id : 0;

        const bId = b.type === "campaign" ? b.campaign_id :
          b.type === "group" ? b.group_id :
            b.type === "tenant" ? b.tenant_id : 0;

        comparison = (aId || 0) - (bId || 0);
      }

      // Apply direction
      return direction === "asc" ? comparison : -comparison;
    });

    // Sort children recursively
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        node.children = sortNodes(node.children);
      }
    });

    return nodes;
  };

  return sortNodes(sortedData);
}

// Helper function for sorting tree data by node type
function sortTreeDataByNodeType(
  treeData: TreeNode[],
  nodeType: NodeType,
  field: SortField,
  direction: SortDirection
): TreeNode[] {
  // Create a deep copy to avoid modifying the original
  const sortedData = JSON.parse(JSON.stringify(treeData));

  // If sorting all nodes, just use the regular sortTreeData function
  if (nodeType === 'all') {
    return sortTreeData(sortedData, field, direction);
  }

  // Helper function to sort nodes recursively based on node type
  const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
    // First, filter nodes by the specified type at the current level
    const nodesOfType = nodes.filter(node => node.type === nodeType);

    // If there are nodes of the specified type at this level, sort them
    if (nodesOfType.length > 0) {
      nodes.sort((a, b) => {
        // Only apply sorting logic if both nodes are of the specified type
        if (a.type === nodeType && b.type === nodeType) {
          let comparison = 0;

          if (field === "name") {
            comparison = a.name.localeCompare(b.name);
          } else if (field === "id") {
            // Use appropriate ID field based on node type
            const aId = nodeType === "campaign" ? a.campaign_id :
              nodeType === "group" ? a.group_id :
                nodeType === "tenant" ? a.tenant_id : 0;

            const bId = nodeType === "campaign" ? b.campaign_id :
              nodeType === "group" ? b.group_id :
                nodeType === "tenant" ? b.tenant_id : 0;

            comparison = (aId || 0) - (bId || 0);
          }

          // Apply direction
          return direction === "asc" ? comparison : -comparison;
        }

        // Keep original order for non-matching nodes
        return 0;
      });
    }

    // Recursively sort children
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        node.children = sortNodes(node.children);
      }
    });

    return nodes;
  };

  return sortNodes(sortedData);
}