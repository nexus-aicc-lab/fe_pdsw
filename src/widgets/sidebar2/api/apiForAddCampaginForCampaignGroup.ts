import { axiosInstance } from "@/lib/axios";
import {
  SkillListRequest,
  SkillListResponse,
  CampaignListRequest,
  CampaignListResponse,
  CampaignSkillsRequest,
  CampaignSkillsResponse,
  CampaignGroupSkillsResponse,
  CampaignGroupSkillsRequest
} from "@/types/typeForAddCampaignForCampaignGroup";

/**
 * 모든 스킬 정보를 가져오는 API 함수
 * @param request 스킬 조회 요청 정보
 * @returns Promise<SkillListResponse> 스킬 목록 응답 데이터
 */
export const apiForTotalSkillList = async (
  request: SkillListRequest
): Promise<SkillListResponse> => {
  try {
    const response = await axiosInstance.post<SkillListResponse>(
      "collections/skill",
      request
    );

    return response.data;
  } catch (error: any) {
    console.error("Skill list API call failed:", error);

    // 에러 객체에 custom 속성 추가
    const enhancedError = new Error(
      error.message || "스킬 정보를 가져오는데 실패했습니다."
    );

    // 원본 에러 정보 유지
    (enhancedError as any).originalError = error;

    throw enhancedError;
  }
};

/**
 * 기본 요청으로 모든 스킬 목록을 가져오는 헬퍼 함수
 * @param tenantId 테넌트 ID (옵션)
 * @returns Promise<SkillListResponse> 스킬 목록 응답 데이터
 */
export const getTotalSkillList = async (tenantId?: number): Promise<SkillListResponse> => {
  const defaultRequest: SkillListRequest = {
    filter: {
      skill_id: {
        start: 1,
        end: 9999
      },
      tenant_id: tenantId ? [tenantId] : [1] // 테넌트 ID가 제공되지 않으면 기본값 1 사용
    },
    sort: {
      skill_id: 0,
      tenant_id: 0
    },
    page: {
      index: 0,
      items: 100 // 더 많은 스킬 항목을 가져오기 위해 기본값보다 크게 설정
    }
  };

  return apiForTotalSkillList(defaultRequest);
};

/**
 * 모든 캠페인 정보를 가져오는 API 함수
 * @param request 캠페인 조회 요청 정보
 * @returns Promise<CampaignListResponse> 캠페인 목록 응답 데이터
 */
export const apiForTotalCampaignList = async (
  request: CampaignListRequest
): Promise<CampaignListResponse> => {
  try {
    const response = await axiosInstance.post<CampaignListResponse>(
      "collections/campaign-list",
      request
    );

    return response.data;
  } catch (error: any) {
    console.error("Campaign list API call failed:", error);

    // 에러 객체에 custom 속성 추가
    const enhancedError = new Error(
      error.message || "캠페인 정보를 가져오는데 실패했습니다."
    );

    // 원본 에러 정보 유지
    (enhancedError as any).originalError = error;

    throw enhancedError;
  }
};

/**
 * 기본 요청으로 모든 캠페인 목록을 가져오는 헬퍼 함수
 * @param tenantId 테넌트 ID (옵션)
 * @returns Promise<CampaignListResponse> 캠페인 목록 응답 데이터
 */
export const getTotalCampaignList = async (tenantId?: number): Promise<CampaignListResponse> => {
  const defaultRequest: CampaignListRequest = {
    filter: {
      tenant_id: {
        start: tenantId || 0, // 테넌트 ID가 제공되면 해당 ID만, 아니면 모든 테넌트
        end: tenantId || 99
      }
    },
    sort: {
      tenant_id: 0
    },
    page: {
      index: 0,
      items: 9999 // 모든 캠페인 가져오기
    }
  };

  return apiForTotalCampaignList(defaultRequest);
};

/**
 * 캠페인에 할당된 스킬 목록을 가져오는 API 함수
 * @param request 캠페인 스킬 조회 요청 정보
 * @returns Promise<CampaignSkillsResponse> 캠페인 스킬 목록 응답 데이터
 */
export const apiForFetchSkilsWithCampaigns = async (
  request: CampaignSkillsRequest
): Promise<CampaignSkillsResponse> => {
  try {
    const response = await axiosInstance.post<CampaignSkillsResponse>(
      "collections/campaign-skill", // API 엔드포인트 확인 필요
      request
    );

    return response.data;
  } catch (error: any) {
    console.error("Campaign skills API call failed:", error);

    // 에러 객체에 custom 속성 추가
    const enhancedError = new Error(
      error.message || "캠페인 스킬 정보를 가져오는데 실패했습니다."
    );

    // 원본 에러 정보 유지
    (enhancedError as any).originalError = error;

    throw enhancedError;
  }
};

/**
 * 기본 요청으로 캠페인에 할당된 스킬 목록을 가져오는 헬퍼 함수
 * @param campaignId 캠페인 ID (옵션)
 * @returns Promise<CampaignSkillsResponse> 캠페인 스킬 목록 응답 데이터
 */
export const getSkilsWithCampaigns = async (campaignId?: number): Promise<CampaignSkillsResponse> => {
  const defaultRequest: CampaignSkillsRequest = {
    // filter: {
    //   skill_id: {
    //     start: 1,
    //     end: 99
    //   }
    // },
    sort: {
      
    },
    page: {
      index: 1,
      items: 9999
    }
  };

  // campaignId를 URL 파라미터나 요청 본문에 추가해야 할 수도 있습니다.
  // API 명세에 따라 이 부분을 수정해야 할 수 있습니다.

  return apiForFetchSkilsWithCampaigns(defaultRequest);
};

/**
 * 캠페인 그룹에 대한 캠페인 목록을 가져오는 API 함수
 * @param request 캠페인 그룹 스킬 조회 요청 정보
 * @returns Promise<CampaignGroupSkillsResponse> 캠페인 그룹 스킬 목록 응답 데이터
 */
export const apiForGetCampaignListForCampaignGroup = async (
  request: CampaignGroupSkillsRequest
): Promise<CampaignGroupSkillsResponse> => {
  try {
    const response = await axiosInstance.post<CampaignGroupSkillsResponse>(
      "collections/campaign-group-list",
      request
    );

    return response.data;
  } catch (error: any) {
    console.error("Campaign Group skills API call failed:", error);

    // 에러 객체에 custom 속성 추가
    const enhancedError = new Error(
      error.message || "캠페인 그룹 스킬 정보를 가져오는데 실패했습니다."
    );

    // 원본 에러 정보 유지
    (enhancedError as any).originalError = error;

    throw enhancedError;
  }
};

/**
 * 기본 요청으로 캠페인 그룹에 대한 캠페인 목록을 가져오는 헬퍼 함수
 * @param groupId 캠페인 그룹 ID (필수)
 * @param campaignId 캠페인 ID (옵션)
 * @param tenantId 테넌트 ID (옵션)
 * @returns Promise<CampaignGroupSkillsResponse> 캠페인 그룹 스킬 목록 응답 데이터
 */
export const getCampaignListForCampaignGroup = async (
  groupId: number,
  campaignId?: number,
  tenantId?: number
): Promise<CampaignGroupSkillsResponse> => {
  const defaultRequest: CampaignGroupSkillsRequest = {
    filter: {
      group_id: [groupId],
      campaign_id: campaignId ? {
        start: campaignId,
        end: campaignId
      } : {
        start: 1,
        end: 99
      }
    },
    sort: {
      // 필요 시 추가 정렬 조건을 넣으세요.
    },
    page: {
      index: 0,
      items: 9999
    }
  };

  return apiForGetCampaignListForCampaignGroup(defaultRequest);
};


