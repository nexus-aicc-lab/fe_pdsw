// src/features/auth/types/mainIndex.ts
// 메인 요청 시 필요한 credentials 타입
export interface MainCredentials {
  roleId?: any;
  session_key: string;
  tenant_id: number;
}

export interface MainCredentials2 {
  roleId?: any;
  tenant_id: number | string;
}

// 스킬마스터정보조회 요청 시 필요한 credentials 타입
export interface SkillListCredentials {
  tenant_id_array: number[];
}

// 장비목록 요청 시 필요한 credentials 타입
// export interface DialingDeviceListCredentials {
//   tenant_id_array: number[];
// }

// 백엔드로 전송되는 실제 메인 요청 데이터 타입
export interface MainRequest {
  session_key: string;
  tenant_id: number;
}

// 센터 정보 데이터 타입 
export interface CenterInfoResponse {
   centerId : string,
   centerName: string
}

export interface CenterInfoDataResponse {
  code: string;
  message: string;
  centerInfoList: CenterInfoResponse[];
}

// 캠페인스킬 수정 요청 데이터 타입
export interface CampaignSkillUpdateRequest {
  campaign_id: number;
  skill_id: number[];
}

// 메인 응답 데이터 리스트 타입
export interface AuthApiError {
  message: string;
  status: number;
}

// 메인 응답 데이터 리스트 타입
export interface MainDataResponse {
  // group_id: undefined;
  campaign_status?: any;
  campaign_id: number;
  campaign_name: string;
  campaign_desc: string;
  site_code: number;
  service_code: number;
  start_flag: number;
  end_flag: number;
  dial_mode: number;
  callback_kind: number;
  delete_flag: number;
  list_count: number;
  list_redial_query: string;
  next_campaign: number;
  token_id: number;
  phone_order: string;
  phone_dial_try: number[];
  dial_try_interval: number;
  trunk_access_code: string;
  DDD_code: string;
  power_divert_queue: number | string;
  max_ring: number;
  detect_mode: number;
  auto_dial_interval: number;
  creation_user: string;
  creation_time: string;
  creation_ip: string;
  update_user: string;
  update_time: string;
  update_ip: string;
  dial_phone_id: number;
  tenant_id: number;
  alarm_answer_count: number;
  dial_speed: number;
  parent_campaign: number;
  overdial_abandon_time: number;
  list_alarm_count: number;
  supervisor_phone: string;
  reuse_count: number;
  use_counsel_result: number;
  use_list_alarm: number;
  redial_strategy: string[];
  dial_mode_option: number;
  user_option: string;
  customer_char_id?: number;
  counsel_script_id?: number;
  announcement_id?: number;
  campaign_level?: number;
  outbound_sequence?: string;
  channel_group_id: number;

  phone_dial_try1?: 0,
  phone_dial_try2?: 0,
  phone_dial_try3?: 0,
  phone_dial_try4?: 0,
  phone_dial_try5?: 0,

  redial_strategy1?: string,
  redial_strategy2?: string,  
  redial_strategy3?: string,
  redial_strategy4?: string,
  redial_strategy5?: string,
  

}

// 메인 응답 데이터 타입
export interface MainResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: MainDataResponse[];
}

// 테넌트 조회 응답 데이터 리스트 타입
export interface TenantListDataResponse {
  tenant_id: number;
  tenant_name: string;
}

// 테넌트 조회 데이터 타입
export interface TenantListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: TenantListDataResponse[];
}

// 수정 응답 타입
export interface UpdateResponse {
  result_code: number;
  result_msg: string;
}

// API 에러 타입
export interface AuthApiError {
  message: string;
  status: number;
}

// 캠페인정보 수정 요청 데이터 타입
export interface CampaignInfoUpdateRequest {
  campaign_name: string;
  campaign_desc: string;
  site_code: number;
  service_code: number;
  start_flag: number;
  end_flag: number;
  dial_mode: number;
  callback_kind: number;
  delete_flag: number;
  list_count: number;
  list_redial_query: string;
  next_campaign: number;
  token_id: number;
  phone_order: string;
  phone_dial_try1: number;
  phone_dial_try2: number;
  phone_dial_try3: number;
  phone_dial_try4: number;
  phone_dial_try5: number;
  dial_try_interval: number;  
  trunk_access_code: string;
  DDD_code: string;
  power_divert_queue: number | string;
  max_ring: number;
  detect_mode: number;
  auto_dial_interval: number;
  creation_user: string;
  creation_time: string;
  creation_ip: string;
  update_user: string;
  update_time: string;
  update_ip: string;
  customer_char_id: number;
  dial_phone_id: number;
  counsel_script_id: number;
  announcement_id: number;
  tenant_id: number;
  alarm_answer_count: number;
  dial_speed: number;
  parent_campaign: number;
  campaign_level: number;
  overdial_abandon_time: number;
  list_alarm_count: number;
  supervisor_phone: string;
  reuse_count: number;
  outbound_sequence: string;
  use_counsel_result: number;
  use_list_alarm: number;
  redial_strategy1: string;
  redial_strategy2: string;
  redial_strategy3: string;
  redial_strategy4: string;
  redial_strategy5: string;  
  dial_mode_option: number;
  user_option: string;  
  channel_group_id?: number;
}

// 다이얼링 장비 데이터 타입
// export interface DialingDeviceListDataResponse {
//   tenant_id: number;
//   device_id: number;
//   device_name: string;
//   channel_count: number;
// }

// 다이얼링 장비 데이터 타입
// export interface DialingDeviceListResponse {
//   result_code: number;
//   result_msg: string;
//   result_count: number;
//   total_count: number;
//   result_data: DialingDeviceListDataResponse[];
// }