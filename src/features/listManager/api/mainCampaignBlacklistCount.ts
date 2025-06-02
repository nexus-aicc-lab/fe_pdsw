// src/features/campaignManager/api/mainCampaignHistory.ts
import { axiosInstance } from '@/lib/axios';
import { CampaignBlacklistCountResponse } from '../types/listManagerIndex';

// 캠페인 블랙 리스트 건 수 조회 요청
export const fetchCampaignBlacklistCount = async (credentials: number): Promise<CampaignBlacklistCountResponse> => {
  const campaignBlacklistCountRequestData = {
    request_data: {      
      campaign_id: credentials
    },
  };

  try {
    const { data } = await axiosInstance.post<CampaignBlacklistCountResponse>(
      '/collections/campaign-blacklist-count', 
      campaignBlacklistCountRequestData
    );

    console.log("블랙 리스트 카운트 조회 api 응답 : ", data);
    

    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};

// 블랙 리스트 최대치 조회
// pds/collections/campaign-blacklist-max
// apiForGetCampaignMaximumBlacklistCount

// request:
// 없음

// reponse:
// ```
// {
//     "result_code": 0,
//     "result_msg": "Success",
//     "result_data": {
//         "max_count": 100000
//     }
// }
// ```