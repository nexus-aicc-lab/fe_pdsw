"use client";

import React, { useState, useEffect } from "react";
import CommonButton from "@/components/shared/CommonButton";
import { useAuthStore } from "@/store/authStore";
import { CustomCheckbox } from "@/components/shared/CustomCheckbox";
import { useAssignableSkills } from "@/features/preferences/hooks/useAssignableSkills";
import { Popover } from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { useTreeMenuStore } from "@/store/storeForSsideMenuCampaignTab";

interface Skill {
    skill_id: number;
    skill_name: string;
}

interface SkilFilterOptionPannelForCampaignTabProps {
    shouldCloseOnConfirm?: boolean;
    onConfirm?: () => void;
    selectedSkills?: number[];
    onSelectedSkillsChange?: (skills: number[]) => void;
}

const SkilFilterOptionPannelForCampaignTab = ({
    shouldCloseOnConfirm = false,
    onConfirm,
    selectedSkills: externalSelectedSkills,
    onSelectedSkillsChange,
}: SkilFilterOptionPannelForCampaignTabProps) => {
    const { tenant_id } = useAuthStore();

    // 할당 가능한 스킬 목록 가져오기
    const { data: skills = [] as Skill[], isLoading, isError } = useAssignableSkills();

    // 로컬 상태로 체크 박스 선택 상태 관리
    const [internalSelectedSkills, setInternalSelectedSkills] = useState<number[]>([]);
    
    // 실제로 사용할 선택된 스킬 배열 (외부 또는 내부)
    const selectedSkills = externalSelectedSkills !== undefined ? externalSelectedSkills : internalSelectedSkills;
    const setSelectedSkills = (skills: number[]) => {
        if (onSelectedSkillsChange) {
            onSelectedSkillsChange(skills);
        } else {
            setInternalSelectedSkills(skills);
        }
    };

    // 통합 스토어에서 설정자 함수 가져오기
    const { 
        setSkilIdsForCampaignTreeMenu,
        setFilterMode 
    } = useTreeMenuStore(); // 통합 스토어 사용

    // 체크박스 변경 핸들러 (skill_id 기준)
    const handleSkillChange = (skill_id: number) => {
        setSelectedSkills(
            selectedSkills.includes(skill_id) 
                ? selectedSkills.filter((id) => id !== skill_id) 
                : [...selectedSkills, skill_id]
        );
    };

    // 확인 버튼 → 선택한 스킬 ID를 부모 컴포넌트로 전달
    const handleConfirm = () => {
        // 외부에서 선택 관리를 하지 않는 경우에만 스토어 업데이트
        if (!onSelectedSkillsChange) {
            setSkilIdsForCampaignTreeMenu(selectedSkills);
            setFilterMode(selectedSkills.length > 0 ? "skill" : "all");
        }
        
        // onConfirm 콜백이 있으면 호출
        if (onConfirm) {
            onConfirm();
        }
    };

    // 취소 버튼 핸들러
    const handleCancel = () => {
        // 외부에서 관리하지 않는 경우에만 초기화
        if (!onSelectedSkillsChange) {
            setInternalSelectedSkills([]);
        }
    };

    return (
        <div className="">
            {/* 로딩/에러 처리 */}
            {isLoading && <p className="text-gray-500 text-sm">로딩 중...</p>}
            {isError && <p className="text-red-500 text-sm">스킬 정보를 불러오는데 실패했습니다</p>}

            {/* 스킬 체크박스 컨테이너 */}
            <div className="">
                {/* 스킬 체크박스 목록 */}
                <ul className="space-y-1 max-h-60 overflow-y-auto ">
                    {skills.length > 0 ? (
                        skills.map(({ skill_id, skill_name }: { skill_id: number; skill_name: string }) => (
                            <li key={skill_id} className="px-[6px] py-[3px] flex items-center gap-2 border-gray-200 hover:bg-[#F4F6F9]">
                                <CustomCheckbox
                                    id={`skill-${skill_id}`}
                                    checked={selectedSkills.includes(skill_id)}
                                    onCheckedChange={() => handleSkillChange(skill_id)}
                                />
                                <label htmlFor={`skill-${skill_id}`} className="cursor-pointer text-sm text-[#333]">
                                    {skill_name}
                                </label>
                            </li>
                        ))
                    ) : (
                        !isLoading && <p className="text-gray-500 text-sm">불러올 스킬이 없습니다.</p>
                    )}
                </ul>

                {/* 확인/취소 버튼: 가운데 정렬 */}
                <div className="mt-2 flex justify-end gap-2">
                    {shouldCloseOnConfirm ? (
                        <PopoverClose asChild>
                            <CommonButton onClick={handleConfirm} size="sm">
                                확인
                            </CommonButton>
                        </PopoverClose>
                    ) : (
                        <CommonButton onClick={handleConfirm} size="sm">
                            확인
                        </CommonButton>
                    )}
                    <PopoverClose asChild>
                        <CommonButton onClick={handleCancel} variant="outline" size="sm" className="text-gray-500">
                            취소
                        </CommonButton>
                    </PopoverClose>
                </div>
            </div>
        </div>
    );
};

export default SkilFilterOptionPannelForCampaignTab;