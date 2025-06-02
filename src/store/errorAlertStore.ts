// stores/alertStore.ts
import { create } from 'zustand';

type AlertState = {
  isOpen: boolean;
  title: string;
  message: string;
  type: string;
  onClose?: () => void;
  openAlert: (params: { title: string, message: string, type: string, routerYn:boolean, onClose?: () => void }) => void;
  closeAlert: () => void;
  routerYn: boolean;
  setRouterYn: (value: boolean) => void; // 로그인페이지로 보낼지 여부 (커스텀 선택가능 하게끔)
};

// 공용 에러 store ==> 에러 전용 컴포넌트인 GlobalAlert 에서 사용
export const useErrorAlertStore = create<AlertState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  type: '1',
  onClose: undefined,
  routerYn: true,
  
  openAlert: ({ title, message, type, routerYn, onClose,  }) =>
    set({ isOpen: true, title, message, type, routerYn, onClose }),
  closeAlert: () =>
    set((state) => {
      state.onClose?.();
      return { isOpen: false, onClose: undefined };
    }),
  setRouterYn: (value: boolean) => set({ routerYn: value }),
}));
