import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ApiError, SuccesResponse } from "../types/SystemPreferences";
import { createChannelGroup, deleteChannelGroup, fetchChannelGroupList, UpdateChannelGroup } from "../api/apiForChannelGroupList";


// 캠페인 운용 가능 시간 조회 응답 데이터 타입
export interface ChannelGroupListDataResponse {
    group_id: number;
    group_name: string;
  }
  
// 캠페인 운용 가능 시간 조회 응답 타입
export interface ChannelGroupListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: ChannelGroupListDataResponse[];
}

// 채널 그룹 리스트 조회하기
export function useApiForChannelGroupList(
  options?: UseMutationOptions<ChannelGroupListResponse, ApiError, void>
) {
  return useMutation({
    mutationKey: ['channelGroupList'],
    mutationFn: fetchChannelGroupList,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: ApiError, variables: void, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}

export interface ChannelGroupCreateRequest {
  group_id: number;
  group_name?: string;
}


// 채널 그룹 신규 등록을 위한 hook
export function useApiForChannelGroupCreate(
  options?: UseMutationOptions<SuccesResponse, ApiError, ChannelGroupCreateRequest>
) {
  return useMutation({
    mutationKey: ['channelGroupCreate'],
    mutationFn: createChannelGroup,  
    ...options
  });
}
  
// 수정을 위한 hook
export function useApiForChannelGroupUpdate(
  options?: UseMutationOptions<SuccesResponse, ApiError, ChannelGroupCreateRequest>
) {
  return useMutation({
    mutationKey: ['channelGroupUpdate'],
    mutationFn: UpdateChannelGroup,  
    ...options
  });
}

// 삭제를 위한 hook
export function useApiForChannelGroupDelete(
  options?: UseMutationOptions<SuccesResponse, ApiError, ChannelGroupCreateRequest>
) {
  return useMutation({
    mutationKey: ['channelGroupDelete'],
    mutationFn: deleteChannelGroup, 
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: ApiError, variables: ChannelGroupCreateRequest, context: unknown) => {
        options?.onError?.(error, variables, context);
    }
  });
}