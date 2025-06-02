// src/features/campaignManager/types/campaignManagerIndex.ts

export const apiUrl: string = '/counselor';

// 캠페인스케줄 데이터 타입
export interface CampaignScheDuleListDataResponse {
  campaign_id: number;
  tenant_id: number;
  start_date: string;
  end_date: string;
  start_time: string[];
  end_time: string[];
}

// 캠페인스케줄 데이터 타입
export interface CampaignScheDuleListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: CampaignScheDuleListDataResponse[];
}

// 스킬마스터정보조회 데이터 타입
export interface SkillListDataResponse {
  tenant_id: number;
  skill_id: number;
  skill_name: string;
  skill_description: string;
}

// 스킬마스터정보조회 데이터 타입
export interface SkillListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: SkillListDataResponse[];
}

// 캠페인 요청 시 필요한 credentials 타입
export interface CampaignCredentials {
  session_key: string;
  tenant_id: number;
  campaign_id? : number;
}

// 스킬마스터정보조회 요청 시 필요한 credentials 타입
export interface SkillListCredentials {
  tenant_id_array: number[];
}

// 캠페인 할당상담사 요청 시 필요한 credentials 타입
export interface CampaignAssignmentAgentCredentials {
  tenantId: string;
  campaignId: string;
}

// 캠페인 할당상담사 데이터 타입
export interface CampaignAssignmentAgentListResponse {
  code: number;
  message: string;
  assignedCounselorList: CampaignAssignmentAgentListDataResponse[];
}

// 캠페인 할당상담사 데이터 타입
export interface CampaignAssignmentAgentListDataResponse {
  affiliationGroupId: string;
  affiliationGroupName: string;
  affiliationTeamId: string;
  affiliationTeamName: string;
  counselorEmplNum: string;
  counselorId: string;
  counselorname: string;
}

// 캠페인 발신 속도 수정 요청 데이터 타입
export interface CampaignDialSpeedUpdateRequest {
  campaign_id: number;
  tenant_id: number;
  dial_speed: number;
}

// 캠페인스킬 수정 요청 데이터 타입
export interface CampaignSkillUpdateRequest {
  campaign_id: number;
  skill_id: number[];
}

// 캠페인발신번호 데이터 타입
export interface CallingNumberListDataResponse {
  campaign_id: number;
  calling_number: string;
}

// 캠페인 상태 변경 응답 타입
export interface CampaignStatusResponse {
  result_code: number;
  result_msg: string;
  reason_code: number;
}

// 캠페인 상태 변경 요청 데이터 타입
export interface CampaignStatusDataRequest {
  campaign_id: number;
  campaign_status: number;
}

// 캠페인발신번호 데이터 타입
export interface CallingNumberListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: CallingNumberListDataResponse[];
}

// 캠페인 재발신 스케줄링 정보 데이터 타입
export interface AutoRedialListDataResponse {
  campaign_id: number;
  sequence_number: number;
  start_date: string;
  redial_condition: string;
  run_flag: number;
}

// 캠페인 재발신 스케줄링 정보 데이터 타입
export interface AutoRedialListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: AutoRedialListDataResponse[];
}

// 캠페인 소속 상담사 리스트 요청
export interface CampaignAgentListDataRequest {
  campaign_id: number;
}

// 캠페인 소속 상담사 데이터 타입
export interface CampaignAgentListDataResponse {
  campaign_id: number;
  agent_id: string[];
}

// 캠페인 소속 상담사 데이터 타입
export interface CampaignAgentListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: CampaignAgentListDataResponse[];
}

// 캠페인스킬 데이터 타입
export interface CampaignSkillDataResponse {
  campaign_id: number;
  tenant_id: number;
  skill_id: [number];
}

// 캠페인스킬 데이터 타입
export interface CampaignSkillListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: CampaignSkillDataResponse[];
}

// 전화번호설명 템플릿 조회 데이터 타입
export interface PhoneDescriptionListDataResponse {
  description_id: number;
  description: string[];
}

// 전화번호설명 템플릿 조회 데이터 타입
export interface PhoneDescriptionListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: PhoneDescriptionListDataResponse[];
}

// 캠페인 추가 응답 타입
export interface CampaignInsertDataResponse {
  campaign_id: number;
}

// 캠페인 추가 응답 타입
export interface CampaignInsertResponse {
  result_code: number;
  result_msg: string;
  result_data: CampaignInsertDataResponse;
}

// 수정 응답 타입
export interface UpdateResponse {
  result_code: number;
  result_msg: string;
}

// 캠페인 API 에러 타입
export interface CampaignApiError {
  message: string;
  status: number;
}

// 캠페인정보 수정 요청 데이터 타입
export interface CampaignInfoUpdateRequest {
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
  phone_dial_try1: number;
  phone_dial_try2: number;
  phone_dial_try3: number;
  phone_dial_try4: number;
  phone_dial_try5: number;
  dial_try_interval: number;  
  trunk_access_code: string;
  DDD_code: string;
  power_divert_queue: string;
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
  redial_strategy1: string;
  redial_strategy2: string;
  redial_strategy3: string;
  redial_strategy4: string;
  redial_strategy5: string;  
  dial_mode_option: number;
  user_option: string;  
  customer_char_id: number;
  counsel_script_id: number;
  announcement_id: number;
  campaign_level: number;
  outbound_sequence: string;
  channel_group_id: number;
}

// 캠페인정보 삭제 요청 데이터 타입
export interface CampaignInfoDeleteRequest {
  campaign_id: number;
  tenant_id: number;
  delete_dial_list: number;
}

// 캠페인 분배제한 정보 삭제 요청 데이터 타입
export interface MaxcallExtDataDeleteRequest {
  agent_id: string;
}
// 캠페인 분배제한 정보 삭제 요청 데이터 타입
export interface MaxcallExtDeleteRequest {
  campaign_id: number;
  agent_id_list: MaxcallExtDataDeleteRequest[];
}
// 캠페인 재발신 스케줄링 삭제 데이터 요청 타입
export interface AutoRedialDataRequest {
  campaign_id: number;
  sequence_number: number;
}

