"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from "lucide-react";
import CommonButton from '@/components/shared/CommonButton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCounselorFilterStore, NodeType } from "@/store/storeForSideMenuCounselorTab";
import Image from 'next/image';

// 정렬 타입 정의
export type SortType = 'name' | 'id';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  type: SortType;
  direction: SortDirection;
  nodeType: NodeType;
}

const ISortButtonForSideMenuCounselorTab = () => {
  const { 
    sortOption, 
    setSortOption, 
    expandToLevel,
    currentExpansionLevel
  } = useCounselorFilterStore();
  
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeLevel, setActiveLevel] = useState<number>(currentExpansionLevel);

  // 현재 확장 레벨 변경 시 로컬 상태 업데이트
  useEffect(() => {
    setActiveLevel(currentExpansionLevel);
  }, [currentExpansionLevel]);

  // 정렬 기준 선택 처리 (ID/이름)
  const handleSortTypeSelect = (sortType: SortType) => {
    setSortOption({ 
      ...sortOption,
      type: sortType
    });
  };

  // 노드 타입과 정렬 방향 함께 선택
  const handleNodeTypeSort = (nodeType: NodeType, direction: SortDirection, event: React.MouseEvent) => {
    event.stopPropagation();
    
    setSortOption({ 
      type: sortOption.type,
      nodeType, 
      direction 
    });
    
    // 노드 타입에 따라 확장 레벨 설정
    switch (nodeType) {
      case 'tenant':
        expandToLevel(2);
        break;
      case 'group':
        expandToLevel(3);
        break;
      case 'team':
        expandToLevel(4);
        break;
      case 'counselor':
        expandToLevel(5);
        break;
      case 'all':
        expandToLevel(5);
        break;
    }
    
    setIsSortOpen(false);
  };

  // 현재 활성화된 정렬 상태 확인
  const isActiveSort = (nodeType: NodeType, direction: SortDirection) => {
    return sortOption.nodeType === nodeType && sortOption.direction === direction;
  };

  // 현재 선택된 확장 레벨에 따라 버튼 스타일 결정
  const getExpansionButtonClass = (level: number) => {
    const baseClass = "flex-1 px-[6px] py-[4px] text-xs font-medium rounded-md border";
    return currentExpansionLevel === level 
      ? `${baseClass} bg-[#56CAD6] text-[#fff]` 
      : `${baseClass} hover:bg-gray-50`;
  };

  // 레벨 선택 버튼 클릭 핸들러
  const handleLevelSelect = (level: number, e: React.MouseEvent) => {
    e.stopPropagation();
    expandToLevel(level);
  };

  return (
    <Popover open={isSortOpen} onOpenChange={setIsSortOpen}>
      <PopoverTrigger asChild>
        <CommonButton 
          variant="ghost" 
          size="sm" 
          className="text-xs font-normal gap-[2px] hover:bg-[transparent] text-[#888] !p-0"
        >
          정렬
          <Image 
            src={`/tree-menu/array.png`} 
            alt={`정렬`} 
            width={9} 
            height={10} 
          />
        </CommonButton>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-[180px] p-0 py-[10px] px-[12px] rounded-[3px] border border-[#333]" align="start">
        <div className="flex flex-col">
          {/* 정렬 기준 헤더와 필드 토글 */}
          <div className="">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#333]">정렬 기준</span>
              <div className="flex gap-1">
                <button
                  className={getExpansionButtonClass(2)}
                  onClick={(e) => handleLevelSelect(2, e)}
                  title="테넌트 레벨만 보기"
                >
                  T
                </button>
                <button
                  className={getExpansionButtonClass(3)}
                  onClick={(e) => handleLevelSelect(3, e)}
                  title="그룹 레벨 보기"
                >
                  G
                </button>
                <button
                  className={getExpansionButtonClass(4)}
                  onClick={(e) => handleLevelSelect(4, e)}
                  title="팀 레벨 보기"
                >
                  M
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className={`flex-1 px-[6px] py-[4px] text-sm rounded-md border ${
                  sortOption.type === "id" 
                    ? "bg-[#56CAD6] text-[#fff] " 
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => handleSortTypeSelect("id")}
              >
                ID
              </button>
              <button
                className={`flex-1 px-[6px] py-[4px] text-sm rounded-md border ${
                  sortOption.type === "name" 
                    ? "bg-[#56CAD6] text-[#fff] " 
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => handleSortTypeSelect("name")}
              >
                이름
              </button>
            </div>
          </div>

          {/* 구분선 */}
          <div className="border-t border-gray-200 my-2"></div>

          {/* 전체 정렬 옵션 */}
          <div className="flex items-center hover:bg-[#F4F6F9] rounded-md px-[6px] py-[4px]">
            <div className="flex-1 text-sm text-[#333]">전체 보기</div>
            <div className="flex gap-2">
              <button
                className={`p-1.5 rounded-md ${
                  isActiveSort('all', 'asc')
                    ? 'bg-[#56CAD6] text-[#fff]'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                onClick={(e) => handleNodeTypeSort('all', 'asc', e)}
                title={`${sortOption.type === 'name' ? '이름' : 'ID'} 오름차순`}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                className={`p-1.5 rounded-md ${
                  isActiveSort('all', 'desc')
                    ? 'bg-[#56CAD6] text-[#fff]'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                onClick={(e) => handleNodeTypeSort('all', 'desc', e)}
                title={`${sortOption.type === 'name' ? '이름' : 'ID'} 내림차순`}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          
          {/* 구분선 */}
          <div className="border-t border-gray-200 my-2"></div>

          {/* 테넌트 정렬 옵션 */}
          <div className="flex items-center hover:bg-[#F4F6F9] rounded-md px-[6px] py-[4px]">
            <div className="flex-1 text-sm text-[#333]">테넌트 보기</div>
            <div className="flex gap-2">
              <button
                className={`p-1.5 rounded-md ${
                  isActiveSort('tenant', 'asc')
                    ? 'bg-[#56CAD6] text-[#fff]'
                    : 'text-gray-400 hover:text-gray-600 hover:text-gray-600 hover:bg-gray-100'
                }`}
                onClick={(e) => handleNodeTypeSort('tenant', 'asc', e)}
                title={`${sortOption.type === 'name' ? '이름' : 'ID'} 오름차순`}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                className={`p-1.5 rounded-md ${
                  isActiveSort('tenant', 'desc')
                    ? 'bg-[#56CAD6] text-[#fff]'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                onClick={(e) => handleNodeTypeSort('tenant', 'desc', e)}
                title={`${sortOption.type === 'name' ? '이름' : 'ID'} 내림차순`}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 그룹 정렬 옵션 */}
          <div className="flex items-center hover:bg-[#F4F6F9] rounded-md px-[6px] py-[4px]">
            <div className="flex-1 text-sm text-[#333]">그룹 보기</div>
            <div className="flex gap-2">
              <button
                className={`p-1.5 rounded-md ${
                  isActiveSort('group', 'asc')
                    ? 'bg-[#56CAD6] text-[#fff]'
                    : 'text-gray-400 hover:text-gray-600  hover:bg-gray-100'
                }`}
                onClick={(e) => handleNodeTypeSort('group', 'asc', e)}
                title={`${sortOption.type === 'name' ? '이름' : 'ID'} 오름차순`}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                className={`p-1.5 rounded-md ${
                  isActiveSort('group', 'desc')
                    ? 'bg-[#56CAD6] text-[#fff]'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                onClick={(e) => handleNodeTypeSort('group', 'desc', e)}
                title={`${sortOption.type === 'name' ? '이름' : 'ID'} 내림차순`}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 팀 정렬 옵션 */}
          <div className="flex items-center hover:bg-[#F4F6F9] rounded-md px-[6px] py-[4px]">
            <div className="flex-1 text-sm text-[#333]">팀 보기</div>
            <div className="flex gap-2">
              <button
                className={`p-1.5 rounded-md ${
                  isActiveSort('team', 'asc')
                    ? 'bg-[#56CAD6] text-[#fff]'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                onClick={(e) => handleNodeTypeSort('team', 'asc', e)}
                title={`${sortOption.type === 'name' ? '이름' : 'ID'} 오름차순`}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                className={`p-1.5 rounded-md ${
                  isActiveSort('team', 'desc')
                    ? 'bg-[#56CAD6] text-[#fff]'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                onClick={(e) => handleNodeTypeSort('team', 'desc', e)}
                title={`${sortOption.type === 'name' ? '이름' : 'ID'} 내림차순`}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 상담사 정렬 옵션 */}
          <div className="flex items-center hover:bg-[#F4F6F9] rounded-md px-[6px] py-[4px]">
            <div className="flex-1 text-sm text-[#333]">상담사 보기</div>
            <div className="flex gap-2">
              <button
                className={`p-1.5 rounded-md ${
                  isActiveSort('counselor', 'asc')
                    ? 'bg-[#56CAD6] text-[#fff]'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                onClick={(e) => handleNodeTypeSort('counselor', 'asc', e)}
                title={`${sortOption.type === 'name' ? '이름' : 'ID'} 오름차순`}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                className={`p-1.5 rounded-md ${
                  isActiveSort('counselor', 'desc')
                    ? 'bg-[#56CAD6] text-[#fff]'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                onClick={(e) => handleNodeTypeSort('counselor', 'desc', e)}
                title={`${sortOption.type === 'name' ? '이름' : 'ID'} 내림차순`}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          </div>



        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ISortButtonForSideMenuCounselorTab;