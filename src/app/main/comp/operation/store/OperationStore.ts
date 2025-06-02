"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// 환경설정 관련 상태 인터페이스 (최소화 버전)
interface OperationStore {
  // 현재 열린 아코디언 섹션 ID
  openSectionId: string;
  
  // 최근 활성화된 탭 ID
  lastActiveTabId: number | null;
  
  // 섹션 ID 설정 메서드
  setOpenSectionId: (id: string) => void;
  
  // 탭 ID 설정 (해당 탭에 맞는 초기 섹션 자동 열기)
  setActiveTab: (tabId: number) => void;
  
  // 특정 탭 ID에 대한 초기 섹션 설정
  getInitialSectionForTab: (tabId: number) => string;

  operationCampaignId: number | null; // 선택된 캠페인 ID
  setOperationCampaignId: (id: number) => void; // 캠페인 ID 설정
  operationCampaignName: string | null; // 선택된 캠페인 이름
  setOperationCampaignName: (name: string) => void; // 캠페인 ID 이름
  clearOperationCampaign: () => void; // 캠페인 ID 초기화
}

export const useOperationStore = create<OperationStore>()(
  persist(
    (set, get) => ({
      // 기본적으로 아무 섹션도 열려있지 않음
      openSectionId: '',
      
      // 최근 활성화된 탭 ID
      lastActiveTabId: null,
      
      // 섹션 ID 설정 메서드
      setOpenSectionId: (id: string) => set({ openSectionId: id }),
      
      // 탭 활성화 시 자동으로 해당 탭에 맞는 아코디언 메뉴 열기
      setActiveTab: (tabId: number) => {
        const initialSectionId = get().getInitialSectionForTab(tabId);
        set({ 
          lastActiveTabId: tabId,
          openSectionId: initialSectionId 
        });
      },

      operationCampaignId: null, // 초기값: null
      setOperationCampaignId: (id) => set({ operationCampaignId: id }),
      operationCampaignName : null,
      setOperationCampaignName : (name) => set({ operationCampaignName : name}),
      clearOperationCampaign: () => set({ operationCampaignId: null, operationCampaignName : null }),
      
      // 특정 탭 ID에 맞는 초기 섹션 ID 반환
      getInitialSectionForTab: (tabId: number) => {
        switch (tabId) {
          case 8:
            return 'section3'; // 예약콜 제한 설정
          case 9:
            return 'section4'; // 분배호수 제한 설정
          case 11:
            return 'section1'; // 캠페인별 발신번호 변경
          default:
            return '';
        }
      },
    }),
    {
      name: "operation-store",
      partialize: (state) => ({
        openSectionId: state.openSectionId,
        lastActiveTabId: state.lastActiveTabId,
      }),
    }
  )
);