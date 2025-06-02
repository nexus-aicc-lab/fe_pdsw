// src/features/campaignManager/hooks/fetchCallingListDelete.ts
import { axiosInstance } from '@/lib/axios';
import { DeleteResponse,CampaignGroupCampaignListDeleteDataRequest } from '../types/campaignGroupManagerIndex';

// 캠페인 그룹 소속 캠페인 삭제 요청
export const fetchCampaignGroupCampaignListDelete = async (credentials: CampaignGroupCampaignListDeleteDataRequest): Promise<DeleteResponse> => {
  const campaignGroupCampaignListRequestData = {
    request_data: {
      tenant_id: credentials.tenant_id,
      campaign_id: credentials.campaign_id
    }
  };
    
  try {
    const { data } = await axiosInstance.delete<DeleteResponse>(
      'campaign-group/' + credentials.group_id + '/list',
      {
        headers: {
          'Content-Type': 'application/json' 
        },
        data: campaignGroupCampaignListRequestData 
      }
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};