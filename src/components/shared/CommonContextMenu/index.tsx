"use client";

import React, { ReactNode, Fragment, useState, useCallback } from "react";
import { Transition } from "@headlessui/react";

interface CommonContextMenuProps {
  trigger: ReactNode;      // 우클릭(혹은 클릭) 대상이 될 트리거 요소
  children: ReactNode;     // 실제 메뉴 아이템들
}

interface CommonMenuItemProps {
  onClick: () => void;
  children: ReactNode;
}

// 전역 상태 및 이벤트 관리를 위한 객체
const MenuManager = {
  activeMenu: null as (() => void) | null,
  setActiveMenu(menu: () => void) {
    this.activeMenu = menu;
  },
  closeActiveMenu() {
    if (this.activeMenu) {
      this.activeMenu();
      this.activeMenu = null;
    }
  },
  closeOthers(current: () => void) {
    if (this.activeMenu && this.activeMenu !== current) {
      this.activeMenu();
    }
    this.setActiveMenu(current);
  },
};

// 전역 이벤트 리스너 등록 (브라우저 환경에서만 수행)
if (typeof window !== "undefined") {
  window.addEventListener("click", () => {
    MenuManager.closeActiveMenu();
  });

  window.addEventListener("contextmenu", () => {
    MenuManager.closeActiveMenu();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      MenuManager.closeActiveMenu();
    }
  });
}

/**
 * 우클릭 또는 지정된 이벤트에 따라 열리는 공통 컨텍스트 메뉴
 */
const CommonContextMenu: React.FC<CommonContextMenuProps> = ({
  trigger,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // 메뉴 닫기 핸들러
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // 열릴 때 다른 메뉴 닫기
  React.useEffect(() => {
    if (isOpen) {
      MenuManager.closeOthers(handleClose);
    }
    return () => {
      if (MenuManager.activeMenu === handleClose) {
        MenuManager.activeMenu = null;
      }
    };
  }, [isOpen, handleClose]);

  // 트리거 우클릭 시
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 다른 컨텍스트 메뉴 닫기
      MenuManager.closeActiveMenu();

      // 우클릭 위치 설정
      setPosition({ x: e.clientX, y: e.clientY });
      setIsOpen(true);

      // 현재 메뉴를 활성화 메뉴로 지정
      MenuManager.setActiveMenu(handleClose);
    },
    [handleClose]
  );

  // 메뉴 아이템 클릭 시
  const handleMenuItemClick = useCallback(
    (originalOnClick: () => void) => {
      return () => {
        setIsOpen(false);
        // 약간의 지연 후 원본 클릭 로직 수행
        setTimeout(() => {
          originalOnClick();
        }, 10);
      };
    },
    []
  );

  return (
    <div className="relative inline-block text-left">
      {/* 트리거 요소 */}
      <div onContextMenu={handleContextMenu} onClick={(e) => e.stopPropagation()}>
        {trigger}
      </div>

      {/* 실제 컨텍스트 메뉴 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          onContextMenu={(e) => {
            e.preventDefault();
            setIsOpen(false);
          }}
        >
          <Transition
            show={isOpen}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <div
              className="fixed z-50 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-1">
                {React.Children.map(children, (child) =>
                  React.isValidElement(child)
                    ? React.cloneElement(child as React.ReactElement<CommonMenuItemProps>, {
                        onClick: handleMenuItemClick(
                          (child as React.ReactElement<CommonMenuItemProps>).props.onClick
                        ),
                      })
                    : child
                )}
              </div>
            </div>
          </Transition>
        </div>
      )}
    </div>
  );
};

/**
 * 컨텍스트 메뉴 내에서 사용하는 단일 메뉴 아이템
 */
const CommonMenuItem: React.FC<CommonMenuItemProps> = ({ onClick, children }) => (
  <button
    className="hover:bg-[#F4F6F9] relative cursor-default select-none rounded-[3px] px-[6px] py-[4px] outline-none focus:bg-[#F4F6F9] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-[#333] flex items-center text-sm w-full"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  >
    {children}
  </button>
);

export { CommonContextMenu, CommonMenuItem };
