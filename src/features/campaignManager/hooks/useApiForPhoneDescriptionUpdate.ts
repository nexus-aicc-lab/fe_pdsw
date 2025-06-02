import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { CampaignApiError } from "../types/typeForCampaignForSideBar";
import { PhoneDescriptionListDataResponse, UpdateResponse } from "../types/campaignManagerIndex";
import { fetchPhoneDescriptionUpdate } from "../api/mainPhoneDescriptionUpdate";

export function useApiForPhoneDescriptionUpdate(
    option? : UseMutationOptions<UpdateResponse, CampaignApiError, PhoneDescriptionListDataResponse>
) {
    return useMutation({
        mutationKey: ['mainPhoneDescriptionUpdate'],
        mutationFn: fetchPhoneDescriptionUpdate,
        onSuccess: (data, variables, context) => {
            option?.onSuccess?.(data, variables, context);
        },
        onError: (error: CampaignApiError, variables: PhoneDescriptionListDataResponse, context: unknown) => {
            option?.onError?.(error, variables, context);
        }
    })
}