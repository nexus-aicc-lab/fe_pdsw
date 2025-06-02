// src/features/campaignGroupManager/api/mainCampaignGroupCreate.ts
import { axiosInstance } from '@/lib/axios';
import { DeleteResponse, CampaignGroupCreateDataRequest } from '../types/campaignGroupManagerIndex';

// 캠페인 그룹 추가 요청
export const fetchCampaignGroupCreate = async (credentials: CampaignGroupCreateDataRequest): Promise<DeleteResponse> => {
    const campaignGroupCreateRequestData = {
      request_data: {
          tenant_id: credentials.tenant_id,
          group_name: credentials.group_name,
      },
    };

  try {
    const { data } = await axiosInstance.post<DeleteResponse>(
      `campaign-groups/${credentials.group_id}`,
      campaignGroupCreateRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};