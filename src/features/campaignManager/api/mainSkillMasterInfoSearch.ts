// src/features/auth/api/fetchSkills.ts
import { axiosInstance } from '@/lib/axios';
import { SkillListCredentials, SkillListResponse } from '../types/campaignManagerIndex';
import { useSessionCheckStore } from '@/store/sessionCheckStore';

// 스킬마스터정보조회 리스트 요청
export const fetchSkills = async (credentials: SkillListCredentials): Promise<SkillListResponse> => {
  // console.log("credentials ?????????????????????????? ", credentials);
  
  
  const skillMasterInfoSearchRequestData = {
    filter: {        
      tenant_id: credentials.tenant_id_array[0]
    },
    sort: {
      skill_id: 0,
      tenant_id: credentials.tenant_id_array[0],
    },
  };
  
  try {
    const { data } = await axiosInstance.post<SkillListResponse>(
      '/collections/skill', 
      skillMasterInfoSearchRequestData
    );
    return data;
  } catch (error: any) {
    
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    // bad request 즉, 세션 만료후에 이전 세션키로 api 호출시 발생하는 에러처리
    if (error.response?.status === 400 && error.response?.data?.result_code === 5) {  
      // 에러 정보를 store에 저장
      const setSessionError = useSessionCheckStore.getState().setSessionError;
      const setResultMsg = useSessionCheckStore.getState().setResultMsg;
      const setResultCode = useSessionCheckStore.getState().setResultCode;
      
      setSessionError(true);
      setResultMsg(error.response?.data?.result_msg);
      setResultCode(error.response?.data?.result_code);
    } // end of if

    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};