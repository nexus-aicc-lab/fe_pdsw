// src/features/campaignManager/hooks/fetchCampaignAutoRedialInsert.ts
import { axiosInstance } from '@/lib/axios';
import { CampaignAutoRedialInsertDataRequest, CampaignAutoRedialInsertResponse } from '../types/rebroadcastSettingsPanelIndex';

// 재발신 추가 요청
export const fetchCampaignAutoRedialInsert = async (credentials: CampaignAutoRedialInsertDataRequest): Promise<CampaignAutoRedialInsertResponse> => {
  const campaignAutoRedialInserRequestData = {
    request_data: {      
      sequence_number: credentials.sequence_number,
      start_date: credentials.start_date,
      redial_condition: credentials.redial_condition,
      run_flag: credentials.run_flag
    }
  };

  try {
    const { data } = await axiosInstance.post<CampaignAutoRedialInsertResponse>(
      'campaigns/'+credentials.campaign_id+'/scheduled-redial', 
      campaignAutoRedialInserRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};