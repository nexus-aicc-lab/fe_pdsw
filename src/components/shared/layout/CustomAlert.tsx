// src/components/shared/layout/CustomAlert.tsx 수정본

"use client";

import React, { ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { CommonButton } from "@/components/shared/CommonButton";

export interface CustomAlertRequest {
  message: React.ReactNode;
  title: React.ReactNode;
  type: string;
  isOpen?: boolean;
  onClose: () => void;
  onCancel?: () => void;
  width?: string | number;
  height?: string | number;
  showButtons?: boolean;
  confirmDisabled?: boolean;
  isShowForCancelButton?: boolean;
  preventAutoClose?: boolean; // 새로 추가: 자동 닫힘 방지 옵션
}

const CustomAlert = ({
  message,
  title,
  type,
  isOpen = true,
  onClose,
  onCancel,
  width = 'max-w-sm',
  height,
  showButtons = true,
  confirmDisabled = false,
  isShowForCancelButton = false,
  preventAutoClose = false, // 기본값은 false로 설정
}: CustomAlertRequest) => {
  
  const parsedWidth = typeof width === "number" ? `${width}px` : width;
  const parsedHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        // 자동 닫힘 방지 옵션이 켜져 있는 경우, 닫기 이벤트 무시
        if (!open && !preventAutoClose) {
          if (onCancel) {
            onCancel();
          } else {
            onClose();
          }
        }
      }}
    >
      <AlertDialogContent
        className={`p-0 rounded-none border shadow-sm ${typeof width === 'string' ? width : ''}`}
        style={{
          width: parsedWidth,
          height: parsedHeight,
        }}
      >
        <AlertDialogHeader className="bg-[#AAA] px-4 py-2 border-b rounded-tl-[.5rem] rounded-tr-[.5rem]">
          <AlertDialogTitle className="text-sm text-[#fff] font-normal">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            {typeof message === 'string' ? message : '알림 메시지'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="p-4 bg-white rounded-bl-[.5rem] rounded-br-[.5rem] h-full">
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
            <div className="flex justify-end gap-1.5 mt-[20px]">
              {type === '1' ? (
                <>
                  <CommonButton
                    onClick={onClose}
                    disabled={confirmDisabled}
                    className={confirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    확인
                  </CommonButton>
                  {(onCancel || isShowForCancelButton) && (
                    <CommonButton variant="outline" onClick={onCancel || onClose}>
                      닫기
                    </CommonButton>
                  )}
                </>
              ) : type === '0' ? (
                <>
                  <CommonButton
                    onClick={onClose}
                    disabled={confirmDisabled}
                    className={confirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    확인
                  </CommonButton>
                  <CommonButton variant="outline" onClick={onCancel || onClose}>
                    닫기
                  </CommonButton>
                </>
              ) : type === '3' ? (
                <>
                  {/* type 3은 버튼 없음 */}
                </>
              ) : (
                <>
                  <CommonButton
                    onClick={onClose}
                    disabled={confirmDisabled}
                    className={confirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    확인
                  </CommonButton>
                  {isShowForCancelButton && (
                    <CommonButton variant="outline" onClick={onCancel || onClose}>
                      닫기
                    </CommonButton>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CustomAlert;