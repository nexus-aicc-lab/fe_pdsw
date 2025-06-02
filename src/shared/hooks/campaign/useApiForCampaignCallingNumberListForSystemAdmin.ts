"use client";

import { apiForCampaignCallingNumberListForSystemAdmin, IRequestForCampaignCallingNumberListForSystemAdmin, IResponseForCampaignCallingNumberListForSystemAdmin } from "@/shared/api/camapign/apiForCampaignCallingNumberList";
import { useQuery } from "@tanstack/react-query";

interface UseApiForCampaignCallingNumberListOptions {
  request?: Partial<IRequestForCampaignCallingNumberListForSystemAdmin>;
  enabled?: boolean;
}

export const useApiForCampaignCallingNumberListForSystemAdmin = ({
  request,
  enabled = true,
}: UseApiForCampaignCallingNumberListOptions = {}) => {
  return useQuery<IResponseForCampaignCallingNumberListForSystemAdmin>({
    queryKey: ["campaignCallingNumberListForSystemAdmin", request],
    queryFn: () => apiForCampaignCallingNumberListForSystemAdmin(request),
    enabled,
    staleTime: 1000 * 60 * 5, // 5분
  });
};