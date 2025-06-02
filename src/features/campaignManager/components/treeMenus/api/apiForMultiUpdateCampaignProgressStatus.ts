// src/features/campaignManager/utils/updateMultipleCampaignStatus.ts
import { fetchCampaignStatusUpdate } from "@/features/campaignManager/api/mainCampaignStatusUpdate";
import { CampaignStatusDataRequest, CampaignStatusResponse } from "@/features/campaignManager/types/campaignManagerIndex";

export type UpdateResult = {
  campaignId: string;
  success: boolean;
  response?: CampaignStatusResponse;
  error?: string;
};

export type BatchUpdateResult = {
  totalCount: number;
  successCount: number;
  failCount: number;
  results: UpdateResult[];
};

export const updateMultipleCampaignStatus = async (
  campaignIds: string[],
  status: string
): Promise<BatchUpdateResult> => {
  const updatePromises = campaignIds.map(async (campaignId) => {
    try {
      const credentials: CampaignStatusDataRequest = {
        campaign_id: parseInt(campaignId, 10),
        campaign_status: parseInt(status, 10)
      };
      
      const response = await fetchCampaignStatusUpdate(credentials);
      
      return {
        campaignId,
        success: true,
        response
      };
    } catch (error: any) {
      return {
        campaignId,
        success: false,
        error: error.message
      };
    }
  });

  const results = await Promise.all(updatePromises);
  
  const successCount = results.filter(result => result.success).length;
  const failCount = results.filter(result => !result.success).length;
  
  return {
    totalCount: campaignIds.length,
    successCount,
    failCount,
    results
  };
};