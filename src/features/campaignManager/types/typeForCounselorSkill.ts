// src/features/campaignManager/types/typeForCounselorSkill.ts
export interface CounselorSkillRequestData {
  filter: {
    skill_id?: {
      start: number;
      end: number;
    };
    tenant_id?: number[];
  };
  sort: {
    skill_id: number;
    tenant_id: number;
  };
  page?: {
    index: number,
    items: number
  }
}

export interface CounselorSkill {
  tenant_id: number;
  skill_id: number;
  skill_name: string;
  skill_description: string;
}

export interface CounselorSkillListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  result_data: CounselorSkill[];
}

export interface CounselorSkillApiError {
  response?: {
    data?: {
      result_msg: string;
    };
  };
}

/**
 * 상담사에게 스킬 할당 API 요청 타입
 * 요청 예시:
 * {
 *   "request_data": {
 *     "agent_id": [
 *       "2002",
 *       "KICC3402"
 *     ]
 *   }
 * }
 */
export interface CounselorSkillAssignmentRequest {
  request_data: {
    agent_id: string[];
  };
}

/**
 * 상담사에게 스킬 할당 API 응답 타입
 * 응답 예시:
 * {
 *   "result_code": 0,
 *   "result_msg": "Success"
 * }
 */
export interface CounselorSkillAssignmentResponse {
  result_code: number;
  result_msg: string;
}

/**
 * 상담사에게 스킬 할당 API 요청 타입
 * 요청 예시:
 * {
 *   "request_data": {
 *     "agent_id": [
 *       "2002",
 *       "KICC3402"
 *     ]
 *   }
 * }
 */
export interface CounselorSkillAssignmentRequest {
  request_data: {
    agent_id: string[];
  };
}

/**
 * 상담사에게 스킬 할당 API 응답 타입
 * 응답 예시:
 * {
 *   "result_code": 0,
 *   "result_msg": "Success"
 * }
 */
export interface CounselorSkillAssignmentResponse {
  result_code: number;
  result_msg: string;
}

/**
 * ✅ 상담사가 보유한 스킬과 할당 가능한 스킬을 함께 반환하는 타입 추가
 */
export interface RelatedCounselorSkillInfo {
  assignedSkills: CounselorSkillListResponse;  // 상담사가 현재 보유한 스킬
  assignableSkills: CounselorSkillListResponse;  // 상담사에게 할당 가능한 스킬
}