// src/features/campaignManager/api/apiForChannelStateMonitoringList.ts
import { axiosRedisInstance } from "@/lib/axios";
import { ChannelStatusMonitoringRequest, ChannelStatusMonitoringListResponse } from '../types/monitoringIndex';
import { getCookie } from '@/lib/cookies';

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