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

// 1. 중복 호출 방지를 위한 모듈 레벨 플래그
let isLoggingOut = false;

const logoutFunction = ({ portcheck = true }: PortCheck = {}) => {
    // footer 이벤트수신으로 alert가 2번 발생하는 경우를 제외시키기 위하여 선택적 파라미터로 설정
    
    if (isLoggingOut) return;
    isLoggingOut = true;

    const isPopup = typeof window !== 'undefined' && !!(window.opener && window.opener !== window);
    // 로그아웃 시 쿠키 삭제
    // Cookies.remove('session_key');
    Cookies.remove('session_key', {
        path: '/',
        domain: window.location.hostname,
    });

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

    if (isPopup) {
        if (window.opener && !window.opener.closed) {
            try {
                // 2. 부모 창을 로그인 페이지로 이동
                // window.opener.location.replace를 사용하여 부모의 세션도 초기화 유도
                window.opener.location.replace('/login');
            } catch (e) {
                // 도메인이 다르거나 기타 이유로 접근이 불가할 경우 대비
                console.error("부모 창 제어 실패:", e);
            }
        }
        // 팝업창은 즉시 닫음
        window.close();
    } else {
        // 부모 창은 로그인 페이지로 이동
        // Next.js router보다는 window.location을 사용하여 모든 메모리 상태를 완전히 비우는 것을 권장합니다.
        window.location.replace('/login');
    }

}

export default logoutFunction;