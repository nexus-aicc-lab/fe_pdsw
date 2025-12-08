"use client";

import React, { useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import CommonCheckBox2 from "@/components/shared/CommonCheckBox2";

interface SkillWithCampaigns {
  skillId: number;
  campaigns: { campaignId: number; tenantId: number }[];
}

interface Props {
  filteredSkills: SkillWithCampaigns[];
  expandedSkills: number[];
  selectedLeftCampaigns: string[];
  isLoading: boolean;
  hasError: boolean;
  toggleSkill: (skillId: number) => void;
  toggleLeftCampaignSelection: (campaignId: string | number | any) => void;
  toggleAllCampaigns: (checked: boolean) => void;
  getCampaignName: (campaignId: number) => string;
  getSkillName: (skillId: number | string | any) => string;
  setExpandedSkills: (skills: number[]) => void;
  // 추가된 prop - 이미 등록된 캠페인 ID 목록
  existingCampaignIds?: string[];
}

const ITableForSkillListWithCampaign: React.FC<Props> = ({
  filteredSkills = [],
  expandedSkills = [],
  selectedLeftCampaigns = [],
  isLoading,
  hasError,
  toggleSkill,
  toggleLeftCampaignSelection,
  toggleAllCampaigns,
  getCampaignName,
  getSkillName,
  setExpandedSkills,
  // 기본값은 빈 배열
  existingCampaignIds = [],
}) => {
  
  // 이미 등록된 캠페인들을 제외한 필터링된 스킬 목록 생성
  // const filteredSkillsWithoutExisting = useMemo(() => {
  //   // 등록된 캠페인이 없으면 원래 목록 그대로 반환
  //   if (existingCampaignIds.length === 0) return filteredSkills;

  //   // 등록된 캠페인 ID 세트 생성 (조회 최적화)
  //   const existingSet = new Set(existingCampaignIds);

  //   // 각 스킬마다 등록되지 않은 캠페인만 포함하도록 필터링
  //   return filteredSkills.map(skill => {
  //     // 등록되지 않은 캠페인만 필터링
  //     const filteredCampaigns = skill.campaigns.filter(campaign => {
  //       const compositeId = `${skill.skillId}-${campaign.campaignId}`;
  //       return !existingSet.has(compositeId);
  //     });

  //     // 필터링된 캠페인이 있는 스킬만 포함
  //     return {
  //       ...skill,
  //       campaigns: filteredCampaigns
  //     };
  //   }).filter(skill => skill.campaigns.length > 0); // 캠페인이 없는 스킬은 제외
  // }, [filteredSkills, existingCampaignIds]);

  const normalizedExistingIds = useMemo(() => {
    // Set인 경우 배열로 변환
    const idsArray = existingCampaignIds instanceof Set 
      ? Array.from(existingCampaignIds) 
      : existingCampaignIds;
    
    // 모든 ID를 문자열로 변환
    return idsArray.map(id => String(id));
  }, [existingCampaignIds]);

  const filteredSkillsWithoutExisting = useMemo(() => {
    // 등록된 캠페인이 없으면 원래 목록 그대로 반환
    if (normalizedExistingIds.length === 0) return filteredSkills;

    // 각 스킬마다 등록되지 않은 캠페인만 포함하도록 필터링
    return filteredSkills.map(skill => {
      // 등록되지 않은 캠페인만 필터링
      const filteredCampaigns = skill.campaigns.filter(campaign => {
        // 캠페인 ID를 문자열로 변환
        const campaignIdStr = String(campaign.campaignId);

        // 1. 복합 ID 체크: "skillId-campaignId" 형식
        const compositeId = `${skill.skillId}-${campaignIdStr}`;

        // 2. 단순 캠페인 ID 체크: "campaignId" 형식
        // 이미지의 오른쪽 목록에 있는 ID 형식과 일치

        // 디버깅용 로그
        // if (normalizedExistingIds.includes(campaignIdStr)) {
        //   console.log(`Filtering out campaign ${campaignIdStr} from skill ${skill.skillId}`);
        // }

        // 두 형식 모두 체크하여 이미 존재하는 ID가 아닌 경우만 포함
        return !normalizedExistingIds.includes(compositeId) &&
          !normalizedExistingIds.includes(campaignIdStr);
      });

      // 필터링된 캠페인이 있는 스킬만 포함
      return {
        ...skill,
        campaigns: filteredCampaigns
      };
    }).filter(skill => skill.campaigns.length > 0); // 캠페인이 없는 스킬은 제외
  }, [filteredSkills, normalizedExistingIds]);

  // Calculate if all visible campaigns are selected
  const allCampaignsIds = useMemo(() => {
    return filteredSkillsWithoutExisting.flatMap(skill =>
      skill.campaigns.map(campaign => `${skill.skillId}-${campaign.campaignId}`)
    );
  }, [filteredSkillsWithoutExisting]);

  const allSelected = allCampaignsIds.length > 0 &&
    allCampaignsIds.every(id => selectedLeftCampaigns.includes(id));

  const hasPartialSelection = !allSelected &&
    allCampaignsIds.some(id => selectedLeftCampaigns.includes(id));

  // Toggle all campaigns for a specific skill
  const toggleSkillCampaigns = (skillId: number, checked: boolean) => {
    const skill = filteredSkillsWithoutExisting.find(s => s.skillId === skillId);
    if (!skill) return;

    const skillCampaignIds = skill.campaigns.map(campaign => `${skillId}-${campaign.campaignId}`);

    if (checked) {
      // 체크 시 자동으로 스킬을 펼치기
      if (!expandedSkills.includes(skillId)) {
        setExpandedSkills([...expandedSkills, skillId]);
      }

      // Add all campaigns that are not already selected
      const idsToAdd = skillCampaignIds.filter(id => !selectedLeftCampaigns.includes(id));
      if (idsToAdd.length > 0) {
        // Toggle each campaign selection individually
        idsToAdd.forEach(id => toggleLeftCampaignSelection(id));
      }
    } else {
      // 체크 해제 시 자동으로 스킬을 접기
      setExpandedSkills(expandedSkills.filter(id => id !== skillId));

      // Remove all campaigns for this skill that are currently selected
      const idsToRemove = skillCampaignIds.filter(id => selectedLeftCampaigns.includes(id));
      if (idsToRemove.length > 0) {
        // Toggle each campaign selection individually
        idsToRemove.forEach(id => toggleLeftCampaignSelection(id));
      }
    }
  };

  // 개별 캠페인 선택/해제 처리 함수
  const handleToggleCampaign = (compositeId: string) => {
    // 원래 토글 함수 호출
    toggleLeftCampaignSelection(compositeId);

    // 이 캠페인을 선택 해제하는 경우 (현재 선택된 상태)
    if (selectedLeftCampaigns.includes(compositeId)) {
      // 해당 스킬의 모든 캠페인이 선택 해제되었는지 확인
      const [skillIdStr] = compositeId.split('-');
      const skillId = parseInt(skillIdStr);
      const skill = filteredSkillsWithoutExisting.find(s => s.skillId === skillId);

      if (skill) {
        const skillCampaignIds = skill.campaigns.map(campaign => `${skillId}-${campaign.campaignId}`);
        // 현재 선택 해제하는 캠페인을 제외한 나머지 선택된 캠페인 수
        const remainingSelectedCount = skillCampaignIds.filter(
          id => id !== compositeId && selectedLeftCampaigns.includes(id)
        ).length;

        // 선택된 캠페인이 이제 없다면 스킬을 접기
        if (remainingSelectedCount === 0) {
          setExpandedSkills(expandedSkills.filter(id => id !== skillId));
        }
      }
    }
  };

  // 전체 선택/해제 처리 함수
  const handleToggleAllCampaigns = (checked: boolean) => {
    // 전체 선택 해제할 때는 모든 스킬 접기
    if (!checked) {
      setExpandedSkills([]);
    } else {
      // 전체 선택할 때는 모든 스킬 펼치기
      const allSkillIds = filteredSkillsWithoutExisting.map(skill => skill.skillId);
      setExpandedSkills(allSkillIds);
    }

    // 기존 전체 선택/해제 로직 호출
    toggleAllCampaigns(checked);
  };

  // Calculate selection state for each skill
  const getSkillSelectionState = (skillId: number) => {
    const skill = filteredSkillsWithoutExisting.find(s => s.skillId === skillId);
    if (!skill || skill.campaigns.length === 0) return { checked: false, indeterminate: false };

    const skillCampaignIds = skill.campaigns.map(campaign => `${skillId}-${campaign.campaignId}`);
    const selectedCount = skillCampaignIds.filter(id => selectedLeftCampaigns.includes(id)).length;

    return {
      checked: selectedCount === skillCampaignIds.length && skillCampaignIds.length > 0,
      indeterminate: selectedCount > 0 && selectedCount < skillCampaignIds.length
    };
  };

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="flex items-center justify-center h-full text-sm">로딩 중...</div>
      ) : hasError ? (
        <div className="flex items-center justify-center h-full text-red-500 text-sm">
          데이터 로드 중 오류 발생
        </div>
      ) : filteredSkillsWithoutExisting.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
          {filteredSkills.length > 0 && existingCampaignIds.length > 0
            ? "모든 캠페인이 이미 등록되었습니다."
            : "검색 결과가 없습니다."}
        </div>
      ) : (
        <div className="overflow-y-auto" style={{ height: '340px' }}>
          <table className="w-full border-collapse table-fixed text-xs">
            <thead>
              <tr className="bg-[#F8F8F8] border-b sticky top-0 z-10">
                <th className="w-12 px-2 text-center border-r align-bottom" style={{ height: '30px' }}>
                  <CommonCheckBox2
                    checked={allSelected}
                    indeterminate={hasPartialSelection}
                    onChange={() => handleToggleAllCampaigns(!allSelected)}
                    title="전체 선택"
                  />
                </th>
                <th className="text-left px-2 font-medium text-[#333] border-r" style={{ height: '30px' }}>스킬</th>
                <th className="text-left px-2 font-medium text-[#333] w-1/4 border-r" style={{ height: '30px' }}>캠페인 아이디</th>
                <th className="text-left px-2 font-medium text-[#333] w-1/2" style={{ height: '30px' }}>캠페인 이름</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkillsWithoutExisting.map((skill) => {
                const isExpanded = expandedSkills.includes(skill.skillId);
                const { checked, indeterminate } = getSkillSelectionState(skill.skillId);

                return (
                  <React.Fragment key={`skill-${skill.skillId}`}>
                    {/* 스킬 행 */}
                    <tr className={`border-b ${isExpanded ? "bg-[#edf7fd]" : "bg-[#f5faff]"}`}>
                      <td className="px-2 align-bottom text-center" style={{ height: '30px' }}>
                        {/* 스킬 레벨 체크박스 */}
                        <CommonCheckBox2
                          checked={checked}
                          indeterminate={indeterminate}
                          onChange={() => toggleSkillCampaigns(skill.skillId, !checked)}
                        />
                      </td>
                      <td className="px-2 align-middle cursor-pointer text-[#444]" onClick={() => toggleSkill(skill.skillId)} style={{ height: '30px' }}>
                        <div className="flex items-center">
                          {isExpanded ? (
                            <ChevronDown size={16} className="mr-2 flex-shrink-0 text-[#444]" />
                          ) : (
                            <ChevronRight size={16} className="mr-2 flex-shrink-0 text-[#444]" />
                          )}
                          <span className="font-medium">{getSkillName(skill.skillId)}</span>
                        </div>
                      </td>
                      <td className="px-2 align-middle text-[#444]" style={{ height: '30px' }}></td>
                      <td className="px-2 align-middle text-[#444]" style={{ height: '30px' }}></td>
                    </tr>

                    {/* 캠페인 목록 (확장 시 표시) */}
                    {isExpanded &&
                      (skill.campaigns ?? []).map((campaign) => {
                        const compositeId = `${skill.skillId}-${campaign.campaignId}`;
                        return (
                          <tr
                            key={`campaign-${compositeId}`}
                            className="border-b bg-white hover:bg-[#FFFAEE]"
                          >
                            <td className="px-2 align-middle text-center" style={{ height: '30px' }}>
                              <CommonCheckBox2
                                checked={selectedLeftCampaigns.includes(compositeId)}
                                onChange={() => handleToggleCampaign(compositeId)}
                              />
                            </td>
                            <td className="px-2 align-middle text-gray-600" style={{ height: '30px' }}>
                              <div className="flex items-center">
                                <div className="w-5 mr-2"></div> {/* 아이콘 공간만큼 여백 추가 */}
                                <span className="pl-2">{getSkillName(skill.skillId)}</span> {/* 왼쪽 여백 추가 */}
                              </div>
                            </td>
                            <td className="px-2 align-middle font-medium" style={{ height: '30px' }}>{campaign.campaignId}</td>
                            <td className="px-2 align-middle text-blue-700" style={{ height: '30px' }}>
                              {getCampaignName(campaign.campaignId)}
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ITableForSkillListWithCampaign;