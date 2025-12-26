"use client";

import React, { useState, useCallback } from "react";
import { useTabStore } from "@/store/tabStore";
import UnifiedTabSection from "./UnifiedTabSection";
import ResizableDivider from "./ResizableDivider";


// 통합된 메인 컴포넌트 (탭 + 콘텐츠)
const UnifiedTabView: React.FC = () => {
  const [isResizing, setIsResizing] = useState(false);

  const {
    rows,
    openedTabs,
    addSection,
    activeTabId,
    activeTabKey,
    isResizing: storeResizing,
    setResizing: setStoreResizing
  } = useTabStore();

  // 리사이징 시작 함수
  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
    setStoreResizing(true);
  }, [setStoreResizing]);

  // 리사이징 종료 함수
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setStoreResizing(false);
  }, [setStoreResizing]);

  // 섹션 추가 버튼 핸들러
  const handleAddSection = useCallback(() => {
    if (rows[0]?.sections.length < 2) {
      addSection('row-1');
    }
  }, [rows, addSection]);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* 툴바 영역 */}
      {/* <div className="flex-none flex items-center p-2 bg-gray-50 border-b border-gray-200">
        <button 
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm mr-2"
          onClick={handleAddSection}
          disabled={rows[0]?.sections.length >= 2}
        >
          섹션 추가 {rows[0]?.sections.length}/2
        </button>
        
        <div className="ml-auto text-xs text-gray-500">
          {rows[0]?.sections.length === 2 && (
            `분할 비율: ${rows[0]?.sections.map(s => Math.round(s.width)).join(' : ')}`
          )}
        </div>
      </div> */}
      
      {/* 탭 컨테이너 */}
      <div className={`flex-1 overflow-hidden ${isResizing || storeResizing ? 'is-resizing' : ''}`}>
        {rows.map((row) => {
          const rowId = row.id;

          return (
            <div key={rowId} className="flex h-full">
              {row.sections.map((section, idx) => {
                const isLastSection = idx === row.sections.length - 1;
                
                return (
                  <React.Fragment key={section.id}>
                    <UnifiedTabSection
                      rowId={rowId}
                      sectionId={section.id}
                      section={{
                        tabs: section.tabs,
                        activeTabKey: section.activeTabKey || undefined // null 대신 undefined로 변환
                      }}
                      width={section.width}
                      openedTabs={openedTabs}
                      activeTabId={activeTabId}
                      activeTabKey={activeTabKey}
                      canRemove={section.id !== "default"}
                      showDivider={idx < row.sections.length - 1}
                      isSplitView={row.sections.length > 1}
                    />
                    
                    {/* 마지막 섹션이 아니고 섹션이 2개일 때만 리사이즈 분할선 표시 */}
                    {!isLastSection && row.sections.length === 2 && (
                      <ResizableDivider
                        rowId={rowId}
                        onResizeStart={handleResizeStart}
                        onResizeEnd={handleResizeEnd}
                        className={isResizing || storeResizing ? "bg-[#55BEC8]" : ""}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UnifiedTabView;