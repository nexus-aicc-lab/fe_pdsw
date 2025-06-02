import { axiosRedisInstance } from "@/lib/axios";
import { SystemMonitoringResponse } from "../types/systemMonitoringindex";

// 시스템 모니터링 API(GET)
export const fetchSystemMonitoring = async (): Promise<SystemMonitoringResponse> => {
    try {
        const { data } = await axiosRedisInstance.get<SystemMonitoringResponse>(
            '/monitor/process'
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
      }
    };