// src/features/campaignManager/hooks/useApiForGetDataForSidebarCounselorTab.tsx
import { useQuery } from '@tanstack/react-query';
import { apiToFetchCounselorListForSideBar } from '../api/apiForSidebarCounselorTab';
import { IResponseTypeForApiForGetCounselorList } from '../types/typeForSideBarCounselorTab2';

export function useApiForSidebarCounselor(centerId:string,tenant_id: string) {
  return useQuery<IResponseTypeForApiForGetCounselorList, Error>({
    queryKey: ['counselorList', tenant_id],
    queryFn: () => apiToFetchCounselorListForSideBar(centerId, tenant_id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
