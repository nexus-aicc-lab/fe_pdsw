"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomCheckbox } from "@/components/shared/CustomCheckbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-toastify";
import CustomAlert from "@/components/shared/layout/CustomAlert";
import { useApiForGetRelatedInfoForAssignSkilToCounselor } from "@/features/preferences/hooks/useApiForGetRelatedInfoForAssignSkilToCounselor";
import { useAssignableSkills } from "@/features/preferences/hooks/useAssignableSkills";
import Image from "next/image";
import { useApiDeleteCounselorsFromSkills } from "@/features/campaignManager/hooks/useApiDeleteCounselorsFromSkills";
import { useApiBatchSkillAssignment } from "@/features/campaignManager/hooks/useApiBatchSkillAssignment";
import { CommonButton } from "@/components/shared/CommonButton";
interface IDialogForTeamSkilAssignmentProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  teamMembers: any[];
  tenantId: string;
  isUnassignment?: boolean;
  dialogTitle?: string;
}

export function IDialogForTeamSkilAssignment({
  isOpen,
  onClose,
  teamId,
  teamName,
  teamMembers,
  tenantId,
  isUnassignment = false,
  dialogTitle
}: IDialogForTeamSkilAssignmentProps) {
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [assignedSkillsInfo, setAssignedSkillsInfo] = useState<number[]>([]);
  const [showCounselors, setShowCounselors] = useState(false);
  const [isUnassignMode, setIsUnassignMode] = useState(false);

  // isUnassignment prop이 변경될 때 isUnassignMode 상태 업데이트
  useEffect(() => {
    setIsUnassignMode(isUnassignment);
    // 모드가 변경되면 선택된 스킬 초기화
    setSelectedSkills([]);
  }, [isUnassignment]);

  // 첫 번째 상담사을 대표로 사용하여 스킬 정보 조회
  const firstCounselor = teamMembers.length > 0 ? teamMembers[0] : null;
  const representativeCounselorId = firstCounselor?.counselorId || firstCounselor?.data?.counselorId || "";

  // 할당 가능한 스킬 목록 조회
  const { data: assignableSkills, isLoading: isSkillsLoading, error: skillsError } = useAssignableSkills(Number(tenantId));

  // 기존 할당된 스킬 정보 조회
  const { assignedSkills, isLoading: isAssignedSkillsLoading, error: assignedSkillsError } = useApiForGetRelatedInfoForAssignSkilToCounselor(
    representativeCounselorId,
    Number(tenantId)
  );

  // 배치 처리를 위한 커스텀 훅 사용
  const addSkillsMutation = useApiBatchSkillAssignment(tenantId ?? "0");
  const deleteSkillsMutation = useApiDeleteCounselorsFromSkills(tenantId ?? "0");

  // 로딩 상태 통합
  const isProcessing = addSkillsMutation.isPending || deleteSkillsMutation.isPending;

  // 할당된 스킬 정보 저장 (표시용)
  useEffect(() => {
    if ((assignedSkills?.result_data ?? []).length > 0) {
      const assignedSkillIds = assignedSkills?.result_data.flatMap((item) => item.skill_id) ?? [];
      // 정보 표시용으로만 사용하므로 저장
      setAssignedSkillsInfo(assignedSkillIds);
      // 초기 선택값은 빈 배열로 설정 (모두 해제 상태)
      setSelectedSkills([]);
    } else {
      setAssignedSkillsInfo([]);
      setSelectedSkills([]);
    }
  }, [assignedSkills]);

  // 유효한 상담사 ID 배열 생성 함수
  const getValidCounselorIds = () => {
    if (!teamMembers || teamMembers.length === 0) {
      console.warn("⚠️ 유효한 상담사 배열이 없습니다.");
      return [];
    }

    // 유효한 ID만 필터링
    const validIds = teamMembers
      .filter(counselor => {
        // 데이터 구조에 따라 ID 추출
        const id = (counselor.data && counselor.data.counselorId) || counselor.counselorId;
        return id && id !== '-';
      })
      .map(counselor => {
        // ID 추출
        return (counselor.data && counselor.data.counselorId) || counselor.counselorId;
      });

    return validIds;
  };

  // 스킬 선택/해제 핸들러
  const handleSkillToggle = (skillId: number) => {
    setSelectedSkills((prev) => {
      const isCurrentlySelected = prev.includes(skillId);
      
      // 최대 스킬 할당 개수 체크 (할당 모드일 때만)
      if (!isCurrentlySelected && prev.length >= 10 && !isUnassignMode) {
        toast.error("최대 10개의 스킬만 할당할 수 있습니다.");
        return prev;
      }

      // 선택 상태 토글
      return isCurrentlySelected 
        ? prev.filter(id => id !== skillId) 
        : [...prev, skillId];
    });
  };

  // 상담사 목록 토글
  const toggleCounselors = () => {
    setShowCounselors(!showCounselors);
  };

  // 취소 버튼 핸들러
  const handleCancel = () => {
    onClose();
  };

  // 할당 모드: 선택된 스킬을 추가 (이미 할당된 스킬도 포함)
  const getSkillsToAdd = () => {
    if (isUnassignMode) return [];
    return selectedSkills;
  };

  // 해제 모드: 선택된 스킬만 해제
  const getSkillsToRemove = () => {
    if (!isUnassignMode) return [];
    return selectedSkills;
  };

  // 확인 버튼 핸들러
  const handleConfirm = async () => {
    const counselorIds = getValidCounselorIds();
    const skillsToAdd = getSkillsToAdd();
    const skillsToRemove = getSkillsToRemove();
    
    if (counselorIds.length === 0) {
      toast.error('유효한 상담사가 없습니다.');
      return;
    }
    
    if (skillsToAdd.length === 0 && skillsToRemove.length === 0) {
      toast.info("변경할 사항이 없습니다.");
      onClose();
      return;
    }

    try {
      // 추가할 스킬이 있으면 배치 처리
      if (skillsToAdd.length > 0) {
        const addResult = await addSkillsMutation.mutateAsync({
          skillIds: skillsToAdd,
          counselorIds: counselorIds,
          tenantId,
          isUnassignment: false
        });
        
        if (addResult.success) {
          toast.success(`${skillsToAdd.length}개 스킬이 모든 상담사에게 할당되었습니다.`);
        } else {
          toast.warning(`${addResult.successCount}개 스킬만 할당되었습니다. ${addResult.failedSkills.length}개 실패.`);
        }
      }
      
      // 제거할 스킬이 있으면 배치 처리
      if (skillsToRemove.length > 0) {
        const removeResult = await deleteSkillsMutation.mutateAsync({
          skillIds: skillsToRemove,
          counselorIds: counselorIds,
          tenantId
        });
        
        if (removeResult.success) {
          toast.success(`${skillsToRemove.length}개 스킬이 모든 상담사에게서 해제되었습니다.`);
        } else {
          toast.warning(`${removeResult.successCount}개 스킬만 해제되었습니다. ${removeResult.failedSkills.length}개 실패.`);
        }
      }
      
      onClose();
    } catch (error) {
      console.error("스킬 할당/해제 중 오류 발생:", error);
      toast.error("스킬 처리 중 오류가 발생했습니다.");
    }
  };

  // 확인 버튼 텍스트 계산
  const getConfirmButtonText = () => {
    const skillsToAdd = getSkillsToAdd();
    const skillsToRemove = getSkillsToRemove();
    
    if (isUnassignMode && skillsToRemove.length > 0) {
      return `스킬 해제 (${skillsToRemove.length}개)`;
    } else if (!isUnassignMode && skillsToAdd.length > 0) {
      return `스킬 할당 (${skillsToAdd.length}개)`;
    }
    
    return isUnassignMode ? "스킬 해제" : "스킬 할당";
  };

  // 버튼 비활성화 여부 계산
  const isButtonDisabled = () => {
    if (isProcessing) return true;
    
    const skillsToAdd = getSkillsToAdd();
    const skillsToRemove = getSkillsToRemove();
    
    return skillsToAdd.length === 0 && skillsToRemove.length === 0;
  };

  const isLoading = isSkillsLoading || isAssignedSkillsLoading;
  const error = skillsError || assignedSkillsError;

  const renderContent = () => {
    if (error) {
      return <div className="text-red-500 p-4">Error: {String(error)}</div>;
    }

    if (isLoading) {
      return (
        <div className="p-6 flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <div>데이터를 불러오는 중입니다...</div>
        </div>
      );
    }

    if (!teamMembers || teamMembers.length === 0) {
      return (
        <div className="px-6 py-4">
          <div className="flex items-center">
            <Image src="/tree-menu/team_icon_for_tree.png" alt="팀" width={14} height={12} className="mr-2" />
            <span className="text-sm text-[#333]">상담사 정보를 찾을 수 없습니다</span>
          </div>
          <p className="text-[#333] mb-4 text-sm">
            선택된 팀의 상담사 정보를 불러올 수 없습니다.<br />
            다시 시도하거나 관리자에게 문의하세요.
          </p>
        </div>
      );
    }

    const skillsToAdd = getSkillsToAdd();
    const skillsToRemove = getSkillsToRemove();

    return (
      <div className="">
        <div className="text-sm text-[#333] mb-4">
          {isUnassignMode 
            ? `팀의 모든 상담사(${teamMembers.length}명)에게서 스킬을 일괄 해제합니다. 해제할 스킬을 선택하세요.` 
            : `팀의 모든 상담사(${teamMembers.length}명)에게 스킬을 일괄 할당합니다. 할당할 스킬을 선택하세요.`}
        </div>
        <div className="gary-border-box ">
          <span>테넌트 아이디 : {tenantId || 'N/A'}</span>
        </div>
        <div className="gap-6">
          <div className="">
            <div className="mb-2 font-medium text-sm">팀 정보</div>
            <div
              className="flex justify-between items-center gary-border-box cursor-pointer"
              onClick={toggleCounselors}
            >
              <div className="flex items-center">
                <Image src="/tree-menu/team_icon_for_tree.png" alt="팀" width={14} height={12} className="mr-2" />
                <span className="text-sm text-[#333]">{teamName}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-[#333] mr-2">{teamMembers.length}명</span>
                {showCounselors ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </div>
            {showCounselors && (
              <div className="border rounded mb-2" style={{ maxHeight: '300px', overflow: 'auto' }}>
                <Table>
                  <TableHeader className="sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="w-16 text-center bg-[#F8F8F8] border-r text-[#333]" style={{ height: '30px' }}>상담사 아이디</TableHead>
                      <TableHead className="w-16 text-center bg-[#F8F8F8] border-r text-[#333]" style={{ height: '30px' }}>상담사 이름</TableHead>
                      <TableHead className="w-16 text-center bg-[#F8F8F8] text-[#333]" style={{ height: '30px' }}>테넌트 아이디</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((counselor, index) => {
                      const id = counselor.data?.counselorId || counselor.counselorId || '-';
                      const name = counselor.data?.counselorname || counselor.counselorname || '-';
                      const currentTenantId = counselor.data?.tenantId || counselor.tenantId || '-';
                      return (
                        <TableRow key={`counselor-${index}`} className="custom-hover">
                          <TableCell className="py-1 text-sm text-center text-[#444]">{id}</TableCell>
                          <TableCell className="py-1 text-sm text-center text-[#444]">{name}</TableCell>
                          <TableCell className="py-1 text-sm text-center text-[#444]">{currentTenantId}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <div className="">
            <div className="mb-2 font-medium text-sm">
              {isUnassignMode ? "해제할 스킬 선택" : "할당할 스킬 선택"}
              <span className="ml-2 text-sm">
                {isUnassignMode 
                  ? `(${skillsToRemove.length}개 선택됨)` 
                  : `(${skillsToAdd.length}개 선택됨)`}
              </span>
            </div>
            <div className="border rounded" style={{ maxHeight: '350px', overflow: 'auto' }}>
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-16 text-center bg-[#F8F8F8] border-r text-[#333]" style={{ height: '30px' }}>선택</TableHead>
                    <TableHead className="w-16 text-center bg-[#F8F8F8] border-r text-[#333]" style={{ height: '30px' }}>스킬 아이디</TableHead>
                    <TableHead className="w-16 text-center bg-[#F8F8F8] text-[#333]" style={{ height: '30px' }}>스킬 이름</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignableSkills && assignableSkills.length > 0 ? (
                    assignableSkills.sort((a,b)=> a.skill_id - b.skill_id).map((skill) => {
                      const isAlreadyAssigned = assignedSkillsInfo.includes(skill.skill_id);
                      const isCurrentlySelected = selectedSkills.includes(skill.skill_id);
                      if (isUnassignMode && !isAlreadyAssigned) {
                        return null;
                      }
                      const willBeAdded = !isUnassignMode && isCurrentlySelected;
                      const willBeRemoved = isUnassignMode && isCurrentlySelected;
                      return (
                        <TableRow 
                          key={`skill-${skill.skill_id}`} 
                          className={`custom-hover ${willBeAdded || willBeRemoved ?  "bg-[#FFFAEE]" : ""}`}
                        >
                          <TableCell className="text-center text-[#444]" style={{ height: '30px', padding: 0 }}>
                            <CustomCheckbox
                              checked={isCurrentlySelected}
                              onCheckedChange={() => handleSkillToggle(skill.skill_id)}
                              disabled={isProcessing}
                            />
                          </TableCell>
                          <TableCell className="text-center text-[#444]" style={{ height: '30px', padding: 0 }}>
                            {skill.skill_id}
                          </TableCell>
                          <TableCell className="text-center text-[#444]" style={{ height: '30px', padding: 0 }}>
                            {skill.skill_name}
                            {isAlreadyAssigned && !isCurrentlySelected && !isUnassignMode && (
                              <span className="ml-2 text-xs text-green-500">(현재 할당됨)</span>
                            )}
                            {isAlreadyAssigned && isCurrentlySelected && !isUnassignMode && (
                              <span className="ml-2 text-xs text-blue-500">(재할당 예정)</span>
                            )}
                            {!isAlreadyAssigned && willBeAdded && (
                              <span className="ml-2 text-xs text-blue-500">(추가 예정)</span>
                            )}
                            {willBeRemoved && (
                              <span className="ml-2 text-xs text-red-500">(해제 예정)</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    }).filter(Boolean)
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        {isUnassignMode ? "해제할 스킬이 없습니다." : "할당 가능한 스킬이 없습니다."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-1.5">
          <CommonButton
            onClick={handleConfirm}
            disabled={isProcessing || isButtonDisabled()}
          >
            {isProcessing ? "처리 중..." : (
              isUnassignMode 
                ? `스킬 해제 (${getSkillsToRemove().length}개)` 
                : `스킬 할당 (${getSkillsToAdd().length}개)`
            )}
          </CommonButton>
          <CommonButton
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            취소
          </CommonButton>
        </div>
      </div>
    );
  };

  return (
    <CustomAlert
      isOpen={isOpen}
      title={dialogTitle || `팀 스킬 ${isUnassignMode ? "해제" : "할당"} - ${teamName || ''}`}
      message={renderContent()}
      type="1"
      onClose={onClose}
      onCancel={onClose}
      width="min-w-[800px]"
      showButtons={false}
    />
  );
}
