// src/features/campaignManager/hooks/fetchCampaignManagerUpdate.ts
import { axiosInstance } from '@/lib/axios';
import { CampaignCredentials, CampaignSkillListResponse } from '../types/campaignManagerIndex';

// 캠페인발스킬 리스트 요청
export const fetchCampaignSkills = async (credentials: CampaignCredentials): Promise<CampaignSkillListResponse> => {
  const campaignSkillListSearchRequestData = {
    sort: {
      campaign_id: 0,
    },
  };

  try {
    const { data } = await axiosInstance.post<CampaignSkillListResponse>(
      '/collections/campaign-skill', 
      campaignSkillListSearchRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};