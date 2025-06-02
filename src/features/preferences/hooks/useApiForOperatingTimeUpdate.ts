// src/features/campaignManager/hooks/useApiForCallingNumberUpdate.ts
import { useMutation } from '@tanstack/react-query';
import { fetchOperatingTimeUpdate } from '../api/apiForOperatingTimeUpdate';
import { UseMutationOptions } from '@tanstack/react-query';
import { ApiError } from "../types/SystemPreferences";

// 캠페인 운용 가능 시간 요청 데이터 타입
export interface OperatingTimesDataRequest {
  start_time: string;
  end_time: string;
  days_of_week: string;
}

// 응답 타입
export interface SuccesResponse {
  result_code: number;
  result_msg: string;
}

export function useApiForOperatingTimeUpdate(
  options?: UseMutationOptions<SuccesResponse, ApiError, OperatingTimesDataRequest>
) {
  return useMutation({
    mutationKey: ['operatingTimeUpdate'],
    mutationFn: fetchOperatingTimeUpdate,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: ApiError, variables: OperatingTimesDataRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}