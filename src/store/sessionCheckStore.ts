// src/features/store/sessionAdminStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";


// 세션 에러 체크를 위한 Zustand 스토어
type SessionCheckStore = {
  // State
  sessionError: boolean; // 세션 에러 상태
  result_msg: string; // 에러 메시지
  result_code: number; // 에러 코드
  // Actions
  setSessionError: (isError: boolean) => void; // 세션 에러 설정 액션
  setResultMsg: (msg: string) => void; // 에러 메시지 설정 액션
  setResultCode: (code: number) => void; // 에러 코드 설정 액션
  clearSessionError: () => void; // 세션 에러 초기화 액션
};

export const useSessionCheckStore = create<SessionCheckStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        sessionError: false, // 초기값 false
        result_msg: "", // 초기값 빈 문자열
        result_code: 0, // 초기값 0
        // Actions
        setSessionError: (isError) =>
          set({ sessionError: isError }, false, "setSessionError"),
        setResultMsg: (msg) => set({ result_msg: msg }, false, "setResultMsg"),
        setResultCode: (code) => set({ result_code: code }, false, "setResultCode"),
        clearSessionError: () =>
          set({ sessionError: false, result_msg: "", result_code: 0 }, false, "clearSessionError"), 
      }),
      {
        name: "session-check-storage", // localStorage에 저장될 키 이름
      }
    ),
    { name: "SessionCheckStore" } // Redux DevTools에 표시될 스토어 이름
  )
);