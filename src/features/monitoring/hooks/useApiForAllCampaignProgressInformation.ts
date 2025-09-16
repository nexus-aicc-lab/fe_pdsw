// src/features/monitoring/hooks/useApiForCampaignProgressInformation.ts
import { useMutation } from '@tanstack/react-query';
import { fetchAllCampaignProgressInformation } from '../api/mainAllCampaignProgressInformation';
import { UseMutationOptions } from '@tanstack/react-query';
import { AllCampaignProgressInformationRequest, CampaignProgressInformationResponse, MonitoringApiError } from '../types/monitoringIndex';

export function useApiForAllCampaignProgressInformation(
  options?: UseMutationOptions<CampaignProgressInformationResponse, MonitoringApiError, AllCampaignProgressInformationRequest>
) {
  return useMutation({
    mutationKey: ['mainAllCampaignProgressInformation'],
    mutationFn: fetchAllCampaignProgressInformation,
    onSuccess: (data, variables, context) => {
      
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: MonitoringApiError, variables: AllCampaignProgressInformationRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
    ...options
  });
}