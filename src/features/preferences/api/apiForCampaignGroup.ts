// src/features/campaignManager/api/apiForCampaignGroup.ts
import { axiosInstance } from "@/lib/axios";
import {
    AddCampaignGroupCredentials,
    CampaignGroupApiResponse,
    SuccessResponse,
    TreeNode,
    SideMenuTreeData,
    CampaignGroupGampaignListApiResponse,
    GetCampaignListForCampaignGroupRequest,
    ExtendedCombinedData
} from "@/features/campaignManager/types/typeForCampaignGroupForSideBar";
import { TenantListResponse } from "@/features/campaignManager/types/typeForTenant";
import { apiForGetTenantList } from "@/features/campaignManager/api/apiForTennants";
import { ApiRequest, CampaignGroupResponse } from "@/features/campaignManager/types/typeForCampaignGroup";
import { useEnvironmentStore } from "@/store/environmentStore";

interface CombinedData {
    tenantData: TenantListResponse;
    campaignGroupData: CampaignGroupApiResponse;
}


/**
 * 테넌트 목록, 캠페인 그룹 목록, 캠페인 목록을 동시에 가져오는 API 함수
 * @param tenant_id 테넌트 ID (캠페인 그룹 조회에 사용)
 * @returns Promise<ExtendedCombinedData> 테넌트, 캠페인 그룹, 캠페인 데이터를 포함한 객체
 */
export const apiForCombinedTenantAndCampaignGroup = async (
    tenant_id: number
): Promise<ExtendedCombinedData> => {

    // console.log("tenant_id ??????????????????????????????????????????????????????????? ", tenant_id);


    try {
        // Promise.all을 사용하여 세 API를 병렬로 호출
        // 여기서 tenant_id를 apiForGetTenantList에 전달하여 필터링
        const [tenantData, campaignGroupData, campaignData] = await Promise.all([
            apiForGetTenantList(tenant_id), // tenant_id 전달
            apiForCampaignGroupList(tenant_id),
            apiForCampaignListForCampaignGroup({
                sort: {
                    campaign_id: 1
                }
            })
        ]);

        // console.log("Combined API for tenant data:", tenantData);
        // console.log("Combined API for campaign group data:", campaignGroupData);
        // console.log("Combined API for campaign data:", campaignData);

        // 데이터 유효성 검사 및 기본값 설정
        const safeData = {
            tenantData: {
                result_data: tenantData?.result_data || [],
                result_code: tenantData?.result_code || 0,
                result_msg: tenantData?.result_msg || "No tenant data",
                result_count: tenantData?.result_count || 0,
                total_count: tenantData?.total_count || 0
            },
            campaignGroupData: {
                result_data: campaignGroupData?.result_data || [],
                result_code: campaignGroupData?.result_code || 0,
                result_msg: campaignGroupData?.result_msg || "No campaign group data",
                result_count: campaignGroupData?.result_count || 0
            },
            campaignData: {
                result_data: campaignData?.result_data || [],
                result_code: campaignData?.result_code || 0,
                result_msg: campaignData?.result_msg || "No campaign data",
                result_count: campaignData?.result_count || 0
            }
        };

        return safeData;
    } catch (error: any) {

        // 에러 객체에 custom 속성 추가
        const enhancedError = new Error(
            error.message || "테넌트, 캠페인 그룹, 캠페인 데이터를 가져오는데 실패했습니다."
        );

        // 원본 에러 정보 유지
        (enhancedError as any).originalError = error;

        throw enhancedError;
    }
};

/**
 * 캠페인 그룹에 속한 캠페인 목록을 가져오는 API
 * @param request 필터, 정렬, 페이징 정보가 포함된 요청 객체
 * @returns 캠페인 그룹별 캠페인 목록
 */
export const apiForCampaignListForCampaignGroup = async (
    request: any
): Promise<CampaignGroupGampaignListApiResponse> => {
    try {
        const { data } = await axiosInstance.post<CampaignGroupGampaignListApiResponse>(
            'collections/campaign-group-list',
            request
        );

        // console.log("Campaign list for campaign group response:", data);

        // Check if data exists and has the expected structure
        // if (!data || typeof data !== 'object') {
        //     console.error("Invalid API response format:", data);
        //     return {
        //         result_data: [],
        //         result_code: 0,
        //         result_msg: "Invalid response",
        //         result_count: 0
        //     };
        // }

        // Return the data as-is if it has result_data, otherwise return empty array
        return {
            result_data: Array.isArray(data.result_data) ? data.result_data : [],
            result_code: data.result_code || 0,
            result_msg: data.result_msg || "No data",
            result_count: data.result_count || 0
        };
    } catch (error: any) {
        // console.error("Error fetching campaign group list:", error);

        if (error.response?.status === 401) {
            throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
        }
        throw new Error(
            `${error.response?.data?.result_code || ''}||${error.response?.data?.result_msg || '데이터 가져오기 실패'}`
        );
    }
};

/**
 * API 응답 데이터를 트리 구조로 변환하는 함수
 * @param combinedData 통합 API 응답 데이터
 * @returns 트리 구조의 데이터
 */
// src/features/campaignManager/api/apiForCampaignGroup.ts 수정

/**
 * API 응답 데이터를 트리 구조로 변환하는 함수 (캠페인 포함)
 * @param combinedData 통합 API 응답 데이터
 * @returns 트리 구조의 데이터
 */
export const transformToTreeData = (combinedData: ExtendedCombinedData): TreeNode[] => {
    const { tenantData, campaignGroupData, campaignData } = combinedData;

    const centerId = useEnvironmentStore.getState().centerId;
    const centerName = useEnvironmentStore.getState().centerName;

    if (!tenantData?.result_data) {
        return [];
    }

    // 테넌트별 그룹 매핑
    const groupsByTenant: Record<number, typeof campaignGroupData.result_data> = {};

    if (campaignGroupData?.result_data) {
        campaignGroupData.result_data.forEach(group => {
            if (!groupsByTenant[group.tenant_id]) {
                groupsByTenant[group.tenant_id] = [];
            }
            groupsByTenant[group.tenant_id].push(group);
        });
    }

    // 그룹별 캠페인 매핑
    const campaignsByGroup: Record<number, typeof campaignData.result_data> = {};

    if (campaignData?.result_data) {
        campaignData.result_data.forEach(campaign => {
            if (!campaignsByGroup[campaign.group_id]) {
                campaignsByGroup[campaign.group_id] = [];
            }
            campaignsByGroup[campaign.group_id].push(campaign);
        });
    }

    // 테넌트 노드 생성 (그룹과 캠페인 포함)
    const tenantNodes = tenantData.result_data.map(tenant => ({
        id: `tenant-${tenant.tenant_id}`,
        name: `[${tenant.tenant_id}]${tenant.tenant_name}`,
        type: "tenant" as const,
        tenant_id: tenant.tenant_id,
        children: (groupsByTenant[tenant.tenant_id] || []).map(group => ({
            id: `group-${group.group_id}-${tenant.tenant_id}-${group.group_name}`,
            name: group.group_name,
            type: "group" as const,
            tenant_id: group.tenant_id,
            group_id: group.group_id,
            children: (campaignsByGroup[group.group_id] || []).map(campaign => ({
                id: `campaign-${campaign.campaign_id}-${group.group_id}-${campaign.campaign_name}`,
                name: campaign.campaign_name,
                type: "campaign" as const,
                tenant_id: campaign.tenant_id,
                group_id: campaign.group_id,
                campaign_id: campaign.campaign_id,
                start_flag: campaign.start_flag,
            }))
        }))
    }));

    // 최상위 NEXUS 노드에 테넌트 노드를 자식으로 추가
    return [{
        id: centerId ? `$$${centerId}` :"nexus-root",
        name: centerId && centerName ? `[${centerId}]${centerName}` :"[-]NEXUS",
        type: "root" as const,
        children: tenantNodes
    }];
};

/**
 * 사이드 메뉴를 위한 통합 데이터 변환 함수
 * @param combinedData 통합 API 응답 데이터
 * @returns 사이드 메뉴용 트리 데이터
 */
export const apiForCombinedDataForSideMenu = (combinedData: ExtendedCombinedData): SideMenuTreeData => {
    const treeData = transformToTreeData(combinedData);

    return {
        items: treeData
    };
};

// 캠페인 그룹 목록을 가져오는 API
export const apiForCampaignGroupList = async (
    tenant_id: number
): Promise<CampaignGroupApiResponse> => {
    const request_data = {
        request_data: {
            tenant_id: tenant_id
        }
    };

    try {
        const { data } = await axiosInstance.post<CampaignGroupApiResponse>(
            `collections/campaign-group`,
            request_data
        );
        return data;
    } catch (error: any) {

        if (error.response?.status === 401) {
            throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
        }
        throw new Error(
            `${error.response?.data?.result_code || ''}||${error.response?.data?.result_msg || '데이터 가져오기 실패'}`
        );
    }
};

// 캠페인 그룹 생성 API
export const apiForCreateCampaignGroup = async (
    credentials: AddCampaignGroupCredentials
): Promise<SuccessResponse> => {
    const request_data = {
        request_data: {
            tenant_id: credentials.tenant_id,
            group_name: credentials.group_name,
        },
    };

    // console.log("Create campaign group request data:", request_data);


    try {
        // group_id를 URL에 포함시킴
        const { data } = await axiosInstance.post<SuccessResponse>(
            `campaign-groups/${credentials.group_id}`,
            request_data
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
        }

        // console.log("error ", error);

        throw error;
    }
};

// 캠페인 그룹 소속 캠페인 목록을 가져오는 API
export const apiForCampaignGroupCampaignList = async (
    group_id: number
): Promise<CampaignGroupGampaignListApiResponse> => {
    const request_data = {
        request_data: {
            group_id: [group_id]
        },
        sort: {
            campaign_id: 0
        }
    };

    try {
        const { data } = await axiosInstance.post<CampaignGroupGampaignListApiResponse>(
            `collections/campaign-group-list`,
            request_data
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
        }
        throw new Error(
            `${error.response?.data?.result_code || ''}||${error.response?.data?.result_msg || '데이터 가져오기 실패'}`
        );
    }
};

export const apiForCampaignGroupDataForCampaignGroupAdmin = async (
    group_id?: number
): Promise<CampaignGroupResponse> => {

    // Create request body that matches the expected API format
    const requestBody = {
        filter: group_id ? { group_id: [group_id] } : {},
        sort: { group_id: 1 },
    };

    try {
        const { data } = await axiosInstance.post<CampaignGroupResponse>(
            'collections/campaign-group-list',
            requestBody
        );

        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
        }
        throw new Error(
            `${error.response?.data?.result_code || ''}||${error.response?.data?.result_msg || '데이터 가져오기 실패'}`
        );
    }
};



export const apiForDeleteCampaignGroup = async (
    group_id: number
): Promise<SuccessResponse> => {
    try {
        // group_id를 URL에 포함시킴
        const { data } = await axiosInstance.delete<SuccessResponse>(
            `campaign-groups/${group_id}`
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
        }

        // console.error("캠페인 그룹 삭제 실패:", error);

        throw new Error(
            `${error.response?.data?.result_code || ''}||${error.response?.data?.result_msg || '캠페인 그룹 삭제 실패'}`
        );
    }
};

// todo:
// apiForUpdateCampaignGroupName 함수 추가 필요
// url: pds/campaign-groups/{gorup_id}
// put

// apiForCampaignGroup.ts 파일에 추가

// 캠페인 그룹 이름 업데이트 API
export const apiForUpdateCampaignGroupName = async (
    group_id: number,
    group_name: string,
    tenant_id: number
): Promise<SuccessResponse> => {
    const request_data = {
        request_data: {
            tenant_id: tenant_id,
            group_name: group_name
        }
    };

    try {
        // group_id를 URL에 포함시키고 PUT 메서드 사용
        const { data } = await axiosInstance.put<SuccessResponse>(
            `campaign-groups/${group_id}`,
            request_data
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
        }

        // console.error("캠페인 그룹 이름 업데이트 실패:", error);

        throw new Error(
            `${error.response?.data?.result_code || ''}||${error.response?.data?.result_msg || '캠페인 그룹 이름 업데이트 실패'}`
        );
    }
};

/**
 * 특정 캠페인 그룹에 캠페인을 추가하는 API
 * @param group_id 캠페인을 추가할 캠페인 그룹의 ID
 * @param campaign_ids 추가할 캠페인의 ID 배열
 * @param tenant_id 테넌트 ID
 * @returns API 응답 (성공 여부)
 */
export const apiForAddCampaignToSpecificCampaignGroup = async (
    group_id: number,
    campaign_ids: number[],
    tenant_id: number
): Promise<SuccessResponse> => {
    const request_data = {
        request_data: {
            campaign_id: campaign_ids,
            tenant_id: tenant_id
        }
    };

    try {
        // group_id를 URL에 포함시키고 POST 메서드 사용
        const { data } = await axiosInstance.post<SuccessResponse>(
            `campaign-group/${group_id}/list`,
            request_data
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
        }

        // console.error("캠페인 그룹에 캠페인 추가 실패:", error);

        throw new Error(
            `${error.response?.data?.result_code || ''}||${error.response?.data?.result_msg || '캠페인 그룹에 캠페인 추가 실패'}`
        );
    }
};

// Add this function to src/features/preferences/api/apiForCampaignGroup.ts

/**
 * 특정 캠페인 그룹에서 캠페인을 제거하는 API
 * @param group_id 캠페인 그룹 ID
 * @param campaign_id 제거할 캠페인 ID
 * @returns API 응답 (성공 여부)
 */
export const apiForRemoveCampaignFromCampaignGroup = async (
    group_id: number,
    campaign_ids: number[],
    tenant_id: number
): Promise<SuccessResponse> => {
    const request_data = {
        request_data: {
            campaign_id: campaign_ids,
            tenant_id: tenant_id
        }
    };

    try {
        // DELETE 요청으로 캠페인 제거 - URL 형식: /pds/campaign-group/{group_id}/list
        const { data } = await axiosInstance.delete<SuccessResponse>(
            `campaign-group/${group_id}/list`,
            { data: request_data }
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
        }

        // console.error("캠페인 그룹에서 캠페인 제거 실패:", error);

        throw new Error(
            `${error.response?.data?.result_code || ''}||${error.response?.data?.result_msg || '캠페인 그룹에서 캠페인 제거 실패'}`
        );
    }
};


// 캠페인 그룹 캠페인 추가

// 함수 이름:
// apiForAddCampaingToSpecificCampaignGroup

// pds/campaign-group/{group_id}/list
// post

// request 예시
// {
//     "request_data": {
//         "campaign_id": 14,
//         "tenant_id": 1
//     }
// }

// response 예시
// {
//     "result_code": 0,
//     "result_msg": "Success"
// }