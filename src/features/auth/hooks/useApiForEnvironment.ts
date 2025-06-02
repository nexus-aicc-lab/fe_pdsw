import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { EnvironmentListCredentials, EnvironmentListResponse, EnvironmentSaveRequest, EnvironmentSaveResponse } from "../types/environmentIndex";
import { ApiError } from "next/dist/server/api-utils";
import { fetchEnvironmentList, fetchEnvironmentSave } from "../api/environment";

export function useApirForEnvironmentList (
    options?: UseMutationOptions<EnvironmentListResponse, ApiError, EnvironmentListCredentials>
) {
    return useMutation({
        mutationKey: ['environmentList'],
        mutationFn: fetchEnvironmentList,
        onSuccess: (data, variables, context) => {
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: EnvironmentListCredentials, context: unknown) => {
            options?.onError?.(error, variables, context);
        }
    });
}

export function useApirForEnvironmentSave (
    options?: UseMutationOptions<EnvironmentSaveResponse, ApiError, EnvironmentSaveRequest>
) {
    return useMutation({
        mutationKey: ['environmentSave'],
        mutationFn: fetchEnvironmentSave,
        onSuccess: (data, variables, context) => {
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: EnvironmentSaveRequest, context: unknown) => {
            options?.onError?.(error, variables, context);
        }
    });
}
