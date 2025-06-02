// src/features/campaignManager/hooks/fetchAutoRedialDelete.ts
import { axiosInstance } from '@/lib/axios';
import { AutoRedialDataRequest, UpdateResponse } from '../types/campaignManagerIndex';

// 캠페인 재발신 스케줄링 정보 삭제 요청
export const fetchAutoRedialDelete = async (credentials: AutoRedialDataRequest): Promise<UpdateResponse> => {
  const campaignAutoRedialRequestData = {
    request_data: {      
      sequence_number: credentials.sequence_number
    }
  };
  
  try {
    const { data } = await axiosInstance.delete<UpdateResponse>(
      'campaigns/' + credentials.campaign_id + '/scheduled-redial',
      {
        headers: {
          'Content-Type': 'application/json' 
        },
        data: campaignAutoRedialRequestData 
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