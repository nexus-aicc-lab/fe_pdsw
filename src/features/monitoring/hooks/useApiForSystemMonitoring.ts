import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { fetchSystemMonitoring } from "../api/mainSystemMonitoring";
import { SystemMonitoringError, SystemMonitoringResponse } from "../types/systemMonitoringindex";

export function useApiForSystemMonitoring(
    options?: UseMutationOptions<SystemMonitoringResponse, SystemMonitoringError, unknown>
) {
    return useMutation({
        mutationKey: ['systemMonitoring'],
        mutationFn: fetchSystemMonitoring,
        onSuccess: (data, variables, context) => {
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error: SystemMonitoringError, variables: unknown, context: unknown) => {
            console.error('API Error:', error);
            options?.onError?.(error, variables, context);
        },
    })
}