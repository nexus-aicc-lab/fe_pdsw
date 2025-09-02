// src/features/campaignManager/hooks/useApiForDeleteCounselorsForSpecificSkill.ts
import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { UseMutationOptions } from '@tanstack/react-query';
import { CounselorSkillAssignmentResponse, CounselorSkillApiError } from '../types/typeForCounselorSkill';
import { apiForDeleteCounselorsForSpecificSkill } from '../api/apiForCounselorSkil';

interface DeleteCounselorFromSkillParams {
  skillId: number;
  counselorIds: string[];
}

export function useApiForDeleteCounselorsForSpecificSkill(
  tenant_id: string,
  options?: UseMutationOptions<
    CounselorSkillAssignmentResponse, 
    CounselorSkillApiError, 
    DeleteCounselorFromSkillParams
  >
): UseMutationResult<CounselorSkillAssignmentResponse, CounselorSkillApiError, DeleteCounselorFromSkillParams, unknown> {
  const queryClient = useQueryClient();

  return useMutation<CounselorSkillAssignmentResponse, CounselorSkillApiError, DeleteCounselorFromSkillParams>({
    mutationKey: ['deleteCounselorsFromSkill'],
    mutationFn: ({ skillId, counselorIds }: DeleteCounselorFromSkillParams) => 
      apiForDeleteCounselorsForSpecificSkill(skillId, counselorIds),
    onSuccess: (data, variables, context) => {
      // 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['counselorList', tenant_id]
      });
      
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // console.error('❌ 스킬에서 상담사 제외 실패:', error);
      options?.onError?.(error, variables, context);
    },
  });
}