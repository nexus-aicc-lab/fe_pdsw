// src/features/campaignManager/api/mainCampaignProgressInformation.ts
import { axiosRedisInstance } from '@/lib/axios';
import { CampaignProgressInformationRequest, CampaignProgressInformationResponse } from '../types/monitoringIndex';

// 캠페인진행정보 요청
export const fetchCampaignProgressInformation = async (credentials: CampaignProgressInformationRequest): Promise<CampaignProgressInformationResponse> => {

  try {
    const { data } = await axiosRedisInstance.get<CampaignProgressInformationResponse>(
      `/monitor/tenant/${credentials.tenantId}/campaign/${credentials.campaignId}/statistics`
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};