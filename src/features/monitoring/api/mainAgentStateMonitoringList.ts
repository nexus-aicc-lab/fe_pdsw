// src/features/campaignManager/api/apiForCampaignAssignmentAgentList.ts
import { axiosRedisInstance } from "@/lib/axios";
import { getCookie } from '@/lib/cookies';

// 상담사 상태 모니터링 요청 
export interface AgentStatusMonitoringRequest {
  centerId: string;
  tenantId: string;
  campaignId: number;
  agentIds?: string[];  
}

// 상담사 상태 모니터링 데이터 타입
interface AgentStateMonitoringListDataResponse {
  counselorId: string;
  counselorName: string;
  statusCode: string;
  statusTime: string;
}

// 상담사 상태 모니터링 응답 
export interface AgentStateMonitoringListResponse {
  code: number;
  message: string;
  counselorStatusList: AgentStateMonitoringListDataResponse[];
}

// export interface IRequestTypeForFetchConsultantStatusMonitorData {
//   centerId: string;
//   tenantId: number;
//   campaignId: number;
//   sessionKey: string;
// }

export const fetchAgentStateMonitoringList = async (credentials: AgentStatusMonitoringRequest): Promise<AgentStateMonitoringListResponse> => {
  const agentStateMonitoringListRequestData = {
    centerId: credentials.centerId,
    tenantId: credentials.tenantId,
    campaignId: credentials.campaignId,
    sessionKey: getCookie('session_key'),
    agentIds: credentials.agentIds || []
  };

  try {
    const { data } = await axiosRedisInstance.post<AgentStateMonitoringListResponse>(
      `/counselor/state`, 
      agentStateMonitoringListRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};


// export const fetchConsultantStatusMonitorData = async (credentials: IRequestTypeForFetchConsultantStatusMonitorData): Promise<AgentStateMonitoringListResponse> => {
//   const agentStateMonitoringListRequestData = {
//     centerId: credentials.centerId,
//     tenantId: credentials.tenantId,
//     campaignId: credentials.campaignId,
//     sessionKey: credentials.sessionKey
//   };

//   try {
//     const { data } = await axiosRedisInstance.post<AgentStateMonitoringListResponse>(
//       `/counselor/state`, 
//       agentStateMonitoringListRequestData
//     );
//     return data;
//   } catch (error: any) {
//     if (error.response?.status === 401) {
//       throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
//     }
//     throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
//   }
// };
