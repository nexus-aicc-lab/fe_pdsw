// C:\nproject\fe_pdsw\src\features\campaignManager\hooks\useApiForGetSkills2.ts

// src/features/campaignManager/hooks/useApiForGetSkills2.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { fetchSkills } from '../api/mainSkillMasterInfoSearch';
import { SkillListCredentials, SkillListResponse, CampaignApiError } from '../types/campaignManagerIndex';

export function useApiForGetSkills2(
  credentials: SkillListCredentials,
  options?: UseQueryOptions<SkillListResponse, CampaignApiError>
) {
  return useQuery<SkillListResponse, CampaignApiError>({
    queryKey: ['mainSkills', credentials],
    queryFn: () => fetchSkills(credentials),
    enabled : true,
    ...options,
    // enabled: !!credentials && credentials.tenant_id_array.length > 0,
    // ...options,
  });
}