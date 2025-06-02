// src/features/rebroadcastSettingsPanel/types/rebroadcastSettingsPanelIndex.ts

export const apiUrl: string = '/counselor';

// 재발신 수정 API 응답
export interface UpdateResponse {
  result_code: number;
  result_msg: string;
}

// 재발신 API 에러 타입
export interface rebroadcastSettingsPanelApiError {
  message: string;
  status: number;
}

// 재발신 추가 요청
export interface CampaignAutoRedialInsertDataRequest {
  campaign_id: number;
  sequence_number: number;
  start_date: string;
  redial_condition: string;
  run_flag: number;
}

// 재발신 추가 응답 데이터 타입
export interface CampaignAutoRedialInsertResponseDataType {
  campaign_id: number;
  sequence_number: number;
  start_date: string;
  redial_condition: string;
  run_flag: number;
}

// 재발신 추가 응답
export interface CampaignAutoRedialInsertResponse {
  result_code: number;
  result_msg: string;
  result_data: CampaignAutoRedialInsertResponseDataType;
}

// 캠페인 재발신 미리보기 요청
export interface CampaignRedialPreviewSearchDataRequest {
  campaign_id: number;
  condition: string;
}

// 캠페인 재발신 미리보기 응답 데이터 타입
export interface CampaignRedialPreviewSearchResponseDataType {
  campaign_id: number;
  redial_count: number;
}

// 캠페인 재발신 미리보기 응답
export interface CampaignRedialPreviewSearchResponse {
  result_code: number;
  result_msg: string;
  result_data: CampaignRedialPreviewSearchResponseDataType;
}

// 캠페인 재발신 추출 응답
export interface CampaignCurrentRedialResponse {
  reason_code: number;
  result_code: number;
  result_msg: string;
}




