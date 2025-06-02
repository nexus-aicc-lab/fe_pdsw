// src/features/campaignManager/hooks/useApiForSchedules.ts
import { useMutation } from '@tanstack/react-query';
import { fetchSchedules } from '../api/mainCampaignSchedule';
import { UseMutationOptions } from '@tanstack/react-query';
import { SkillListCredentials, CampaignScheDuleListResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForSchedules(
  options?: UseMutationOptions<CampaignScheDuleListResponse, CampaignApiError, SkillListCredentials>
) {
  return useMutation({
    mutationKey: ['mainSchedules'],
    mutationFn: fetchSchedules,
    // gcTime: 10 * 60 * 1000, // 10분,
    onSuccess: (data, variables, context) => {
      // console.log('API Response:', {
      //   code: data.result_code,
      //   message: data.result_msg,
      //   count: data.result_count,
      //   total: data.total_count,
      //   data: data.result_data
      // });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignApiError, variables: SkillListCredentials, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}