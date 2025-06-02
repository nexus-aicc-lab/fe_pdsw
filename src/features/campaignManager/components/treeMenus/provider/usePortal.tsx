// src\features\campaignManager\components\treeMenus\provider\usePortal.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import IConfirmPopupForMultiUpdateCampaignProgressToStart from '@/widgets/sidebar2/dialog/IConfirmPopupForMultiUpdateCampaignProgressToStart';

interface PortalContextType {
  openStartPopup: (items: any[], onConfirm: () => Promise<any>) => void;
  closeStartPopup: () => void;
}

const PortalContext = createContext<PortalContextType | null>(null);

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [startPopupState, setStartPopupState] = useState({
    isOpen: false,
    items: [] as any[],
    onConfirm: null as null | (() => Promise<any>),
  });

  const openStartPopup = useCallback((items: any[], onConfirm: () => Promise<any>) => {
    setStartPopupState({
      isOpen: true,
      items,
      onConfirm
    });
  }, []);

  const closeStartPopup = useCallback(() => {
    setStartPopupState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  return (
    <PortalContext.Provider value={{ openStartPopup, closeStartPopup }}>
      {children}
      
      {/* 브라우저 환경에서만 렌더링 */}
      {typeof window !== 'undefined' && createPortal(
        <>
          {startPopupState.isOpen && startPopupState.onConfirm && (
            <IConfirmPopupForMultiUpdateCampaignProgressToStart
              open={startPopupState.isOpen}
              items={startPopupState.items}
              onConfirm={startPopupState.onConfirm}
              onCancel={closeStartPopup}
            />
          )}
        </>,
        document.body
      )}
    </PortalContext.Provider>
  );
};