// src/features/campaignGroupManager/types/campaignGroupManagerIndex.ts

// 캠페인 그룹 API 에러 타입
export interface CampaignGroupManagerApiError {
  message: string;
  status: number;
}

// 캠페인 그룹 소속 캠페인 조회 응답 데이터 타입
export interface CampaignGroupCampaignListResponseDataType {
  tenant_id: number;
  group_id: number;
  group_name: string;
  campaign_id: number;
  campaign_name: string;
  start_flag: number;
}

// 캠페인 그룹 소속 캠페인 조회 응답
export interface CampaignGroupCampaignListResponse {
  result_code: number;
  result_msg: string;
  result_data: CampaignGroupCampaignListResponseDataType[];
}

// 캠페인 그룹 소속 캠페인 삭제 요청
export interface CampaignGroupCampaignListDeleteDataRequest {
  tenant_id: number;
  group_id: number;
  campaign_id: number[];
}

// 캠페인 그룹 추가가 요청
export interface CampaignGroupCreateDataRequest {
  tenant_id: number;
  group_id: number;
  group_name: string;
}


// 삭제 응답 타입
export interface DeleteResponse {
  result_code: number;
  result_msg: string;
}



