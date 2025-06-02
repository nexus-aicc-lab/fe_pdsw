import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { CampaignGroupSkillsResponse } from '@/types/typeForAddCampaignForCampaignGroup';
import { getCampaignListForCampaignGroup } from '@/widgets/sidebar2/api/apiForAddCampaginForCampaignGroup';

/**
 * 캠페인 그룹에 대한 캠페인 목록을 가져오는 React Query 훅
 * @param groupId 캠페인 그룹 ID (필수)
 * @param campaignId 캠페인 ID (옵션)
 * @param tenantId 테넌트 ID (옵션)
 * @param isOpen 팝업이 열려있는지 여부 (기본값: false)
 * @param options React Query 추가 옵션
 * @returns 캠페인 그룹 스킬 목록 쿼리 결과
 */
export const useApiForGetCampaignListForCampaignGroup = (
  groupId: number,
  campaignId?: number,
  tenantId?: number,
  isOpen: boolean = false,
  options?: UseQueryOptions<CampaignGroupSkillsResponse, Error>
) => {
  return useQuery<CampaignGroupSkillsResponse, Error>({
    queryKey: ['campaignGroupSkills', groupId, campaignId, tenantId],
    queryFn: () => getCampaignListForCampaignGroup(groupId, campaignId, tenantId),
    staleTime: 5 * 60 * 1000, // 5분 캐시
    enabled: isOpen, // 팝업이 열려 있을 때만 API 호출
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
};

export default useApiForGetCampaignListForCampaignGroup;
