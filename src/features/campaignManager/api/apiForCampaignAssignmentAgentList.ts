// src/features/campaignManager/api/apiForCampaignAssignmentAgentList.ts
import { axiosRedisInstance } from "@/lib/axios";
import { apiUrl } from '../types/campaignManagerIndex';
import { getCookie } from '@/lib/cookies';

// 캠페인 할당상담사 요청 시 필요한 credentials 타입
export interface CampaignAssignmentAgentCredentials {
  centerId: string;
  tenantId: string;
  campaignId: string;
}

// 캠페인 할당상담사 데이터 타입
export interface CampaignAssignmentAgentListResponse {
  code: number;
  message: string;
  assignedCounselorList: CampaignAssignmentAgentListDataResponse[];
}

// 캠페인 할당상담사 데이터 타입
interface CampaignAssignmentAgentListDataResponse {
  affiliationGroupId: string;
  affiliationGroupName: string;
  affiliationTeamId: string;
  affiliationTeamName: string;
  counselorEmplNum: string;
  counselorId: string;
  counselorname: string;
}

export const fetchCampaignAssignmentAgents = async (credentials: CampaignAssignmentAgentCredentials): Promise<CampaignAssignmentAgentListResponse> => {
  const campaignAssignmentAgentInfoSearchRequestData = {
    centerId: credentials.centerId,
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