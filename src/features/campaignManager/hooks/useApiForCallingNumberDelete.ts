// src/features/campaignManager/hooks/useApiForCallingNumberDelete.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCallingNumberDelete } from '../api/mainCallingNumberDelete';
import { UseMutationOptions } from '@tanstack/react-query';
import { CallingNumberListDataResponse, UpdateResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForCallingNumberDelete(
  options?: UseMutationOptions<UpdateResponse, CampaignApiError, CallingNumberListDataResponse>
) {
  return useMutation({
    mutationKey: ['mainCallingNumberDelete'],
    mutationFn: fetchCallingNumberDelete,
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