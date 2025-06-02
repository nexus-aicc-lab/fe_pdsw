// src/features/campaignManager/hooks/fetchCampaignStatusUpdate.ts
import { axiosInstance } from '@/lib/axios';
import { CampaignStatusDataRequest, CampaignStatusResponse } from '../types/campaignManagerIndex';

// 캠페인 상태 변경 요청
export const fetchCampaignStatusUpdate = async (credentials: CampaignStatusDataRequest): Promise<CampaignStatusResponse> => {
  const campaignStatusUpdateRequestData = {
    request_data: {      
      campaign_status: credentials.campaign_status
    }
  };

  try {
    const { data } = await axiosInstance.put<CampaignStatusResponse>(
      'campaigns/'+credentials.campaign_id+'/status', 
      campaignStatusUpdateRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};