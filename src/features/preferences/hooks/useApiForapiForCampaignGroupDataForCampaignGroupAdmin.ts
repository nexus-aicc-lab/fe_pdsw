// C:\nproject\fe_pdsw\src\features\preferences\hooks\useApiForCampaignGroupDataForCampaignGroupAdmin.ts

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { CampaignGroupResponse, ApiError } from '@/features/campaignManager/types/typeForCampaignGroup';
import { apiForCampaignGroupDataForCampaignGroupAdmin } from '../api/apiForCampaignGroup';


export function useApiForCampaignGroupDataForCampaignGroupAdmin(
    group_id?: number,
    enabled: boolean = true
): UseQueryResult<CampaignGroupResponse, ApiError> {
    return useQuery<CampaignGroupResponse, ApiError>({
        queryKey: ['campaignGroupsAdmin', group_id?.toString() || 'all'],
        queryFn: () => apiForCampaignGroupDataForCampaignGroupAdmin(group_id),
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
    });
}