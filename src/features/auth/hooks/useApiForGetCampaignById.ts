// src/features/campaignManager/hooks/useApiForGetCampaignById.ts
import { apiForGetCampaignById } from '@/features/campaignManager/api/apiForCampaignById';
import { CampaignApiError, CampaignListResponse } from '@/features/campaignManager/types/typeForCampaignForSideBar';
import { useQuery } from '@tanstack/react-query';

export function useApiForGetCampaignById(campaignId: number, options?: { enabled?: boolean }) {
  return useQuery<CampaignListResponse, CampaignApiError>({
    queryKey: ['campaign', campaignId],
    queryFn: () => apiForGetCampaignById(campaignId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true, // 🔥 조건부 실행 제어
  });
}
