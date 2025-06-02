// src/features/campaignManager/hooks/fetchCallingListInsert.ts
import { axiosInstance } from '@/lib/axios';
import { CallingListInsertRequest, CallingListInsertResponse } from '../types/listManagerIndex';

// 발신 리스트 추가 요청
export const fetchCallingListInsert = async (credentials: CallingListInsertRequest): Promise<CallingListInsertResponse> => {
  const callingListInsertRequestData = {
    request_data: {  
      list_flag: credentials.list_flag,
      list: [      
        ...credentials.calling_list.map((item) => ({
          customer_key: item.customer_key,
          sequence_number: item.sequence_number,
          customer_name: item.customer_name,
          phone_number1: item.phone_number1,
          phone_number2: item.phone_number2,
          phone_number3: item.phone_number3,
          phone_number4: item.phone_number4,
          phone_number5: item.phone_number5,
          reserved_time: item.reserved_time,
          token_data: item.token_data
        }))
      ]
    }
  };

  try {
    const { data } = await axiosInstance.post<CallingListInsertResponse>(
      'campaigns/'+credentials.campaign_id+'/calling-list', 
      callingListInsertRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};