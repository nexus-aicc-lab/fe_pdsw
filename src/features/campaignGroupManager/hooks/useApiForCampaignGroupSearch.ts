// src/features/campaignManager/hooks/useApiForCampaignRedialPreviewSearch.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCampaignGroupSearch, CampaignGroupSearchResponse } from '../api/mainCampaignGroupSearch';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignGroupManagerApiError } from '../types/campaignGroupManagerIndex';

export function useApiForCampaignGroupSearch(
  options?: UseMutationOptions<CampaignGroupSearchResponse, CampaignGroupManagerApiError, null>
) {
  return useMutation({
    mutationKey: ['mainCampaignGroupSearch'],
    mutationFn: fetchCampaignGroupSearch,
    onSuccess: (data, variables, context) => {

      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignGroupManagerApiError, variables: null, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}