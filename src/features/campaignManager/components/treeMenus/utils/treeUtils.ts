/// File: src/features/campaignManager/utils/treeUtils.ts
import { TreeNode } from "@/features/campaignManager/types/typeForCampaignGroupForSideBar";
import { TreeItem } from "@/features/campaignManager/types/typeForSidebar2";

/**
 * 주어진 campaignId와 일치하는 캠페인 노드를 트리에서 제거합니다.
 */
export function removeNodeByCampaignIdForCampaignTab(
  items: TreeItem[],
  campaignId: number
): TreeItem[] {
  return items.reduce<TreeItem[]>((acc, item) => {
    // campaign 노드이면서 id가 일치하면 제외
    if (item.type === 'campaign' && Number(item.id) === campaignId) {
      return acc;
    }
    // 자식이 있으면 재귀적으로 처리
    let newChildren: TreeItem[] | undefined;
    if (item.children) {
      newChildren = removeNodeByCampaignIdForCampaignTab(item.children, campaignId);
    }
    acc.push({ ...item, children: newChildren });
    return acc;
  }, []);
}

/**
 * 주어진 campaignId와 일치하는 캠페인 노드를 찾아 updateFields로 업데이트합니다.
 */
export function updateNodeByCampaignIdForCampaignTab(
  items: TreeItem[],
  campaignId: number,
  updateFields: Partial<TreeItem>
): TreeItem[] {
  return items.map(item => {
    // campaign 노드이면서 id가 일치하면 필드 머징
    if (item.type === 'campaign' && Number(item.id) === campaignId) {
      return { ...item, ...updateFields };
    }
    // 자식이 있으면 재귀적으로 처리
    if (item.children) {
      return { ...item, children: updateNodeByCampaignIdForCampaignTab(item.children, campaignId, updateFields) };
    }
    return item;
  });
}

/**
 * 주어진 campaignId와 일치하는 캠페인 노드를 캠페인 그룹 트리에서 제거합니다.
 */
export function removeNodeByCampaignIdForCampaignGroupTab(
  nodes: TreeNode[],
  campaignId: string | number
): TreeNode[] {
  // ID를 문자열로 통일
  const targetId = typeof campaignId === 'number' ? campaignId.toString() : campaignId;
  
  return nodes.reduce<TreeNode[]>((result, node) => {
    // 현재 노드가 삭제 대상 캠페인이면 건너뜀
    if (node.type === 'campaign' && 
        (node.id === targetId || node.campaign_id?.toString() === targetId)) {
      return result;
    }
    
    // 자식 노드가 있으면 재귀적으로 처리
    if (node.children && node.children.length > 0) {
      const filteredChildren = removeNodeByCampaignIdForCampaignGroupTab(
        node.children, targetId
      );
      result.push({ ...node, children: filteredChildren });
    } else {
      result.push(node);
    }
    
    return result;
  }, []);
}