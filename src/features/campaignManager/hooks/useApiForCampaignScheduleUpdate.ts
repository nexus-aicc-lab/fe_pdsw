// src/features/campaignManager/hooks/useApiForCampaignScheduleUpdate.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCampaignScheduleUpdate } from '../api/mainCampaignScheduleUpdate';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignScheDuleListDataResponse, UpdateResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForCampaignScheduleUpdate(
  options?: UseMutationOptions<UpdateResponse, CampaignApiError, CampaignScheDuleListDataResponse>
) {
  return useMutation({
    mutationKey: ['mainCampaignScheduleUpdate'],
    mutationFn: fetchCampaignScheduleUpdate,
    onSuccess: (data, variables, context) => {
      
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignApiError, variables: CampaignScheDuleListDataResponse, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}