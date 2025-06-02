// src/features/campaignManager/api/mainCampaignRedialPreviewSearch.ts
import { axiosInstance } from '@/lib/axios';
import { CampaignRedialPreviewSearchDataRequest, CampaignRedialPreviewSearchResponse } from '../types/rebroadcastSettingsPanelIndex';

// 캠페인 재발신 미리보기 요청
export const fetchCampaignRedialPreviewSearch = async (credentials: CampaignRedialPreviewSearchDataRequest): Promise<CampaignRedialPreviewSearchResponse> => {
  const campaignRedialPreviewSearchRequestData = {
    request_data: {      
      campaign_id: credentials.campaign_id,   
      condition:  credentials.condition
    }
  };

  try {
    const { data } = await axiosInstance.post<CampaignRedialPreviewSearchResponse>(
      '/collections/campaign-redial-preview', 
      campaignRedialPreviewSearchRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};