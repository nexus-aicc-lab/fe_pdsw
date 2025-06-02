import { dataTagSymbol, useMutation, UseMutationOptions } from "@tanstack/react-query";
import { CampaignListResponse, CampaignSkillListResponse, CampaignSkillUpdateRequest, CreateSkillCredentials, DeleteAgentSkillCredentials, DeleteSkillCredentials, SkillAgentListResponse, SkillCampaignListResponse, SkillListCredentials, SkillListResponse, SuccesResponse } from "../types/SystemPreferences";
import { ApiError } from "next/dist/server/api-utils";
import { createSkill, DeleteAgentSkill, DeleteSkill, fetchCampaignList, fetchCampaignSkills, fetchCampaignSkillUpdate, fetchSkillAgentList, fetchskillCampaignList, fetchSkillList, UpdateSkill } from "../api/apiForSkill";

// 스킬 마스터 리스트 조회 요청을 위한 hook
export function useApiForSkillList (
    option?: UseMutationOptions<SkillListResponse, ApiError, SkillListCredentials>
) {
    return useMutation({
        mutationKey: ['skillList'],
        mutationFn: fetchSkillList,
        onSuccess: (data, variables, context) => {
            option?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables, context: unknown) => {
            option?.onError?.(error, variables, context);
        }
    });
}

// 스킬 마스터 신규 등록을 위한 hook
export function useApiForCreateSkill (
    option?: UseMutationOptions<SuccesResponse, ApiError, CreateSkillCredentials>
) {
    return useMutation({
        mutationKey: ['createSkill'],
        mutationFn: createSkill,
        onSuccess: (data, variables, context) => {
            option?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: CreateSkillCredentials, context: unknown) => {
            option?.onError?.(error, variables, context);
        }
    })
}

// 스킬마스터 수정을 위한 hook
export function useApiForUpdateSkill (
    option?: UseMutationOptions<SuccesResponse, ApiError, CreateSkillCredentials>
) {
    return useMutation({
        mutationKey: ['updateSkill'],
        mutationFn: UpdateSkill,
        onSuccess: (data, variables, context) => {
            option?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: CreateSkillCredentials, context: unknown) => {
            option?.onError?.(error, variables, context);
        }
    })
}

// 스킬마스터 삭제를 위한 hook
export function useApiForDeleteSkill (
    option?: UseMutationOptions<SuccesResponse, ApiError, DeleteSkillCredentials>
) {
    return useMutation({
        mutationKey: ['deleteSkill'],
        mutationFn: DeleteSkill,
        onSuccess: (data, variables, context) => {
            option?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: DeleteSkillCredentials, context: unknown) => {
            option?.onError?.(error, variables, context);
        }
    })
}

// 스킬 할당 캠페인 리스트 조회 요청을 위한 hook
export function useApiForSkillCampaignList (
    option?: UseMutationOptions<SkillCampaignListResponse, ApiError, unknown>
) {
    return useMutation({
        mutationKey: ['skillCampaignList'],
        mutationFn: fetchskillCampaignList,
        onSuccess: (data, variables, context) => {
            option?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables, context: unknown) => {
            option?.onError?.(error, variables, context);
        }
    });
}

// 스킬 할당 상담사 리스트 조회 요청을 위한 hook
export function useApiForSkillAgentList (
    option?: UseMutationOptions<SkillAgentListResponse, ApiError, unknown>
) {
    return useMutation({
        mutationKey: ['skillAgentList'],
        mutationFn: fetchSkillAgentList,
        onSuccess: (data, variables, context) => {
            option?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables, context: unknown) => {
            option?.onError?.(error, variables, context);
        }
    });
}

// 캠페인 정보 조회 요청을 위한 hook
export function useApiForCampaignList(
    option?: UseMutationOptions<CampaignListResponse, ApiError, unknown>
) {
    return useMutation({
        mutationKey: ['fetchCampaignList'],
        mutationFn: fetchCampaignList,
        onSuccess: (data, variables, context) => {
            option?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables, context: unknown) => {
            option?.onError?.(error, variables, context);
        }
    });
}

// 선택 상담사 스킬할당 해제를 위한 hook
export function useApiForDeleteAgentSkill (
    option?: UseMutationOptions<SuccesResponse, ApiError, DeleteAgentSkillCredentials>
) {
    return useMutation({
        mutationKey: ['deleteAgentSkill'],
        mutationFn: DeleteAgentSkill,
        onSuccess: (data, variables, context) => {
            option?.onSuccess?.(data, variables, context);
        },
        onError: (error: ApiError, variables: DeleteAgentSkillCredentials, context: unknown) => {
            option?.onError?.(error, variables, context);
        }
    })
}

// 캠페인 스킬 수정 요청을 위한 hook
export function useApiForCampaignSkillUpdate(
  options?: UseMutationOptions<SuccesResponse, ApiError, CampaignSkillUpdateRequest>
) {
  return useMutation({
    mutationKey: ['campaignSkillUpdate'],
    mutationFn: fetchCampaignSkillUpdate,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: ApiError, variables: CampaignSkillUpdateRequest, context: unknown) => {
      options?.onError?.(error, variables, context);
    },
  });
}

// 캠페인 스킬 조회 요청을 위한 hook
export function useApiForCampaignSkill(
  options?: UseMutationOptions<CampaignSkillListResponse, ApiError, unknown>
) {
  return useMutation({
    mutationKey: ['mainCampaignSkills'],
    mutationFn: fetchCampaignSkills,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: ApiError, variables, context: unknown) => {
      options?.onError?.(error, variables, context);
    },
  });
}