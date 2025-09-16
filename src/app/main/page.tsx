"use client";

import React, { useMemo, useCallback, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useTabStore } from "@/store/tabStore";
import DraggableTab from "./comp/Tabmenu/DraggableTab";
import UnifiedTabView from "./comp/Tabmenu/UnifiedTabView";

interface ActiveTabState {
  id: number;
  uniqueKey: string;
  title: string;
  icon: string;
}

const MainPage = () => {
  const [activeTab, setActiveTab] = useState<ActiveTabState | null>(null);

  const {
    rows,
    openedTabs,
    activeTabId,
    activeTabKey,
    moveTabToSection,
    moveTabToGroup,
    moveTabWithinSection,
    setActiveTab: setGlobalActiveTab,
  } = useTabStore();

  // DnD 센서 설정 - 드래그를 시작하기 위한 최소 거리 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 이상 드래그해야 활성화
      },
    })
  );

  // 드래그 시작 핸들러
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const isTab = active.data.current?.type === "tab";
    if (!isTab) return;

    const tabId = active.data.current?.id;
    const uniqueKey = active.data.current?.uniqueKey;

    const tab = openedTabs.find((t) => t.id === tabId && t.uniqueKey === uniqueKey);
    if (tab) {
      setActiveTab({
        id: tab.id,
        uniqueKey: tab.uniqueKey,
        title: tab.title,
        icon: tab.icon || "",
      });
    }
  }, [openedTabs]);

  // 드래그 종료 핸들러
// Updated handleDragEnd function for MainPage.tsx
const handleDragEnd = useCallback((event: DragEndEvent) => {
  const { active, over } = event;
  if (!over) {
    setActiveTab(null);
    return;
  }

  const isTab = active.data.current?.type === "tab";
  if (!isTab) {
    setActiveTab(null);
    return;
  }

  const tabId = active.data.current?.id;
  const uniqueKey = active.data.current?.uniqueKey;
  const overType = over.data.current?.type;
  const activeRowId = active.data.current?.rowId;
  const activeSectionId = active.data.current?.sectionId;

  // 탭을 콘텐츠 영역에 드롭
  if (overType === "content-area") {
    const targetRowId = over.data.current?.rowId;
    const targetSectionId = over.data.current?.sectionId;
    
    // 현재 행에서 섹션 수 확인
    const currentRow = rows.find(r => r.id === targetRowId);
    if (currentRow && currentRow.sections.length < 2) {
      // 새 섹션을 추가하고 탭 이동을 한번에 처리
      // 여기서 원래 너비를 저장하기 위해 store의 getState를 사용하여 직접 접근
      const storeState = useTabStore.getState();
      const originalSectionWidth = storeState.rows.find(r => r.id === targetRowId)?.sections[0].width || 50;
      
      // 새 섹션 추가 후 기존 섹션 너비를 보존하는 로직
      storeState.addSectionAndMoveTab(tabId, uniqueKey, targetRowId, activeSectionId);
      
      // 섹션이 추가된 후에 너비 업데이트
      if (storeState.rows.find(r => r.id === targetRowId)?.sections.length === 2) {
        storeState.updateSectionWidths(targetRowId, [originalSectionWidth, 100 - originalSectionWidth]);
      }
    } else if (activeRowId !== targetRowId || activeSectionId !== targetSectionId) {
      // 이미 섹션이 2개라면 기존 섹션으로 이동 (같은 섹션이 아닌 경우에만)
      moveTabToSection(tabId, targetRowId, targetSectionId, uniqueKey);
    }
  }
  // 탭 위에 드롭한 경우
  else if (overType === "tab") {
    const overRowId = over.data.current?.rowId;
    const overSectionId = over.data.current?.sectionId;
    const targetTabId = over.data.current?.id;
    const targetUniqueKey = over.data.current?.uniqueKey;

    // 같은 섹션 내에서의 드래그
    if (activeRowId === overRowId && activeSectionId === overSectionId) {
      const row = rows.find(r => r.id === activeRowId);
      const section = row?.sections.find(s => s.id === activeSectionId);
      
      if (row && section) {
        const sourceIndex = section.tabs.findIndex(
          t => t.id === tabId && t.uniqueKey === uniqueKey
        );
        const targetIndex = section.tabs.findIndex(
          t => t.id === targetTabId && t.uniqueKey === targetUniqueKey
        );
  
        if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) {
          moveTabWithinSection(
            tabId,
            uniqueKey,
            activeRowId,
            activeSectionId,
            targetIndex
          );
        }
      }
    } 
    // 서로 다른 섹션 간의 드래그
    else if (overRowId && overSectionId) {
      moveTabToSection(tabId, overRowId, overSectionId, uniqueKey);
    }
  }
  // 섹션에 직접 드롭된 경우
  else if (overType === "section") {
    const targetRowId = over.data.current?.rowId;
    const targetSectionId = over.data.current?.sectionId;
    if (targetRowId && targetSectionId) {
      moveTabToSection(tabId, targetRowId, targetSectionId, uniqueKey);
    }
  }
  // 그룹에 드롭된 경우
  else if (overType === "group") {
    moveTabToGroup(tabId, over.data.current?.id);
  }

  setActiveTab(null);
}, [rows, moveTabToSection, moveTabToGroup, moveTabWithinSection]);

  // 드래그 중인 탭 오버레이 메모이제이션
  const dragOverlay = useMemo(() => {
    if (!activeTab) return null;
    
    return (
      <DraggableTab
        id={activeTab.id}
        uniqueKey={activeTab.uniqueKey}
        title={activeTab.title}
        isActive={activeTab.id === activeTabId && activeTab.uniqueKey === activeTabKey}
        onRemove={() => {}}
        onSelect={() => setGlobalActiveTab(activeTab.id, activeTab.uniqueKey)}
        rowId=""
        sectionId=""
      />
    );
  }, [activeTab, activeTabId, activeTabKey, setGlobalActiveTab]);

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* 통합된 탭 뷰 컴포넌트 사용 */}
        <UnifiedTabView />
      </div>

      {/* 드래그 중인 탭 오버레이 */}
      <DragOverlay>{dragOverlay}</DragOverlay>
    </DndContext>
  );
};

export default MainPage;