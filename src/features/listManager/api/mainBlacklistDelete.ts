// src/features/campaignManager/hooks/fetchBlacklistDelete.ts
import { axiosInstance } from '@/lib/axios';
import { DeleteResponse } from '../types/listManagerIndex';

// 블랙리스트 업로드 취소 요청
export const fetchBlacklistDelete = async (credentials: number): Promise<DeleteResponse> => {
    
  try {
    const { data } = await axiosInstance.delete<DeleteResponse>(
      'campaigns/' + credentials + '/black-list',
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