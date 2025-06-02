
"use client";

import React, { ReactNode, useCallback } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

interface CommonDialogForSideMenuProps {
  isOpen: boolean;
  onClose: (e?: React.MouseEvent | React.KeyboardEvent | Event) => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  // 추가: dialogClassName prop 추가
  dialogClassName?: string;
  // 추가: style prop 추가
  style?: React.CSSProperties;
  // 추가: className prop 추가
  className?: string;
}

const CommonDialogForSideMenu = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  dialogClassName,
  style,
  className,
}: CommonDialogForSideMenuProps) => {
  const stopPropagation = useCallback((e: React.UIEvent) => {
    e.stopPropagation();
  }, []);

  // onOpenChange 시 바로 닫지 않고 onClose를 직접 호출
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      onClose();
    }
  }, [onClose]);

  // 오버레이 클릭 시 다이얼로그 닫기
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(e);
  }, [onClose]);

  const handleCloseClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose(e);
  }, [onClose]);

  return (
    <DialogPrimitive.Root 
      open={isOpen} 
      onOpenChange={handleOpenChange}
    >
      <DialogPrimitive.Portal>
        {/* 오버레이 - 클릭 시 다이얼로그 닫힘 */}
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-40 bg-black/40"
          onClick={handleOverlayClick}
          onPointerDown={stopPropagation}
        />
        
        {/* 컨텐츠 - dialogClassName, style, className 적용 */}
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 top-1/2 left-1/2",
            "w-[400px] -translate-x-1/2 -translate-y-1/2",
            "border border-gray-300 bg-white shadow-md p-4 rounded-md",
            dialogClassName,
            className
          )}
          style={style}
          onClick={stopPropagation}
          onPointerDown={stopPropagation}
          // onPointerDownOutside, onInteractOutside 제거하여 외부 이벤트에 의한 닫힘 방지
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            onClose(e);
          }}
        >
          {/* 타이틀 */}
          {title ? (
            <DialogPrimitive.Title 
              className="text-lg font-semibold"
              onClick={stopPropagation}
            >
              {title}
            </DialogPrimitive.Title>
          ) : (
            <VisuallyHidden>
              <DialogPrimitive.Title>Dialog</DialogPrimitive.Title>
            </VisuallyHidden>
          )}
          
          {/* 설명 */}
          {description && (
            <DialogPrimitive.Description 
              className="mt-1 text-sm text-gray-500"
              onClick={stopPropagation}
            >
              {description}
            </DialogPrimitive.Description>
          )}
          
          {/* 콘텐츠 영역 */}
          <div 
            className="mt-4" 
            onClick={stopPropagation}
            onPointerDown={stopPropagation}
          >
            {children}
          </div>
          
          {/* 닫기 버튼 */}
          <DialogPrimitive.Close
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            aria-label="Close"
            onClick={handleCloseClick}
            onPointerDown={stopPropagation}
          >
            ✕
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default CommonDialogForSideMenu;