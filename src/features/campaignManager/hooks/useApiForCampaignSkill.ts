// src/features/campaignManager/hooks/useApiForCampaignSkill.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCampaignSkills } from '../api/mainCampaignSkillSearch';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignCredentials, CampaignSkillListResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForCampaignSkill(
  options?: UseMutationOptions<CampaignSkillListResponse, CampaignApiError, CampaignCredentials>
) {
  return useMutation({
    mutationKey: ['mainCampaignSkills'],
    mutationFn: fetchCampaignSkills,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignApiError, variables: CampaignCredentials, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}