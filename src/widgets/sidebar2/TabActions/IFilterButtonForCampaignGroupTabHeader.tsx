"use client";

import React, { useState, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import CommonButton from "@/components/shared/CommonButton";
import { ArrowUp, ArrowDown } from "lucide-react";
import Image from 'next/image';
import { useSideMenuCampaignGroupTabStore } from "@/store/storeForSideMenuCampaignGroupTab";
import { SortField, SortDirection, NodeType } from "@/store/storeForSideMenuCampaignGroupTab";

const IFilterButtonForCampaignGroupTabHeader = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const {
    sortField,
    sortDirection,
    selectedNodeType,
    sortByNodeType,
    currentExpansionMode
  } = useSideMenuCampaignGroupTabStore();

  // 초기 로딩시 currentExpansionMode가 null일 경우를 처리
  useEffect(() => {
    if (currentExpansionMode === null) {
      // 초기 상태는 그룹 레벨까지 확장('group')으로 설정
      useSideMenuCampaignGroupTabStore.getState().expandTenantAndGroup();
    }
  }, [currentExpansionMode]);

  const toggleSortField = (field: SortField) => {
    if (sortField === field) return;
    sortByNodeType("tenant", field, sortDirection);
  };

  const handleNodeTypeSort = (nodeType: NodeType, direction: SortDirection) => {
    sortByNodeType(nodeType, sortField, direction);
    setIsPopoverOpen(false);
  };

  const isActiveSort = (nodeType: NodeType, direction: SortDirection) => {
    return selectedNodeType === nodeType && sortDirection === direction;
  };

  const getExpansionButtonClass = (mode: 'tenant' | 'group' | 'all') => {
    const baseClass = "h-6 min-w-6 px-1 text-xs border rounded";
    return currentExpansionMode === mode 
      ? `${baseClass} bg-[#56CAD6] text-[#fff] ` 
      : `${baseClass} hover:bg-gray-50`;
  };

  const renderExpansionButtons = () => {
    return (
      <div className="flex gap-1">
        <button
          className={getExpansionButtonClass('tenant')}
          onClick={() => useSideMenuCampaignGroupTabStore.getState().expandTenantOnly()}
          title="테넌트 레벨만 보기"
        >
          T
        </button>
        <button
          className={getExpansionButtonClass('group')}
          onClick={() => useSideMenuCampaignGroupTabStore.getState().expandTenantAndGroup()}
          title="테넌트 및 그룹 레벨 보기"
        >
          G
        </button>

      </div>
    );
  };

  return (
    <div className="flex items-center">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
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
            <div className="">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#333]">정렬 기준</span>
                {renderExpansionButtons()}
              </div>

              <div className="flex gap-2">
                <button
                  className={`flex-1 px-[6px] py-[4px] text-sm rounded-md border ${
                    sortField === "id" 
                      ? "bg-[#56CAD6] text-[#fff] " 
                      : "bg-white text-[#333] border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => toggleSortField("id")}
                >
                  ID
                </button>
                <button
                  className={`flex-1 px-[6px] py-[4px] text-sm rounded-md border ${
                    sortField === "name" 
                      ? "bg-[#56CAD6] text-[#fff] " 
                      : "bg-white text-[#333] border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => toggleSortField("name")}
                >
                  이름
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 my-2"></div>

            <div className="flex items-center hover:bg-[#F4F6F9] rounded-md px-[6px] py-[4px]">
              <div className="flex-1 text-sm text-[#333]">전체 보기</div>
              <div className="flex gap-2">
                <button
                  className={`p-1.5 rounded-md ${
                    isActiveSort('all', 'asc')
                      ? 'bg-[#56CAD6] text-[#fff]'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleNodeTypeSort('all', 'asc')}
                  title={`${sortField === 'name' ? '이름' : 'ID'} 오름차순`}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  className={`p-1.5 rounded-md ${
                    isActiveSort('all', 'desc')
                      ? 'bg-[#56CAD6] text-[#fff]'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleNodeTypeSort('all', 'desc')}
                  title={`${sortField === 'name' ? '이름' : 'ID'} 내림차순`}
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
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleNodeTypeSort('tenant', 'asc')}
                  title={`${sortField === 'name' ? '이름' : 'ID'} 오름차순`}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  className={`p-1.5 rounded-md ${
                    isActiveSort('tenant', 'desc')
                      ? 'bg-[#56CAD6] text-[#fff]'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleNodeTypeSort('tenant', 'desc')}
                  title={`${sortField === 'name' ? '이름' : 'ID'} 내림차순`}
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
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleNodeTypeSort('group', 'asc')}
                  title={`${sortField === 'name' ? '이름' : 'ID'} 오름차순`}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  className={`p-1.5 rounded-md ${
                    isActiveSort('group', 'desc')
                      ? 'bg-[#56CAD6] text-[#fff]'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleNodeTypeSort('group', 'desc')}
                  title={`${sortField === 'name' ? '이름' : 'ID'} 내림차순`}
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 캠페인 정렬 옵션 */}
            <div className="flex items-center hover:bg-[#F4F6F9] rounded-md px-[6px] py-[4px]">
              <div className="flex-1 text-sm text-[#333]">캠페인 보기</div>
              <div className="flex gap-2">
                <button
                  className={`p-1.5 rounded-md ${
                    isActiveSort('campaign', 'asc')
                      ? 'bg-[#56CAD6] text-[#fff]'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleNodeTypeSort('campaign', 'asc')}
                  title={`${sortField === 'name' ? '이름' : 'ID'} 오름차순`}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  className={`p-1.5 rounded-md ${
                    isActiveSort('campaign', 'desc')
                      ? 'bg-[#56CAD6] text-[#fff]'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleNodeTypeSort('campaign', 'desc')}
                  title={`${sortField === 'name' ? '이름' : 'ID'} 내림차순`}
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default IFilterButtonForCampaignGroupTabHeader;