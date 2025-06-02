// src/features/campaignManager/hooks/fetchCallingNumberUpdate.ts
import { axiosInstance } from '@/lib/axios';
import { OperatingTimesDataRequest,SuccesResponse } from "../hooks/useApiForOperatingTimeUpdate";

// 캠페인 발신번호 수정 요청
export const fetchOperatingTimeUpdate = async (credentials: OperatingTimesDataRequest): Promise<SuccesResponse> => {
  const operatingTimeUpdateRequestData = {
    request_data: {      
      start_time: credentials.start_time,
      end_time: credentials.end_time,
      days_of_week: credentials.days_of_week
    }
  };

  try {
    const { data } = await axiosInstance.put<SuccesResponse>(
      '/operating-time', 
      operatingTimeUpdateRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};