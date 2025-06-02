// CustomToast.tsx - 수정 버전
import React, { Fragment, useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X, User } from 'lucide-react';
import { createRoot } from 'react-dom/client';

// 색상 타입 정의
export type ToastColors = {
  bgColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  textColor?: string;
};

// 토스트 타입 정의
export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'event';

// 토스트 메시지 타입 정의
export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  // 색상 커스터마이징 추가
  colors?: ToastColors;
}

// 커스텀 이벤트 인터페이스 정의
interface ToastEventDetail {
  toast: ToastMessage;
  action?: 'add' | 'remove';
  id?: string;
}

// 토스트 이벤트를 위한 타입 정의
interface CustomToastEvent extends CustomEvent {
  detail: ToastEventDetail;
}

// 토스트 컴포넌트 props
interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

// 기본 색상 설정
const defaultColors: Record<ToastType, ToastColors> = {
  success: {
    bgColor: 'bg-[#4A90E2]', // NEXPOS 테마 색상 (청록색)
    textColor: 'text-white',
  },
  error: {
    bgColor: 'bg-[#F86B68]', // 오류 메시지용 레드 계열
    textColor: 'text-white',
  },
  info: {
    bgColor: 'bg-[#3D8BF8]', // 정보 메시지용 블루 계열
    textColor: 'text-white',
  },
  warning: {
    bgColor: 'bg-[#F8B53D]', // 경고 메시지용 옐로우 계열
    textColor: 'text-white',
  },
  event: {
    // 보라색에서 푸른색 계열로 변경
    bgColor: 'bg-[#4A90E2]',
    gradientFrom: 'from-[#5A9FE8]',
    gradientTo: 'to-[#3A80D2]',
    textColor: 'text-white',
  },
};

// 글로벌 토스트 상태 관리를 위한 콜백 함수들
let toastUpdateCallback: ((toast: ToastMessage) => void) | null = null;
let toastRemoveCallback: ((id: string) => void) | null = null;

// 토스트 컴포넌트
const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const { id, type, message, duration = 18000, colors } = toast;
  const [isVisible, setIsVisible] = useState(true);

  // 타입별 스타일 및 아이콘 설정
  const config = {
    success: {
      icon: CheckCircle,
      title: '성공'
    },
    error: {
      icon: AlertCircle,
      title: '오류'
    },
    info: {
      icon: Info,
      title: '안내'
    },
    warning: {
      icon: AlertTriangle,
      title: '주의'
    },
    event: {
      icon: User, // 상담사 아이콘으로 사용
      title: 'EVENT'
    },
  };

  // 커스텀 색상 또는 기본 색상 사용
  const typeColors = defaultColors[type];
  const customColors = colors || {};
  
  const bgColor = customColors.bgColor || typeColors.bgColor;
  const gradientFrom = customColors.gradientFrom || typeColors.gradientFrom;
  const gradientTo = customColors.gradientTo || typeColors.gradientTo;
  const textColor = customColors.textColor || typeColors.textColor;
  
  const { icon: Icon, title } = config[type];
  
  // 그라데이션 사용 여부에 따른 배경 클래스
  let bgColorClass = bgColor;
  if (gradientFrom && gradientTo) {
    bgColorClass = `bg-gradient-to-br ${gradientFrom} ${gradientTo}`;
  }

  // 닫기 핸들러
  const handleClose = (e: React.MouseEvent) => {
    // 이벤트 버블링 방지
    e.preventDefault();
    e.stopPropagation();
    
    setIsVisible(false);
    
    // 애니메이션 완료 후 onClose 호출
    setTimeout(() => {
      onClose(id);
    }, 200); // 트랜지션 시간에 맞춰 설정
  };

  // 자동 닫힘 타이머
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose(id);
        }, 200);
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [id, duration, onClose]);

  return (
    <Transition
      appear
      show={isVisible}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0"
      enterTo="translate-y-0 opacity-100"
      leave="transition ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div 
        className={`
          ${bgColorClass}
          shadow-md rounded-lg max-w-xs w-56 mb-3
          transform transition-all duration-300 ease-in-out
          overflow-hidden pointer-events-auto
        `}
        style={{ height: 'auto', maxHeight: '6rem' }} // 높이 조절
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-1.5 border-b border-white/20">
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${textColor} ml-1 mr-1.5`}>
              <Icon size={14} />
            </div>
            <span className={`font-medium text-xs ${textColor}`}>
              {title}
            </span>
          </div>
          <button
            onClick={handleClose}
            className={`${textColor} hover:opacity-80 focus:outline-none mr-1 p-1 z-10`}
            type="button"
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </div>
        
        {/* 컨텐츠 - 메시지가 있을 때만 렌더링 */}
        {message && (
          <div className="p-2 text-xs">
            <p className={`font-medium leading-5 whitespace-pre-line ${textColor} line-clamp-2`}>
              {message}
            </p>
          </div>
        )}
      </div>
    </Transition>
  );
};

// 토스트 컨테이너
export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // 토스트 추가 함수 - 중복 체크 및 빈 메시지 필터링 추가
  const addToast = (toast: ToastMessage) => {
    
    // 빈 메시지가 아닌지 확인
    if (!toast.message || toast.message.trim() === '') {
      return;
    }
    
    setToasts((prev) => {
      // 중복 ID 확인
      const exists = prev.some(t => t.id === toast.id);
      if (exists) {
        return prev; // 중복된 ID가 있으면 상태를 변경하지 않음
      }
      return [toast, ...prev.slice(0, 4)]; // 최대 5개만 표시
    });
  };

  // 싱글톤 콜백 설정
  useEffect(() => {
    toastUpdateCallback = addToast;
    toastRemoveCallback = removeToast;
    
    return () => {
      toastUpdateCallback = null;
      toastRemoveCallback = null;
    };
  }, []);

  // 전역 토스트 이벤트 리스너
  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomToastEvent;
      if (customEvent.detail) {
        if (customEvent.detail.action === 'remove' && customEvent.detail.id) {
          removeToast(customEvent.detail.id);
        } else if (customEvent.detail.toast) {
          addToast(customEvent.detail.toast);
        }
      }
    };

    // 커스텀 이벤트 리스너 등록
    window.addEventListener('toast-message', handleToast);

    return () => {
      window.removeEventListener('toast-message', handleToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end justify-end px-4 py-6 pointer-events-none sm:p-6 z-[9999]"
    >
      <div className="flex flex-col items-end space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
};

// 토스트 생성 함수
interface CreateToastOptions {
  duration?: number;
  colors?: ToastColors;
}

const createToast = (
  type: ToastType, 
  message: string, 
  options: CreateToastOptions = {}
) => {
  // 메시지가 비어있는지 확인
  if (!message || message.trim() === '') {
    return null;
  }
  
  // 고유한 ID 생성 - 타임스탬프와 랜덤 문자열 조합
  const toast: ToastMessage = {
    id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type,
    message,
    duration: options.duration || 5000,
    colors: options.colors
  };

  // 콜백 함수가 설정되어 있으면 직접 호출
  if (toastUpdateCallback) {
    toastUpdateCallback(toast);
    return toast.id; // ID 반환
  }

  // 백업 방식: 커스텀 이벤트 발생시켜 토스트 생성
  try {
    const toastEvent = new CustomEvent('toast-message', {
      detail: { toast, action: 'add' },
      bubbles: true,
      composed: true
    });
    window.dispatchEvent(toastEvent);
    return toast.id; // ID 반환
  } catch (err) {
    console.error('Failed to dispatch toast event:', err);
    return null;
  }
};

// 수동으로 토스트 제거하는 함수
const removeToast = (id: string) => {
  
  // 콜백 함수가 있으면 직접 호출
  if (toastRemoveCallback) {
    toastRemoveCallback(id);
    return;
  }

  // 백업 방식: 커스텀 이벤트 발생
  try {
    const toastEvent = new CustomEvent('toast-message', {
      detail: { action: 'remove', id },
      bubbles: true,
      composed: true
    });
    window.dispatchEvent(toastEvent);
  } catch (err) {
    console.error('Failed to dispatch toast remove event:', err);
  }
};

// 토스트 API
export const toast = {
  success: (message: string, options?: CreateToastOptions) => 
    createToast('success', message, options),
  error: (message: string, options?: CreateToastOptions) => 
    createToast('error', message, options),
  info: (message: string, options?: CreateToastOptions) => 
    createToast('info', message, options),
  warning: (message: string, options?: CreateToastOptions) => 
    createToast('warning', message, options),
  event: (message: string, options?: CreateToastOptions) => 
    createToast('event', message, options),
  remove: (id: string) => removeToast(id), // 수동 제거 메소드
};

// 앱 시작 시 토스트 컨테이너 생성
export const initToasts = () => {
  // 이미 존재하는지 확인
  if (document.getElementById('headless-toast-container')) return;
  
  // DOM에 토스트 컨테이너 요소 추가
  const toastContainer = document.createElement('div');
  toastContainer.id = 'headless-toast-container';
  document.body.appendChild(toastContainer);

  try {
    // 컨테이너에 렌더링
    const root = createRoot(toastContainer);
    root.render(<ToastContainer />);
  } catch (err) {
    console.error('Failed to initialize toast container:', err);
  }
};