// src/features/campaignManager/hooks/useApiForCampaignBlacklistCount.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCampaignBlacklistCount } from '../api/mainCampaignBlacklistCount';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignBlacklistCountResponse, ListManagerApiError } from '../types/listManagerIndex';

export function useApiForCampaignBlacklistCount(
  options?: UseMutationOptions<CampaignBlacklistCountResponse, ListManagerApiError, number>
) {
  return useMutation({
    mutationKey: ['mainCampaignBlacklistCount'],
    mutationFn: fetchCampaignBlacklistCount,
    onSuccess: (data, variables, context) => {
      console.log('API Response:', {
        code: data.result_code,
        message: data.result_msg,
        data: data.result_data
      });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: ListManagerApiError, variables: number, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}