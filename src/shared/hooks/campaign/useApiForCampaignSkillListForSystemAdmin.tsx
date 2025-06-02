
"use client";

import { apiForCampaignSkillListForSystemAdmin, IRequestTypeForCampaignSkillListForSystemAdmin, IResponseTypeForCampaignSkillListForSystemAdmin } from "@/shared/api/camapign/apiForCampaignSkilListForSystemAdmin";
import { useQuery } from "@tanstack/react-query";

interface UseApiForCampaignSkillListOptions {
  request?: Partial<IRequestTypeForCampaignSkillListForSystemAdmin>;
  enabled?: boolean;
}

export const useApiForCampaignSkillListForSystemAdmin = ({
  request,
  enabled = true,
}: UseApiForCampaignSkillListOptions = {}) => {
  return useQuery<IResponseTypeForCampaignSkillListForSystemAdmin>({
    queryKey: ["campaignSkillListForSystemAdmin", request],
    queryFn: () => apiForCampaignSkillListForSystemAdmin(request),
    enabled,
    staleTime: 1000 * 60 * 5, // 5분
  });
};