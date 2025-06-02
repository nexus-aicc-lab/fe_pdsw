import { axiosInstance } from "@/lib/axios";
import { CallLimitSettingCreateRequest, CallLimitSettingListResponse, SuccesResponse, TenantIdCredentials } from "../types/SystemPreferences";

// 운영설정 예약콜 제한설정 리스트 요청
export const fetchCallLimitSettingList = async (credentials: TenantIdCredentials): Promise<CallLimitSettingListResponse> => {
    const callLimitSettingListRequestData = {
        filter: {
            tenant_id: credentials.tenant_id_array
        },
        sort: {
            tenant_id: 0,
            campaign_id: 0
        },
    };

    try {
        const { data } = await axiosInstance.post<CallLimitSettingListResponse>(
            '/collections/campaign-reserved-call',
            callLimitSettingListRequestData
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
};

// 신규 등록 API (POST)
export const createCallLimitSetting = async (credentials: CallLimitSettingCreateRequest): Promise<SuccesResponse> => {
    const requestData = {
        request_data: {
            tenant_id: credentials.tenant_id,
            call_kind: credentials.call_kind,
            call_timeout: credentials.call_timeout,
            max_call: credentials.max_call,
            // max_criteria: credentials.max_criteria,
        }
    };

    try {
        const { data } = await axiosInstance.post<SuccesResponse>(
            'campaigns/'+credentials.campaign_id+'/reserved-call',
            requestData
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
};

// 수정 API (PUT)
export const UpdateCallLimitSetting = async (credentials: CallLimitSettingCreateRequest): Promise<SuccesResponse> => {
    const requestData = {
        request_data: {
            tenant_id: credentials.tenant_id,
            call_kind: credentials.call_kind,
            call_timeout: credentials.call_timeout,
            max_call: credentials.max_call,
            // max_criteria: credentials.max_criteria,
        }
    };

    try {
        const { data } = await axiosInstance.put<SuccesResponse>(
            'campaigns/'+credentials.campaign_id+'/reserved-call',
            requestData
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
};