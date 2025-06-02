import { axiosInstance } from "@/lib/axios";
import { CallLimitSettingCreateRequest, CallLimitSettingDeleteRequest, CallLimitSettingListResponse, SuccesResponse, TenantIdCredentials } from "../types/SystemPreferences";
import { ca } from "date-fns/locale";

// 운영설정 예약콜 제한설정 리스트 요청
export const fetchCallLimitSettingList = async (credentials: TenantIdCredentials): Promise<CallLimitSettingListResponse> => {
    const callLimitSettingListRequestData = {
        filter: {
            tenant_id: credentials.tenant_id_array
        },
        sort: {
            // ### 정렬 우선순위 campaing_id로 변경
            campaign_id: 0,
            tenant_id: 0
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
            // campaign_id: credentials.campaign_id,
            tenant_id: credentials.tenant_id,
            call_kind: credentials.call_kind,
            call_timeout: credentials.call_timeout,
            max_call: credentials.max_call,
            daily_init_flag: credentials.daily_init_flag,
            daily_init_time: credentials.daily_init_time

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

            daily_init_flag: credentials.daily_init_flag,
            daily_init_time: credentials.daily_init_time

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

// 삭제 API (DELETE)
export const deleteCallLimitSetting = async (credentials: CallLimitSettingDeleteRequest): Promise<SuccesResponse> => {
    const requestData = {
        request_data: {
            tenant_id: credentials.tenant_id
        }
    };
    try {
        const { data } = await axiosInstance.delete<SuccesResponse>(
            'campaigns/'+credentials.campaign_id+'/reserved-call',
            { data: requestData }
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
};