// src/features/campaignManager/hooks/useApiForBlacklistInsert.ts
import { useMutation } from '@tanstack/react-query';
import { fetchBlacklistInsert } from '../api/mainBlacklistInsert';
import { UseMutationOptions } from '@tanstack/react-query';
import { CallingListInsertRequest, CallingListInsertResponse, ListManagerApiError } from '../types/listManagerIndex';

export function useApiForBlacklistInsert(
  options?: UseMutationOptions<CallingListInsertResponse, ListManagerApiError, CallingListInsertRequest>
) {
  return useMutation({
    mutationKey: ['mainBlacklistInsert'],
    mutationFn: fetchBlacklistInsert,
    onSuccess: (data, variables, context) => {
      console.log('API Response:', {
        code: data.result_code,
        message: data.result_msg,
        count: data.result_count,
        requestCount: data.request_count,
        data: data.result_data
      });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: ListManagerApiError, variables: CallingListInsertRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}