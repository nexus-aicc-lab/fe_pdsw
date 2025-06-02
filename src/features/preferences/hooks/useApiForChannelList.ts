import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ApiError, ChannelListResponse } from "../types/SystemPreferences";
import { fetchChannelList } from "../api/apiForChannellist";

export function useApiForChannelList(
    options?: UseMutationOptions<ChannelListResponse, ApiError>
) {
    return useMutation({
        mutationKey: ['channelList'],
        mutationFn: fetchChannelList,
        onSuccess: (data: ChannelListResponse, variables: void, context: unknown) => {
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: void, context: unknown) => {
            options?.onError?.(error, variables, context);
        },
    });
}