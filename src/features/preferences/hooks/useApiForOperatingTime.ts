import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ApiError } from "../types/SystemPreferences";
import { fetchOperatingTime } from "../api/apiForOperatingTime";

// 캠페인 운용 가능 시간 조회 응답 데이터 타입
export interface OperatingTimeResponse {
    start_time: string;
    end_time: string;
    days_of_week: string;
  }
  
  // 캠페인 운용 가능 시간 조회 응답 타입
  export interface OperatingTimeResponse {
    result_code: number;
    result_msg: string;
    result_count: number;
    total_count: number;
    result_data: OperatingTimeResponse;
  }
  
  export function useApiForOperatingTime(
    options?: UseMutationOptions<OperatingTimeResponse, ApiError, void>
  ) {
    return useMutation({
      mutationKey: ['operatingTime'],
      mutationFn: fetchOperatingTime,
      onSuccess: (data, variables, context) => {
        options?.onSuccess?.(data, variables, context);
      },
      onError: (error: ApiError, variables: void, context: unknown) => {
        // console.error('API Error:', error);
        // toast.error(error.message || '데이터 로드에 실패했습니다.');
        options?.onError?.(error, variables, context);
      },
    });
  }