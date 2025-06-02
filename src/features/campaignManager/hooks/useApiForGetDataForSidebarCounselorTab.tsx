// // src/features/campaignManager/hooks/useApiForGetDataForSidebarCounselorTab.tsx
// import { useQuery } from '@tanstack/react-query';
// import { apiToFetchCounselorListForSideBar } from '../api/apiForSidebarCounselorTab';
// import { IResponseTypeForApiForGetCounselorList } from '../types/typeForSideBarCounselorTab2';

// export function useApiForSidebarCounselor(tenant_id: string, role_id: string) {
//   return useQuery<IResponseTypeForApiForGetCounselorList, Error>({
//     queryKey: ['counselorList', tenant_id, role_id],
//     queryFn: () => apiToFetchCounselorListForSideBar({ tenant_id, roleId: role_id }),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });
// }

// src/features/campaignManager/hooks/useApiForGetDataForSidebarCounselorTab.tsx
import { useQuery } from '@tanstack/react-query';
import { apiToFetchCounselorListForSideBar } from '../api/apiForSidebarCounselorTab';
import { IResponseTypeForApiForGetCounselorList } from '../types/typeForSideBarCounselorTab2';

export function useApiForSidebarCounselor(tenant_id: string) {
  return useQuery<IResponseTypeForApiForGetCounselorList, Error>({
    queryKey: ['counselorList', tenant_id],
    queryFn: () => apiToFetchCounselorListForSideBar(tenant_id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
