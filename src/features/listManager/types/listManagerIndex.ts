// src/features/listManager/types/listManagerIndex.ts

export const apiUrl: string = '/counselor';

// 리스트매니저 API 에러 타입
export interface ListManagerApiError {
  message: string;
  status: number;
}

// 발신 리스트 추가 요청 데이터 타입
export interface CallingListInsertDataType {
  customer_key: string;
  sequence_number: number;
  customer_name: string;
  phone_number1: string;
  phone_number2: string;
  phone_number3: string;
  phone_number4: string;
  phone_number5: string;
  reserved_time: string;
  token_data: string;
}
// 발신 리스트 추가 요청 
export interface CallingListInsertRequest {
  campaign_id: number;
  list_flag: string;
  calling_list: CallingListInsertDataType[];
}

// 발신 리스트 추가 응답 데이터 타입
export interface CallingListInsertResponseDataType {
  customer_key: string;
  sequence_number: number;
  customer_name: string;
  phone_number1: string;
  reserved_time: string;
  token_data: string;
}

// 발신 리스트 추가 응답
export interface CallingListInsertResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  request_count: number;
  result_data: CallingListInsertResponseDataType[];
}

// 삭제 응답 타입
// 삭제 응답 타입
export interface DeleteResponse {
  result_code: number;
  result_msg: string;
  result_count?: number; // 선택적 속성으로 변경
  request_count?: number; // 선택적 속성으로 변경
  result_data?: ResultDataItem[]; // 선택적 배열 타입 추가
}

// result_data 배열의 각 항목에 대한 인터페이스
export interface ResultDataItem {
  customer_key?: string; // 선택적 속성
  sequence_number?: number; // 선택적 속성
  customer_name?: string;  // 선택적 속성
  phone_number1?: string; // 선택적 속성
  phone_number2?: string; // 선택적 속성
  phone_number3?: string; // 선택적 속성
  phone_number4?: string; // 선택적 속성
  phone_number5?: string; // 선택적 속성
  token_data?: string;    // 선택적 속성
  reserved_time?: string; // 추가: reserved_time도 ResultDataItem에 있었음
}

// 캠페인 블랙 릭스트 건 수 조회 응답 데이터 타입
export interface CampaignBlacklistCountResponseDataType {
  campaign_id: string;
  blacklist_count: number;
  maxBlacklistCount: number;
  max_count: number;
  common_count: number;
}

// 캠페인 블랙 릭스트 건 수 조회 응답 타입
export interface CampaignBlacklistCountResponse {
  result_code: number;
  result_msg: string;
  result_data: CampaignBlacklistCountResponseDataType;
}


