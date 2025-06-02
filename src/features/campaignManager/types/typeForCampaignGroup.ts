// C:\nproject\fe_pdsw\src\features\campaignManager\types\typeForCampaignGroup.ts

// Base API Response type
export interface ApiResponse<T> {
  result_code: number;
  result_msg: string;
  result_count: number;
  result_data: T[];
}

// Campaign Group Types
export interface CampaignGroup {
  tenant_id: number;
  group_id: number;
  group_name: string;
}

export type CampaignGroupResponse = ApiResponse<CampaignGroup>;

// Campaign Types
export interface Campaign {
  tenant_id: number;
  campaign_id: number;
  campaign_name: string;
  group_id: number;
  start_flag: number;
}

export type CampaignResponse = ApiResponse<Campaign>;

// Campaign Group Campaign Types - For campaigns within a group
export interface GroupCampaign {
  tenant_id: number;
  group_id: number;
  group_name: string;
  campaign_id: number;
  campaign_name: string;
  start_flag: number;
}

export type GroupCampaignResponse = ApiResponse<GroupCampaign>;

// Request Types - Simplified to match actual API requirements
export interface ApiRequest {
  filter: {
    group_id?: number[];
    tenant_id?: number[];
    campaign_id?: number[];
  };
  sort: {
    group_id?: number;
    campaign_id?: number;
  };
  page: {
    index: number;
    items: number;
  };
}

// Error Type
export interface ApiError {
  message: string;
  status?: number;
}

