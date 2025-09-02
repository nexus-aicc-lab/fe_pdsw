import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { UseMutationOptions } from '@tanstack/react-query';
import { SuccessResponse } from '@/features/campaignManager/types/typeForCampaignGroupForSideBar';
import { apiForAddCampaignToSpecificCampaignGroup } from '@/features/preferences/api/apiForCampaignGroup';

interface AddCampaignToGroupParams {
  group_id: number;
  campaign_ids: number[];
  tenant_id: number;
}

/**
 * 특정 캠페인 그룹에 캠페인을 추가하기 위한 커스텀 훅
 * @param options 뮤테이션 옵션
 * @returns 뮤테이션 결과 및 관련 함수
 */
const useApiForAddCampaignToSpecificCampaignGroup = (
  options?: UseMutationOptions<
    SuccessResponse, 
    Error, 
    AddCampaignToGroupParams
  >
): UseMutationResult<SuccessResponse, Error, AddCampaignToGroupParams, unknown> => {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse, Error, AddCampaignToGroupParams>({
    mutationKey: ['addCampaignToGroup'],
    mutationFn: ({ group_id, campaign_ids, tenant_id }: AddCampaignToGroupParams) => 
      apiForAddCampaignToSpecificCampaignGroup(group_id, campaign_ids, tenant_id),
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
      
      // console.log('✅ 캠페인 그룹에 캠페인 추가 성공:', data);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // console.error('❌ 캠페인 그룹에 캠페인 추가 실패:', error);
      options?.onError?.(error, variables, context);
    },
  });
};

export default useApiForAddCampaignToSpecificCampaignGroup;