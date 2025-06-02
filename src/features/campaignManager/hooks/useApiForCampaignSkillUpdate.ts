// src/features/campaignManager/hooks/useApiForCampaignSkillUpdate.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCampaignSkillUpdate } from '../api/mainCampaignSkillUpdate';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignSkillUpdateRequest, UpdateResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForCampaignSkillUpdate(
  options?: UseMutationOptions<UpdateResponse, CampaignApiError, CampaignSkillUpdateRequest>
) {
  return useMutation({
    mutationKey: ['mainCampaignSkillUpdate'],
    mutationFn: fetchCampaignSkillUpdate,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignApiError, variables: CampaignSkillUpdateRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}