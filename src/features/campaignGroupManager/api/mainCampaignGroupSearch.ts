// src/features/campaignGroupManager/api/mainCampaignGroupSearch.ts
import { axiosInstance } from '@/lib/axios';

// 캠페인 그룹 조회 응답 데이터 타입
interface CampaignGroupSearchResponseDataType {
  tenant_id: number;
  group_id: number;
  group_name: string;
}

// 캠페인 그룹 조회 응답
export interface CampaignGroupSearchResponse {
  result_code: number;
  result_msg: string;
  result_data: CampaignGroupSearchResponseDataType[];
}

// 캠페인 그룹 조회 요청
export const fetchCampaignGroupSearch = async (): Promise<CampaignGroupSearchResponse> => {
    const campaignGroupRequestData = {
        sort: {
          group_id: 0,
        },
    };

  try {
    const { data } = await axiosInstance.post<CampaignGroupSearchResponse>(
      '/collections/campaign-group', 
      campaignGroupRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};