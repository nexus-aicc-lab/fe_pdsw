import { axiosRedisInstance } from "@/lib/axios";
import { CounselorAssignListCredentials, CounselorAssignListResponse } from "../types/SystemPreferences";
import { getCookie } from "@/lib/cookies";


// 스킬 할당 상담사 목록 가져오기
export const fetchCounselorAssignList = async (credentials: CounselorAssignListCredentials): Promise<CounselorAssignListResponse> => {
  const counselorAssignListRequestData = {
    tenantId: credentials.tenantId,
    skillId: credentials.skillId,
    sessionKey: getCookie('session_key')
  };

  try {
    const { data } = await axiosRedisInstance.post<CounselorAssignListResponse>(
      '/counselor/sillAssigned/list',
      counselorAssignListRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};