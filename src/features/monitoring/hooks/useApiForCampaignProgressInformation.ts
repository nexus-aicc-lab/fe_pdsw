// src/features/monitoring/hooks/useApiForCampaignProgressInformation.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCampaignProgressInformation } from '../api/mainCampaignProgressInformation';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignProgressInformationRequest, CampaignProgressInformationResponse, MonitoringApiError } from '../types/monitoringIndex';

export function useApiForCampaignProgressInformation(
  options?: UseMutationOptions<CampaignProgressInformationResponse, MonitoringApiError, CampaignProgressInformationRequest>
) {
  return useMutation({
    mutationKey: ['mainCampaignProgressInformation'],
    mutationFn: fetchCampaignProgressInformation,
    onSuccess: (data, variables, context) => {
      console.log('API Response:', {
        code: data.code,
        message: data.message,
        data: data.progressInfoList
      });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: MonitoringApiError, variables: CampaignProgressInformationRequest, context: unknown) => {
      console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
    ...options
  });
}