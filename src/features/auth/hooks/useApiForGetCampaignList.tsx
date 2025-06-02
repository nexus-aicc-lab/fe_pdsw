// src/features/campaignManager/hooks/useApiForGetCampaignList.ts
import { apiForGetCampaignList } from '@/features/campaignManager/api/apiForCampaign';
import { CampaignApiError, CampaignListResponse } from '@/features/campaignManager/types/typeForCampaignForSideBar';
import { useQuery } from '@tanstack/react-query';

export function useApiForGetCampaignList(options?: { enabled?: boolean }) {
  return useQuery<CampaignListResponse, CampaignApiError>({
    queryKey: ['campaignList'],
    queryFn: apiForGetCampaignList,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true, // 🔥 조건부 실행 제어
  });
}
