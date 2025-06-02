// src/features/campaignManager/api/apiForCampaignAssignmentAgentList.ts
import { axiosRedisInstance } from "@/lib/axios";
import { CampaignAssignmentAgentCredentials, CampaignAssignmentAgentListResponse, apiUrl } from '../types/campaignManagerIndex';
import { getCookie } from '@/lib/cookies';

export const fetchCampaignAssignmentAgents = async (credentials: CampaignAssignmentAgentCredentials): Promise<CampaignAssignmentAgentListResponse> => {
  const campaignAssignmentAgentInfoSearchRequestData = {
    tenantId: credentials.tenantId,
    campaignId: credentials.campaignId,
    sessionKey: getCookie('session_key')
  };

  try {
    const { data } = await axiosRedisInstance.post<CampaignAssignmentAgentListResponse>(
      apiUrl+`/counselorInfo`, 
      campaignAssignmentAgentInfoSearchRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};