import { axiosInstance } from "@/lib/axios";
import { PhoneDescriptionListDataResponse, UpdateResponse } from "../types/campaignManagerIndex";

//전화 번호별설명 템플릿 수정
export const fetchPhoneDescriptionUpdate = async (credentials: PhoneDescriptionListDataResponse): Promise<UpdateResponse> => {
    const PhoneDescriptionUpdateRequestData = {
        request_data: {
            description_id: credentials.description_id,
            description: credentials.description,
        }
    };

    try {
        const { data } = await axiosInstance.put<UpdateResponse>(
            '/phone-description',
            PhoneDescriptionUpdateRequestData
        );
        return data;
    } catch (error: any) {
        if(error.response?.status === 401) {
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
}