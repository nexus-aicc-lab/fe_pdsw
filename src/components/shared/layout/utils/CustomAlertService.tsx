
// src\components\shared\layout\utils\CustomAlertService.tsx
import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CommonButton } from "@/components/shared/CommonButton";

// CustomAlert와 동일한 인터페이스 사용
interface CustomAlertOptions {
  message: ReactNode;
  title: string;
  type: string;
  onClose?: () => void;
  onCancel?: () => void;
  width?: string;
  showButtons?: boolean;
  confirmDisabled?: boolean;
}

class CustomAlertService {
  private containerElement: HTMLDivElement | null = null;
  private root: ReactDOM.Root | null = null;

  constructor() {
    // 싱글턴 패턴 - 서비스가 초기화될 때 컨테이너 생성
    if (typeof window !== 'undefined') {
      this.createContainer();
    }
  }

  private createContainer() {
    // 이미 컨테이너가 있다면 생성하지 않음
    if (this.containerElement) return;

    // 새 div 요소 생성
    this.containerElement = document.createElement('div');
    this.containerElement.id = 'custom-alert-container';
    document.body.appendChild(this.containerElement);
    this.root = ReactDOM.createRoot(this.containerElement);
  }

  // 다이얼로그 표시 메서드
  show({
    message,
    title,
    type,
    onClose,
    onCancel,
    width = 'max-w-sm',
    showButtons = true,
    confirmDisabled = false
  }: CustomAlertOptions) {
    if (!this.containerElement || !this.root) {
      this.createContainer();
    }

    // 내부적으로 사용할 닫기 함수
    const handleClose = () => {
      if (onClose) onClose();
      this.hide();
    };

    // 내부적으로 사용할 취소 함수
    const handleCancel = () => {
      if (onCancel) onCancel();
      this.hide();
    };

    // CustomAlert 컴포넌트와 동일한 JSX 구조 사용
    const alertElement = (
      <AlertDialog
        open={true}
        onOpenChange={(open) => {
          // 다이얼로그가 닫힐 때(ESC키, 오버레이 클릭 등)는 취소 동작 호출
          if (!open) {
            if (onCancel) {
              handleCancel();
            } else {
              handleClose();
            }
          }
        }}
      >
        <AlertDialogContent className={`p-0 ${width} rounded-none border shadow-sm`}>
          <AlertDialogHeader className="bg-[#AAA] px-4 py-2 border-b rounded-tl-[.5rem] rounded-tr-[.5rem]">
            <AlertDialogTitle className="text-sm text-[#fff] font-normal">
              {title}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="p-4 bg-white rounded-bl-[.5rem] rounded-br-[.5rem]">
            <div className="text-sm text-[#333]">
              {typeof message === 'string'
                ? message.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))
                : message}
            </div>
            {showButtons && (
              <div className="flex justify-end gap-1.5">
                {type === '1' ? (
                  <>
                    <CommonButton
                      onClick={handleClose}
                      disabled={confirmDisabled}
                      className={confirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      확인
                    </CommonButton>
                    {onCancel && (
                      <CommonButton variant="outline" onClick={handleCancel}>
                        닫기
                      </CommonButton>
                    )}
                  </>
                ) : type === '0' ? (
                  <>
                    <CommonButton
                      onClick={handleClose}
                      disabled={confirmDisabled}
                      className={confirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      확인
                    </CommonButton>
                    <CommonButton variant="outline" onClick={handleClose}>
                      닫기
                    </CommonButton>
                  </>
                ) : type === '3' ? (
                  <>
                  </>
                ) : (
                  <>
                    <CommonButton
                      onClick={handleClose}
                      disabled={confirmDisabled}
                      className={confirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      확인
                    </CommonButton>
                  </>
                )}
              </div>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );

    // 다이얼로그 렌더링
    if (this.root) {
      this.root.render(alertElement);
    }
  }

  // 다이얼로그 숨기기
  hide() {
    if (this.root) {
      this.root.render(null);
    }
  }

  // 편의 메서드들
  error(message: string, title: string = '오류', onClose?: () => void) {
    this.show({ message, title, type: '2', onClose });
  }

  info(message: string, title: string = '안내', onClose?: () => void) {
    this.show({ message, title, type: '2', onClose });
  }

  success(message: string, title: string = '성공', onClose?: () => void) {
    this.show({ message, title, type: '2', onClose });
  }

  confirm(message: string, title: string = '확인', onConfirm?: () => void, onCancel?: () => void) {
    this.show({
      message,
      title,
      type: '1',
      onClose: onConfirm,
      onCancel: onCancel
    });
  }

  yesNo(message: string, title: string = '선택', onYes?: () => void) {
    this.show({
      message,
      title,
      type: '0',
      onClose: onYes
    });
  }
}

// 싱글턴 인스턴스 생성 및 내보내기
export const customAlertService = new CustomAlertService();