
// src/features/campaignManager/hooks/useApiForMultiUpdateCampaignProgressStatus.ts
"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMultipleCampaignStatus, BatchUpdateResult } from '../api/apiForMultiUpdateCampaignProgressStatus';
import { TreeNode } from '@/features/campaignManager/types/typeForCampaignGroupForSideBar';

// 트리 내 각 노드의 status를 업데이트하는 재귀 함수
function updateTreeStatus(
  nodes: TreeNode[],
  campaignIds: string[],
  status: string
): TreeNode[] {
  return nodes.map((node) => ({
    ...node,
    ...(campaignIds.includes(node.id.toString())
      ? { status }
      : {}),
    children: node.children
      ? updateTreeStatus(node.children, campaignIds, status)
      : []
  }));
}

interface Variables {
  campaignIds: string[];
  status: string;
}

interface Context {
  previousTree?: TreeNode[];
}

export const useApiForMultiUpdateCampaignProgressStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<BatchUpdateResult, Error, Variables, Context>({
    mutationFn: ({ campaignIds, status }: Variables) => updateMultipleCampaignStatus(campaignIds, status),
    // 낙관적 업데이트
      onMutate: async ({ campaignIds, status }) => {
        await queryClient.cancelQueries({ queryKey: ['campaignTreeDataForCampaignGroupTab'] });
        const previousTree = queryClient.getQueryData<TreeNode[]>(['campaignTreeDataForCampaignGroupTab']);
        if (previousTree) {
          queryClient.setQueryData(
            ['campaignTreeDataForCampaignGroupTab'],
            updateTreeStatus(previousTree, campaignIds, status)
          );
        }
        return { previousTree };
      },
      // 오류 시 롤백
      onError: (_err, _vars, context) => {
        if (context?.previousTree) {
          queryClient.setQueryData(
            ['campaignTreeDataForCampaignGroupTab'],
            context.previousTree
          );
        }
      },
      // 완료 후(성공 또는 실패) 실제 서버 데이터로 다시 조회
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ['campaignTreeDataForCampaignGroupTab'],
          refetchType: 'active'
        });
      }
    }
  );

  // 호출 인터페이스를 기존과 유사하게 유지
  const updateCampaignsStatus = (
    campaignIds: string[],
    status: string
  ) => {
    return mutation.mutateAsync({ campaignIds, status });
  };

  return {
    updateCampaignsStatus,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
    result: mutation.data ?? null
  };
};
