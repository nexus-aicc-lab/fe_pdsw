// 에러 타입
export interface ApiError {
    message: string;
    status: number;
}  

// 환경설정 요청 시 필요한 credenitials 타입
export interface EnvironmentListCredentials {
    centerId: number;
    tenantId: number;
    employeeId: string;
}

// 환경설정 응답 데이터 타입
export interface EnvironmentListResponse {
    code: string;
    message: string;
    campaignListAlram: number;
    statisticsUpdateCycle: number;
    serverConnectionTime: number;
    showChannelCampaignDayScop: number;
    personalCampaignAlertOnly: number;
    useAlramPopup: number;
    unusedWorkHoursCalc: number;
    sendingWorkStartHours: string;
    sendingWorkEndHours: string;
    dayOfWeekSetting: string;
    maskInfo: number;
}

// 환경설정 수정 RequestData
export interface EnvironmentSaveRequest {
    employeeId: string;
    campaignListAlram: number;
    statisticsUpdateCycle: number;
    serverConnectionTime: number;
    showChannelCampaignDayScop: number;
    personalCampaignAlertOnly: number;
    useAlramPopup: number;
    unusedWorkHoursCalc: number;
    sendingWorkStartHours: string;
    sendingWorkEndHours: string;
    dayOfWeekSetting: string;
    maskInfo: number;
}

// 환경설정 수정 Response
export interface EnvironmentSaveResponse {
    code: string;
    message: string;
}