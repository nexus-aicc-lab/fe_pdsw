// src/features/campaignManager/api/mainCampaignHistory.ts
import { axiosInstance } from '@/lib/axios';
import { CampaignHistoryRequest, CampaignHistoryResponse } from '../types/monitoringIndex';

// 캠페인 운영 이력 조회 요청
export const fetchCampaignHistory = async (credentials: CampaignHistoryRequest): Promise<CampaignHistoryResponse> => {
  const campaignHistoryRequestData = {
    filter: {      
      campaign_id: credentials.campaign_id, 
      dial_kind: credentials.dial_kind
    },
    sort: {
      campaign_sequence: 0,
    },
  };

  try {
    const { data } = await axiosInstance.post<CampaignHistoryResponse>(
      '/collections/campaign-history', 
      campaignHistoryRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};