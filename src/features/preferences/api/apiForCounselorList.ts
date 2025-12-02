import { axiosRedisInstance } from "@/lib/axios";
import { getCookie } from "@/lib/cookies";

export interface CounselorAssignListCredentials {
  centerId: string;
  tenantId: number;
  skillId: number;
}

export interface CounselorAssignListResponse {
  result_data: any;
  code: string;
  message: string;
  skillAssignedCounselorList: SkillAssignedCounselorListItem[];
}

interface SkillAssignedCounselorListItem {
  affiliationGroupId: string; //상담사 소속그룹ID
  affiliationGroupName: string; //상담사 소속그룹명
  affiliationTeamId: string; // 상담사 팀아이디
  affiliationTeamName: string; // 상담사 팀이름
  counselorEmplNum: string; //상담사아이디
  counselorId: string; //상담사 로그인아이디
  counselorname: string; //상담사 이름
  blendKind: string; //블렌드 구분(인바운드: 1, 아웃바운드: 2, 블렌드: 3)
}

// 스킬 할당 상담사 목록 가져오기
export const fetchCounselorAssignList = async (credentials: CounselorAssignListCredentials): Promise<CounselorAssignListResponse> => {
  const counselorAssignListRequestData = {
    centerId: credentials.centerId,
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