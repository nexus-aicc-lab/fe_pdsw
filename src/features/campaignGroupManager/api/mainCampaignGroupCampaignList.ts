// src/features/campaignGroupManager/api/mainCampaignGroupCampaignList.ts
import { axiosInstance } from '@/lib/axios';
import { CampaignGroupCampaignListResponse } from '../types/campaignGroupManagerIndex';

// 캠페인 그룹 소속 캠페인 조회 요청
export const fetchCampaignGroupCampaignList = async (): Promise<CampaignGroupCampaignListResponse> => {
    const campaignGroupCampaignListRequestData = {
        sort: {
          campaign_id: 0,
        },
    };

  try {
    const { data } = await axiosInstance.post<CampaignGroupCampaignListResponse>(
      '/collections/campaign-group-list', 
      campaignGroupCampaignListRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};