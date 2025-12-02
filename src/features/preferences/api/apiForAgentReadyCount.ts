import { AgentReadyCountDataResponse } from "../types/SystemPreferences";
import { axiosInstance } from "@/lib/axios";

export interface CampaignAgentListCredentials {
  campaign_id: number[];
}

// 캠페인 대기 상담사 수 조회 API
export const fetchAgentReadyCount = async (credentials: CampaignAgentListCredentials): Promise<AgentReadyCountDataResponse> => {
    const campaignAgentListRequestData = {
        filter: {
            campaign_id: credentials.campaign_id
        }
    };

    try {
        const { data } = await axiosInstance.post<AgentReadyCountDataResponse>(
          '/collections/agent-ready-count', 
          campaignAgentListRequestData
        );
        return data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
      }
    };