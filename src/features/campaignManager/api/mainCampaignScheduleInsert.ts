// src/features/campaignManager/hooks/fetchCampaignScheduleInsert.ts
import { axiosInstance } from '@/lib/axios';
import { CampaignScheDuleListDataResponse, UpdateResponse } from '../types/campaignManagerIndex';

// 캠페인 스케줄 등록 요청
export const fetchCampaignScheduleInsert = async (credentials: CampaignScheDuleListDataResponse): Promise<UpdateResponse> => {
  const campaignScheduleInsertRequestData = {
    request_data: {      
      tenant_id: credentials.tenant_id, 
      start_date: credentials.start_date,
      end_date: credentials.end_date,
      start_time: credentials.start_time,
      end_time: credentials.end_time
    }
  };

  try {
    const { data } = await axiosInstance.post<UpdateResponse>(
      'campaigns/'+credentials.campaign_id+'/schedule', 
      campaignScheduleInsertRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};