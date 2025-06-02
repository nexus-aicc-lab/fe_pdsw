// src/features/campaignManager/api/mainCallingNumberInfoSearch.ts
import { axiosInstance } from '@/lib/axios';
import { CampaignCredentials, CallingNumberListResponse } from '../types/campaignManagerIndex';

// 캠페인발신번호 리스트 요청
export const fetchCallingNumbers = async (credentials: CampaignCredentials): Promise<CallingNumberListResponse> => {
  const callingNumberListSearchRequestData = {
    sort: {
      campaign_id: 0,
    },
  };

  try {
    const { data } = await axiosInstance.post<CallingNumberListResponse>(
      '/collections/campaign-calling-number', 
      callingNumberListSearchRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};