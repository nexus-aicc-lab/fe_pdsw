"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { Checkbox } from "@/components/ui/checkbox";
import { useAssignableSkills } from "@/features/preferences/hooks/useAssignableSkills";
import { useTreeMenuStore } from "@/store/storeForSsideMenuCampaignTab";

interface Skill {
  skill_id: number;
  skill_name: string;
}

interface SkilFilterOptionPannelProps {
  closePanel?: () => void;
  onConfirm?: () => void;
  selectedSkills?: number[];
  onSelectedSkillsChange?: (skills: number[]) => void;
  shouldCloseOnConfirm?: boolean;
}

const SkilFilterOptionPannelForCampaignTab = ({
  closePanel,
  onConfirm,
  selectedSkills: externalSelectedSkills,
  onSelectedSkillsChange,
  shouldCloseOnConfirm = false
}: SkilFilterOptionPannelProps) => {
  const { tenant_id } = useAuthStore();
  
  // 통합 스토어에서 스킬 ID 목록 가져오기
  const { 
    skilIdsForCampaignTreeMenu, 
    setSkilIdsForCampaignTreeMenu, 
    setFilterMode 
  } = useTreeMenuStore();
  
  // 할당 가능한 스킬 목록 가져오기
  const { data: skills = [] as Skill[], isLoading, isError } = useAssignableSkills();
  
  // 로컬 상태로 체크 박스 선택 상태 관리
  const [localSelectedSkills, setLocalSelectedSkills] = useState<number[]>([]);

  // 외부에서 선택된 스킬이 있으면 우선 사용, 없으면 스토어 값 사용
  useEffect(() => {
    if (externalSelectedSkills) {
      setLocalSelectedSkills(externalSelectedSkills);
    } else {
      // 스토어의 문자열 배열을 숫자 배열로 변환
      const numericSkillIds = skilIdsForCampaignTreeMenu.map(id => Number(id));
      setLocalSelectedSkills(numericSkillIds);
    }
  }, [externalSelectedSkills, skilIdsForCampaignTreeMenu]);

  // 체크박스 변경 핸들러
  const handleSkillChange = (skill_id: number) => {
    const updatedSkills = localSelectedSkills.includes(skill_id)
      ? localSelectedSkills.filter((id) => id !== skill_id)
      : [...localSelectedSkills, skill_id];
    
    setLocalSelectedSkills(updatedSkills);
    
    // 외부 상태 업데이트 콜백이 있으면 호출
    if (onSelectedSkillsChange) {
      onSelectedSkillsChange(updatedSkills);
    }
  };

  // 확인 버튼 → 선택한 스킬 ID를 스토어에 저장하고 패널 닫기
  const handleConfirm = () => {
    // 외부에서 관리되는 경우 외부 콜백만 실행
    if (onConfirm) {
      onConfirm();
    } 
    // 외부에서 관리되지 않는 경우 스토어 직접 업데이트
    else {
      // 선택된 스킬 ID 배열을 스토어에 저장
      setSkilIdsForCampaignTreeMenu(localSelectedSkills);
      // 선택된 스킬이 있으면 필터 모드를 'skill'로, 없으면 'all'로 설정
      setFilterMode(localSelectedSkills.length > 0 ? 'skill' : 'all');
      
      if (shouldCloseOnConfirm && closePanel) {
        closePanel();
      }
    }
    
    // 항상 패널 닫기 (외부 콜백이 처리하지 않는 경우)
    if (!onConfirm && closePanel) {
      closePanel();
    }
  };

  // 취소 버튼 → 로컬 상태 초기화하고 패널 닫기
  const handleCancel = () => {
    if (externalSelectedSkills) {
      setLocalSelectedSkills(externalSelectedSkills);
    } else {
      // 스토어의 문자열 배열을 숫자 배열로 변환
      const numericSkillIds = skilIdsForCampaignTreeMenu.map(id => Number(id));
      setLocalSelectedSkills(numericSkillIds);
    }
    
    if (closePanel) {
      closePanel();
    }
  };

  return (
    <div>
      {/* 로딩/에러 처리 */}
      {isLoading && <p className="text-gray-500 text-center py-4">로딩 중...</p>}
      {isError && <p className="text-red-500 text-center py-4">스킬 데이터를 불러오는 중 오류가 발생했습니다.</p>}

      {!isLoading && !isError && (
        <>
          {/* 테이블 형태로 렌더링 */}
          <div className="border rounded">
            {/* 테이블 헤더 */}
            <div className="grid grid-cols-3 bg-gray-100 p-2 text-sm font-medium">
              <div className="text-center">선택</div>
              <div className="text-center">아이디</div>
              <div className="text-center">이름</div>
            </div>
            
            {/* 테이블 바디 */}
            <div className="max-h-[300px] overflow-y-auto">
              {skills.length > 0 ? (
                skills.map(({ skill_id, skill_name }) => (
                  <div key={skill_id} className="grid grid-cols-3 p-2 border-t hover:bg-gray-50">
                    <div className="flex justify-center items-center">
                      <Checkbox
                        id={`skill-${skill_id}`}
                        checked={localSelectedSkills.includes(skill_id)}
                        onCheckedChange={() => handleSkillChange(skill_id)}
                      />
                    </div>
                    <div className="text-center">{skill_id}</div>
                    <div className="text-center">{skill_name}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">불러올 스킬이 없습니다.</div>
              )}
            </div>
          </div>

          {/* 확인/취소 버튼 */}
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={handleCancel} variant="secondary">
              취소
            </Button>
            <Button onClick={handleConfirm}>
              확인
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default SkilFilterOptionPannelForCampaignTab;