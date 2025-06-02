// src/features/campaignManager/types/typeForCampaign.ts

// 요청 데이터 타입
export interface CampaignRequestData {
  filter: {
    campaign_id: {
      start: number;
      end: number;
    };
  };
  sort: {
    campaign_id: number;
  };
  page: {
    index: number;
    items: number;
  };
}

// 응답 데이터의 result_data 항목 타입
export interface CampaignListDataResponse {
  campaign_id: number;
  campaign_name: string;
  campaign_desc: string;
  start_flag: number;
  end_flag: number;
  tenant_id: number;
  dial_mode: number; // 추가된 필드: dial_mode 속성
  // ... 기타 필요한 필드들
}

// 응답 데이터 전체 타입
export interface CampaignListResponse {
  result_code: 0 | number;
  result_msg: "Success" | string;
  result_count: number;
  total_count: number;
  result_data: CampaignListDataResponse[];
}

// API 에러 타입
export interface CampaignApiError {
  status: number;
  message: string;
  response?: {
    data?: {
      result_code: number;
      result_msg: string;
    };
  };
}