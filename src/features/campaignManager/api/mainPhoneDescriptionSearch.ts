// src/features/campaignManager/api/mainPhoneDescriptionSearch.ts
import { axiosInstance } from '@/lib/axios';
import { CampaignCredentials, PhoneDescriptionListResponse } from '../types/campaignManagerIndex';

// 전화번호설명 템플릿 조회 리스트 요청
export const fetchPhoneDescriptions = async (credentials: CampaignCredentials): Promise<PhoneDescriptionListResponse> => {
  const phoneDescriptionListSearchRequestData = {
    sort: {
      description_id: 0,
    },
  };

  try {
    const { data } = await axiosInstance.post<PhoneDescriptionListResponse>(
      '/collections/phone-description', 
      phoneDescriptionListSearchRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};