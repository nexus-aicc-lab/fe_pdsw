// src/features/campaignManager/hooks/useApiForSkills.ts
import { useMutation } from '@tanstack/react-query';
import { fetchSkills } from '../api/mainSkillMasterInfoSearch';
import { UseMutationOptions } from '@tanstack/react-query';
import { SkillListCredentials, SkillListResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForSkills(
  options?: UseMutationOptions<SkillListResponse, CampaignApiError, SkillListCredentials>
) {
  return useMutation({
    mutationKey: ['mainSkills'],
    mutationFn: fetchSkills,
    retry: 1,
    gcTime: 10 * 60 * 1000, // 10분

    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignApiError, variables: SkillListCredentials, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}
