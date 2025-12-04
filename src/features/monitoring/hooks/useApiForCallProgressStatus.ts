// src/features/campaignManager/hooks/useApiForCallingNumber.ts
import { useMutation } from '@tanstack/react-query';
import { fetchCallProgressStatus, CallProgressStatusRequest, CallProgressStatusResponse } from '../api/mainCallProgressStatus';
import { UseMutationOptions } from '@tanstack/react-query';
import { MonitoringApiError } from '../types/monitoringIndex';

export function useApiForCallProgressStatus(
  options?: UseMutationOptions<CallProgressStatusResponse, MonitoringApiError, CallProgressStatusRequest>
) {
  return useMutation({
    mutationKey: ['mainCallProgressStatus'],
    mutationFn: fetchCallProgressStatus,
    onSuccess: (data, variables, context) => {
      // console.log('API Response:', {
      //   code: data.code,
      //   message: data.message,
      //   waitingCounselorCnt: data.waitingCounselorCnt,
      //   data: data.sendingProgressStatusList
      // });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: MonitoringApiError, variables: CallProgressStatusRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}