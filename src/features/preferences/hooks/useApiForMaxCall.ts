import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { CreateMaxCallRequest, CreateMaxCallResponse, MaxCallDeleteRequest, MaxCallDeleteResponse, MaxCallInitTimeListResponse, MaxCallInitTimeUpdateRequest, MaxCallInitTimeUpdateResponse, MaxCallListCredentials, MaxCallListResponse } from "../types/SystemPreferences";
import { ApiError } from "next/dist/server/api-utils";
import { createMaxCall, deleteMaxCall, fetchMaxCallInitTimeList, fetchMaxCallList, updateMaxCall, updateMaxCallInitTime } from "../api/apiForMaxCall";

// 운영설정 분배호수 제한 설정 리스트 요청을 위한 hook
export function useApiForMaxCallList(
    option?: UseMutationOptions<MaxCallListResponse, ApiError, MaxCallListCredentials>
) {
    return useMutation({
        mutationKey: ['maxCallList'],
        mutationFn: fetchMaxCallList,
        onSuccess: (data, variables, context) => {
            option?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables, context: unknown) => {
            option?.onError?.(error, variables, context);
        }
    });
}

// 신규 등록을 위한 hook
export function useApiForCreateMaxCall(
    option?: UseMutationOptions<CreateMaxCallResponse, ApiError, CreateMaxCallRequest>
) {
    return useMutation({
        mutationKey: ['createMaxCall'],
        mutationFn: createMaxCall,
        onSuccess: (data, variables, context) => {
            option?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: CreateMaxCallRequest, context: unknown) => {
            option?.onError?.(error, variables, context);
        }  
    })
}

// 수정을 위한 hook
export function useApiForUpdateMaxCall(
    option?: UseMutationOptions<CreateMaxCallResponse, ApiError, CreateMaxCallRequest>
) {
    return useMutation({
        mutationKey: ['updateMaxCall'],
        mutationFn: updateMaxCall,
        onSuccess: (data, variables, context) => {
            option?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: CreateMaxCallRequest, context: unknown) => {
            option?.onError?.(error, variables, context);
        }
    }); 
}

// 운영설정 분배호수 제한 설정 삭제 을 위한 hook
export function useApiForDeleteMaxCall(
    option?: UseMutationOptions<MaxCallDeleteResponse, ApiError, MaxCallDeleteRequest>
) {
    return useMutation({
        mutationKey: ['deleteMaxCall'],
        mutationFn: deleteMaxCall,
        onSuccess: (data, variables, context) => {
            option?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: MaxCallDeleteRequest, context: unknown) => {
            option?.onError?.(error, variables, context);
        }
    });
}

// 운영설정 분배호수 제한 설정 초기화 시각 조회를 위한 hook
export function useApiForMaxCallInitTimeList(
    options?: UseMutationOptions<MaxCallInitTimeListResponse, ApiError, unknown>
) {
    return useMutation({
        mutationKey: ['maxCallInitTimeList'],
        mutationFn: fetchMaxCallInitTimeList,
        onSuccess: (data, variables, context) => {
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: unknown, context: unknown) => {
            options?.onError?.(error, variables, context);
        }
    });
}

// 운영설정 분배호수 제한 설정 초기화 시각 수정을 위한 hook
export function useApiForMaxCallInitTimeUpdate(
    options?: UseMutationOptions<MaxCallInitTimeUpdateResponse, ApiError, MaxCallInitTimeUpdateRequest>
) {
    return useMutation({
        mutationKey: ['maxCallInitTimeUpdate'],
        mutationFn: updateMaxCallInitTime,
        onSuccess: (data, variables, context) => {
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: MaxCallInitTimeUpdateRequest, context: unknown) => {   
            options?.onError?.(error, variables, context);
        }
    });
}