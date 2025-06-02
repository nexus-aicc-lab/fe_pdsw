// src/features/campaignManager/hooks/useApiForDeleteCampaignGroup.ts
import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { UseMutationOptions } from '@tanstack/react-query';
import { SuccessResponse } from '@/features/campaignManager/types/typeForCampaignGroupForSideBar';
import { apiForDeleteCampaignGroup } from '@/features/preferences/api/apiForCampaignGroup';

export interface DeleteCampaignGroupError {
  message: string;
  status?: number;
}

export function useApiForDeleteCampaignGroup(
  options?: UseMutationOptions<
    SuccessResponse, 
    DeleteCampaignGroupError, 
    number
  >
): UseMutationResult<SuccessResponse, DeleteCampaignGroupError, number, unknown> {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse, DeleteCampaignGroupError, number>({
    mutationKey: ['deleteCampaignGroup'],
    mutationFn: (group_id: number) => apiForDeleteCampaignGroup(group_id),
    onSuccess: (data, variables, context) => {
      // 캐시 무효화 - 캠페인 그룹 관련 쿼리 모두 무효화
      queryClient.invalidateQueries({
        queryKey: ['sideMenuTreeData']
      });
      
      console.log('✅ 캠페인 그룹 삭제 성공:', data);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('❌ 캠페인 그룹 삭제 실패:', error);
      options?.onError?.(error, variables, context);
    },
  });
}