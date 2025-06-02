// src/features/campaignManager/hooks/fetchCallingListDelete.ts
import { axiosInstance } from '@/lib/axios';
import { DeleteResponse } from '../types/listManagerIndex';

interface DeleteRequest {
  request_data: {
    list_flag: "L";
  };
}

// 발신리스트 업로드 취소 요청 (DELETE -> POST, body 추가)
// 0507 발신리스트 업로드 취소 요청 변경 (POST => DELETE body 삭제)
export const fetchCallingListDelete = async (campaignId: number): Promise<DeleteResponse> => {
  const requestData: DeleteRequest = {
    request_data: {
      list_flag: "L",
    },
  };

  try {
    const { data } = await axiosInstance.post<DeleteResponse>(
      `campaigns/${campaignId}/calling-list`
      , requestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(
      error.response?.data?.result_code +
        '||' +
        error.response?.data?.result_msg || '데이터 가져오기 실패'
    );
  }
};