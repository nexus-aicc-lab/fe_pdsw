// import { useQuery } from '@tanstack/react-query';
// import { fetchCampaignProgressForMultipleCampaigns } from '../api/fetchCampaignProgressMultiple';

// export const useMultiCampaignProgressQuery = (campaigns: {
//   campaign_id: number;
//   campaign_name: string;
//   tenant_id: number;
// }[]) => {
//   return useQuery({
//     queryKey: ['multiCampaignProgress', campaigns.map(c => c.campaign_id)],
//     queryFn: () => fetchCampaignProgressForMultipleCampaigns(campaigns),
//     enabled: campaigns.length > 0,
//   });
// };

import { useQuery } from '@tanstack/react-query';
import { fetchCampaignProgressForMultipleCampaigns } from '../api/fetchCampaignProgressMultiple';

export const useMultiCampaignProgressQuery = (campaigns: {
  campaign_id: number;
  campaign_name: string;
  tenant_id: number;
}[]) => {
  return useQuery({
    queryKey: ['multiCampaignProgress', campaigns.map(c => c.campaign_id)],
    queryFn: () => fetchCampaignProgressForMultipleCampaigns(campaigns),
    enabled: campaigns.length > 0,
    // Adding staleTime to prevent excessive refetching when switching skills
    staleTime: 30000, // 30 seconds
  });
};