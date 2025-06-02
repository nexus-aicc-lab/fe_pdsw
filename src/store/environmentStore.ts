// import { create } from "zustand";
// import { devtools, persist } from "zustand/middleware";
// import { EnvironmentListResponse } from "@/features/auth/types/environmentIndex";

// type EnvironmentStore = {
//   // State
//   environmentData: EnvironmentListResponse | null;
  
//   // Actions
//   setEnvironment: (data: EnvironmentListResponse) => void;
//   clearEnvironment: () => void;
// };

// export const useEnvironmentStore = create<EnvironmentStore>()(
//   devtools(
//     persist(
//       (set) => ({
//         // Initial state
//         environmentData: null,
        
//         // Actions
//         setEnvironment: (data) => 
//           set({ environmentData: data }, false, "setEnvironment"),
          
//         clearEnvironment: () => 
//           set({ environmentData: null }, false, "clearEnvironment"),
//       }),
//       {
//         name: "environment-storage", // localStorage에 저장될 키 이름
//       }
//     ),
//     { name: "EnvironmentStore" } // Redux DevTools에 표시될 스토어 이름
//   )
// );

// environmentStore.ts 수정
// tofix 0409 통계 갱신 주기와 상담원 상태 모니터 api 연동 with statisticsUpdateCycle
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { EnvironmentListResponse, EnvironmentSaveRequest } from "@/features/auth/types/environmentIndex";

export interface EnvironmentState {
  // 기존 호환성을 위한 필드
  environmentData: EnvironmentListResponse | null;

  // 환경설정 데이터 - 명시적으로 각 필드 정의
  campaignListAlram: number;  // 알람 다이어로그 출력 여부
  statisticsUpdateCycle: number;
  serverConnectionTime: number;
  showChannelCampaignDayScop: number;
  personalCampaignAlertOnly: number;
  useAlramPopup: number;
  unusedWorkHoursCalc: number;
  sendingWorkStartHours: string;
  sendingWorkEndHours: string;
  dayOfWeekSetting: string;
  
  // 메타 상태
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // 센터 정보 데이타
  centerId: string;
  centerName: string;
  
}

interface EnvironmentActions {
  // 기존 함수명 유지
  setEnvironment: (data: EnvironmentListResponse) => void;
  clearEnvironment: () => void;
  
  // 개별 필드 업데이트 액션들 - 더 명시적인 액션 이름 사용
  setCampaignListAlarm: (value: number) => void;
  setStatisticsUpdateCycle: (value: number) => void;
  setServerConnectionTime: (value: number) => void;
  setShowChannelCampaignDayScope: (value: number) => void;
  setPersonalCampaignAlertOnly: (value: number) => void; 
  setUseAlarmPopup: (value: number) => void;
  setUnusedWorkHoursCalc: (value: number) => void;
  setWorkHours: (start: string, end: string) => void;
  setDayOfWeekSetting: (value: string) => void;
  
  // 상태 관리 액션들
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 환경설정 저장을 위한 데이터 준비
  getEnvironmentSaveRequest: (employeeId: string) => EnvironmentSaveRequest;

  // 센터 데이터 액션
  setCenterInfo(centerId: string, centerName: string): void;  
}

type EnvironmentStore = EnvironmentState & EnvironmentActions;

// 초기 상태 분리해서 명확하게 정의
const initialState: EnvironmentState = {
  // 기존 호환성을 위한 필드
  environmentData: null,

  // 환경설정 데이터 초기값
  campaignListAlram: 0,
  statisticsUpdateCycle: 0,  // 통계 갱신 주기
  serverConnectionTime: 0,
  showChannelCampaignDayScop: 0,
  personalCampaignAlertOnly: 0,
  useAlramPopup: 0,
  unusedWorkHoursCalc: 0,
  sendingWorkStartHours: "",
  sendingWorkEndHours: "",
  dayOfWeekSetting: "",
  
  // 메타 상태 초기값
  isLoading: false,
  error: null,
  lastUpdated: null,

  // 센터 정보 데이터 초기값
  centerId: "",
  centerName: ""
};

export const useEnvironmentStore = create<EnvironmentStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // 기존 함수명으로 전체 환경설정 데이터 설정
        setEnvironment: (data) => set({
          // 기존 환경설정 데이터 저장 (호환성 유지)
          environmentData: data,
          
          // 개별 필드도 함께 업데이트
          campaignListAlram: data.campaignListAlram,
          statisticsUpdateCycle: data.statisticsUpdateCycle,
          serverConnectionTime: data.serverConnectionTime,
          showChannelCampaignDayScop: data.showChannelCampaignDayScop,
          personalCampaignAlertOnly: data.personalCampaignAlertOnly,
          useAlramPopup: data.useAlramPopup,
          unusedWorkHoursCalc: data.unusedWorkHoursCalc,
          sendingWorkStartHours: data.sendingWorkStartHours,
          sendingWorkEndHours: data.sendingWorkEndHours,
          dayOfWeekSetting: data.dayOfWeekSetting,
          lastUpdated: new Date(),
          error: null
        }, false, "setEnvironment"),
        
        // 기존 함수명 유지
        clearEnvironment: () => set(
          { ...initialState }, 
          false, 
          "clearEnvironment"
        ),
        
        // 개별 필드 업데이트 액션들 - environmentData도 함께 업데이트
        setCampaignListAlarm: (value) => {
          const state = get();
          const environmentData = state.environmentData ? 
            { ...state.environmentData, campaignListAlram: value } : 
            null;
          
          return set(
            { 
              campaignListAlram: value,
              environmentData 
            }, 
            false, 
            "setCampaignListAlarm"
          );
        },
        
        setStatisticsUpdateCycle: (value) => {
          const state = get();
          const environmentData = state.environmentData ? 
            { ...state.environmentData, statisticsUpdateCycle: value } : 
            null;
          
          return set(
            { 
              statisticsUpdateCycle: value,
              environmentData 
            }, 
            false, 
            "setStatisticsUpdateCycle"
          );
        },
        
        setServerConnectionTime: (value) => {
          const state = get();
          const environmentData = state.environmentData ? 
            { ...state.environmentData, serverConnectionTime: value } : 
            null;
          
          return set(
            { 
              serverConnectionTime: value,
              environmentData 
            }, 
            false, 
            "setServerConnectionTime"
          );
        },
        
        setShowChannelCampaignDayScope: (value) => {
          const state = get();
          const environmentData = state.environmentData ? 
            { ...state.environmentData, showChannelCampaignDayScop: value } : 
            null;
          
          return set(
            { 
              showChannelCampaignDayScop: value,
              environmentData 
            }, 
            false, 
            "setShowChannelCampaignDayScope"
          );
        },
        
        setPersonalCampaignAlertOnly: (value) => {
          const state = get();
          const environmentData = state.environmentData ? 
            { ...state.environmentData, personalCampaignAlertOnly: value } : 
            null;
          
          return set(
            { 
              personalCampaignAlertOnly: value,
              environmentData 
            }, 
            false, 
            "setPersonalCampaignAlertOnly"
          );
        },
        
        setUseAlarmPopup: (value) => {
          const state = get();
          const environmentData = state.environmentData ? 
            { ...state.environmentData, useAlramPopup: value } : 
            null;
          
          return set(
            { 
              useAlramPopup: value,
              environmentData 
            }, 
            false, 
            "setUseAlarmPopup"
          );
        },
        
        setUnusedWorkHoursCalc: (value) => {
          const state = get();
          const environmentData = state.environmentData ? 
            { ...state.environmentData, unusedWorkHoursCalc: value } : 
            null;
          
          return set(
            { 
              unusedWorkHoursCalc: value,
              environmentData 
            }, 
            false, 
            "setUnusedWorkHoursCalc"
          );
        },
        
        setWorkHours: (start, end) => {
          const state = get();
          const environmentData = state.environmentData ? 
            { 
              ...state.environmentData, 
              sendingWorkStartHours: start,
              sendingWorkEndHours: end 
            } : 
            null;
          
          return set(
            { 
              sendingWorkStartHours: start, 
              sendingWorkEndHours: end,
              environmentData 
            }, 
            false, 
            "setWorkHours"
          );
        },
        
        setDayOfWeekSetting: (value) => {
          const state = get();
          const environmentData = state.environmentData ? 
            { ...state.environmentData, dayOfWeekSetting: value } : 
            null;
          
          return set(
            { 
              dayOfWeekSetting: value,
              environmentData 
            }, 
            false, 
            "setDayOfWeekSetting"
          );
        },
        
        // 상태 관리 액션들
        setLoading: (isLoading) => set(
          { isLoading }, 
          false, 
          "setLoading"
        ),
        
        setError: (error) => set(
          { error }, 
          false, 
          "setError"
        ),
        
        // 환경설정 저장을 위한 데이터 준비
        getEnvironmentSaveRequest: (employeeId) => {
          const state = get();
          return {
            employeeId,
            campaignListAlram: state.campaignListAlram,
            statisticsUpdateCycle: state.statisticsUpdateCycle,
            serverConnectionTime: state.serverConnectionTime,
            showChannelCampaignDayScop: state.showChannelCampaignDayScop,
            personalCampaignAlertOnly: state.personalCampaignAlertOnly,
            useAlramPopup: state.useAlramPopup,
            unusedWorkHoursCalc: state.unusedWorkHoursCalc,
            sendingWorkStartHours: state.sendingWorkStartHours,
            sendingWorkEndHours: state.sendingWorkEndHours,
            dayOfWeekSetting: state.dayOfWeekSetting
          };
        },

        setCenterInfo: (centerId, centerName) => {
          set({ centerId, centerName }, false, "setCenterInfo");
        } 
      }),
      {
        name: "environment-storage",
        // 영구 저장할 상태만 지정 (메타 상태 제외)
        partialize: (state) => ({
          // 기존 호환성을 위한 필드
          environmentData: state.environmentData,
          
          // 개별 필드
          campaignListAlram: state.campaignListAlram,
          statisticsUpdateCycle: state.statisticsUpdateCycle,
          serverConnectionTime: state.serverConnectionTime,
          showChannelCampaignDayScop: state.showChannelCampaignDayScop,
          personalCampaignAlertOnly: state.personalCampaignAlertOnly,
          useAlramPopup: state.useAlramPopup,
          unusedWorkHoursCalc: state.unusedWorkHoursCalc,
          sendingWorkStartHours: state.sendingWorkStartHours,
          sendingWorkEndHours: state.sendingWorkEndHours,
          dayOfWeekSetting: state.dayOfWeekSetting,
          centerId: state.centerId,
          centerName: state.centerName
        })
      }
    ),
    { name: "EnvironmentStore", enabled: true }
  )
);