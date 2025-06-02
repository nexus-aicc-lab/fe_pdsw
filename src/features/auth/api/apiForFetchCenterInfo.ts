import { axiosRedisInstance } from "@/lib/axios";
import { CenterInfoDataResponse } from "../types/mainIndex";





// 센터 정보 가져오기
export const fetchCenterInfo = async() => {
  
  try {
    const { data } = await axiosRedisInstance.get<CenterInfoDataResponse>(
      '/auth/centerInfo',
      
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};