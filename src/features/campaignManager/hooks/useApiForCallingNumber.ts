// src/features/campaignManager/hooks/useApiForCallingNumber.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCallingNumbers } from '../api/mainCallingNumberInfoSearch';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignCredentials, CallingNumberListResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForCallingNumber(
  options?: UseMutationOptions<CallingNumberListResponse, CampaignApiError, CampaignCredentials>
) {
  return useMutation({
    mutationKey: ['mainCallingNumbers'],
    mutationFn: fetchCallingNumbers,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignApiError, variables: CampaignCredentials, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}