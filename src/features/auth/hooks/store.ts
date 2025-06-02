import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface UserInfoData {
    id: string;
    tenant_id: number;
    session_key: string;
    role_id: number;
    menu_role_id: number;
}

// 초기 상태 정의
const initialState: UserInfoData = {
    id: '',
    tenant_id: -1,
    session_key: '',
    role_id: -1,
    menu_role_id: 10
};

// Zustand store 생성
const useStore = create<
    UserInfoData & {
        setUserInfo: (userInfo: UserInfoData) => void;
        resetUserInfo: () => void;
    }
>()(
    devtools(
        (set) => ({
            ...initialState,
            setUserInfo: (userInfo: UserInfoData) => {
                // console.log("🔹 setUserInfo 호출됨:", userInfo); 
                
                // 상태 업데이트
                set({
                    id: userInfo.id,
                    tenant_id: userInfo.tenant_id,
                    session_key: userInfo.session_key,
                    role_id: userInfo.role_id,
                    menu_role_id: userInfo.menu_role_id // menu_role_id 확인
                }, false, "setUserInfo");
                
                // 디버깅: 상태 업데이트 후 확인
                setTimeout(() => {
                    const state = useStore.getState();
                    // console.log("🔹 상태 업데이트 후:", state);
                    // console.log("🔹 menu_role_id 확인:", state.menu_role_id);
                }, 0);
            },
            resetUserInfo: () => {
                console.log("🔄 resetUserInfo 호출됨");
                set({ ...initialState }, false, "resetUserInfo");
            }
        }),
        {
            name: "UserStore",
            enabled: true
        }
    )
);

// 현재 상태 확인을 위한 디버깅 함수
export const logCurrentState = () => {
    const state = useStore.getState();
    console.log("📊 현재 스토어 상태:", state);
    return state;
};

export default useStore;
