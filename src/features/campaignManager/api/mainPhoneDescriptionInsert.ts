import { PhoneDescriptionListDataResponse, UpdateResponse } from "../types/campaignManagerIndex";
import { axiosInstance } from "@/lib/axios";

export const fetchPhoneDescriptionInsert = async (credentials: PhoneDescriptionListDataResponse): Promise<UpdateResponse> => {
    const PhoneDescriptionInsertRequestData = {
        request_data: {
            description_id: credentials.description_id,
            description: credentials.description,
        }
    };

    try {
        const { data } = await axiosInstance.post<UpdateResponse>(
            '/phone-description',
            PhoneDescriptionInsertRequestData
        );
        return data;
    } catch (error: any) {
        if(error.response?.status === 401) {
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
}