import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { CampaignAgentListCredentials, AgentReadyCountDataResponse } from "../types/SystemPreferences";
import { ApiError } from "next/dist/server/api-utils";
import { fetchAgentReadyCount } from "../api/apiForAgentReadyCount";

export function useApiForAgentReadyCount(
    options?: UseMutationOptions<AgentReadyCountDataResponse, ApiError, CampaignAgentListCredentials>
) {
    return useMutation({
        mutationKey: ['agentReadyCount'],
        mutationFn: fetchAgentReadyCount,
        onSuccess: (data, variables, context) => {
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: CampaignAgentListCredentials, context: unknown) => {
            options?.onError?.(error, variables, context);
        }
    })
}