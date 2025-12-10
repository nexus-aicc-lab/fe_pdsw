import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { fetchCenterInfo, CenterInfoDataResponse } from "../api/apiForFetchCenterInfo";
import { ApiError } from "../types/environmentIndex";

export function useApiForCenterInfo(
    options?: UseMutationOptions<CenterInfoDataResponse, ApiError>
) {
    return useMutation({
        mutationKey: ['centerInfo'],
        mutationFn: fetchCenterInfo,
        onSuccess: (data: CenterInfoDataResponse, variables: void, context: unknown) => {
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: void, context: unknown) => {
            options?.onError?.(error, variables, context);
        },
    });
}