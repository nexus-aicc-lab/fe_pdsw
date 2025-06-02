// src/shared/store/useStoreForTenantDataForSystemAdmin.tsx

import { create } from "zustand";
import { TenantItemForSystemAdmin } from "@/shared/api/tenant/apiForGetTenantsForSystemAdmin";

interface TenantDataState {
  tenants: TenantItemForSystemAdmin[];
  isLoading: boolean;
  error: unknown;
  setTenants: (tenants: TenantItemForSystemAdmin[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: unknown) => void;
}

export const useStoreForTenantDataForSystemAdmin = create<TenantDataState>((set) => ({
  tenants: [],
  isLoading: false,
  error: null,
  setTenants: (tenants) => set({ tenants }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
