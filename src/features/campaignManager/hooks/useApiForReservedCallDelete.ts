// src/features/campaignManager/hooks/useApiForReservedCallDelete.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReservedCallDelete } from '../api/mainReservedCallDelete';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignInfoDeleteRequest, UpdateResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForReservedCallDelete(
  options?: UseMutationOptions<UpdateResponse, CampaignApiError, CampaignInfoDeleteRequest>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['mainReservedCallDelete'],
    mutationFn: fetchReservedCallDelete,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);

    queryClient.invalidateQueries({ queryKey: ["treeMenuDataForSideMenu"] });

    },
    onError: (error: CampaignApiError, variables: CampaignInfoDeleteRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}