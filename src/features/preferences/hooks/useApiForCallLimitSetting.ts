import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ApiError, CallLimitSettingCreateRequest, CallLimitSettingDeleteRequest, CallLimitSettingListResponse, SuccesResponse, TenantIdCredentials } from "../types/SystemPreferences";
import { createCallLimitSetting, deleteCallLimitSetting, fetchCallLimitSettingList, UpdateCallLimitSetting } from "../api/apiForCallLimitSetting";

// 운영설정 예약콜 제한설정 리스트 요청을 위한 hook
export function useApiForCallLimitSettingList(
    option?: UseMutationOptions<CallLimitSettingListResponse, ApiError, TenantIdCredentials>
) {
    return useMutation({
        mutationKey: ['callLimitSettingList'],
        mutationFn: fetchCallLimitSettingList,
        onSuccess: (data, variables, context) => {
            option?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables, context: unknown) => {
            option?.onError?.(error, variables, context);
        }
    });
}

// 신규 등록을 위한 hook
export function useApiForCallLimitSettingCreate(
  options?: UseMutationOptions<SuccesResponse, ApiError, CallLimitSettingCreateRequest>
) {
  return useMutation({
    mutationKey: ['callLimitSettingCreate'],
    mutationFn: createCallLimitSetting,  
    ...options
  });
}
  
// 수정을 위한 hook
export function useApiForCallLimitSettingUpdate(
  options?: UseMutationOptions<SuccesResponse, ApiError, CallLimitSettingCreateRequest>
) {
  return useMutation({
    mutationKey: ['callLimitSettingUpdate'],
    mutationFn: UpdateCallLimitSetting,  
    ...options
  });
}

// 삭제를 위한 hook
export function useApiForCallLimitSettingDelete(
  options?: UseMutationOptions<SuccesResponse, ApiError, CallLimitSettingDeleteRequest>
) {
  return useMutation({
    mutationKey: ['callLimitSettingDelete'],
    mutationFn: deleteCallLimitSetting, 
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: ApiError, variables: CallLimitSettingDeleteRequest, context: unknown) => {
        options?.onError?.(error, variables, context);
    }
  });
}