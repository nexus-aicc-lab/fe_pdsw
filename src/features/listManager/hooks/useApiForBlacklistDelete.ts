// src/features/campaignManager/hooks/useApiForBlacklistDelete.ts
import { useMutation } from '@tanstack/react-query';
import { fetchBlacklistDelete } from '../api/mainBlacklistDelete';
import { UseMutationOptions } from '@tanstack/react-query';
import { DeleteResponse, ListManagerApiError } from '../types/listManagerIndex';

export function useApiForBlacklistDelete(
  options?: UseMutationOptions<DeleteResponse, ListManagerApiError, number>
) {
  return useMutation({
    mutationKey: ['mainBlacklistDelete'],
    mutationFn: fetchBlacklistDelete,
    onSuccess: (data, variables, context) => {
      
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: ListManagerApiError, variables: number, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}