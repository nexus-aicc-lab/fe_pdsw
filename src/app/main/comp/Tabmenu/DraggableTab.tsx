// src/app/main/comp/DraggableTab.tsx
"use client";

import React, { CSSProperties } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CommonButton } from "@/components/shared/CommonButton";
import Image from "next/image";

interface DraggableTabProps {
  id: number;
  uniqueKey: string;
  title: string;
  isActive: boolean;
  onRemove: () => void;
  onSelect: () => void;
  rowId: string;
  sectionId: string;
}

export default function DraggableTab({
  id,
  uniqueKey,
  title,
  isActive,
  onRemove,
  onSelect,
  rowId,
  sectionId,
}: DraggableTabProps) {
  const elementId = uniqueKey;

  const {
    attributes,
    listeners,
    setNodeRef: setDragNodeRef,
    transform,
    isDragging,
  } = useDraggable({ 
    id: elementId, 
    data: { type: "tab", id, uniqueKey, rowId, sectionId, title, isActive } 
  });

  const { isOver, setNodeRef: setDropNodeRef } = useDroppable({ 
    id: `droppable-${elementId}`, 
    data: { type: "tab", id, uniqueKey, rowId, sectionId } 
  });

  const setNodeRef = (node: HTMLElement | null) => {
    setDragNodeRef(node);
    setDropNodeRef(node);
  };

  // 드래그 중일 때는 원본 요소를 투명하게 만들고 transform 제거
  const style: CSSProperties = isDragging 
    ? {
        opacity: 0.5,
        // transform 제거하여 원본 위치 유지
      }
    : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex-none flex items-center gap-2 px-3 border-r border-t border-[#ebebeb]
        relative h-full cursor-pointer select-none rounded-t-[3px] rounded-b-none
        ${isActive ? "bg-[#56CAD6] text-white" : "bg-white text-[#777]"}
        ${isOver && !isDragging ? "after:absolute after:inset-0 after:border-[1.5px] after:border-dashed after:border-blue-500 after:pointer-events-none" : ""}
      `}
      onClick={onSelect}
      {...listeners}
      {...attributes}
      data-tab-id={id}
      data-tab-key={uniqueKey}
      data-row-id={rowId}
      data-section-id={sectionId}
    >
      <span className="text-sm whitespace-nowrap">{title}</span>
      <CommonButton
        variant="ghost"
        size="sm"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="p-0 min-w-[8px] hover:bg-transparent"
      >
        <Image
          src={isActive ? "/header-menu/maintap_colse_on.png" : "/header-menu/maintap_colse_off.png"}
          alt="닫기"
          width={8}
          height={8}
        />
      </CommonButton>
    </div>
  );
}

// 드래그 오버레이용 컴포넌트
export function TabDragOverlay({ 
  title, 
  isActive 
}: { 
  title: string; 
  isActive: boolean; 
}) {
  return (
    <div
      className={`
        flex-none flex items-center gap-2 px-3 border-r border-t border-[#ebebeb]
        relative h-full cursor-pointer select-none rounded-t-[3px] rounded-b-none
        ${isActive ? "bg-[#56CAD6] text-white" : "bg-white text-[#777]"}
        shadow-lg transform rotate-2
      `}
      style={{ minHeight: '40px' }} // 탭의 실제 높이와 맞춤
    >
      <span className="text-sm whitespace-nowrap">{title}</span>
      <div className="p-0 min-w-[8px]">
        <Image
          src={isActive ? "/header-menu/maintap_colse_on.png" : "/header-menu/maintap_colse_off.png"}
          alt="닫기"
          width={8}
          height={8}
        />
      </div>
    </div>
  );
}