import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { CampaignAgentListCredentials, CampaignAgentListResponse } from "../types/SystemPreferences";
import { ApiError } from "next/dist/server/api-utils";
import { fetchCampaignAgentList } from "../api/apiForCampaignAgent";

export function useApiForCampaignAgentList(
    options?: UseMutationOptions<CampaignAgentListResponse, ApiError, CampaignAgentListCredentials>
) {
    return useMutation({
        mutationKey: ['skillMaster'],
        mutationFn: fetchCampaignAgentList,
        onSuccess: (data, variables, context) => {
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: CampaignAgentListCredentials, context: unknown) => {
            options?.onError?.(error, variables, context);
        }
    })
}