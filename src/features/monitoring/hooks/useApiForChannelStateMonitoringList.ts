// src/features/campaignManager/hooks/useApiForChannelStateMonitoringList.ts
import { useMutation } from '@tanstack/react-query';
import { fetchChannelStateMonitoringList } from '../api/mainChannelStateMonitoringList';
import { UseMutationOptions } from '@tanstack/react-query';
import { ChannelStatusMonitoringRequest, ChannelStatusMonitoringListResponse, MonitoringApiError } from '../types/monitoringIndex';

export function useApiForChannelStateMonitoringList(
  options?: UseMutationOptions<ChannelStatusMonitoringListResponse, MonitoringApiError, ChannelStatusMonitoringRequest>
) {
  return useMutation({
    mutationKey: ['mainChannelStateMonitoringList'],
    mutationFn: fetchChannelStateMonitoringList,
    onSuccess: (data, variables, context) => {
      // console.log('API Response:', {
      //   code: data.code,
      //   message: data.message,
      //   data: data.dialerChannelStatusList
      // });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: MonitoringApiError, variables: ChannelStatusMonitoringRequest, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}