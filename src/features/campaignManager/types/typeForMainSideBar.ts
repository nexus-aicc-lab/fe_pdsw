import { MainDataResponse } from "@/features/auth/types/mainIndex";

// src\features\campaignManager\types\typeForMainSideBar.ts
export interface ITenant {
    tenant_id: number;
    tenant_name: string;
    created_dt?: string;
    updated_dt?: string;
  }
  
  export interface ISideBarMenuItemListProps {
    _tenantId: number;
    tenants: ITenant[];
    campaigns: MainDataResponse[];
    expandedTenants: number[];
    toggleTenant: (tenantId: number) => void;
    handleCampaignClick: (campaign: MainDataResponse) => void;
  }