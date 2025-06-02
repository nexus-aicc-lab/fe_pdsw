// src/features/campaignManager/hooks/useApiForCampaignManagerDelete.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCampaignManagerDelete } from '../api/mainCampaignManagerDelete';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignInfoDeleteRequest, UpdateResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForCampaignManagerDelete(
  options?: UseMutationOptions<UpdateResponse, CampaignApiError, CampaignInfoDeleteRequest>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['mainCampaignManagerDelete'],
    mutationFn: fetchCampaignManagerDelete,
    onSuccess: (data, variables, context) => {
      console.log('API Response:', {
        code: data.result_code,
        message: data.result_msg,
      });
      options?.onSuccess?.(data, variables, context);

    // queryClient.invalidateQueries({ queryKey: ["treeMenuDataForSideMenu"] });

    },
    onError: (error: CampaignApiError, variables: CampaignInfoDeleteRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}