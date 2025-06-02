"use client";

import { apiForCampaignScheduleInfosForSystemAdmin, CampaignScheduleInfosRequestForSystemAdmin, CampaignScheduleInfosResponseForSystemAdmin } from "@/shared/api/camapign/apiForCampaignScheduleInfosForSystemAdmin";
import { useQuery } from "@tanstack/react-query";

interface UseApiForCampaignScheduleInfosOptions {
  request?: Partial<CampaignScheduleInfosRequestForSystemAdmin>;
  enabled?: boolean;
}

export const useApiForCampaignScheduleInfosForSystemAdmin = ({
  request,
  enabled = true,
}: UseApiForCampaignScheduleInfosOptions = {}) => {
  return useQuery<CampaignScheduleInfosResponseForSystemAdmin>({
    queryKey: ["campaignScheduleInfosForSystemAdmin", request],
    queryFn: () => apiForCampaignScheduleInfosForSystemAdmin(request),
    enabled,
    staleTime: 1000 * 60 * 5, // 5분
  });
};