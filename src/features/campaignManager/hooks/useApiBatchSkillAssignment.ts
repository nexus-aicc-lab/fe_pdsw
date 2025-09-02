// src/features/campaignManager/hooks/useApiBatchSkillAssignment.ts
import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { CounselorSkillAssignmentResponse, CounselorSkillApiError } from '../types/typeForCounselorSkill';
import { apiForAddCounselorsForSpecificSkill } from '../api/apiForCounselorSkil';
import { apiForDeleteCounselorsForSpecificSkill } from '../api/apiForCounselorSkil';
import { useAgentSkillStatusStore } from '@/store/agenSkillStatusStore';

interface BatchSkillAssignmentParams {
  skillIds: number[];
  counselorIds: string[];
  isUnassignment: boolean;
  tenantId: string;
  concurrentLimit?: number;
}

interface BatchSkillResult {
  success: boolean;
  successCount: number;
  failedSkills: number[];
  error?: Error;
}

/**
 * 여러 스킬을 여러 상담사에게 한 번에 할당/해제하는 커스텀 훅
 */
export function useApiBatchSkillAssignment(tenantId: string) {
  const queryClient = useQueryClient();

  const {setAgentSkillStatus} = useAgentSkillStatusStore();

  // 배치 처리 유틸리티 함수
  const processBatchSkillAssignment = async ({
    skillIds,
    counselorIds,
    isUnassignment,
    concurrentLimit = 3
  }: Omit<BatchSkillAssignmentParams, 'tenantId'>) => {
    // 결과 추적용 객체
    const result: BatchSkillResult = {
      success: true,
      successCount: 0,
      failedSkills: []
    };

    try {
      // 여러 스킬을 동시에 처리하되 concurrentLimit 만큼씩 분할 처리
      for (let i = 0; i < skillIds.length; i += concurrentLimit) {
        const batch = skillIds.slice(i, i + concurrentLimit);
        
        // 현재 배치의 요청들을 병렬로 처리
        const promises = batch.map(skillId => {
          const apiCall = isUnassignment
            ? apiForDeleteCounselorsForSpecificSkill(skillId, counselorIds)
            : apiForAddCounselorsForSpecificSkill(skillId, counselorIds);
            
          return apiCall
            .then(() => {
              result.successCount++;
              return true;
            })
            .catch(error => {
              // console.error(`스킬 ID ${skillId} ${isUnassignment ? '해제' : '할당'} 실패:`, error);
              result.failedSkills.push(skillId);
              result.success = false;
              return false;
            });
        });
        
        // 현재 배치의 모든 요청 완료 대기
        await Promise.all(promises);
      }
      
      return result;
    } catch (error) {
      // console.error(`배치 스킬 ${isUnassignment ? '해제' : '할당'} 중 오류 발생:`, error);
      result.success = false;
      result.error = error instanceof Error ? error : new Error(String(error));
      return result;
    }
  };

  return useMutation<BatchSkillResult, Error, BatchSkillAssignmentParams>({
    mutationKey: ['batchSkillAssignment', tenantId],
    mutationFn: async (params) => {
      return processBatchSkillAssignment({
        skillIds: params.skillIds,
        counselorIds: params.counselorIds,
        isUnassignment: params.isUnassignment,
        concurrentLimit: params.concurrentLimit
      });
    },
    onSuccess: () => {
      // 스킬 관련 쿼리 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['counselorSkills', tenantId]
      });

      queryClient.invalidateQueries({
        queryKey: ['counselorList']
      });
      
      // // 상담사 관련 쿼리 캐시 무효화
      // queryClient.invalidateQueries({
      //   queryKey: ['counselorList', tenantId]
      // });

      // 다른 컴포넌트에 알리기위한 상담사 스킬 변경 상태
      setAgentSkillStatus(true);
    }
  });
}