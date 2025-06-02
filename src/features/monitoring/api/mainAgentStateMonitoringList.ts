// src/features/campaignManager/api/apiForCampaignAssignmentAgentList.ts
import { axiosRedisInstance } from "@/lib/axios";
import { AgentStatusMonitoringRequest, AgentStateMonitoringListResponse, IRequestTypeForFetchConsultantStatusMonitorData } from '../types/monitoringIndex';
import { getCookie } from '@/lib/cookies';

export const fetchAgentStateMonitoringList = async (credentials: AgentStatusMonitoringRequest): Promise<AgentStateMonitoringListResponse> => {
  const agentStateMonitoringListRequestData = {
    tenantId: credentials.tenantId,
    campaignId: credentials.campaignId,
    sessionKey: getCookie('session_key')
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


export const fetchConsultantStatusMonitorData = async (credentials: IRequestTypeForFetchConsultantStatusMonitorData): Promise<AgentStateMonitoringListResponse> => {
  const agentStateMonitoringListRequestData = {
    tenantId: credentials.tenantId,
    campaignId: credentials.campaignId,
    sessionKey: credentials.sessionKey
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
