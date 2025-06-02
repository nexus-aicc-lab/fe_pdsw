// src/features/campaignManager/hooks/fetchCampaignCurrentRedial.ts
import { axiosInstance } from '@/lib/axios';
import { CampaignRedialPreviewSearchDataRequest, CampaignCurrentRedialResponse } from '../types/rebroadcastSettingsPanelIndex';

// 캠페인 재발신 추출 요청
export const fetchCampaignCurrentRedial = async (credentials: CampaignRedialPreviewSearchDataRequest): Promise<CampaignCurrentRedialResponse> => {
  const campaignCurrentRedialRequestData = {
    request_data: {      
      condition: credentials.condition
    }
  };

  try {
    const { data } = await axiosInstance.put<CampaignCurrentRedialResponse>(
      'campaigns/'+credentials.campaign_id+'/current-redial', 
      campaignCurrentRedialRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};