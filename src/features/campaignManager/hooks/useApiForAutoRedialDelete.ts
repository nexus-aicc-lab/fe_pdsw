// src/features/campaignManager/hooks/useApiForCallingNumberDelete.ts
import { useMutation } from '@tanstack/react-query';
import { fetchAutoRedialDelete } from '../api/mainAutoRedialDelete';
import { UseMutationOptions } from '@tanstack/react-query';
import { AutoRedialDataRequest, UpdateResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForAutoRedialDelete(
  options?: UseMutationOptions<UpdateResponse, CampaignApiError, AutoRedialDataRequest>
) {
  return useMutation({
    mutationKey: ['mainAutoRedialDelete'],
    mutationFn: fetchAutoRedialDelete,
    onSuccess: (data, variables, context) => {
      console.log('API Response:', {
        code: data.result_code,
        message: data.result_msg,
      });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignApiError, variables: AutoRedialDataRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}