// src/features/campaignManager/api/apiForCampaignById.ts
import { axiosInstance } from "@/lib/axios";
import { CampaignApiError, CampaignListResponse, CampaignRequestData } from "../types/typeForCampaignForSideBar";

export const apiForGetCampaignById = async (campaignId: number): Promise<CampaignListResponse> => {
  const campaignRequestData: CampaignRequestData = {
    filter: {
      campaign_id: {
        start: campaignId,
        end: campaignId,
      },
    },
    sort: {
      campaign_id: 0,
    },
    page: {
      index: 1,
      items: 1,
    },
  };

  try {
    const { data } = await axiosInstance.post<CampaignListResponse>(
      '/collections/campaign',
      campaignRequestData
    );

    if (data.result_code === 0 && data.result_msg === "Success") {
      return data;
    } else {
      throw new Error(`API Error: ${data.result_msg}`);
    }
  } catch (error) {
    const typedError = error as CampaignApiError;
    throw new Error(
      typedError.response?.data?.result_msg || '캠페인 정보를 가져오는데 실패했습니다.'
    );
  }
};
