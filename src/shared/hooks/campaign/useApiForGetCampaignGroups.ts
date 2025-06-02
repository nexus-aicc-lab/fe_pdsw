// src/shared/hooks/group/useApiForGetCampaignGroups.ts

import { useQuery } from '@tanstack/react-query';
import { useMainStore } from '@/store';
import { 
  apiForGetCampaignGroupForSystemAdmin, 
  IRequestTypeForCampaignGroupForSystemAdmin,
  IResponseTypeForCampaignGroupForSystemAdmin
} from '@/shared/api/camapign/apiForGetCampaignGroupForSystemAdmin';

interface UseApiForGetCampaignGroupsOptions {
  enabled?: boolean;
  retry?: number;
  request?: Partial<IRequestTypeForCampaignGroupForSystemAdmin>;
}

export const useApiForGetCampaignGroups = (options?: UseApiForGetCampaignGroupsOptions) => {
  const { setCampaignGroups, setCampaignGroupsLoading, setCampaignGroupsLoaded } = useMainStore();

  return useQuery<IResponseTypeForCampaignGroupForSystemAdmin, Error>({
    queryKey: ['campaignGroups', options?.request],
    queryFn: async () => {
      setCampaignGroupsLoading(true);
      try {
        const response = await apiForGetCampaignGroupForSystemAdmin(options?.request || {});

        // console.log("Campaign groups data response at hook:", response);
        
        if (response.result_code === 0) {
          setCampaignGroups(response.result_data || []);
          setCampaignGroupsLoaded(true);
          // console.log("Campaign groups data loaded, updated store");
        }
        
        return response;
      } catch (error) {
        console.error("Error loading campaign groups data:", error);
        throw error;
      } finally {
        setCampaignGroupsLoading(false);
      }
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5분 동안 데이터를 신선하게 유지
    retry: options?.retry ?? 1,
  });
};