// src/features/campaignManager/hooks/useApiForCampaignCurrentRedial.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCampaignCurrentRedial } from '../api/mainCampaignCurrentRedial';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignRedialPreviewSearchDataRequest, CampaignCurrentRedialResponse,rebroadcastSettingsPanelApiError } from '../types/rebroadcastSettingsPanelIndex';

export function useApiForCampaignCurrentRedial(
  options?: UseMutationOptions<CampaignCurrentRedialResponse, rebroadcastSettingsPanelApiError, CampaignRedialPreviewSearchDataRequest>
) {
  return useMutation({
    mutationKey: ['mainCampaignCurrentRedial'],
    mutationFn: fetchCampaignCurrentRedial,
    onSuccess: (data, variables, context) => {
      console.log('API Response:', {
        code: data.result_code,
        message: data.result_msg,
      });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: rebroadcastSettingsPanelApiError, variables: CampaignRedialPreviewSearchDataRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}