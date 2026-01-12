// src/features/campaignManager/hooks/useApiForBlacklistDelete.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCampaignGroupDelete } from '../api/mainCampaignGroupDelete';
import { UseMutationOptions } from '@tanstack/react-query';
import { DeleteResponse, CampaignGroupManagerApiError } from '../types/campaignGroupManagerIndex';

export function useApiForCampaignGroupDelete(
  options?: UseMutationOptions<DeleteResponse, CampaignGroupManagerApiError, number>
) {
  return useMutation({
    mutationKey: ['mainCampaignGroupDelete'],
    mutationFn: fetchCampaignGroupDelete,
    onSuccess: (data, variables, context) => {
      /*
      console.log('API Response:', {
        code: data.result_code,
        message: data.result_msg,
      });
      */
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignGroupManagerApiError, variables: number, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}