// src/features/campaignManager/hooks/useApiForCallingNumber.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCampaignHistory } from '../api/mainCampaignHistory';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignHistoryRequest, CampaignHistoryResponse, MonitoringApiError } from '../types/monitoringIndex';

export function useApiForCampaignHistory(
  options?: UseMutationOptions<CampaignHistoryResponse, MonitoringApiError, CampaignHistoryRequest>
) {
  return useMutation({
    mutationKey: ['mainCampaignHistory'],
    mutationFn: fetchCampaignHistory,
    onSuccess: (data, variables, context) => {
      console.log('API Response:', {
        code: data.result_code,
        message: data.result_msg,
        count: data.result_count,
        total: data.total_count,
        data: data.result_data
      });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: MonitoringApiError, variables: CampaignHistoryRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}