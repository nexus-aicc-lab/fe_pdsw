// src/features/campaignManager/hooks/useApiForReservedCallDelete.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMaxcallExtDelete } from '../api/mainMaxcallExtDelete';
import { UseMutationOptions } from '@tanstack/react-query';
import { MaxcallExtDeleteRequest, UpdateResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForMaxcallExtDelete(
  options?: UseMutationOptions<UpdateResponse, CampaignApiError, MaxcallExtDeleteRequest>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['mainMaxcallExtDelete'],
    mutationFn: fetchMaxcallExtDelete,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);

    queryClient.invalidateQueries({ queryKey: ["treeMenuDataForSideMenu"] });

    },
    onError: (error: CampaignApiError, variables: MaxcallExtDeleteRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}