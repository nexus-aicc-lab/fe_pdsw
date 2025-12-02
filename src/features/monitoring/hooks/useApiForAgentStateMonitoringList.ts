// src/features/campaignManager/hooks/useApiForAgentStateMonitoringList.ts
import { useMutation } from '@tanstack/react-query';
import { fetchAgentStateMonitoringList } from '../api/mainAgentStateMonitoringList';
import { UseMutationOptions } from '@tanstack/react-query';
import { MonitoringApiError } from '../types/monitoringIndex';
import { AgentStatusMonitoringRequest,AgentStateMonitoringListResponse } from '../api/mainAgentStateMonitoringList';

// 상담 모니터 목록
export function useApiForAgentStateMonitoringList(
  options?: UseMutationOptions<AgentStateMonitoringListResponse, MonitoringApiError, AgentStatusMonitoringRequest>
) {
  return useMutation({
    mutationKey: ['mainAgentStateMonitoringList'],
    mutationFn: fetchAgentStateMonitoringList,
    onSuccess: (data, variables, context) => {
      // console.log('API Response:', {
      //   code: data.code,
      //   message: data.message,
      //   data: data.counselorStatusList
      // });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: MonitoringApiError, variables: AgentStatusMonitoringRequest, context: unknown) => {
      options?.onError?.(error, variables, context);
    },
  });
}