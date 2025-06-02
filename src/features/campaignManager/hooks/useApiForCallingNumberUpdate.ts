// src/features/campaignManager/hooks/useApiForCallingNumberUpdate.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCallingNumberUpdate } from '../api/mainCallingNumberUpdate';
import { UseMutationOptions } from '@tanstack/react-query';
import { CallingNumberListDataResponse, UpdateResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForCallingNumberUpdate(
  options?: UseMutationOptions<UpdateResponse, CampaignApiError, CallingNumberListDataResponse>
) {
  return useMutation({
    mutationKey: ['mainCallingNumberUpdate'],
    mutationFn: fetchCallingNumberUpdate,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignApiError, variables: CallingNumberListDataResponse, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}