// src/features/campaignManager/api/mainAllCampaignProgressInformation.ts
import { axiosRedisInstance } from '@/lib/axios';
import { AllCampaignProgressInformationRequest, CampaignProgressInformationResponse } from '../types/monitoringIndex';
import { getCookie } from '@/lib/cookies';

// 전체캠페인진행정보 요청
export const fetchAllCampaignProgressInformation = async (credentials: AllCampaignProgressInformationRequest): Promise<CampaignProgressInformationResponse> => {
  const callProgressStatusRequestData = {
    campaignList: credentials.campaignList || [],
    sessionKey: getCookie('session_key')
  };

  try {
    const { data } = await axiosRedisInstance.post<CampaignProgressInformationResponse>(
      `/monitor/tenant/campaign/statistics`,
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
