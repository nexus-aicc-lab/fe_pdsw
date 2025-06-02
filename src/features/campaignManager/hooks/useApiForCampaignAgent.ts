// src/features/campaignManager/hooks/useApiForCampaignAgent.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCampaignAgents } from '../api/mainCampaignAgentInfoSearch';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignAgentListDataRequest, CampaignAgentListResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForCampaignAgent(
  options?: UseMutationOptions<CampaignAgentListResponse, CampaignApiError, CampaignAgentListDataRequest>
) {
  return useMutation({
    mutationKey: ['mainCampaignAgents'],
    mutationFn: fetchCampaignAgents,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignApiError, variables: CampaignAgentListDataRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}