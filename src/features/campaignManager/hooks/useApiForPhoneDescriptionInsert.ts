import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { PhoneDescriptionListDataResponse, UpdateResponse } from "../types/campaignManagerIndex";
import { CampaignApiError } from "../types/typeForCampaignForSideBar";
import { fetchPhoneDescriptionInsert } from "../api/mainPhoneDescriptionInsert";

export function useApiForPhoneDescriptionInsert(
    option? : UseMutationOptions<UpdateResponse, CampaignApiError, PhoneDescriptionListDataResponse>
) {
    return useMutation({
        mutationKey: ['mainPhoneDescriptionInsert'],
        mutationFn: fetchPhoneDescriptionInsert,
        onSuccess: (data, variables, context) => {
            option?.onSuccess?.(data, variables, context);
        },
        onError: (error: CampaignApiError, variables: PhoneDescriptionListDataResponse, context: unknown) => {
            option?.onError?.(error, variables, context);
        }
    })
}