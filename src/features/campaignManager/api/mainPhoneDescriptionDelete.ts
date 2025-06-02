import { axiosInstance } from "@/lib/axios";
import { UpdateResponse } from "../types/campaignManagerIndex";

// 전화번호설명 템플릿 삭제
export const fetchPhoneDescriptionDelete = async (description_id: number): Promise<UpdateResponse> => {
    const request_data = {
        request_data: { description_id }
    };

    try {
        const {data} = await axiosInstance.delete<UpdateResponse>(
            'phone-description',
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                data: request_data
            }
        );
        return data;
  } catch (error: any) {
        if (error.response?.status === 401) {
        throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};