// src/features/campaignManager/hooks/fetchReservedCallDelete.ts
import { axiosInstance } from '@/lib/axios';
import { CampaignInfoDeleteRequest, UpdateResponse } from '../types/campaignManagerIndex';

// 캠페인 예약호 마스터 정보 삭제 요청
export const fetchReservedCallDelete = async (credentials: CampaignInfoDeleteRequest): Promise<UpdateResponse> => {
  const campaignReservedCallDeleteRequestData = {
    request_data: {      
      tenant_id: credentials.tenant_id
    }
  };
  
  try {
    const { data } = await axiosInstance.delete<UpdateResponse>(
      'campaigns/' + credentials.campaign_id + '/reserved-call',
      {
        headers: {
          'Content-Type': 'application/json' 
        },
        data: campaignReservedCallDeleteRequestData 
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