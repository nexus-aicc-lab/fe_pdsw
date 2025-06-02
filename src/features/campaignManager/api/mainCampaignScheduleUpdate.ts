// src/features/campaignManager/hooks/fetchCampaignScheduleUpdate.ts
import { axiosInstance } from '@/lib/axios';
import { CampaignScheDuleListDataResponse, UpdateResponse } from '../types/campaignManagerIndex';

// 캠페인 스케줄 수정 요청
export const fetchCampaignScheduleUpdate = async (credentials: CampaignScheDuleListDataResponse): Promise<UpdateResponse> => {
  const campaignScheduleUpdateRequestData = {
    request_data: {      
      tenant_id: credentials.tenant_id, 
      start_date: credentials.start_date,
      end_date: credentials.end_date,
      start_time: credentials.start_time,
      end_time: credentials.end_time
    }
  };

  try {
    const { data } = await axiosInstance.put<UpdateResponse>(
      'campaigns/'+credentials.campaign_id+'/schedule', 
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