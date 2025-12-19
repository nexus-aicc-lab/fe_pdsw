// C:\nproject\fe_pdsw3\src\shared\hooks\skill\useApiForGetCampaignSkills.ts
import { useQuery } from '@tanstack/react-query';
import { useMainStore } from '@/store';
import { 
  apiForCampaignSkillListForSystemAdmin, 
  IRequestTypeForCampaignSkillListForSystemAdmin,
  IResponseTypeForCampaignSkillListForSystemAdmin
} from '@/shared/api/camapign/apiForCampaignSkilListForSystemAdmin';

interface UseApiForCampaignSkillsOptions {
  enabled?: boolean;
  retry?: number;
  request?: Partial<IRequestTypeForCampaignSkillListForSystemAdmin>;
}

export const useApiForGetCampaignSkills = (options?: UseApiForCampaignSkillsOptions) => {
  const { setSkillCampaigns, setSkillCampaignsLoading, setSkillCampaignsLoaded } = useMainStore();

  return useQuery<IResponseTypeForCampaignSkillListForSystemAdmin, Error>({
    queryKey: ['campaignSkills', options?.request],
    queryFn: async () => {
      setSkillCampaignsLoading(true);
      try {
        const response = await apiForCampaignSkillListForSystemAdmin(options?.request || {});
        
        if (response.result_code === 0) {
          setSkillCampaigns(response.result_data || []);
          setSkillCampaignsLoaded(true);
          // console.log("Campaign skills data loaded, updated store");
        }
        
        return response;
      } catch (error) {
        // console.error("Error loading campaign skills data:", error);
        throw error;
      } finally {
        setSkillCampaignsLoading(false);
      }
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5분 동안 데이터를 신선하게 유지
    retry: options?.retry ?? 1,
  });
};