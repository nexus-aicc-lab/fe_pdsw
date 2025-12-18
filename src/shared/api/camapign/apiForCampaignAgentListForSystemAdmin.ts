import { axiosInstance } from "@/lib/axios";

//  캠페인 소속 상담사 항목 타입
export interface CampaignAgentItemForSystemAdmin {
  campaign_id: number;
  agent_id: number[];
}

//  요청 타입
export interface IRequestTypeForCampaignAgentListForSystemAdmin {
  filter: {
    campaign_id?: number[];
  };
}

//  응답 타입
export interface IResponseTypeForCampaignAgentListForSystemAdmin {
  result_code: number;
  result_msg: string;
  result_count?: number;
  result_data: CampaignAgentItemForSystemAdmin[];
}

//  기본 요청 값
const defaultRequest: IRequestTypeForCampaignAgentListForSystemAdmin = {
  filter: {
    campaign_id: []
  }
};

//  API 호출 함수
export const apiForCampaignAgentListForSystemAdmin = async (
  request: Partial<IRequestTypeForCampaignAgentListForSystemAdmin> = {}
): Promise<IResponseTypeForCampaignAgentListForSystemAdmin> => {
  const finalRequest: IRequestTypeForCampaignAgentListForSystemAdmin = {
    ...defaultRequest,
    ...request,
    filter: {
      ...defaultRequest.filter,
      ...request.filter,
    },
  };

  const response = await axiosInstance.post<IResponseTypeForCampaignAgentListForSystemAdmin>(
    "collections/campaign-agent",
    finalRequest
  );

  return response.data;
};