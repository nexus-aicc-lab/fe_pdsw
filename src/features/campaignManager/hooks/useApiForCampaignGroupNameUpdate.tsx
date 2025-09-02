// src/features/campaignManager/hooks/useApiForCampaignGroupNameUpdate.ts
import { useMutation } from '@tanstack/react-query';
import { UseMutationOptions } from '@tanstack/react-query';
import { SuccessResponse } from '../types/typeForCampaignGroupForSideBar';
import { ApiError } from '../types/typeForCampaignGroup';
import { apiForUpdateCampaignGroupName } from '@/features/preferences/api/apiForCampaignGroup';

interface UpdateCampaignGroupNameParams {
  group_id: number;
  group_name: string;
  tenant_id: number;
}

export function useApiForCampaignGroupNameUpdate(
  options?: UseMutationOptions<SuccessResponse, ApiError, UpdateCampaignGroupNameParams>
) {
  return useMutation({
    mutationKey: ['campaignGroupNameUpdate'],
    mutationFn: ({ group_id, group_name, tenant_id }: UpdateCampaignGroupNameParams) => 
      apiForUpdateCampaignGroupName(group_id, group_name, tenant_id),
    onSuccess: (data: SuccessResponse, variables, context) => {
      
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: ApiError, variables: UpdateCampaignGroupNameParams, context: unknown) => {
      // console.error('캠페인 그룹 이름 업데이트 실패:', error);
      // 필요한 경우 여기에 toast 메시지 추가
      options?.onError?.(error, variables, context);
    },
  });
}