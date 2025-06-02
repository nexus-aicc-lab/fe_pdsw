// C:\nproject2\fe_pdsw_add_admin\src\shared\hooks\campaign\useApiForCampaignListForSystemAdmin.ts
// src/shared/hooks/campaign/useApiForCampaignListForSystemAdmin.ts
"use client";

import { apiForCampaignListForSystemAdmin, CampaignListRequestForSystemAdmin, CampaignListResponseForSystemAdmin } from "@/shared/api/camapign/apiForCampaignListForSystemAdmin";
import { useQuery } from "@tanstack/react-query";


interface UseApiForCampaignListOptions {
  request?: Partial<CampaignListRequestForSystemAdmin>;
  enabled?: boolean;
}

export const useApiForCampaignListForSystemAdmin = ({
  request,
  enabled = true,
}: UseApiForCampaignListOptions = {}) => {
  return useQuery<CampaignListResponseForSystemAdmin>({
    queryKey: ["campaignListForSystemAdmin", request],
    queryFn: () => apiForCampaignListForSystemAdmin(request),
    enabled,
    staleTime: 1000 * 60 * 5, // 5분
  });
};
