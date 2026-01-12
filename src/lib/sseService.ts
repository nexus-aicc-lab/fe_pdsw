import { isEqual } from 'lodash';

interface SseData {
  announce: string;
  command: string;
  data: any;
  kind: string;
  campaign_id: string;
  [key: string]: any;
}

let eventSourceInstance: EventSource | null = null;
let currentParams = { tenant_id: '', id: '', apiUrl: '' };

// 재연결 관련 변수
let reconnectDelay = 1000; // 시작 지연 시간 1초
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let watchdogTimeout: ReturnType<typeof setTimeout> | null = null;
const MAX_RECONNECT_DELAY = 30000; // 최대 지연 30초
const HEARTBEAT_INTERVAL = 40000; // 서버가 30초마다 주므로 40초로 설정

// 캐시 변수
let lastMessageCache: Partial<SseData> = {};

const listeners = new Set<(data: SseData) => void>();

export const sseService = {
  connect: (tenant_id: string, id: string, apiUrl: string) => {
    if (typeof window === 'undefined' || !window.EventSource) return;

    // 파라미터 저장 (재연결 시 사용)
    currentParams = { tenant_id, id, apiUrl };

    // 기존 연결이 OPEN 상태이고 파라미터가 같다면 유지
    if (eventSourceInstance?.readyState === EventSource.OPEN && 
        isEqual(currentParams, { tenant_id, id, apiUrl })) {
      return;
    }

    sseService.disconnect();

    const url = `${apiUrl}/notification/${tenant_id}/subscribe/${id}`;
    eventSourceInstance = new EventSource(url);

    // 1. 연결 성공 시
    eventSourceInstance.onopen = () => {
      // console.log(`[SSE] Connected to ${id}`);
      reconnectDelay = 1000; // 재연결 지연 초기화
      sseService.startWatchdog(); // 감시 타이머 시작
    };

    // 2. 에러 발생 시 (자동 재연결 로직)
    eventSourceInstance.onerror = () => {
      // console.error(`[SSE] Connection error. Attempting reconnect in ${reconnectDelay}ms`);
      sseService.handleReconnect();
    };

    // 3. 서버에서 보낸 Heartbeat 수신 (매우 중요)
    eventSourceInstance.addEventListener('heartbeat', (event: any) => {
      // console.debug("[SSE] Heartbeat received:", event.data); // ping
      sseService.startWatchdog(); // 핑을 받았으므로 타이머 갱신
    });

    // 4. 일반 메시지 수신
    eventSourceInstance.addEventListener('message', (event) => {
      sseService.startWatchdog(); // 메시지를 받아도 생존한 것으로 간주

      if (event.data === "Connected!!") return;

      try {
        const newData = JSON.parse(event.data) as SseData;

        // lodash를 이용한 데이터 변경 확인 (불필요한 리렌더링 방지)
        if (!isEqual(lastMessageCache, newData)) {
          lastMessageCache = newData;
          listeners.forEach(listener => listener(newData));
        }
      } catch (e) {
        console.error("[SSE] Parsing error", e);
      }
    });
  },

  // Watchdog: 서버가 일정 시간 응답 없으면 죽은 연결로 간주
  startWatchdog: () => {
    if (watchdogTimeout) clearTimeout(watchdogTimeout);
    watchdogTimeout = setTimeout(() => {
      console.warn("[SSE] No heartbeat for too long. Forcing reconnect...");
      sseService.connect(currentParams.tenant_id, currentParams.id, currentParams.apiUrl);
    }, HEARTBEAT_INTERVAL);
  },

  // 지수 백오프 기반 재연결
  handleReconnect: () => {
    sseService.disconnect();
    if (reconnectTimeout) clearTimeout(reconnectTimeout);

    reconnectTimeout = setTimeout(() => {
      sseService.connect(currentParams.tenant_id, currentParams.id, currentParams.apiUrl);
      // 다음 재연결 대기 시간은 두 배로 (최대 30초)
      reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
    }, reconnectDelay);
  },

  disconnect: () => {
    if (eventSourceInstance) {
      eventSourceInstance.close();
      eventSourceInstance = null;
    }
    if (watchdogTimeout) clearTimeout(watchdogTimeout);
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    lastMessageCache = {};
  },

  subscribe: (listener: (data: SseData) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};