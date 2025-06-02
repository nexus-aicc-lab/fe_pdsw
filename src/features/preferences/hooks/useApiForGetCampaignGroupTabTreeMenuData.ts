// src/features/preferences/hooks/useApiForCampaignGroupList.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
    apiForCampaignGroupList,
    apiForCombinedTenantAndCampaignGroup,
    apiForCombinedDataForSideMenu,
    transformToTreeData,
    apiForCampaignGroupCampaignList,
    apiForCampaignListForCampaignGroup
} from '../api/apiForCampaignGroup';
import {
    CampaignGroupApiResponse,
    TreeNode,
    SideMenuTreeData,
    CampaignGroupGampaignListApiResponse,
    ExtendedCombinedData
} from '@/features/campaignManager/types/typeForCampaignGroupForSideBar';
import { TenantListResponse } from '@/features/campaignManager/types/typeForTenant';
import { useAuthStore } from '@/store/authStore';

// 에러 타입 정의
interface CombinedDataError {
    message: string;
    originalError?: any;
    status?: number;
    result_code?: number;
    result_msg?: string;
}

/**
 * 트리 구조 데이터를 가져오는 React Query 훅
 * @param tenant_id 테넌트 ID
 * @param enabled 쿼리 활성화 여부 (기본값: true)
 * @returns 트리 구조의 데이터
 */
export function useApiForGetCampaignGroupTabTreeMenuData(
    // tenant_id: number,
    enabled: boolean = true
): UseQueryResult<TreeNode[], CombinedDataError> {
    // console.log("tenant_id at 사이드 메뉴 호출 : ", tenant_id);
    const { tenant_id, role_id } = useAuthStore();

    return useQuery<ExtendedCombinedData, CombinedDataError, TreeNode[]>({
        queryKey: ['sideMenuTreeData', tenant_id],
        queryFn: () => apiForCombinedTenantAndCampaignGroup(tenant_id),
        select: (data) => transformToTreeData(data),
        enabled,
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    });
}