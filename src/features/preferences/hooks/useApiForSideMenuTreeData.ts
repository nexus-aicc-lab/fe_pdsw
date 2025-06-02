// C:\nproject\fe_pdsw\src\features\preferences\hooks\useApiForCombinedDataForSideMenuForCampaignTab.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { 
    apiForCombinedTenantAndCampaignGroup,
    transformToTreeData,
} from '../api/apiForCampaignGroup';
import { 
    CampaignGroupApiResponse,
    TreeNode,
    CampaignGroupGampaignListApiResponse,
    ExtendedCombinedData,
} from '@/features/campaignManager/types/typeForCampaignGroupForSideBar';
import { TenantListResponse } from '@/features/campaignManager/types/typeForTenant';

interface CombinedData {
    tenantData: TenantListResponse;
    campaignGroupData: CampaignGroupApiResponse;
}

interface CombinedDataError {
    message: string;
    originalError?: any;
    status?: number;
    result_code?: number;
    result_msg?: string;
}


/**
 * 트리 메뉴용 데이터를 가져오는 React Query 훅 
 */
export function useApiForSideMenuTreeData(
    tenant_id: number,
    enabled: boolean = true
): UseQueryResult<TreeNode[], CombinedDataError> {

    console.log("tenant_id at 사이드 메뉴 호출 : ", tenant_id);

    return useQuery<ExtendedCombinedData, CombinedDataError, TreeNode[]>({
        queryKey: ['sideMenuTreeData', tenant_id],
        queryFn: () => apiForCombinedTenantAndCampaignGroup(tenant_id) as Promise<ExtendedCombinedData>,
        select: (data) => transformToTreeData(data),
        enabled,
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    });
}   