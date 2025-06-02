// // src/features/campaignManager/types/typeForCampaignGroupForSideBar.ts

import { TenantListResponse } from "./typeForTenant";

// API 요청 인터페이스
export interface GetCampaignListForCampaignGroupRequest {
  filter?: {
      group_id?: number[];
      campaign_id?: {
          start?: number;
          end?: number;
      };
  };
  sort?: {
      campaign_id?: number;
  };
  page?: {
      index?: number;
      items?: number;
  };
}

export interface AddCampaignGroupCredentials {
  group_id: string;
  tenant_id: number;
  group_name: string;
}

export interface SuccessResponse {
  result_code: string;
  result_msg: string;
}

// API 응답의 전체 구조
export interface CampaignGroupApiResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  result_data: CampaignGroupItem[];
}

export interface CampaignGroupItem {
  tenant_id: number;
  group_id: number;
  group_name: string;
}

// 캠페인 그룹 소속 캠페인 목록 API 응답의 전체 구조
export interface CampaignGroupGampaignListApiResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  result_data: CampaignGroupGampaignListItem[];
}

export interface CampaignGroupGampaignListItem {
  tenant_id: number;
  group_id: number;
  group_name: string;
  campaign_id: number;
  campaign_name: string;
  start_flag: number; // 새로 추가된 필드
}

// 확장된 CombinedData 인터페이스
export interface ExtendedCombinedData {
  tenantData: TenantListResponse;
  campaignGroupData: CampaignGroupApiResponse;
  campaignData: CampaignGroupGampaignListApiResponse;
}

// 트리 메뉴 구조를 위한 타입 정의
// export interface TreeNode {
//   id: string;
//   name: string;
//   type: "root" | "tenant" | "group" | "campaign";
//   children?: TreeNode[];
//   tenant_id?: number;
//   group_id?: number;
//   campaign_id?: number;
// }
export interface TreeNode {
  id: string;
  name: string;
  type: "root" | "tenant" | "group" | "campaign";
  tenant_id?: number;
  group_id?: number;
  campaign_id?: number;
  children?: TreeNode[];
  start_flag?: number; // 추가: 캠페인 시작 상태 플래그
  status?: string;     // 추가: 시작 상태를 문자열로 변환한 값
}

// 통합 데이터 변환 후 사이드바 트리 메뉴에 사용할 데이터 타입
export interface SideMenuTreeData {
  items: TreeNode[];
}