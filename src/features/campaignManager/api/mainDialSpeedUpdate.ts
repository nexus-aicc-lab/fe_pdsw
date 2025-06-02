// src/features/campaignManager/hooks/fetchDialSpeedUpdate.ts
import { axiosInstance } from '@/lib/axios';
import { CampaignDialSpeedUpdateRequest, UpdateResponse } from '../types/campaignManagerIndex';

// 캠페인 발신 속도 수정 요청
export const fetchDialSpeedUpdate = async (credentials: CampaignDialSpeedUpdateRequest): Promise<UpdateResponse> => {
  const campaignDialSpeedUpdateRequestData = {
    request_data: {      
      tenant_id: credentials.tenant_id,
      dial_speed: credentials.dial_speed
    }
  };

  try {
    const { data } = await axiosInstance.put<UpdateResponse>(
      'campaigns/'+credentials.campaign_id+'/dial-speed', 
      campaignDialSpeedUpdateRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};