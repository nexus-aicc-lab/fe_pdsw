// src/features/campaignManager/hooks/useApiForCampaignRedialPreviewSearch.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCampaignRedialPreviewSearch } from '../api/mainCampaignRedialPreviewSearch';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignRedialPreviewSearchDataRequest, CampaignRedialPreviewSearchResponse, rebroadcastSettingsPanelApiError } from '../types/rebroadcastSettingsPanelIndex';

export function useApiForCampaignRedialPreviewSearch(
  options?: UseMutationOptions<CampaignRedialPreviewSearchResponse, rebroadcastSettingsPanelApiError, CampaignRedialPreviewSearchDataRequest>
) {
  return useMutation({
    mutationKey: ['mainCampaignRedialPreviewSearch'],
    mutationFn: fetchCampaignRedialPreviewSearch,
    onSuccess: (data, variables, context) => {
      
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: rebroadcastSettingsPanelApiError, variables: CampaignRedialPreviewSearchDataRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}