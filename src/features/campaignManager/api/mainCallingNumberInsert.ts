// src/features/campaignManager/hooks/fetchCallingNumberInsert.ts
import { axiosInstance } from '@/lib/axios';
import { CallingNumberListDataResponse, UpdateResponse } from '../types/campaignManagerIndex';

// 캠페인 발신번호 추가 요청
export const fetchCallingNumberInsert = async (credentials: CallingNumberListDataResponse): Promise<UpdateResponse> => {
  const campaignScheduleUpdateRequestData = {
    request_data: {      
      calling_number: credentials.calling_number
    }
  };

  try {
    const { data } = await axiosInstance.post<UpdateResponse>(
      'campaigns/'+credentials.campaign_id+'/calling-number', 
      campaignScheduleUpdateRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};