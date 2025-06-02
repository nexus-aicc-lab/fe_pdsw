// src/shared/hooks/tenant/useApiForGetTenants.ts
"use client";

import {
  apiForGetTenantsForSystemAdmin,
  TenantListResponseForSystemAdmin,
  TenantFilterRequestForSystemAdmin,
} from "@/shared/api/tenant/apiForGetTenantsForSystemAdmin";
import { useQuery } from "@tanstack/react-query";

interface UseApiForGetTenantsOptions {
  request?: Partial<TenantFilterRequestForSystemAdmin>;
  enabled?: boolean;
}

export const useApiForGetTenants = ({
  request,
  enabled = true,
}: UseApiForGetTenantsOptions = {}) => {
  return useQuery<TenantListResponseForSystemAdmin>({
    queryKey: ["tenants", request],
    queryFn: () => apiForGetTenantsForSystemAdmin(request),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};
