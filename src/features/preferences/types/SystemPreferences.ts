export const apiUrl: string = '/counselor';

// API 에러 타입
export interface ApiError {
    message: string;
    status: number;
}

// 테넌트ID credentials 타입
export interface TenantIdCredentials {
    tenant_id_array: number[];
  }

// 응답 타입
export interface SuccesResponse {
  result_code: number;
  result_msg: string;
}

// 다이얼링 장비 데이터 타입
export interface DialingDeviceListDataResponse {
    tenant_id: number;
    device_id: number;
    device_name: string;
    channel_count: number;
    device_state: string;
}
  
// 다이얼링 장비 데이터 타입
export interface DialingDeviceListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: DialingDeviceListDataResponse[];
}

// 다이얼링 장비 삭제
export interface DialingDeviceDeleteRequest {
  tenant_id: number;
  device_id: number;
}


// 채널 리스트 데이터 타입
export interface ChannelListDataResponse {
  device_id: number;
  assign_kind: number;
  channel_count: number;
  channel_assign: number[];
}

// 채널 리스트 타입
export interface ChannelListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: ChannelListDataResponse[];
}

// 채널 수정 요청 타입
export interface ChannelEditRequest {
  device_id: number;
  assign_kind: number;
  channel_count: number;
  channel_assign: number[];
}

export interface DialingDeviceCreateRequest {
  channel_count: number;
  device_id: number;
  device_name: string;
  tenant_id: number;
}

// 예약콜 제한설정 리스트 데이터 타입
export interface DialingDeviceListDataResponse {
  campaign_id: number;
  tenant_id: number;
  call_kind: number;
  call_timeout: number;
  max_call: number;
  max_criteria: number;
}

// 예약콜 제한설정 리스트 데이터 타입
export interface CallLimitSettingListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: DialingDeviceListDataResponse[];
}

// 예약콜 제한설정 추가 요청 타입
// 0417 수정 
export interface CallLimitSettingCreateRequest {
  campaign_id: number; // 캠페인 ID

  // request_data 객체 내부
  tenant_id: number;   // 테넌트 ID
  call_kind: number;   // 예약콜 종류 (1: Callback)
  call_timeout: number; // 예약콜 타임아웃 시간 (단위: 분)
  max_call: number;     // 예약콜 최대 건수

  daily_init_flag?: number; // 콜백캠페인 리스트 일별 초기화 여부 (0: 미사용, 1: 하루에 한 번씩 리스트 삭제)
  daily_init_time?: string | null; // 리스트 초기화 시간 (형식: 24hhmi, 예: 0830)
}


// 예약콜 제한설정 삭제 요청 타입
export interface CallLimitSettingDeleteRequest {
  campaign_id: number;
  tenant_id: number;
}


// 시스템 콜백 리스트 초기화 시간 데이터 타입
export interface SystemCallBackTimeResponse {
  result_code: number;
  result_msg: string;
  result_data: {use_flag: number, init_hour?: string;};
}

// 시스템 콜백 리스트 초기화 시간 수정 요청 타입
export interface SystemCallBackTimeUpdateRequest {
  use_flag: number; // 0: 미사용, 1: 사용
  init_hour?: string; // "01" string 옵셔널값, init_flag가 1이면 보내야하고, 0이면 안보낸다
}


// 상담사 리스트
export interface CounselorListCredentials {
  tenantId: number;
  roleId: number;
}

export interface GetCounselorListResponse {
  code: string;
  message: string;
  organizationList: IOrganization[];
}

export interface IOrganization {
  centerId: string;
  centerName: string;
  tenantInfo: ITenant[];
}

interface ITenant {
  tenantId: string;
  tenantName: string;
  groupInfo: IGroup[];
}

export interface IGroup {
  groupId: string;
  groupName: string;
  teamInfo: ITeam[];
}

export interface ITeam {
  teamId: string;
  teamName: string;
  counselorInfo: ICounselor[];
}

export interface ICounselor {
  counselorId: string;
  counselorname: string;
  blendKind: string;
}

export interface MaxCallListCredentials {
  campaign_id: number[];
}

export interface SingleMaxCallDeleteRequest {
  campaign_id: number;
  agent_id: string;
}

export type MaxCallDeleteRequest = SingleMaxCallDeleteRequest | SingleMaxCallDeleteRequest[];

export interface MaxCallListDataResponse {
  agent_id: string; 
  campaign_id: number;
  max_call: number;
  answered_call: number;
  fix_flag: number;
}

export interface MaxCallListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: MaxCallListDataResponse[];
}

export interface SingleMaxCallRequest {
  campaign_id: number;
  agent_id: string;
  max_call: number;
  fix_flag: number;
}

export type CreateMaxCallRequest = SingleMaxCallRequest | SingleMaxCallRequest[];

export interface MaxCallDataResponse {
  agent_id: string;
  campaign_id: number;
  max_call: number;
  answered_call: number;
}

export interface CreateMaxCallResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  request_count: number;
  result_data: MaxCallDataResponse[];
}

export interface MaxCallDeleteResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  request_count: number;
  result_data: MaxCallDeleteDataResponse[];
}

export interface MaxCallDeleteDataResponse {
  agent_id: string;
  campaign_id: number;
}

export interface AgentReadyCountDataResponse {
  result_code: number;
  result_msg: string;
  result_data: {
    campaign_id: number;
    ready_count: number;
  }
}

export interface MaxCallInitTimeListResponse {
  result_code: number;
  result_msg: string;
  result_data: {
    init_time: string;
  }
}

export interface MaxCallInitTimeUpdateRequest {
  init_time: string;
}

export interface MaxCallInitTimeUpdateResponse {
  result_code: number;
  result_msg: string;
}

export interface SkillListCredentials {
  tenant_id_array: number[] | undefined;
}

export interface SkillListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: SkillListDataResponse[];
}

export interface SkillListDataResponse {
  tenant_id: number;
  skill_id: number;
  skill_name: string;
  skill_description: string;
}

export interface SkillCampaignListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: SkillCampaignListDataResponse[];
}

export interface SkillCampaignListDataResponse {
  skill_id: number;
  tenant_id: number;
  campaign_id: number[];
}

export interface SkillAgentListResponse {
  result_code: number;
  result_msg: string,
  result_count: number;
  total_count: number;
  result_data: SkillAgentListDataResponse[];
}

export interface SkillAgentListDataResponse {
  skill_id: number;
  tenant_id: number;
  agent_id: string[];
}

export interface CampaignListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: CampaignListDataResponse[];
}

export interface CampaignListDataResponse {
  campaign_id: number;
  campaign_name: string;
  tenant_id: number;
  dial_mode: number; // 캠페인 발신 모드 구분 1 : Power Mode, 2 : Progressive Mode, 3 : Predictive Mode, 5 : Preview Mode
}

export interface  CreateSkillCredentials {
  skill_id: number;
  tenant_id: number;
  skill_name: string;
  skill_description: string;
}

export interface DeleteSkillCredentials {
  skill_id: number;
  skill_name: string;
}

export interface DeleteAgentSkillCredentials {
  skill_id: number;
  agent_id: string[];
}

// 캠페인스킬 수정 요청 데이터 타입
export interface CampaignSkillUpdateRequest {
  campaign_id: number;
  skill_id: number[];
}

// 캠페인 요청 시 필요한 credentials 타입
// export interface CampaignCredentials {
//   session_key: string;
//   tenant_id: number;
// }

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

// 서스펜드 캠페인 조회
export interface SuspendedCampaignListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data:[
    camapain_id: number,
    suspend_time: string
  ]
}

// 서스펜드 스킬 조회
export interface SuspendedSkillListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data:[
    skill_id: number,
    suspend_time: string
  ]
}