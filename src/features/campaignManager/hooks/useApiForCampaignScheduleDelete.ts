// src/features/campaignManager/hooks/useApiForCampaignScheduleUpdate.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCampaignScheduleDelete } from '../api/mainCampaignScheduleDelete';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignInfoDeleteRequest, UpdateResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForCampaignScheduleDelete(
  options?: UseMutationOptions<UpdateResponse, CampaignApiError, CampaignInfoDeleteRequest>
) {
  return useMutation({
    mutationKey: ['mainCampaignScheduleDelete'],
    mutationFn: fetchCampaignScheduleDelete,
    onSuccess: (data, variables, context) => {
      console.log('API Response:', {
        code: data.result_code,
        message: data.result_msg,
      });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignApiError, variables: CampaignInfoDeleteRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}