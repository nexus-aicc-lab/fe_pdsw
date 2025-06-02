// src/shared/api/tenant/skill/apiForCreateSkilForSystemAdmin.ts

import { axiosInstance } from "@/lib/axios";

// 📌 요청 타입 정의
export interface CreateSkillRequestForSystemAdmin {
  request_data: {
    tenant_id: number;
    skill_name: string;
    skill_description: string;
  };
}

// 📌 응답 타입 정의
export interface CreateSkillResponseForSystemAdmin {
  result_code: number;
  result_msg: string;
}

// 📌 API 함수
export const apiForCreateSkilForSystemAdmin = async (
  skill_id: string,
  request: CreateSkillRequestForSystemAdmin
): Promise<CreateSkillResponseForSystemAdmin> => {
  const response = await axiosInstance.post<CreateSkillResponseForSystemAdmin>(
    `/skills/${skill_id}`,
    request
  );

  return response.data;
};
