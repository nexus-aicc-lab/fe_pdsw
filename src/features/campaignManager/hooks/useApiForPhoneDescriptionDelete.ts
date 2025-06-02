import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { UpdateResponse } from "../types/campaignManagerIndex";
import { CampaignApiError } from "../types/typeForCampaignForSideBar";
import { fetchPhoneDescriptionDelete } from "../api/mainPhoneDescriptionDelete";

export function useApiForPhoneDescriptionDelete(
    options?: UseMutationOptions<UpdateResponse, CampaignApiError, number>
) {
    return useMutation({
        mutationKey: ["mainPhoneDescriptionDelete"],
        mutationFn: fetchPhoneDescriptionDelete,
        onSuccess: (data, variables, context) => {
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error: CampaignApiError, variables: number, context: unknown) => {
            options?.onError?.(error, variables, context);
        },

    })
}