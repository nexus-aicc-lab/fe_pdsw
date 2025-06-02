// src/features/campaignManager/utils/groupHelpers.ts

import { TreeNode } from '@/features/campaignManager/types/typeForCampaignGroupForSideBar';

/**
 * 특정 테넌트에 속한 모든 그룹 아이디 목록을 가져옵니다.
 * @param treeData 전체 트리 데이터
 * @param tenantId 테넌트 ID
 * @returns 그룹 아이디 문자열 배열
 */
export const getGroupIdsInTenant = (treeData: TreeNode[], tenantId: number): string[] => {
  const groupIds: string[] = [];
  
  // treeData를 탐색하여 현재 tenant_id에 속한 그룹들의 group_id를 수집
  const findGroupsInTenant = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      if (node.type === 'tenant' && node.tenant_id === tenantId) {
        // 이 테넌트의 자식 노드들 중 그룹 타입인 것들의 ID 추출
        if (node.children) {
          node.children.forEach((child) => {
            if (child.type === 'group' && child.group_id) {
              groupIds.push(child.group_id.toString());
            }
          });
        }
      } else if (node.children) {
        // 재귀적으로 자식 노드들 탐색
        findGroupsInTenant(node.children);
      }
    });
  };

  findGroupsInTenant(treeData);
  return groupIds;
};

/**
 * 특정 테넌트에 속한 모든 그룹 정보를 가져옵니다.
 * @param treeData 전체 트리 데이터
 * @param tenantId 테넌트 ID
 * @returns 그룹 객체 배열 (id와 name 포함)
 */
export const getGroupsInTenant = (treeData: TreeNode[], tenantId: number): { id: string; name: string }[] => {
  const groups: { id: string; name: string }[] = [];
  
  const findGroupsInTenant = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      if (node.type === 'tenant' && node.tenant_id === tenantId) {
        if (node.children) {
          node.children.forEach((child) => {
            if (child.type === 'group' && child.group_id) {
              groups.push({
                id: child.group_id.toString(),
                name: child.name
              });
            }
          });
        }
      } else if (node.children) {
        findGroupsInTenant(node.children);
      }
    });
  };

  findGroupsInTenant(treeData);
  return groups;
};

/**
 * 그룹 아이디 중복 체크 함수
 * @param treeData 전체 트리 데이터
 * @param tenantId 테넌트 ID
 * @param groupId 확인할 그룹 ID
 * @returns 중복 여부 (true: 중복됨, false: 중복 없음)
 */
export const isGroupIdDuplicate = (treeData: TreeNode[], tenantId: number, groupId: string): boolean => {
  const groupIds = getGroupIdsInTenant(treeData, tenantId);
  return groupIds.includes(groupId);
};