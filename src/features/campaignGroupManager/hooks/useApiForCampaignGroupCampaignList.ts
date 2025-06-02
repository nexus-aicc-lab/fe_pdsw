// src/features/campaignManager/hooks/useApiForCampaignRedialPreviewSearch.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCampaignGroupCampaignList } from '../api/mainCampaignGroupCampaignList';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignGroupCampaignListResponse, CampaignGroupManagerApiError } from '../types/campaignGroupManagerIndex';

export function useApiForCampaignGroupCampaignList(
  options?: UseMutationOptions<CampaignGroupCampaignListResponse, CampaignGroupManagerApiError, null>
) {
  return useMutation({
    mutationKey: ['mainCampaignGroupCampaignList'],
    mutationFn: fetchCampaignGroupCampaignList,
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