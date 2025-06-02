import { axiosInstance } from "@/lib/axios";
import { ChannelGroupCreateRequest, ChannelGroupListResponse } from "../hooks/useApiForChannelGroup";
import { SuccesResponse } from "../types/SystemPreferences";


export const fetchChannelGroupList = async (): Promise<ChannelGroupListResponse> => {

    try {
        const channelGroupListRequestData = {

            sort: {
                group_id: 0
            },

        };

        const { data } = await axiosInstance.post<ChannelGroupListResponse>(
            '/collections/channel-group',
            channelGroupListRequestData
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
};



// 신규 등록 API (POST)
export const createChannelGroup = async (credentials: ChannelGroupCreateRequest): Promise<SuccesResponse> => {
    const requestData = {
        request_data: {
            group_id: credentials.group_id,
            group_name: credentials.group_name,
        }
    };

    try {
        const { data } = await axiosInstance.post<SuccesResponse>(
            'channel-group',
            requestData
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
};

// 수정 API (PUT)
export const UpdateChannelGroup = async (credentials: ChannelGroupCreateRequest): Promise<SuccesResponse> => {
    const requestData = {
        request_data: {
            group_id: credentials.group_id,
            group_name: credentials.group_name,
        }
    };

    try {
        const { data } = await axiosInstance.put<SuccesResponse>(
            'channel-group',
            requestData
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
};

// 삭제 API (DELETE)
export const deleteChannelGroup = async (credentials: ChannelGroupCreateRequest): Promise<SuccesResponse> => {
    const requestData = {
        request_data: {
            group_id: credentials.group_id
        }
    };
    try {
        const { data } = await axiosInstance.delete<SuccesResponse>(
            '/channel-group',
            { data: requestData }
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
};