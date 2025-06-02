import React, { ReactNode, useEffect } from 'react';
import { CommonButton } from '@/components/shared/CommonButton';
import { createPortal } from 'react-dom';

interface CustomConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  width?: string;
}

const CustomConfirmDialog: React.FC<CustomConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '확인',
  cancelText = '닫기',
  width = 'max-w-sm'
}) => {
  // 모달이 열리면 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESC 키 이벤트 처리
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        e.preventDefault();
        // ESC 키로는 닫기 안함
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  // Portal을 사용하여 DOM의 최상위에 렌더링
  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      // 배경 클릭 이벤트 중지 (닫히지 않도록)
      onClick={(e) => e.stopPropagation()}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      
      {/* 다이얼로그 컨테이너 */}
      <div 
        className={`${width} bg-white rounded-md shadow-lg relative z-10 flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-[#AAA] px-4 py-2 border-b rounded-tl-[.5rem] rounded-tr-[.5rem]">
          <h3 className="text-sm text-[#fff] font-normal">
            {title}
          </h3>
        </div>
        
        {/* 본문 */}
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
          
          {/* 버튼 영역 */}
          <div className="flex justify-end gap-1.5 mt-[20px]">
            <CommonButton onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}>
              {confirmText}
            </CommonButton>
            <CommonButton variant="outline" onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}>
              {cancelText}
            </CommonButton>
          </div>
        </div>
      </div>
    </div>,
    document.body // body에 직접 추가
  );
};

export default CustomConfirmDialog;