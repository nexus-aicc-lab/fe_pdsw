// src/features/campaignManager/hooks/useApiForCampaignAgent.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCampaignAssignmentAgents } from '../api/apiForCampaignAssignmentAgentList';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignAssignmentAgentCredentials, CampaignAssignmentAgentListResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForCampaignAssignmentAgent(
  options?: UseMutationOptions<CampaignAssignmentAgentListResponse, CampaignApiError, CampaignAssignmentAgentCredentials>
) {
  return useMutation({
    mutationKey: ['mainCampaignAssignmentAgents'],
    mutationFn: fetchCampaignAssignmentAgents,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignApiError, variables: CampaignAssignmentAgentCredentials, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}