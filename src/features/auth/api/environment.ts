import { axiosRedisInstance } from "@/lib/axios";
import { EnvironmentListCredentials, EnvironmentListResponse, EnvironmentSaveRequest, EnvironmentSaveResponse } from "../types/environmentIndex";

export const fetchEnvironmentList = async (credentials: EnvironmentListCredentials): Promise<EnvironmentListResponse> => {
    const EnvironmentRequestData = {
        centerId: credentials.centerId,
        tenantId: credentials.tenantId,
        employeeId: credentials.employeeId
    };

    try {
        const { data } = await axiosRedisInstance.post<EnvironmentListResponse>(
            '/auth/environment',
            EnvironmentRequestData
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
};

export const fetchEnvironmentSave = async (credentials: EnvironmentSaveRequest): Promise<EnvironmentSaveResponse> => {
    const EnvironmentRequestData = {
        employeeId: credentials.employeeId,
        campaignListAlram: credentials.campaignListAlram,
        statisticsUpdateCycle: credentials.statisticsUpdateCycle,
        serverConnectionTime: credentials.serverConnectionTime,
        showChannelCampaignDayScop: credentials.showChannelCampaignDayScop,
        personalCampaignAlertOnly: credentials.personalCampaignAlertOnly,
        useAlramPopup: credentials.useAlramPopup,
        unusedWorkHoursCalc: credentials.unusedWorkHoursCalc,
        sendingWorkStartHours: credentials.sendingWorkStartHours,
        sendingWorkEndHours: credentials.sendingWorkEndHours,
        dayOfWeekSetting: credentials.dayOfWeekSetting,
        maskInfo: credentials.maskInfo
    };

    try {
        const { data } = await axiosRedisInstance.post<EnvironmentListResponse>(
            '/auth/environment/save',
            EnvironmentRequestData
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
};