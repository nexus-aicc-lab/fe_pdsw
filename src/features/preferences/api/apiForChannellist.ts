import { axiosInstance } from "@/lib/axios";
import { ChannelListResponse } from "../types/SystemPreferences";

export const fetchChannelList = async (): Promise<ChannelListResponse> => {
    const channelListRequestData = {

        sort: {
            device_id: 0
        },

    };

    try {
        const { data } = await axiosInstance.post<ChannelListResponse>(
            '/collections/channel-assign',
            channelListRequestData
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
};