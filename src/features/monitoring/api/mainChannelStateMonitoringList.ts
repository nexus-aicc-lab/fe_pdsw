// src/features/campaignManager/api/apiForChannelStateMonitoringList.ts
import { axiosRedisInstance } from "@/lib/axios";
import { getCookie } from '@/lib/cookies';

// 채널 모니터링 요청 
export interface ChannelStatusMonitoringRequest {
  deviceId: string;
}

// 채널 모니터링 데이터 타입
interface ChannelStatusMonitoringListDataResponse {
  id: string;             //채널번호
  deviceId: string;       //장치번호
  state: string;          //채널 상태 : 0(NONE), 1(IDLE), 2(BUSY)
  event: string;          //채널에 발생한 마지막 이벤트
  assign_kind: string;    //채널 할당 유형 : 1(CAMPAIGN), 2(DIAL_MODE), 3(CHANNEL_GROUPP)
  campaign_id: string;    //채널을 사용하는 캠페인 ID
  dial_mode: string;      //캠페인 발신 모드 : 0(NONE), 1(POWER), 2(PROGRESSIVE), 3(PREDICTIVE), 4(PRIVATE_PROGRESSIVE), 5(AUTO_PREVIEW), 6(ALARM), 7(DIRECT), 0x7fffffff(AUTO)
  dial_sequence: string;  //발신 일련 번호
}

// 채널 모니터링 응답 
export interface ChannelStatusMonitoringListResponse {
  code: number;
  message: string;
  dialerChannelStatusList: ChannelStatusMonitoringListDataResponse[];
}

export const fetchChannelStateMonitoringList = async (credentials: ChannelStatusMonitoringRequest): Promise<ChannelStatusMonitoringListResponse> => {
  const channelStateMonitoringListRequestData = {
    deviceId: credentials.deviceId+'',
    sessionKey: getCookie('session_key')
  };

  try {
    const { data } = await axiosRedisInstance.post<ChannelStatusMonitoringListResponse>(
      `/monitor/dialer/channel`, 
      channelStateMonitoringListRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};