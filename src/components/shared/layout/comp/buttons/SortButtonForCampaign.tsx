"use client";

import React, { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CommonButton from "@/components/shared/CommonButton";
import { ArrowUp, ArrowDown } from "lucide-react";
import Image from 'next/image';
import { NodeType, SortDirection, SortType, useTreeMenuStore, ViewMode } from '@/store/storeForSsideMenuCampaignTab';

// Extend Window interface to include custom functions
declare global {
  interface Window {
    expandAllNodes?: () => void;
    expandTenantsOnly?: () => void;
  }
}

export function SortButtonForCampaign() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { 
    campaignSort, 
    selectedNodeType, 
    sortByNodeType,
    setViewMode,
    viewMode,
    setSelectedNodeType,
  } = useTreeMenuStore();

  // 초기 설정 - 캠페인 모드로 설정하고 루트 노드만 확장
  useEffect(() => {
    if (viewMode === null) {
      useTreeMenuStore.getState().setViewMode('campaign');
      useTreeMenuStore.getState().setSelectedNodeType('campaign');

      setTimeout(() => {
        if (window.expandAllNodes) {
          window.expandAllNodes();
        }
      }, 100);
    }
  }, [viewMode]);

  const toggleSortField = (field: SortType) => {
    if (campaignSort.type === field) return;
    sortByNodeType(selectedNodeType, field, campaignSort.direction);
  };

  const handleNodeTypeSort = (nodeType: NodeType, direction: SortDirection) => {
    // console.log("정렬 버튼 클릭:", { nodeType, direction });
    
    sortByNodeType(nodeType, campaignSort.type, direction);
    setSelectedNodeType(nodeType);
    
    setTimeout(() => {
      if (nodeType === 'tenant') {
        if (window.expandTenantsOnly) {
          window.expandTenantsOnly();
        }
      } else {
        if (window.expandAllNodes) {
          window.expandAllNodes();
        }
      }
      
      window.dispatchEvent(new Event('resize'));
    }, 100);

    setIsPopoverOpen(false);
  };

  const isActiveSort = (nodeType: NodeType, direction: SortDirection) => {
    return selectedNodeType === nodeType && campaignSort.direction === direction;
  };

  const getViewButtonClass = (mode: ViewMode) => {
    const baseClass = "h-6 min-w-6 px-1 text-xs border rounded";
    return viewMode === mode 
      ? `${baseClass} bg-[#56CAD6] text-[#fff] ` 
      : `${baseClass} hover:bg-gray-50`;
  };

  const handleViewModeChange = (mode: ViewMode) => {
    // console.log("뷰 모드 변경:", mode);
    
    // 이미 같은 모드인지 확인
    if (viewMode === mode) {
      // 같은 모드라도 확장 상태를 초기화
      setTimeout(() => {
        if (mode === 'tenant') {
          if (window.expandTenantsOnly) {
            window.expandTenantsOnly();
          }
        } else {
          if (window.expandAllNodes) {
            window.expandAllNodes();
          }
        }
        
        // 리사이즈 이벤트 발생시켜 UI 업데이트 유도
        window.dispatchEvent(new Event('resize'));
      }, 50);
      return;
    }
    
    // 다른 모드로 변경
    setViewMode(mode);

    setTimeout(() => {
      if (mode === 'tenant') {
        if (window.expandTenantsOnly) {
          window.expandTenantsOnly();
        }
      } else {
        if (window.expandAllNodes) {
          window.expandAllNodes();
        }
      }
      
      // 리사이즈 이벤트 발생시켜 UI 업데이트 유도
      window.dispatchEvent(new Event('resize'));
    }, 50);
  };

  const renderViewButtons = () => {
    return (
      <div className="flex gap-1">
        <button
          className={getViewButtonClass('tenant')}
          onClick={() => handleViewModeChange('tenant')}
          title="테넌트 보기"
        >
          T
        </button>
        <button
          className={getViewButtonClass('campaign')}
          onClick={() => handleViewModeChange('campaign')}
          title="캠페인 보기"
        >
          C
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
                {renderViewButtons()}
              </div>

              <div className="flex gap-2">
                <button
                  className={`flex-1 px-[6px] py-[4px] text-sm rounded-md border ${
                    campaignSort.type === "id" 
                      ? "bg-[#56CAD6] text-[#fff] " 
                      : "bg-white text-[#333] border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => toggleSortField("id")}
                >
                  ID
                </button>
                <button
                  className={`flex-1 px-[6px] py-[4px] text-sm rounded-md border ${
                    campaignSort.type === "name" 
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
              <div className="flex-1 text-sm text-[#333]">테넌트 보기</div>
              <div className="flex gap-2">
                <button
                  className={`p-1.5 rounded-md ${
                    isActiveSort('tenant', 'asc')
                      ? 'bg-[#56CAD6] text-[#fff]'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleNodeTypeSort('tenant', 'asc')}
                  title={`${campaignSort.type === 'name' ? '이름' : 'ID'} 오름차순`}
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
                  title={`${campaignSort.type === 'name' ? '이름' : 'ID'} 내림차순`}
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
            </div>

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
                  title={`${campaignSort.type === 'name' ? '이름' : 'ID'} 오름차순`}
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
                  title={`${campaignSort.type === 'name' ? '이름' : 'ID'} 내림차순`}
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
}