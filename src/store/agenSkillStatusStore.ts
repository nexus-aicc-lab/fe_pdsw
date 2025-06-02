import {create} from 'zustand';

interface AgentSkillStatusStore {
  agentSkillStatus: boolean;
  setAgentSkillStatus: (status: boolean) => void;
}

export const useAgentSkillStatusStore = create<AgentSkillStatusStore>((set) => ({
  agentSkillStatus: false, // 초기 상태
  setAgentSkillStatus: (status: boolean) => set({ agentSkillStatus: status }),
}));