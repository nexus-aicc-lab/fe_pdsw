import { axiosInstance } from "@/lib/axios";
import { SuccesResponse, SystemCallBackTimeResponse, SystemCallBackTimeUpdateRequest, TenantIdCredentials } from "../types/SystemPreferences";


// 시스템 콜백 리스트 초기화 시간 조회 API (POST)
export const SystemCallBackTimeSetting = async (): Promise<SystemCallBackTimeResponse> => {
    
    try {
        const { data } = await axiosInstance.post<SystemCallBackTimeResponse>(
            '/collections/callback-daily-init-time',
            
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
};


// 시스템 콜백 리스트 초기화 시간 수정 API (POST)
export const UpdateSystemCallBackTime = async (credentials: SystemCallBackTimeUpdateRequest): Promise<SuccesResponse> => {
    const requestData = {
        request_data: {
            use_flag: credentials.use_flag,
            ...(credentials.use_flag === 1 && { init_hour: credentials.init_hour }), // init_flag가 1일 때만 init_hour 포함
        }
    };

    try {
        const { data } = await axiosInstance.put<SuccesResponse>(
            '/callback-daily-init-time',
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

