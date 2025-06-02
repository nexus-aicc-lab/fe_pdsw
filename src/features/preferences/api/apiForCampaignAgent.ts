import { CampaignAgentListCredentials, CampaignAgentListResponse } from "../types/SystemPreferences";
import { axiosInstance } from "@/lib/axios";

// 캠페인 소속 상담사 조회 API
export const fetchCampaignAgentList = async (credentials: CampaignAgentListCredentials): Promise<CampaignAgentListResponse> => {
    const campaignAgentListRequestData = {
        filter: {
            campaign_id: credentials.campaign_id
        }
    };

    try {
        const { data } = await axiosInstance.post<CampaignAgentListResponse>(
          '/collections/campaign-agent', 
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