// src/features/campaignManager/api/mainCampaignProgressInformation.ts
import { axiosRedisInstance } from '@/lib/axios';
import { CallProgressStatusRequest, CallProgressStatusResponse } from '../types/monitoringIndex';
import { getCookie } from '@/lib/cookies';

// 발신진행상태 요청
export const fetchCallProgressStatus = async (credentials: CallProgressStatusRequest): Promise<CallProgressStatusResponse> => {
  const callProgressStatusRequestData = {
    tenantId: credentials.tenantId,
    campaignId: credentials.campaignId,
    sessionKey: getCookie('session_key')
  };

  try {
    const { data } = await axiosRedisInstance.post<CallProgressStatusResponse>(
      `/monitor/tenant/campaign/dial`,
      callProgressStatusRequestData 
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};