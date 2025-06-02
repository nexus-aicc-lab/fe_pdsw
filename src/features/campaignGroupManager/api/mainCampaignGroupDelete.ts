// src/features/campaignManager/hooks/fetchCallingListDelete.ts
import { axiosInstance } from '@/lib/axios';
import { DeleteResponse } from '../types/campaignGroupManagerIndex';

// 캠페인 그룹 삭제 요청
export const fetchCampaignGroupDelete = async (credentials: number): Promise<DeleteResponse> => {
    
  try {
    const { data } = await axiosInstance.delete<DeleteResponse>(
      'campaign-groups/' + credentials,
      {
        headers: {
          'Content-Type': 'application/json' 
        },
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