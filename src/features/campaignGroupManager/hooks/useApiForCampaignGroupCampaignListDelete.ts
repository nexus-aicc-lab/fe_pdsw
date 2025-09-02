// src/features/campaignManager/hooks/useApiForBlacklistDelete.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCampaignGroupCampaignListDelete } from '../api/mainCampaignGroupCampaignListDelete';
import { UseMutationOptions } from '@tanstack/react-query';
import { DeleteResponse, CampaignGroupManagerApiError, CampaignGroupCampaignListDeleteDataRequest } from '../types/campaignGroupManagerIndex';

export function useApiForCampaignGroupCampaignListDelete(
  options?: UseMutationOptions<DeleteResponse, CampaignGroupManagerApiError, CampaignGroupCampaignListDeleteDataRequest>
) {
  return useMutation({
    mutationKey: ['mainCampaignGroupCampaignListDelete'],
    mutationFn: fetchCampaignGroupCampaignListDelete,
    onSuccess: (data, variables, context) => {

      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignGroupManagerApiError, variables: CampaignGroupCampaignListDeleteDataRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}