// src/features/campaignManager/hooks/fetchCampaignManagerInsert.ts

import { axiosInstance } from '@/lib/axios';
import { CampaignInsertResponse } from '../types/campaignManagerIndex';
import { CampaignInfoInsertRequest } from '../hooks/useApiForCampaignManagerInsert'

// 캠페인 관리 등록 요청
export const fetchCampaignManagerInsert = async (data: CampaignInfoInsertRequest  ): Promise<CampaignInsertResponse> => {
  const requestPayload = {
    request_data: data
  };

  try {
    const response = await axiosInstance.post<CampaignInsertResponse>(
      `campaigns/${data.campaign_id}`,
      requestPayload
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};