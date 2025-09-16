
import React, { useRef, useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { CommonButton } from "@/components/shared/CommonButton";
import { useTabStore } from "@/store/tabStore";
import DraggableTab from "./Tabmenu/DraggableTab";
import Image from "next/image";

interface TabSectionProps {
  rowId: string;
  sectionId: string;
  width: number;
  canRemove?: boolean;
  showDivider?: boolean;
}

export default function TabSection({
  rowId,
  sectionId,
  width,
  canRemove = true,
  showDivider = false,
}: TabSectionProps) {
  // Move all hooks to the top before any conditional returns
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [scrolling, setScrolling] = useState<"left" | "right" | null>(null);
  const prevTabsLengthRef = useRef<number | null>(null);
  
  // 섹션 ID 일관성 있게 생성
  const droppableId = `section-${rowId}-${sectionId}`;
  
  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
    data: { 
      type: "section", 
      rowId, 
      sectionId 
    },
  });

  const {
    rows,
    openedTabs,
    removeTab,
    removeSection,
    setSectionActiveTab,
    setOpenOperationSectionId,
    activeTabId,
    activeTabKey,
  } = useTabStore();
  
  // 현재 row와 section 찾기
  const row = rows.find((r) => r.id === rowId);
  const section = row?.sections.find((s) => s.id === sectionId);
  const currentTabsLength = section?.tabs.length || 0;

  // 탭 추가 감지 및 자동 스크롤 처리
  useEffect(() => {
    // 처음 렌더링이 아니고, 이전 탭 개수보다 현재 탭 개수가 많아졌을 경우
    if (prevTabsLengthRef.current !== null && currentTabsLength > prevTabsLengthRef.current) {
      // 오른쪽 끝으로 스크롤
      if (scrollRef.current) {
        // 즉시 실행과 약간의 지연 후 실행(애니메이션이나 렌더링 완료 후)
        scrollToEnd();
        
        // 추가로 약간의 지연을 두고 한 번 더 스크롤 (렌더링이 완전히 끝난 후)
        setTimeout(scrollToEnd, 100);
      }
    }
    
    // 현재 탭 개수 저장
    prevTabsLengthRef.current = currentTabsLength;
  }, [currentTabsLength]);

  // 오른쪽 끝으로 스크롤하는 함수
  const scrollToEnd = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  };

  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const delta = dir === "left" ? -100 : 100;
    scrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  const startScroll = (dir: "left" | "right") => {
    setScrolling(dir);
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    scroll(dir);
    scrollIntervalRef.current = setInterval(() => scroll(dir), 150);
  };

  const stopScroll = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    setScrolling(null);
  };

  // 섹션 삭제 핸들러
  const handleSectionRemove = () => {
    // 섹션 삭제 전에 업데이트된 removeSection 함수 호출
    removeSection(rowId, sectionId);
  };

  // Now perform conditional checks after all hooks have been called
  if (!row) return null;
  if (!section) return null;

  return (
    <div
      ref={setNodeRef}
      className={`flex-none relative transition-colors duration-200 ${
        isOver 
          ? "bg-blue-100 shadow-inner ring-2 ring-blue-300" // 강조된 하이라이트 스타일
          : "bg-white"
      }${
        showDivider ? " border-r border-gray-200" : ""
      }`}
      style={{ width: `${width}%` }}
      data-section-id={sectionId}
      data-row-id={rowId}
    >
      {/* 높이를 일관되게 맞춘 컨테이너 */}
      <div className="flex items-stretch">
        {/* Left scroll - 높이를 동일하게 */}
        <CommonButton
          variant="tabEtc"
          size="sm"
          className={`flex-none flex items-center justify-center px-3 ${scrolling === "left" ? "bg-gray-100" : ""}`}
          onMouseDown={() => startScroll("left")}
          onMouseUp={stopScroll}
          onMouseLeave={stopScroll}
          onTouchStart={() => startScroll("left")}
          onTouchEnd={stopScroll}
        >
          <Image src="/header-menu/leftArrow.svg" alt="left" width={8} height={8} />
        </CommonButton>

        {/* Tabs container - 높이와 정렬 일치 */}
        <div
          ref={scrollRef}
          className={`flex-1 flex items-stretch overflow-x-auto scrollbar-none ${
            isOver ? "bg-blue-50" // 탭 컨테이너도 하이라이트
            : ""
          }`}
          data-droppable-tabs-container={true}
        >
          {section.tabs.map((tab, index) => {
            // openedTabs에서 실제 탭 정보 찾기
            const openedTab = openedTabs.find(
              (t) => t.id === tab.id && t.uniqueKey === tab.uniqueKey
            );
            
            // 섹션 활성 탭 확인 및 전역 활성 탭 확인
            const isActiveInSection = section.activeTabKey === tab.uniqueKey;
            const isActiveGlobal = tab.id === activeTabId && tab.uniqueKey === activeTabKey;
            const isActive = isActiveInSection || isActiveGlobal;
            
            return (
              <DraggableTab
                key={tab.uniqueKey}
                id={tab.id}
                uniqueKey={tab.uniqueKey}
                title={openedTab?.title || tab.title} // openedTab이 없을 경우 fallback
                isActive={isActive}
                onRemove={() => {
                  if (tab.id === 11) setOpenOperationSectionId("section1");
                  removeTab(tab.id, tab.uniqueKey);
                }}
                onSelect={() => setSectionActiveTab(rowId, sectionId, tab.uniqueKey)}
                rowId={rowId}
                sectionId={sectionId}
              />
            );
          })}
        </div>

        {/* Right scroll - 높이를 동일하게 */}
        <CommonButton
          variant="tabEtc"
          size="sm"
          className={`flex-none flex items-center justify-center px-3 ${scrolling === "right" ? "bg-gray-100" : ""}`}
          onMouseDown={() => startScroll("right")}
          onMouseUp={stopScroll}
          onMouseLeave={stopScroll}
          onTouchStart={() => startScroll("right")}
          onTouchEnd={stopScroll}
        >
          <Image src="/header-menu/rightArrow.svg" alt="right" width={8} height={8} />
        </CommonButton>
          
        {/* Remove section - 높이를 동일하게 */}
        {canRemove && row.sections.length > 1 && (
          <CommonButton
            variant="tabEtc"
            size="sm"
            className="flex-none flex items-center justify-center px-3"
            onClick={handleSectionRemove}
          >
            <Image src="/header-menu/tab_minus.svg" alt="remove" width={8} height={8} />
          </CommonButton>
        )}
      </div>
      
      {/* 추가: 드롭 가능한 영역에 대한 시각적 표시 */}
      {isOver && (
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-400 bg-blue-50 bg-opacity-30 z-10"></div>
      )}
    </div>
  );
}