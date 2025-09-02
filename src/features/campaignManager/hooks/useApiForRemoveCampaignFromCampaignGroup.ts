// src\features\campaignManager\hooks\useApiForRemoveCampaignFromCampaignGroup.ts
import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { UseMutationOptions } from '@tanstack/react-query';
import { SuccessResponse } from '@/features/campaignManager/types/typeForCampaignGroupForSideBar';
import { apiForRemoveCampaignFromCampaignGroup } from '@/features/preferences/api/apiForCampaignGroup';

interface RemoveCampaignFromGroupParams {
  group_id: number;
  campaign_ids: number[];
  tenant_id: number;
}

/**
 * 특정 캠페인 그룹에서 캠페인을 제거하기 위한 커스텀 훅
 * @param options 뮤테이션 옵션
 * @returns 뮤테이션 결과 및 관련 함수
 */
const useApiForRemoveCampaignFromCampaignGroup = (
  options?: UseMutationOptions<
    SuccessResponse, 
    Error, 
    RemoveCampaignFromGroupParams
  >
): UseMutationResult<SuccessResponse, Error, RemoveCampaignFromGroupParams, unknown> => {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse, Error, RemoveCampaignFromGroupParams>({
    mutationKey: ['removeCampaignFromGroup'],
    mutationFn: ({ group_id, campaign_ids, tenant_id}: RemoveCampaignFromGroupParams) => 
      apiForRemoveCampaignFromCampaignGroup(group_id, campaign_ids, tenant_id),
    onSuccess: (data, variables, context) => {
      // 캠페인 그룹 관련 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['campaignGroupSkills', variables.group_id]
      });
      
      // 캠페인 그룹 리스트 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['campaignGroupList']
      });
      
      // 사이드메뉴 데이터 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['sideMenuData']
      });
      
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // console.error('❌ 캠페인 그룹에서 캠페인 제거 실패:', error);
      options?.onError?.(error, variables, context);
    },
  });
};

export default useApiForRemoveCampaignFromCampaignGroup;