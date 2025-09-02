// src/features/campaignManager/hooks/useApiForCallingNumberUpdate.ts
import { useMutation } from '@tanstack/react-query';
import { fetchDialSpeedUpdate } from '../api/mainDialSpeedUpdate';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignDialSpeedUpdateRequest, UpdateResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForDialSpeedUpdate(
  options?: UseMutationOptions<UpdateResponse, CampaignApiError, CampaignDialSpeedUpdateRequest>
) {
  return useMutation({
    mutationKey: ['mainDialSpeedUpdate'],
    mutationFn: fetchDialSpeedUpdate,
    onSuccess: (data, variables, context) => {
      
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignApiError, variables: CampaignDialSpeedUpdateRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}