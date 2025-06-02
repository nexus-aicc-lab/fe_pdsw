// src/features/preferences/hooks/useApiForCampaignGroupList.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { 
    apiForCampaignGroupList, 
    apiForCombinedTenantAndCampaignGroup,
    apiForCombinedDataForSideMenu,
    transformToTreeData,
    apiForCampaignGroupCampaignList
} from '../api/apiForCampaignGroup';
import { 
    CampaignGroupApiResponse,
    TreeNode,
    SideMenuTreeData,
    CampaignGroupGampaignListApiResponse,
    ExtendedCombinedData
} from '@/features/campaignManager/types/typeForCampaignGroupForSideBar';
import { TenantListResponse } from '@/features/campaignManager/types/typeForTenant';

// 통합 데이터 타입 정의
interface CombinedData {
    tenantData: TenantListResponse;
    campaignGroupData: CampaignGroupApiResponse;
}

// 에러 타입 정의
interface CombinedDataError {
    message: string;
    originalError?: any;
    status?: number;
    result_code?: number;
    result_msg?: string;
}

/**
 * 테넌트 목록과 캠페인 그룹 목록을 동시에 가져오는 React Query 훅
 * @param tenant_id 테넌트 ID
 * @param enabled 쿼리 활성화 여부 (기본값: true)
 * @returns UseQueryResult 객체
 */
export function useApiForCombinedDataForSideMenuForCampaignTab(
    tenant_id: number,
    enabled: boolean = true
): UseQueryResult<CombinedData, CombinedDataError> {
    return useQuery<CombinedData, CombinedDataError>({
        queryKey: ['combinedData', tenant_id.toString()],
        queryFn: () => apiForCombinedTenantAndCampaignGroup(tenant_id),
        enabled,
        staleTime: 1000 * 60 * 5, // 5분 동안 캐시 유지
        retry: 1, // 실패 시 1번 재시도
        refetchOnWindowFocus: false, // 창 포커스 시 자동 재조회 비활성화
    });
}

/**
 * 트리 메뉴용 데이터를 가져오는 React Query 훅 
 * CombinedData를 TreeNode[] 구조로 변환
export function useApiForSideMenuTreeData(
    tenant_id: number,
    enabled: boolean = true
): UseQueryResult<TreeNode[], CombinedDataError> {

    console.log("tenant_id at 사이드 메뉴 호출 : ", tenant_id);

    return useQuery<ExtendedCombinedData, CombinedDataError, TreeNode[]>({
        queryKey: ['sideMenuTreeData', tenant_id],
        queryFn: () => apiForCombinedDataForSideMenu(tenant_id),
        select: (data) => transformToTreeData(data),
        enabled,
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    });
}
}

/**
 * 캠페인 그룹 목록만 가져오는 React Query 훅 (기존 코드와의 호환성 유지)
 */
export function useApiForCampaignGroupData(
    tenant_id: number,
    enabled: boolean = true
): UseQueryResult<CampaignGroupApiResponse, CombinedDataError> {
    return useQuery<CombinedData, CombinedDataError, CampaignGroupApiResponse>({
        queryKey: ['combinedData', tenant_id.toString()],
        queryFn: () => apiForCombinedTenantAndCampaignGroup(tenant_id),
        select: (data) => data.campaignGroupData,
        enabled,
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    });
}

/**
 * 원래 캠페인 그룹 목록만 가져오는 API를 사용하는 훅 (기존 용도로 유지)
 */
export function useApiForCampaignGroupList(
    tenant_id: number,
    enabled: boolean = true
): UseQueryResult<CampaignGroupApiResponse, CombinedDataError> {
    return useQuery<CampaignGroupApiResponse, CombinedDataError>({
        queryKey: ['campaignGroupsOnly', tenant_id.toString()],
        queryFn: () => apiForCampaignGroupList(tenant_id),
        enabled,
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    });
}

/**
 * 캠페인 그룹 소속 캠페인 목록만 가져오는 React Query 훅 (기존 코드와의 호환성 유지)
 */
export function useApiForCampaignGroupCampaignList(
    group_id: number,
    enabled: boolean = true
): UseQueryResult<CampaignGroupGampaignListApiResponse, CombinedDataError> {
    return useQuery<CampaignGroupGampaignListApiResponse, CombinedDataError>({
        queryKey: ['campaignGroupCampaignListsOnly', group_id.toString()],
        queryFn: () => apiForCampaignGroupCampaignList(group_id),
        enabled,
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    });
}
