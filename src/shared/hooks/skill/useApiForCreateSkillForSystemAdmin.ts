"use client";

import { useMutation } from "@tanstack/react-query";
import {
  apiForCreateSkilForSystemAdmin,
  CreateSkillRequestForSystemAdmin,
  CreateSkillResponseForSystemAdmin,
} from "@/shared/api/skill/apiForCreateSkilForSystemAdmin";

// 💡 mutation에 사용할 인자 타입
interface UseApiForCreateSkillArgs {
  skill_id: string;
  request: CreateSkillRequestForSystemAdmin;
}

export const useApiForCreateSkillForSystemAdmin = () => {
  return useMutation<CreateSkillResponseForSystemAdmin, Error, UseApiForCreateSkillArgs>({
    mutationFn: ({ skill_id, request }) =>
      apiForCreateSkilForSystemAdmin(skill_id, request),
  });
};
