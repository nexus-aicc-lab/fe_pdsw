"use client";

import React, { useState, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import CommonButton from "@/components/shared/CommonButton";
import { Check, CheckIcon } from "lucide-react";
import { useAssignableSkills } from "@/features/preferences/hooks/useAssignableSkills";
import Image from 'next/image'
import SkilFilterOptionPannelForCampaignTab from "../TabActions/SkilFilterOptionPannelForCampaignTab";
import { useTreeMenuStore } from "@/store/storeForSsideMenuCampaignTab";
import { useAuthStore } from "@/store";

const IFilterButtonForCampaignTabHeader = () => {
  const [showSkillFilter, setShowSkillFilter] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  // 로컬에서 선택된 스킬 ID를 관리하기 위한 상태 추가
  const [localSelectedSkills, setLocalSelectedSkills] = useState<number[]>([]);

  // 통합 스토어에서 선택된 스킬 ID 목록과 필터 모드를 가져오기
  const {
    skilIdsForCampaignTreeMenu,
    setSkilIdsForCampaignTreeMenu,
    filterMode,
    setFilterMode
  } = useTreeMenuStore(); // 변경됨
  
  const {tenant_id} = useAuthStore();
  
  // 할당 가능한 스킬 목록 가져오기
  const { data: skills = [] } = useAssignableSkills(tenant_id);

  // 현재 "전체 선택" 상태 확인 (로컬 상태 기준)
  const allSkillIds = skills.map(skill => skill.skill_id);
  const allSelected = allSkillIds.length > 0 && 
    allSkillIds.every(id => localSelectedSkills.includes(id));
  const someSelected = localSelectedSkills.length > 0 && !allSelected;
  
  // 팝오버가 열릴 때 스토어 값으로 로컬 상태 초기화
  useEffect(() => {
    if (isPopoverOpen) {
      setLocalSelectedSkills([...skilIdsForCampaignTreeMenu].map(id => Number(id)));
    }
  }, [isPopoverOpen, skilIdsForCampaignTreeMenu]);

  // 선택 스킬로 보기 클릭 처리
  const handleSelectSkillsClick = () => {
    setShowSkillFilter(true);
  };

  // 전체보기 클릭 처리
  const handleViewAllClick = () => {
    // 스토어의 선택된 스킬 ID 목록을 빈 배열로 설정 (체크박스 모두 해제 효과)
    setSkilIdsForCampaignTreeMenu([]);

    // 필터 모드를 'all'로 설정
    setFilterMode("all");

    // 팝오버 닫기
    setShowSkillFilter(false);
    setIsPopoverOpen(false);
  };

  // 확인 버튼 클릭 시 로컬 상태를 스토어에 반영하고 창 닫기
  const handleConfirmClick = () => {
    // 로컬 상태를 스토어에 반영
    setSkilIdsForCampaignTreeMenu(localSelectedSkills);
    
    // 선택된 스킬이 있으면 필터 모드를 'skill'로, 없으면 'all'로 설정
    setFilterMode(localSelectedSkills.length > 0 ? "skill" : "all");
    
    // 창 닫기
    setShowSkillFilter(false);
    setIsPopoverOpen(false);
  };

  // 전체 선택/해제 토글 기능 (로컬 상태만 변경)
  const toggleAllSkills = () => {
    if (allSelected) {
      // 전체 해제
      setLocalSelectedSkills([]);
    } else {
      // 전체 선택
      setLocalSelectedSkills([...allSkillIds]);
    }
  };

  // 자식 컴포넌트로 전달할 로컬 상태 관리 함수들
  const handleLocalSkillChange = (skillIds: number[]) => {
    setLocalSelectedSkills(skillIds);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <CommonButton 
          variant="ghost" 
          size="sm" 
          className="text-xs font-normal gap-[2px]  hover:bg-[transparent] text-[#888] !p-0"
        >
          필터
          <Image 
            src={`/tree-menu/filter.png`} 
            alt={`필터`} 
            width={9} 
            height={10} 
          />
        </CommonButton>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-[150px] p-0 py-[10px] px-[12px] rounded-[3px] border border-[#333]" align="start">
        {!showSkillFilter ? (
          // 기본 필터 옵션 메뉴
          <div className="flex flex-col">
            <div className="">
              <CommonButton
                variant="ghost"
                className="w-full justify-between rounded-[3px] px-[6px] py-[4px] text-sm text-[#333] hover:bg-[#F4F6F9]"
                onClick={handleViewAllClick}
              >
                <span>전체보기</span>
                {filterMode === "all" && (
                  <CheckIcon className="h-4 w-4 text-[#333]" />
                )}
              </CommonButton>
            </div>
            <div>
              <CommonButton
                variant="ghost"
                className="w-full justify-between rounded-[3px] px-[6px] py-[4px] text-sm text-[#333] hover:bg-[#F4F6F9]"
                onClick={handleSelectSkillsClick}
              >
                <span>선택 스킬로 보기</span>
                {filterMode === "skill" && (
                  <CheckIcon className="h-4 w-4 text-[#333]" />
                )}
              </CommonButton>
            </div>
          </div>
        ) : (
          // 스킬 필터 패널
          <div className="p-0 w-[150px]">
            <div className="flex items-center gap-3">
              <CommonButton
                variant="ghost"
                onClick={() => setShowSkillFilter(false)}
                className="text-sm text-[#333] !p-0"
              >
                &lt; 뒤로
              </CommonButton>
              <span className="text-sm text-[#333]">스킬 선택</span>
            </div>
            <div className="mt-[12px] mb-[1px] hover:bg-[#F4F6F9]">
              <CommonButton
                  variant="ghost"
                  onClick={toggleAllSkills}
                  className="text-sm text-[#333] flex items-center !px-[6px] !py-[3px]"
                  title={allSelected ? "전체 해제" : "전체 선택"}
                >
                  {allSelected ? (
                    <>
                      <div className="h-4 w-4 shrink-0 rounded-none border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:text-black border-[#000] data-[state=checked]:border-primary bg-[#fff] flex justify-center items-center">
                          <Check className="h-4 w-4" />
                      </div>
                      <span className="ml-1 text-sm">모두 해제</span>
                    </>
                  ) : someSelected ? (
                    <>
                      <div className="relative">
                        <div className="h-4 w-4 shrink-0 rounded-none border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:text-black border-[#b6b6b6] data-[state=checked]:border-primary bg-[#fff] flex justify-center items-center">
                          <div className="h-3 w-3 bg-[#333]"></div>
                        </div>
                      </div>
                      <span className="ml-1 text-sm">전체 선택</span>
                    </>
                  ) : (
                    <>
                        <div className="h-4 w-4 shrink-0 rounded-none border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:text-black border-[#b6b6b6] data-[state=checked]:border-primary bg-[#fff]">
                        </div>
                      <span className="ml-1 text-sm">전체 선택</span>
                    </>
                  )}
                </CommonButton>
            </div>
            <SkilFilterOptionPannelForCampaignTab
              shouldCloseOnConfirm={true}
              onConfirm={handleConfirmClick}
              selectedSkills={localSelectedSkills}
              onSelectedSkillsChange={handleLocalSkillChange}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default IFilterButtonForCampaignTabHeader;