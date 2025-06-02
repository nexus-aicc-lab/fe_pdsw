// src/features/campaignManager/hooks/useApiForCampaignRedialPreviewSearch.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCampaignGroupSearch } from '../api/mainCampaignGroupSearch';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignGroupSearchResponse, CampaignGroupManagerApiError } from '../types/campaignGroupManagerIndex';

export function useApiForCampaignGroupSearch(
  options?: UseMutationOptions<CampaignGroupSearchResponse, CampaignGroupManagerApiError, null>
) {
  return useMutation({
    mutationKey: ['mainCampaignGroupSearch'],
    mutationFn: fetchCampaignGroupSearch,
    onSuccess: (data, variables, context) => {
      console.log('API Response:', {
        code: data.result_code,
        message: data.result_msg,
        data: data.result_data
      });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignGroupManagerApiError, variables: null, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}