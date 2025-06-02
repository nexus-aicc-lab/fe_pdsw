// src/features/campaignManager/api/mainCampaignSkillUpdate.ts
import { axiosInstance } from '@/lib/axios';
import { CampaignSkillUpdateRequest, UpdateResponse } from '../types/campaignManagerIndex';

// 캠페인 스킬 수정 요청
export const fetchCampaignSkillUpdate = async (credentials: CampaignSkillUpdateRequest): Promise<UpdateResponse> => {
  const campaignSkillListSearchRequestData = {
    request_data: {      
      skill_id: credentials.skill_id, 
    }
  };

  try {
    const { data } = await axiosInstance.put<UpdateResponse>(
      'campaigns/'+credentials.campaign_id+'/skill', 
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