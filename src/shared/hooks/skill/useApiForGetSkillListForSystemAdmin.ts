"use client";

import { useQuery } from "@tanstack/react-query";
import {
  apiForGetSkillListForSystemAdmin,
  SkillListRequestForSystemAdmin,
  SkillListResponseForSystemAdmin,
} from "@/shared/api/skill/apiForGetSkillListForSystemAdmin";

interface UseApiForGetSkillListOptions {
  request?: Partial<SkillListRequestForSystemAdmin>;
  enabled?: boolean;
}

export const useApiForGetSkillListForSystemAdmin = ({
  request,
  enabled = true,
}: UseApiForGetSkillListOptions = {}) => {
  return useQuery<SkillListResponseForSystemAdmin>({
    queryKey: ["skillListForSystemAdmin", request],
    queryFn: () => apiForGetSkillListForSystemAdmin(request || {}),
    enabled,
    staleTime: 1000 * 60 * 5, // 5분
  });
};
