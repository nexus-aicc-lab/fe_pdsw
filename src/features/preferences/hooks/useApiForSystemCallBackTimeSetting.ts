import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { SystemCallBackTimeSetting, UpdateSystemCallBackTime } from "../api/apiForSystemCallBackTimeSetting";
import { SuccesResponse, ApiError, SystemCallBackTimeUpdateRequest, SystemCallBackTimeResponse } from "../types/SystemPreferences";



export function useApiForSystemCallBackTimeSetting(
  options?: UseMutationOptions<SystemCallBackTimeResponse, ApiError>
) {
  return useMutation({
    mutationKey: ['systemCallBackTimeSetting'], // 캐싱 키
    mutationFn: SystemCallBackTimeSetting, // API 호출 함수
    onSuccess: (data, variables, context) => {
      // 성공 시 추가 처리
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: ApiError, variables, context) => {
      // 실패 시 추가 처리
      options?.onError?.(error, variables, context);
    },
  });
}



/**
 * 시스템 콜백 리스트 초기화 시간 수정 훅
 * @param  use_flag - 0: 미사용, 1: 사용
 * @param  init_hour - "01" string 옵셔널값, init_flag가 1이면 보내야하고, 0이면 안보낸다
 * @returns 
 */
export function useApiForSystemCallBackTimeUpdate(
  options?: UseMutationOptions<SuccesResponse, ApiError, SystemCallBackTimeUpdateRequest>
) {
  return useMutation({
    mutationKey: ['updateSystemCallBackTime'], // 캐싱 키
    mutationFn: UpdateSystemCallBackTime, // API 호출 함수
    onSuccess: (data, variables, context) => {
      // 성공 시 추가 처리
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: ApiError, variables, context) => {
      // 실패 시 추가 처리
      options?.onError?.(error, variables, context);
    },
  });
}