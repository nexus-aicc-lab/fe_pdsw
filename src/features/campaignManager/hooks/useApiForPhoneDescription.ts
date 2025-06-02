// src/features/campaignManager/hooks/useApiForPhoneDescription.ts
import { useMutation } from '@tanstack/react-query';
import { fetchPhoneDescriptions } from '../api/mainPhoneDescriptionSearch';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignCredentials, PhoneDescriptionListResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForPhoneDescription(
  options?: UseMutationOptions<PhoneDescriptionListResponse, CampaignApiError, CampaignCredentials>
) {
  return useMutation({
    mutationKey: ['mainPhoneDescriptions'],
    mutationFn: fetchPhoneDescriptions,
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