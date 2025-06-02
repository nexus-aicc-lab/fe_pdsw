// C:\nproject\fe_pdsw\src\widgets\sidebar\hooks\useApiForGetSkillsWithCampaigns.ts

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { 
  CampaignSkillsResponse 
} from '@/types/typeForAddCampaignForCampaignGroup';
import { getSkilsWithCampaigns } from '@/widgets/sidebar2/api/apiForAddCampaginForCampaignGroup';

/**
 * 캠페인에 할당된 스킬 목록을 가져오는 React Query 훅
 * 
 * @param campaignId 캠페인 ID (선택 사항)
 * @param isEnabled 쿼리 활성화 여부 (기본값: false)
 * @param options React Query 추가 옵션
 * @returns 캠페인 스킬 목록 쿼리 결과
 */
export const useApiForGetSkillsWithCampaigns = (
  campaignId?: number,
  isEnabled: boolean = false,
  options?: UseQueryOptions<CampaignSkillsResponse, Error>
) => {
  return useQuery<CampaignSkillsResponse, Error>({
    queryKey: ['skillsWithCampaigns', campaignId],
    queryFn: () => getSkilsWithCampaigns(campaignId),
    enabled: isEnabled, // 명시적으로 활성화될 때만 API 호출
    refetchOnWindowFocus: false,
    retry: 1,
    // staleTime: 5 * 60 * 1000, // 5분 캐시
    ...options,
  });
};


export default useApiForGetSkillsWithCampaigns;