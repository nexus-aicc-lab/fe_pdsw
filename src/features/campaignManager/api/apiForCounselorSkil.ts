// src/features/campaignManager/api/apiForCounselorSkill.ts
import { axiosInstance } from "@/lib/axios";
import {
  CounselorSkillApiError,
  CounselorSkillAssignmentRequest,
  CounselorSkillAssignmentResponse,
  CounselorSkillListResponse,
  CounselorSkillRequestData
} from "../types/typeForCounselorSkill";
import { customAlertService } from "@/components/shared/layout/utils/CustomAlertService";

/**
 * 상담사에게 선택한 스킬들을 할당하는 API
 * @param counselorIds 상담사 ID 배열 (여러 명 가능)
 * @param selectedSkills 선택한 스킬 ID 배열
 * @returns 각 요청의 응답 결과 배열
 */
export async function assignSkillsToCounselor(
  counselorIds: string[],
  selectedSkills: number[]
): Promise<CounselorSkillAssignmentResponse[]> {
  
  const requests = selectedSkills.map((skillId) =>
    axiosInstance.put<CounselorSkillAssignmentResponse>(
      `skills/${skillId}/agent-list`,
      {
        request_data: {
          agent_id: counselorIds,
        } as CounselorSkillAssignmentRequest["request_data"],
      }
    ).then((response) => response.data)
  );

  return Promise.all(requests);
}

/**
 * 상담사에게 할당 가능한 스킬 목록을 조회하는 API
 * @param tenantId 테넌트 ID
 * @returns 할당 가능한 스킬 목록
 */
export const getAssignableSkillsForCounselor = async (tenantId: number): Promise<CounselorSkillListResponse> => {

  // console.log(" 상담사 할당 가능 스킬 목록 조회 시작:", tenantId);
  // console.log(" 테넌트 ID 타입:", typeof tenantId);
  // console.log(" 테넌트 ID for 캠페인 탭 헤더 :", tenantId);

  const skillRequestData: CounselorSkillRequestData = {
    filter: {
      // skill_id: { start: 1, end: 9999 },
      // tenant_id: [tenantId],
      tenant_id: tenantId !== 0 ? [tenantId] : undefined,
    },
    // sort: {
    //   skill_id: 0,
    //   tenant_id: 0,
    // },
    // page: {
    //   index: 1,
    //   items: 10
    // },
    sort: {
      skill_id: 1,
      tenant_id: 10
    }
  };

  try {
    const { data } = await axiosInstance.post<CounselorSkillListResponse>(
      "collections/skill",
      skillRequestData
    );
    // console.log(" 상담사 할당 가능 스킬 목록 조회 성공 ???????????????????????????? ", data);

    return data;

    // if (data.result_code === 0 && data.result_msg === "Success") {
    //   console.log(" 상담사 할당 가능 스킬 목록 조회 성공:", data);
    //   return data;
    // } else {
    //   throw new Error(`API Error: ${data.result_msg}`);
    // }
  } catch (error) {
    const typedError = error as CounselorSkillApiError;
    throw new Error(
      typedError.response?.data?.result_msg || "상담사 스킬 목록을 가져오는 데 실패했습니다."
    );
  }
};

/**
 * 상담사가 보유한 스킬 목록을 조회하는 API
 * @param counselorId 상담사 ID
 * @returns 상담사가 현재 보유한 스킬 목록
 */
export const getAssignedSkillsForCounselor = async (
  counselorId: string
): Promise<CounselorSkillListResponse> => {
  // console.log(" 상담사 스킬 데이터 조회 시작:", counselorId);

  try {
    const { data } = await axiosInstance.post<CounselorSkillListResponse>(
      "/collections/agent-skill",
      {
        filter: { agent_id: [counselorId] },
        sort: {},
        page: { index: 1, items: 10 },
      }
    );

    // console.log(" 상담사가 보유한 스킬 목록 조회 성공:", data);
    return data;
  } catch (error) {
    const typedError = error as CounselorSkillApiError;
    // console.error(" 상담사 스킬 목록 조회 실패:", error);
    throw new Error(
      typedError.response?.data?.result_msg || "상담사의 스킬 목록을 가져오는 데 실패했습니다."
    );
  }
};

/**
 * 상담사가 보유한 스킬과 할당 가능한 스킬을 동시에 가져오는 API
 * @param counselorId 상담사 ID
 * @param tenantId 테넌트 ID
 * @returns 상담사가 보유한 스킬 목록과 할당 가능한 스킬 목록
 */
export const apiForGetRelatedInfoForAssignSkilToCounselor = async (
  counselorId: string,
  tenantId: number
): Promise<{ assignedSkills: CounselorSkillListResponse; assignableSkills: CounselorSkillListResponse }> => {
  // console.log(" 상담사 스킬 데이터 조회 시작:", counselorId, tenantId);

  try {
    const [assignedSkills, assignableSkills] = await Promise.all([
      getAssignedSkillsForCounselor(counselorId), // 상담사가 보유한 스킬
      getAssignableSkillsForCounselor(tenantId), // 할당 가능한 스킬 목록
    ]);

    // console.log(" 상담사가 보유한 스킬 목록:", assignedSkills);
    // console.log(" 상담사에게 할당 가능한 스킬 목록:", assignableSkills);

    return { assignedSkills, assignableSkills };
  } catch (error) {
    // console.error(" 상담사 스킬 조회 실패:", error);
    throw new Error("스킬 데이터를 가져오는 중 오류가 발생했습니다.");
  }
};

// 스킬을 가진 상담사 리스트에서 특정 상담사를 제외하는 api 요청 함수
// skills/{skill_id}/agent-lis , apiForDeleteCounselorsForSpecificSkil
/**
 * 특정 스킬을 가진 상담사 목록에서 지정된 상담사들을 제외하는 API
 * @param skillId 스킬 ID
 * @param counselorIds 제외할 상담사 ID 배열
 * @returns API 응답 결과
 */
export const apiForDeleteCounselorsForSpecificSkill = async (
  skillId: number,
  counselorIds: string[]
): Promise<CounselorSkillAssignmentResponse> => {

  try {
    // API 엔드포인트가 정확하지 않을 수 있으므로 실제 API에 맞게 수정 필요
    const { data } = await axiosInstance.delete<CounselorSkillAssignmentResponse>(
      `skills/${skillId}/agent-list`,
      {
        data: {
          request_data: {
            agent_id: counselorIds
          }
        }
      }
    );

    // console.log(" 스킬을 가진 상담사 목록에서 특정 상담사들 해제 성공:", data);
    return data;
  } catch (error) {
    // console.error(" 스킬에서 상담사 해제 실패:", error);
    const typedError = error as CounselorSkillApiError;
    throw new Error(
      typedError.response?.data?.result_msg || "스킬에서 상담사 해제 중 오류가 발생했습니다."
    );
  }
};

// apiForDeleteCounselorsForSpecificSkill 를 post 로 바꾸면 된다 to apiForAddCounselorsForSpecificSkills
// 특정 스킬에 대한 상담사 목록에 대한 추가 api 이다 apiForDeleteCounselorsForSpecificSkill 와 url 같고 http method 만 post 야 구현해줘 copilot 아래에 구현 해줘
export const apiForAddCounselorsForSpecificSkill = async (
  skillId: number,
  counselorIds: string[]
): Promise<CounselorSkillAssignmentResponse> => {
  
  try {
    const { data } = await axiosInstance.post<CounselorSkillAssignmentResponse>(
      `skills/${skillId}/agent-list`,
      {
        request_data: {
          agent_id: counselorIds
        }
      }
    );

    return data;
  } catch (error:any) {

    // if (error.response.data.result_code === 5) {
    //   // 세션 만료 시 알럿 표시 후 로그인 페이지로 리다이렉트
    //   customAlertService.error('로그인 세션이 만료되었습니다. 다시 로그인 해주세요.', '세션 만료', () => {
    //     window.location.href = '/login';
    //   });
    // }

    // console.error(" 스킬에 상담사 추가 실패:", error);
    const typedError = error as CounselorSkillApiError;
    throw new Error(
      typedError.response?.data?.result_msg || "스킬에 상담사 추가 중 오류가 발생했습니다."
    );
  }
};