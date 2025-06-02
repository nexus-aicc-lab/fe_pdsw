// src/features/campaignManager/hooks/useApiForCallingNumber.ts
import { useMutation } from '@tanstack/react-query';
import { fetchAutoRedials } from '../api/mainAutoRedialInfoSearch';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignCredentials, AutoRedialListResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForAutoRedial(
  options?: UseMutationOptions<AutoRedialListResponse, CampaignApiError, CampaignCredentials>
) {
  return useMutation({
    mutationKey: ['mainAutoRedials'],
    mutationFn: fetchAutoRedials,
    onSuccess: (data, variables, context) => {
      console.log('API Response:', {
        code: data.result_code,
        message: data.result_msg,
        count: data.result_count,
        total: data.total_count,
        data: data.result_data
      });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignApiError, variables: CampaignCredentials, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}