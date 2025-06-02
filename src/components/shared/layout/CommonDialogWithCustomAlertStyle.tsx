// src\components\shared\layout\CommonDialogWithCustomAlertStyle.tsx
import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CommonButton } from "@/components/shared/CommonButton";

// props 타입 정의
interface ICommonDialogWithCustomAlertStyleProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
  width?: string;
  showButtons?: boolean;
  confirmDisabled?: boolean;
  children: React.ReactNode;
}

const CommonDialogWithCustomAlertStyle: React.FC<ICommonDialogWithCustomAlertStyleProps> = ({
  title,
  isOpen,
  onClose,
  onCancel,
  width = 'max-w-sm',
  showButtons = true,
  confirmDisabled = false,
  children,
}) => {
  // 다이얼로그를 닫는 함수
  const handleClose = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* 오버레이 */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        {/* 다이얼로그 컨테이너 */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`p-0 ${width} rounded-none border shadow-sm bg-white`}>
                {/* 헤더 */}
                <div className="bg-[#AAA] px-4 py-2 border-b rounded-tl-[.5rem] rounded-tr-[.5rem]">
                  <Dialog.Title className="text-sm text-[#fff] font-normal">
                    {title}
                  </Dialog.Title>
                </div>
                
                {/* 본문 */}
                <div className="p-4 bg-white rounded-bl-[.5rem] rounded-br-[.5rem]">
                  <div className="text-sm text-gray-700 mb-4">
                    {children}
                  </div>
                  {showButtons && (
                    <div className="flex justify-end gap-1.5">
                      <CommonButton 
                        onClick={onClose} 
                        disabled={confirmDisabled}
                        className={confirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        확인
                      </CommonButton>
                      {onCancel && (
                        <CommonButton variant="outline" onClick={onCancel}>
                          닫기
                        </CommonButton>
                      )}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CommonDialogWithCustomAlertStyle;