// src/features/campaignManager/hooks/fetchCampaignScheduleDelete.ts
import { axiosInstance } from '@/lib/axios';
import { CampaignInfoDeleteRequest, UpdateResponse } from '../types/campaignManagerIndex';

// 캠페인 스케줄 삭제 요청
export const fetchCampaignScheduleDelete = async (credentials: CampaignInfoDeleteRequest): Promise<UpdateResponse> => {
  console.log("tenant_id ???????????????????????????", credentials.tenant_id);
  const campaignScheduleDeleteRequestData = {
    request_data: {      
      tenant_id: credentials.tenant_id
    }
  };

  try {
    const { data } = await axiosInstance.delete<UpdateResponse>(
      'campaigns/'+credentials.campaign_id+'/schedule', 
      {
        headers: {
          'Content-Type': 'application/json' 
        },
        data: campaignScheduleDeleteRequestData 
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