// src/features/rebroadcastSettingsPanel/hooks/useApiForCampaignAutoRedialInsert.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCampaignAutoRedialInsert } from '../api/mainCampaignAutoRedialInsert';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignAutoRedialInsertDataRequest, CampaignAutoRedialInsertResponse, rebroadcastSettingsPanelApiError } from '../types/rebroadcastSettingsPanelIndex';

export function useApiForCampaignAutoRedialInsert(
  options?: UseMutationOptions<CampaignAutoRedialInsertResponse, rebroadcastSettingsPanelApiError, CampaignAutoRedialInsertDataRequest>
) {
  return useMutation({
    mutationKey: ['mainCampaignAutoRedialInsert'],
    mutationFn: fetchCampaignAutoRedialInsert,
    onSuccess: (data, variables, context) => {
      console.log('API Response:', {
        code: data.result_code,
        message: data.result_msg,
      });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: rebroadcastSettingsPanelApiError, variables: CampaignAutoRedialInsertDataRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}