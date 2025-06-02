import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { fetchCampaignProgressForMultipleCampaigns } from "../api/fetchCampaignProgressMultiple";
import { CampaignProgressInformationResponse, MonitoringApiError } from "@/features/monitoring/types/monitoringIndex";

// 타입 정의
type CampaignInput = {
  campaign_id: number;
  tenant_id: number;
  campaign_name: string;
};

// multiple 캠페인 결과 타입 정의
type MultiCampaignProgressResult = {
  campaign_id: number;
  campaign_name: string;
  progressInfoList: CampaignProgressInformationResponse["progressInfoList"];
}[];

// multiple에 맞게 수정
export const useCampaignProgressMutation = (
  options?: UseMutationOptions<MultiCampaignProgressResult, MonitoringApiError, CampaignInput[]>
) => {
  return useMutation<MultiCampaignProgressResult, MonitoringApiError, CampaignInput[]>({
    mutationFn: (campaigns: CampaignInput[]) =>
      fetchCampaignProgressForMultipleCampaigns(campaigns),
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      options?.onSettled?.(data, error, variables, context);
    },
  });
};