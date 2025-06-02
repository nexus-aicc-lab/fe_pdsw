// src/store/optimisticUpdateStore.ts
import { create } from 'zustand';

interface DeletingSkill {
  skillId: string;
  counselorId: string;
  tenantId: string;
  startTime: number;
}

interface OptimisticUpdateStore {
  // 삭제 중인 스킬들
  deletingSkills: DeletingSkill[];
  
  // 스킬 삭제 시작
  startSkillDeletion: (skillId: string, counselorId: string, tenantId: string) => void;
  
  // 스킬 삭제 완료/실패
  endSkillDeletion: (skillId: string, counselorId: string) => void;
  
  // 특정 스킬이 삭제 중인지 확인
  isSkillDeleting: (skillId: string, counselorId: string) => boolean;
  
  // 모든 삭제 상태 초기화
  clearAllDeletions: () => void;
  
  // 오래된 삭제 상태 정리 (10초 이상)
  cleanupStaleOperations: () => void;
}

export const useOptimisticUpdateStore = create<OptimisticUpdateStore>((set, get) => ({
  deletingSkills: [],

  startSkillDeletion: (skillId, counselorId, tenantId) => {
    set((state) => ({
      deletingSkills: [
        ...state.deletingSkills.filter(
          skill => !(skill.skillId === skillId && skill.counselorId === counselorId)
        ),
        {
          skillId,
          counselorId,
          tenantId,
          startTime: Date.now()
        }
      ]
    }));
    
    console.log(`🚀 스킬 삭제 시작: ${skillId} (상담사: ${counselorId})`);
  },

  endSkillDeletion: (skillId, counselorId) => {
    set((state) => ({
      deletingSkills: state.deletingSkills.filter(
        skill => !(skill.skillId === skillId && skill.counselorId === counselorId)
      )
    }));
    
    console.log(`🏁 스킬 삭제 완료: ${skillId} (상담사: ${counselorId})`);
  },

  isSkillDeleting: (skillId, counselorId) => {
    const state = get();
    return state.deletingSkills.some(
      skill => skill.skillId === skillId && skill.counselorId === counselorId
    );
  },

  clearAllDeletions: () => {
    set({ deletingSkills: [] });
    console.log('🧹 모든 삭제 상태 초기화');
  },

  cleanupStaleOperations: () => {
    const now = Date.now();
    const STALE_THRESHOLD = 10000; // 10초
    
    set((state) => ({
      deletingSkills: state.deletingSkills.filter(
        skill => (now - skill.startTime) < STALE_THRESHOLD
      )
    }));
  }
}));