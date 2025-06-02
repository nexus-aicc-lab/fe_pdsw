"use client";

import { apiForCampaignAgentListForSystemAdmin, IRequestTypeForCampaignAgentListForSystemAdmin, IResponseTypeForCampaignAgentListForSystemAdmin } from "@/shared/api/camapign/apiForCampaignAgentListForSystemAdmin";
import { useQuery } from "@tanstack/react-query";

interface UseApiForCampaignAgentListOptions {
  request?: Partial<IRequestTypeForCampaignAgentListForSystemAdmin>;
  enabled?: boolean;
}

// useApiForCampaignAgentListForSystemAdmin 훅을 수정
export const useApiForCampaignAgentListForSystemAdmin = ({
  request,
  enabled = true,
}: UseApiForCampaignAgentListOptions = {}) => {
  // 요청 변환: campaign_id 배열이 여러 개인 경우 각각 단일 요소 배열로 변환하여 여러 번 호출
  const fetchAgents = async () => {
    if (!request?.filter?.campaign_id || request.filter.campaign_id.length === 0) {
      return await apiForCampaignAgentListForSystemAdmin(request);
    }

    // 각 캠페인 ID에 대해 개별 호출
    const campaignIds = request.filter.campaign_id;
    const results = await Promise.all(
      campaignIds.map(id =>
        apiForCampaignAgentListForSystemAdmin({
          ...request,
          filter: {
            ...request.filter,
            campaign_id: [id]  // 단일 요소 배열로 전달
          }
        })
      )
    );

    // 결과 병합
    if (results.length === 0) return { result_code: 0, result_msg: '', result_data: [] };

    const mergedResult = { ...results[0] };
    for (let i = 1; i < results.length; i++) {
      if (results[i].result_data) {
        mergedResult.result_data = [
          ...(mergedResult.result_data || []),
          ...results[i].result_data
        ];
      }
    }

    return mergedResult;
  };

  return useQuery<IResponseTypeForCampaignAgentListForSystemAdmin>({
    queryKey: ["campaignAgentListForSystemAdmin", request],
    queryFn: fetchAgents,
    enabled,
    staleTime: 1000 * 60 * 5, // 5분
  });
};