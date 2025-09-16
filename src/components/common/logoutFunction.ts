import Cookies from 'js-cookie';
import { useTabStore } from "@/store/tabStore";
import { useAuthStore } from "@/store/authStore"; // Ensure this is the correct path to your authStore
import { useOperationStore } from '@/app/main/comp/operation/store/OperationStore';
import { useSessionCheckStore } from '@/store/sessionCheckStore';
import { logoutChannel } from '@/lib/broadcastChannel';
import { useEnvironmentStore } from '@/store/environmentStore';
import { useCampainManagerStore, useMainStore } from '@/store';
import { useSystemDeviceStore } from '@/store/systemDeviceStore';
import { useAvailableMenuStore } from '@/store/useAvailableMenuStore';

type PortCheck = {
    portcheck?: boolean;
}


const logoutFunction = ({ portcheck = true }: PortCheck = {}) => {
    // footer 이벤트수신으로 alert가 2번 발생하는 경우를 제외시키기 위하여 선택적 파라미터로 설정
    
    
    // 로그아웃 시 쿠키 삭제
    Cookies.remove('session_key');

    // AuthStore의 상태를 초기화
    useAuthStore.getState().clearAuth();

    // tabStore 초기화 정보
    useTabStore.getState().resetTabStore();

    // 운영설정 stroe 초기화
    useOperationStore.getState().clearOperationCampaign();

    // 세션 체크 store 초기화
    useSessionCheckStore.getState().clearSessionError();

    // 팝업 창 닫는 로직 추가해야함
    // localStorage.setItem('monitorPopupOpen', 'false');
    
    // --- store 초기화 로직 추가하실거 있으시면 추가하시면 됩니다 ---

    // 환경 설정 Store 초기화 0522 추가
    useEnvironmentStore.getState().clearEnvironment();

    // mainStore 초기화 0522 추가
    useMainStore.getState().setResetMainStore();

    // campaignManagerStore 초기화 0522 추가
    useCampainManagerStore.getState().setResetCampaignManagerStore();

    useSystemDeviceStore.getState().setSaveSelectDevice('');

    // BQSQ-126 사용자계정 상담 메뉴 표출되지 않음, 2025-09-16 lab09 available-menu-storage 초기화 추가 
    useAvailableMenuStore.getState().clearMenus();

    

    if(portcheck){
        logoutChannel.postMessage({
            type: "logout",
            message: '',
        });
    }
        
    


}

export default logoutFunction;