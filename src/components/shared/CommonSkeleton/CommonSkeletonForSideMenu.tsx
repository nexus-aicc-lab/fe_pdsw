"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CommonSkeletonForSideMenuProps {
  itemCount?: number; // 트리 노드 개수 조절
  indentLevel?: number; // 들여쓰기 수준 조절
  showIcons?: boolean; // 아이콘 표시 여부
}

const CommonSkeletonForSideMenu: React.FC<CommonSkeletonForSideMenuProps> = ({
  itemCount = 6,
  indentLevel = 0,
  showIcons = true,
}) => {
  return (
    <div className={`p-4 space-y-3 ${indentLevel > 0 ? `pl-${indentLevel * 4}` : ""}`}>
      {/* 최상위 그룹 */}
      <div className="flex items-center space-x-2">
        {showIcons && <Skeleton className="h-5 w-5 rounded-full" />}
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="pl-5 space-y-2">
        {/* 하위 그룹 */}
        <div className="flex items-center space-x-2">
          {showIcons && <Skeleton className="h-5 w-5 rounded-full" />}
          <Skeleton className="h-6 w-28" />
        </div>

        <div className="pl-5 space-y-2">
          {/* 사용자 목록 */}
          {Array.from({ length: itemCount }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              {showIcons && <Skeleton className="h-5 w-5 rounded-full" />}
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommonSkeletonForSideMenu;
