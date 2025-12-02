// import { useQuery, UseQueryOptions } from '@tanstack/react-query';
// import { fetchConsultantStatusMonitorData
//     , AgentStateMonitoringListResponse
//     , IRequestTypeForFetchConsultantStatusMonitorData 
// } from '../api/mainAgentStateMonitoringList';

// /**
//  * Custom hook to fetch consultant status monitoring data
//  * @param credentials The credentials required for the API call
//  * @param options Optional React Query options
//  * @returns React Query result with monitoring data
//  */
// export const useApiForGetConsultantStatusMonitorData = (
//     credentials: IRequestTypeForFetchConsultantStatusMonitorData,
//     options?: Omit<UseQueryOptions<
//         AgentStateMonitoringListResponse,
//         Error,
//         AgentStateMonitoringListResponse,
//         readonly ['consultantStatusMonitor', number, number]
//     >, 'queryKey' | 'queryFn'>
// ) => {
//     const queryKey = ['consultantStatusMonitor', credentials.tenantId, credentials.campaignId] as const;
    
//     return useQuery<
//         AgentStateMonitoringListResponse,
//         Error,
//         AgentStateMonitoringListResponse,
//         typeof queryKey
//     >({
//         queryKey,
//         queryFn: () => fetchConsultantStatusMonitorData(credentials),
//         ...options,
//         staleTime: 0, 
//     });
// };