// src/features/campaignManager/hooks/fetchBlacklistInsert.ts
import { axiosInstance } from '@/lib/axios';
import { CallingListInsertRequest, CallingListInsertResponse } from '../types/listManagerIndex';

// 블랙 리스트 추가 요청
export const fetchBlacklistInsert = async (credentials: CallingListInsertRequest): Promise<CallingListInsertResponse> => {
  const blacklistInsertRequestData = {
    request_data: {  
      list_flag: credentials.list_flag,
      list: [      
        ...credentials.calling_list.map((item) => ({
          customer_key: item.customer_key
        }))
      ]
    }
  };

  try {
    const { data } = await axiosInstance.post<CallingListInsertResponse>(
      'campaigns/'+credentials.campaign_id+'/black-list', 
      blacklistInsertRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};