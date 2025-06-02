import { useQuery, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import {
  SkillListResponse,
} from '@/widgets/sidebar2/api/type/typeForAddCampaignForCampaignGroup';
import { getTotalSkillList } from '@/widgets/sidebar2/api/apiForAddCampaginForCampaignGroup';

/**
 * 스킬 목록을 가져오는 React Query 훅
 * @param tenantId 테넌트 ID (선택 사항)
 * @param isOpen 팝업이 열려있는지 여부 (기본값: false)
 * @param options React Query 추가 옵션
 * @returns 스킬 목록 쿼리 결과
 */
export const useTotalSkillListForAddCampaignToCampaignGroup = (
  tenantId?: number,
  isOpen: boolean = false,
  options?: UseQueryOptions<SkillListResponse, Error>
) => {
  return useQuery<SkillListResponse, Error>({
    queryKey: ['skills', tenantId],
    queryFn: () => getTotalSkillList(tenantId),
    staleTime: 5 * 60 * 1000, // 5분 캐시
    enabled: isOpen, // 팝업이 열려 있을 때만 API 호출
    refetchOnWindowFocus: false, // 창이 포커스될 때 자동으로 다시 가져오지 않음
    retry: 1, // 실패 시 1번만 재시도
    ...options,
  });
};