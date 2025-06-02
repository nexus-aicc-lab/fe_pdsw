// src/features/auth/api/fetchSkills.ts
import { axiosInstance } from '@/lib/axios';
import { SkillListCredentials, CampaignScheDuleListResponse } from '../types/campaignManagerIndex';

// 캠페인스케줄 리스트 요청
export const fetchSchedules = async (credentials: SkillListCredentials): Promise<CampaignScheDuleListResponse> => {
  const campaignScheduleInfoSearchRequestData = {
    filter: {      
      tenant_id: credentials.tenant_id_array
    },
    sort: {
      tenant_id: 0,
      campaign_id: 0,
    },
  };

  try {
    const { data } = await axiosInstance.post<CampaignScheDuleListResponse>(
      '/collections/campaign-schedule', 
      campaignScheduleInfoSearchRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};