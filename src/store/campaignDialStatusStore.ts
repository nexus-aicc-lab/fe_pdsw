import { campaignChannel } from '@/lib/broadcastChannel';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface CampaignDialStatus {
  campaign_id: string;
  status?: string;
}

interface CampaignDialStatusStore {
  campaignDialStatus: CampaignDialStatus[]; // 배열로 변경
  addCampaignDialStatus: (status: CampaignDialStatus) => void; // 특정 캠페인 상태 추가
  removeCampaignDialStatus: (status: CampaignDialStatus) => void; // 특정 캠페인 제거 (완료 후 제거)
  resetCampaignDialStatus: () => void; // 상태 초기화
  setSseInputMessage: (sseInputMessage:string, camaping_id?:string, status?:string) => void;
  sseInputMessage?: string; // sseInputMessage 속성 추가
  hasHydrated: boolean; 
  setHasHydrated: (value: boolean) => void; 
}

export const useCampaignDialStatusStore = create<CampaignDialStatusStore>()(
  devtools(
    persist(
      (set, get) => ({

        campaignDialStatus: [], // 초기값을 빈 배열로 설정

        hasHydrated: false,
        setHasHydrated: (value) => set({ hasHydrated: value }),

        setSseInputMessage: (sseInputMessage, camaping_id, status) => {
            set({ sseInputMessage }); 
            campaignChannel.postMessage({
              type: sseInputMessage,
              campaignId : camaping_id,
              status : status
        })},

        addCampaignDialStatus: (status: CampaignDialStatus) =>
          set((state) => ({
            campaignDialStatus: [...state.campaignDialStatus, status], // 입력받은 캠페인 아이디 store에서 상태 추가
          })),

        removeCampaignDialStatus : (status: CampaignDialStatus) => 
          set((state) => ({
            campaignDialStatus : [...state.campaignDialStatus.filter( originData => originData.campaign_id !== status.campaign_id)] // 입력받은 캠페인 아이디 store에서 제거
          })),

        resetCampaignDialStatus: () =>
          set({ campaignDialStatus: [] }), // 상태 초기화
         }),
         

      {
        name: "campaign-dial-status-storage", // 고유한 스토리지 키
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      }
    )
  )
);