// src/features/campaignManager/hooks/useApiForAddCounselorsForSpecificSkill.ts
import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { UseMutationOptions } from '@tanstack/react-query';
import { CounselorSkillAssignmentResponse, CounselorSkillApiError } from '../types/typeForCounselorSkill';
import { apiForAddCounselorsForSpecificSkill } from '../api/apiForCounselorSkil';

interface AddCounselorToSkillParams {
  skillId: number;
  counselorIds: string[];
}

export function useApiForAddCounselorsForSpecificSkill(
  tenant_id: string,
  options?: UseMutationOptions<
    CounselorSkillAssignmentResponse, 
    CounselorSkillApiError, 
    AddCounselorToSkillParams
  >
): UseMutationResult<CounselorSkillAssignmentResponse, CounselorSkillApiError, AddCounselorToSkillParams, unknown> {
  const queryClient = useQueryClient();

  return useMutation<CounselorSkillAssignmentResponse, CounselorSkillApiError, AddCounselorToSkillParams>({
    mutationKey: ['addCounselorsToSkill'],
    mutationFn: ({ skillId, counselorIds }: AddCounselorToSkillParams) => 
      apiForAddCounselorsForSpecificSkill(skillId, counselorIds),
    onSuccess: (data, variables, context) => {
      // 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['counselorList', tenant_id]
      });
      
      // console.log('✅ 스킬에 상담사 추가 성공:', data);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // console.error('❌ 스킬에 상담사 추가 실패:', error);
      options?.onError?.(error, variables, context);
    },
  });
}