// // fetchCampaignProgressMultiple.ts

// import { fetchCampaignProgressInformation } from "@/features/monitoring/api/mainCampaignProgressInformation";
// import { CampaignProgressInformationResponse } from "@/features/monitoring/types/monitoringIndex";

// export const fetchCampaignProgressForMultipleCampaigns = async (
//   campaigns: { campaign_id: number; tenant_id: number; campaign_name: string }[]
// ): Promise<
//   {
//     campaign_id: number;
//     campaign_name: string;
//     progressInfoList: CampaignProgressInformationResponse['progressInfoList'];
//   }[]
// > => {
//   const results = await Promise.allSettled(
//     campaigns.map((c) =>
//       fetchCampaignProgressInformation({
//         tenantId: c.tenant_id,
//         campaignId: c.campaign_id,
//       }).then((res) => ({
//         campaign_id: c.campaign_id,
//         campaign_name: c.campaign_name,
//         progressInfoList: res.progressInfoList || [],
//       }))
//     )
//   );

//   return results
//     .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
//     .map((r) => r.value);
// };

// fetchCampaignProgressMultiple.ts

import { fetchCampaignProgressInformation } from "@/features/monitoring/api/mainCampaignProgressInformation";
import { CampaignProgressInformationResponse } from "@/features/monitoring/types/monitoringIndex";

export const fetchCampaignProgressForMultipleCampaigns = async (
  campaigns: { campaign_id: number; tenant_id: number; campaign_name: string }[]
): Promise<
  {
    campaign_id: number;
    campaign_name: string;
    progressInfoList: CampaignProgressInformationResponse["progressInfoList"];
  }[]
> => {
  // Return early if no campaigns to fetch
  if (campaigns.length === 0) {
    return [];
  }

  // Log which campaigns are being fetched for debugging
  // console.log(
  //   `[fetchCampaignProgressForMultipleCampaigns] Fetching progress for ${campaigns.length} campaigns sequentially:`,
  //   campaigns.map(c => `${c.campaign_id} (${c.campaign_name})`)
  // );

  const results: {
    campaign_id: number;
    campaign_name: string;
    progressInfoList: CampaignProgressInformationResponse["progressInfoList"];
  }[] = [];

  // 순차 실행 - for...of 루프 사용하여 한 번에 하나씩 API 호출
  for (const c of campaigns) {
    try {
      // console.log(`[fetchCampaignProgressForMultipleCampaigns] Fetching campaign ${c.campaign_id} (${c.campaign_name})`);
      
      const res = await fetchCampaignProgressInformation({
        tenantId: c.tenant_id,
        campaignId: c.campaign_id,
      });
      
      results.push({
        campaign_id: c.campaign_id,
        campaign_name: c.campaign_name,
        progressInfoList: res.progressInfoList || [],
      });
      
      // console.log(`[fetchCampaignProgressForMultipleCampaigns] Successfully fetched campaign ${c.campaign_id}`);
    } catch (error) {
      // console.error(
      //   `[fetchCampaignProgressForMultipleCampaigns] 캠페인 ${c.campaign_id} (${c.campaign_name}) 조회 실패:`,
      //   error
      // );
      // 실패한 캠페인은 건너뜁니다 - 결과에 포함되지 않음
    }
  }

  return results;
};