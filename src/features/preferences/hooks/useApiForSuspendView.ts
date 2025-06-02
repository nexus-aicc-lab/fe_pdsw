import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ApiError, SuccesResponse, SuspendedCampaignListResponse, SuspendedSkillListResponse } from "../types/SystemPreferences";
import { fetchDeleteSuspendedCampaign, fetchDeleteSuspendedSkill, fetchSuspendedCampaignList, fetchSuspendedSkillList } from "../api/apiForsuspendView";

// 서스펜드 캠페인 조회
export function useApiForSuspendedCampaignList (
    options?: UseMutationOptions<SuspendedCampaignListResponse, ApiError>
) {
    return useMutation({
        mutationKey: ['suspendedCampaignList'],
        mutationFn: fetchSuspendedCampaignList,
        onSuccess: (data, variables, context) => {
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables, context: unknown) => {
            options?.onError?.(error, variables, context);
        },
    });
}

// 서스펜드 캠페인 삭제
export function useApiForDeleteSuspendedCampaign (
    options?: UseMutationOptions<SuccesResponse, ApiError, unknown>
) {
    return useMutation({
        mutationKey: ['deleteSuspendedCampaign'],
        mutationFn: fetchDeleteSuspendedCampaign,
        onSuccess: (data, variables, context) => {
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables, context: unknown) => {
            options?.onError?.(error, variables, context);
        }
    });
}

// 서스펜드 스킬 조회
export function useApiForSuspendedSkillList (
    options?: UseMutationOptions<SuspendedSkillListResponse, ApiError, unknown>
) {
    return useMutation({
        mutationKey: ['suspendedSkillList'],
        mutationFn: fetchSuspendedSkillList,
        onSuccess: (data, variables, context) => {
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables, context: unknown) => {
            options?.onError?.(error, variables, context);
        },
    });
}

// 서스펜드 스킬킬 삭제
export function useApiForDeleteSuspendedSkill (
    options?: UseMutationOptions<SuccesResponse, ApiError, unknown>
) {
    return useMutation({
        mutationKey: ['deleteSuspendedSkill'],
        mutationFn: fetchDeleteSuspendedSkill,
        onSuccess: (data, variables, context) => {
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables, context: unknown) => {
            options?.onError?.(error, variables, context);
        }
    });
}