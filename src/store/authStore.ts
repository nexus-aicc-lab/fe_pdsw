// src/features/store/authStore.ts
import exp from "constants";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type AuthStore = {
  // State
  id: string;
  tenant_id: number;
  session_key: string;
  role_id: number;
  menu_role_id: number;
  expires_in : number; // 로그인시 만료시간을 밀리세컨드로 변환한 값
  expires_check : boolean | null;
  // Actions
  setAuth: (id: string, tenant_id: number, session_key: string, role_id: number, menu_role_id: number, expires_in: number) => void;
  clearAuth: () => void;
  setExpiresCheck: (value: boolean) => void;
  startExpirationWatcher: () => void;
};

let expirationInterval: NodeJS.Timeout | null = null; // 감시 타이머



export const useAuthStore = create<AuthStore>()(
  
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        id: "",
        tenant_id: -1,
        session_key: "",
        role_id: 0,
        menu_role_id: 0,
        expires_in : 0,
        expires_check : false,
        
        // Actions
        // 로그인 시 즉 setAuth 호출 시 변환된 expirde를 사용해서 만료시간 감시하기
        setAuth: (id, tenant_id, session_key, role_id, menu_role_id, expires_in) => {

          set({ id, tenant_id, session_key, role_id, menu_role_id, expires_in: expires_in}, false, "setAuth");

          // set({ expires_in: currentTime + 10000 }); // 만료시간을 현재 시간 + 10초로 설정 (테스트용)

          get().startExpirationWatcher();
        },

        // 만료시간 감시하는 타이머 추가
        startExpirationWatcher: () => {
          if (expirationInterval) {
            clearInterval(expirationInterval);
          }

          expirationInterval = setInterval(() => {
            const { expires_in } = get();
            const now = Date.now();
            if (now > expires_in) {
              set({ expires_check: true }, false, "sessionExpired");
              clearInterval(expirationInterval!);
              expirationInterval = null;
            }
          }, 1000);
        },
        
        clearAuth: () => {

          set({ id: "", tenant_id: -1, session_key: "", role_id: 0, menu_role_id: 0, expires_in: 0, expires_check: false }, false, "clearAuth");

          // 로그아웃시 감시 타이머 중단하기
          if (expirationInterval) {
            clearInterval(expirationInterval);
            expirationInterval = null;
          }
        },

        setExpiresCheck: (value: boolean) => {
          set({ expires_check: value });
        },
          
      }),
      {
        name: "auth-storage", // localStorage에 저장될 키 이름
      }
    ),
    { name: "AuthStore" } // Redux DevTools에 표시될 스토어 이름
  )
);
