// src/features/campaignManager/hooks/useApiForCampaignRedialPreviewSearch.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCampaignGroupCreate } from '../api/mainCampaignGroupCreate';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignGroupCreateDataRequest, CampaignGroupManagerApiError,DeleteResponse } from '../types/campaignGroupManagerIndex';

export function useApiForCampaignGroupCreate(
  options?: UseMutationOptions<DeleteResponse, CampaignGroupManagerApiError, CampaignGroupCreateDataRequest>
) {
  return useMutation({
    mutationKey: ['mainCampaignGroupCreate'],
    mutationFn: fetchCampaignGroupCreate,
    onSuccess: (data, variables, context) => {
      console.log('API Response:', {
        code: data.result_code,
        message: data.result_msg,
      });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignGroupManagerApiError, variables: CampaignGroupCreateDataRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}