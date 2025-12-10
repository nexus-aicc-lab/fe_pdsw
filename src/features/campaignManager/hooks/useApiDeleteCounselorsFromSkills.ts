declare global {
  interface Window {
    __COUNSELOR_TREE_STATE__?: {
      tenantId: string;
      sidebarData: any;
      expandedNodes: Set<string>;
      selectedNodeId?: string;
      updateSidebarCallback?: (updatedData: any) => void;
      setExpandedNodesCallback?: (nodes: Set<string>) => void;
      setSelectedNodeCallback?: (nodeId?: string) => void;
    };
  }
}

import { useMutation } from '@tanstack/react-query';
import { apiForDeleteCounselorsForSpecificSkill } from '../api/apiForCounselorSkil';
import { useAgentSkillStatusStore } from '@/store/agenSkillStatusStore';

// Window 객체에 저장할 타입 정의

interface DeleteCounselorsFromSkillsParams {
  skillIds: number[];
  counselorIds: string[];
  tenantId: string;
}

interface BatchDeleteResult {
  success: boolean;
  successCount: number;
  failedSkills: number[];
  error?: Error;
}

/**
 * 🌟 간단한 Window 기반 스킬 삭제 훅
 * 복잡한 캐시 무효화 없이 Window 데이터만 직접 업데이트
 */
export function useApiDeleteCounselorsFromSkills(tenantId: string) {
  const { setAgentSkillStatus } = useAgentSkillStatusStore();

  // 실제 API 호출 함수
  const deleteSkills = async ({ skillIds, counselorIds }: Omit<DeleteCounselorsFromSkillsParams, 'tenantId'>) => {
    
    const results = await Promise.allSettled(
      skillIds.map(skillId => 
        apiForDeleteCounselorsForSpecificSkill(skillId, counselorIds)
          .then(response => {
            // console.log(`✅ 스킬 ${skillId} 삭제 성공`);
            return { skillId, success: true, response };
          })
          .catch(error => {
            // console.error(`❌ 스킬 ${skillId} 삭제 실패:`, error);
            return { skillId, success: false, error };
          })
      )
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failedSkills = results
      .filter(r => r.status === 'fulfilled' && !r.value.success)
      .map(r => (r as any).value.skillId);


    return {
      success: successCount > 0,
      successCount,
      failedSkills,
      error: failedSkills.length > 0 ? new Error(`${failedSkills.length}개 스킬 삭제 실패`) : undefined
    };
  };

  // Window 데이터에서 스킬 제거
  const removeSkillsFromWindow = (skillIds: number[], counselorIds: string[]) => {
    const windowState = window.__COUNSELOR_TREE_STATE__;
    
    if (!windowState?.sidebarData?.organizationList) {
      // console.warn('⚠️ Window에 사이드바 데이터가 없습니다');
      return;
    }

    // 데이터에서 해당 스킬들 제거
    windowState.sidebarData.organizationList.forEach((org: any) => {
      org.tenantInfo?.forEach((tenant: any) => {
        tenant.groupInfo?.forEach((group: any) => {
          group.teamInfo?.forEach((team: any) => {
            team.counselorInfo?.forEach((counselor: any) => {
              if (counselorIds.includes(counselor.counselorId) && counselor.assignedSkills) {
                const before = counselor.assignedSkills.length;
                counselor.assignedSkills = counselor.assignedSkills.filter(
                  (skill: any) => !skillIds.includes(Number(skill.skillId))
                );
                const after = counselor.assignedSkills.length;
                if (before > after) {
                  // console.log(`🔄 상담사 ${counselor.counselorId}: ${before - after}개 스킬 제거`);
                }
              }
            });
          });
        });
      });
    });

    // UI 업데이트 콜백 호출
    if (windowState.updateSidebarCallback) {
      windowState.updateSidebarCallback(windowState.sidebarData);
      
    }
  };

  return useMutation<BatchDeleteResult, Error, DeleteCounselorsFromSkillsParams>({
    mutationKey: ['deleteCounselorsFromSkills', tenantId],
    mutationFn: deleteSkills,
    
    onSuccess: (result, variables) => {
      if (result.success) {
        // Window에서 스킬 제거
        removeSkillsFromWindow(variables.skillIds, variables.counselorIds);
        
        // 다른 컴포넌트에 알리기
        setAgentSkillStatus(true);
        
      }
    },
    
    onError: (error) => {
      // console.error('💥 스킬 삭제 실패:', error);
    }
  });
}

// Window 상태 관리 유틸리티 (간단 버전)
export const WindowStateUtils = {
  initTreeState: (tenantId: string, initialData: any) => {
    window.__COUNSELOR_TREE_STATE__ = {
      tenantId,
      sidebarData: initialData,
      expandedNodes: new Set(),
      selectedNodeId: undefined
    };
    // console.log('🌟 Window 상태 초기화 완료');
  },

  registerCallbacks: (callbacks: {
    updateSidebarCallback?: (data: any) => void;
    setExpandedNodesCallback?: (nodes: Set<string>) => void;
    setSelectedNodeCallback?: (nodeId?: string) => void;
  }) => {
    if (window.__COUNSELOR_TREE_STATE__) {
      Object.assign(window.__COUNSELOR_TREE_STATE__, callbacks);
      // console.log('🔗 콜백 등록 완료');
    }
  },

  updateExpandedNodes: (nodes: Set<string>) => {
    if (window.__COUNSELOR_TREE_STATE__) {
      window.__COUNSELOR_TREE_STATE__.expandedNodes = nodes;
    }
  },

  updateSelectedNode: (nodeId?: string) => {
    if (window.__COUNSELOR_TREE_STATE__) {
      window.__COUNSELOR_TREE_STATE__.selectedNodeId = nodeId;
    }
  },

  getCurrentState: () => window.__COUNSELOR_TREE_STATE__,

  cleanup: () => {
    delete window.__COUNSELOR_TREE_STATE__;
    // console.log('🧹 Window 상태 정리 완료');
  }
};