import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { DialingDeviceCreateRequest, SuccesResponse, TenantIdCredentials, DialingDeviceListResponse, DialingDeviceDeleteRequest } from "../types/SystemPreferences";
import { ApiError } from "next/dist/server/api-utils";
import { createDialingDevice, deleteDialingDevice, fetchDialingDeviceList, updateDialingDevice } from "../api/apiForDialingdevice";

// 장비 리스트 요청을 위한 hook
export function useApiForDialingDevice(
    options?: UseMutationOptions<DialingDeviceListResponse, ApiError, TenantIdCredentials>
) {
    return useMutation({
        mutationKey: ['dialingDeviceList'],
        mutationFn: fetchDialingDeviceList,
        onSuccess: (data, variables, context) => {
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: TenantIdCredentials, context: unknown) => {
            options?.onError?.(error, variables, context);
        },
    });
}



// 신규 등록을 위한 hook
export function useApiForDialingDeviceCreate(
    options?: UseMutationOptions<SuccesResponse, ApiError, DialingDeviceCreateRequest>
) {
    return useMutation({
        mutationKey: ['dialingDeviceCreate'],
        mutationFn: createDialingDevice,
        onSuccess: (data, variables, context) => {
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: DialingDeviceCreateRequest, context: unknown) => {
            options?.onError?.(error, variables, context);
        }
    });
}

// 수정을 위한 hook
export function useApiForDialingDeviceUpdate(
    options?: UseMutationOptions<SuccesResponse, ApiError, DialingDeviceCreateRequest>
) {
    return useMutation({
        mutationKey: ['dialingDeviceUpdate'],
        mutationFn: updateDialingDevice,
        onSuccess: (data, variables, context) => {
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: DialingDeviceCreateRequest, context: unknown) => {
            options?.onError?.(error, variables, context);
        }
    });
}

// 삭제를를 위한 hook
export function useApiForDialingDeviceDelete(
    options?: UseMutationOptions<SuccesResponse, ApiError, DialingDeviceDeleteRequest>
) {
    return useMutation({
        mutationKey: ['dialingDeviceDelete'],
        mutationFn: deleteDialingDevice,
        onSuccess: (data, variables, context) => {
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: DialingDeviceDeleteRequest, context: unknown) => {
            options?.onError?.(error, variables, context);
        }
    });
}