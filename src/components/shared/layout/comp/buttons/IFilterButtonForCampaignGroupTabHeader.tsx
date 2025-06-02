
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

  // 스토어에서 정렬 상태 가져오기
  const {
    sortField,
    sortDirection,
    selectedNodeType,
    sortByNodeType,
  } = useSideMenuCampaignGroupTabStore();

  // 정렬 필드 토글 (id/name)
  const toggleSortField = (field: SortField) => {
    // 현재 필드가 선택된 필드와 같으면 아무것도 하지 않음
    if (sortField === field) return;

    // 다른 필드로 전환하면서 현재 방향 유지
    sortByNodeType("tenant", field, sortDirection);
    // 필드 변경 후 확장 상태 적용 - 현재 선택된 노드 타입 기준
    // expandNodesForSorting(selectedNodeType);
  };

  // 노드 타입별 정렬 처리
  // const handleNodeTypeSort = (nodeType: NodeType, direction: SortDirection) => {
  //   // 정렬 적용
  //   sortByNodeType(nodeType, sortField, direction);

  //   // 비동기로 확장 함수 호출하여 UI가 업데이트될 시간 제공
  //   setTimeout(() => {
  //     expandNodesForSorting(nodeType);
  //   }, 50);

  //   // 팝오버 닫기
  //   setIsPopoverOpen(false);
  // };

  // 노드 타입별 정렬 처리
  const handleNodeTypeSort = (nodeType: NodeType, direction: SortDirection) => {
    // 정렬 전 트리 데이터 캐시
    const currentTreeData = useSideMenuCampaignGroupTabStore.getState().treeData;

    // 정렬 적용
    sortByNodeType(nodeType, sortField, direction);

    // 100ms 후 확장 상태 재설정 (정렬이 완료된 후)
    setTimeout(() => {
      // 완전히 새로운 확장 집합 생성
      const newExpandedNodes = new Set<string>();

      // 업데이트된 트리 데이터 가져오기
      const { treeData } = useSideMenuCampaignGroupTabStore.getState();

      const applyExpansionByNodeType = (nodes: any[], parentPath: string[] = []) => {
        nodes.forEach(node => {
          // 부모 노드는 항상 확장
          parentPath.forEach(id => newExpandedNodes.add(id));

          // 노드 타입에 따른 확장 적용
          if (nodeType === 'tenant') {
            // 테넌트 노드만 확장
            if (node.type === 'tenant') {
              newExpandedNodes.add(node.id);
            }
          }
          else if (nodeType === 'group') {
            // 테넌트와 그룹 노드 확장
            if (node.type === 'tenant' || node.type === 'group') {
              newExpandedNodes.add(node.id);
            }
          }
          else if (nodeType === 'campaign' || nodeType === 'all') {
            // 모든 노드 타입 확장
            newExpandedNodes.add(node.id);
          }

          // 자식 노드 재귀 처리
          if (node.children?.length > 0) {
            applyExpansionByNodeType(node.children, [...parentPath, node.id]);
          }
        });
      };

      // 확장 규칙 적용
      applyExpansionByNodeType(treeData);

      // 확장 상태 설정
      useSideMenuCampaignGroupTabStore.setState({ expandedNodes: newExpandedNodes });

      console.log(`${nodeType} 정렬 후 확장된 노드 수: ${newExpandedNodes.size}`);
    }, 100);

    // 팝오버 닫기
    setIsPopoverOpen(false);
  };

  // 현재 선택된 정렬 상태에 따라 스타일 결정
  const isActiveSort = (nodeType: NodeType, direction: SortDirection) => {
    return selectedNodeType === nodeType && sortDirection === direction;
  };

  return (
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
      <PopoverContent className="w-auto min-w-[180px] p-0 py-[10px] px-[12px] rounded-[3px] border border-[#333] shadow-md" align="start">
        <div className="flex flex-col space-y-2">
          {/* 정렬 기준 헤더와 필드 토글 - 분리된 버튼으로 변경 */}
          <div className="mb-3">
            <span className="text-sm font-medium block mb-2">정렬 기준</span>
            <div className="flex gap-2">
              <button
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md border ${sortField === "id"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                onClick={() => toggleSortField("id")}
              >
                ID
              </button>
              <button
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md border ${sortField === "name"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                onClick={() => toggleSortField("name")}
              >
                이름
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200 my-1"></div>

          {/* 테넌트 정렬 옵션 */}
          <div className="flex items-center hover:bg-[#F4F6F9] rounded-md px-3 py-2">
            <div className="flex-1 text-sm">테넌트 보기</div>
            <div className="flex gap-2">
              <button
                className={`p-1.5 rounded-md ${isActiveSort('tenant', 'asc')
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                onClick={() => handleNodeTypeSort('tenant', 'asc')}
                title={`${sortField === 'name' ? '이름' : 'ID'} 오름차순`}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                className={`p-1.5 rounded-md ${isActiveSort('tenant', 'desc')
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                onClick={() => handleNodeTypeSort('tenant', 'desc')}
                title={`${sortField === 'name' ? '이름' : 'ID'} 내림차순`}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200 my-1"></div>

          {/* 그룹 정렬 옵션 */}
          <div className="flex items-center hover:bg-[#F4F6F9] rounded-md px-3 py-2">
            <div className="flex-1 text-sm">그룹 보기</div>
            <div className="flex gap-2">
              <button
                className={`p-1.5 rounded-md ${isActiveSort('group', 'asc')
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                onClick={() => handleNodeTypeSort('group', 'asc')}
                title={`${sortField === 'name' ? '이름' : 'ID'} 오름차순`}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                className={`p-1.5 rounded-md ${isActiveSort('group', 'desc')
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                onClick={() => handleNodeTypeSort('group', 'desc')}
                title={`${sortField === 'name' ? '이름' : 'ID'} 내림차순`}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200 my-1"></div>

          {/* 캠페인 정렬 옵션 */}
          <div className="flex items-center hover:bg-[#F4F6F9] rounded-md px-3 py-2">
            <div className="flex-1 text-sm">캠페인 보기</div>
            <div className="flex gap-2">
              <button
                className={`p-1.5 rounded-md ${isActiveSort('campaign', 'asc')
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                onClick={() => handleNodeTypeSort('campaign', 'asc')}
                title={`${sortField === 'name' ? '이름' : 'ID'} 오름차순`}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                className={`p-1.5 rounded-md ${isActiveSort('campaign', 'desc')
                  ? 'bg-green-100 text-green-700'
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
  );
};

export default IFilterButtonForCampaignGroupTabHeader;