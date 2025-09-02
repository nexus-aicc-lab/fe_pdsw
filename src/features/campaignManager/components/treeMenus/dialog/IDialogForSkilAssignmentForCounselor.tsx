"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomCheckbox } from "@/components/shared/CustomCheckbox";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { CounselorSkill } from "@/features/campaignManager/types/typeForCounselorSkill";
import { useApiForGetRelatedInfoForAssignSkilToCounselor } from "@/features/preferences/hooks/useApiForGetRelatedInfoForAssignSkilToCounselor";
import { useApiDeleteCounselorsFromSkills } from "@/features/campaignManager/hooks/useApiDeleteCounselorsFromSkills";
import { useApiBatchSkillAssignment } from "@/features/campaignManager/hooks/useApiBatchSkillAssignment";
import CustomAlert from "@/components/shared/layout/CustomAlert";
import { CommonButton } from "@/components/shared/CommonButton";
interface IDialogForSkilAssignmentForCounselorProps {
  isOpen: boolean;
  onClose: () => void;
  counselorId: string;
  counselorName: string;
  tenantId: string;
  isUnassignment?: boolean;
  dialogTitle?: string;
}

export function IDialogForSkilAssignmentForCounselor({
  isOpen,
  onClose,
  counselorId,
  counselorName,
  tenantId,
  isUnassignment = false,
  dialogTitle,
}: IDialogForSkilAssignmentForCounselorProps) {
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [initialSkills, setInitialSkills] = useState<number[]>([]);
  const [isUnassignMode, setIsUnassignMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    added: number[];
    removed: number[];
  }>({ added: [], removed: [] });

  // isUnassignment prop 변경 시 모드 업데이트
  useEffect(() => {
    setIsUnassignMode(isUnassignment);
  }, [isUnassignment]);

  const { assignedSkills, assignableSkills, isLoading, error } =
    useApiForGetRelatedInfoForAssignSkilToCounselor(
      counselorId,
      Number(tenantId)
    );

  // 스킬 추가/해제 처리 훅
  const addSkillsMutation = useApiBatchSkillAssignment(tenantId ?? "0");
  const deleteSkillsMutation = useApiDeleteCounselorsFromSkills(tenantId ?? "0");
  const isProcessing =
    addSkillsMutation.isPending || deleteSkillsMutation.isPending;

  // 다이얼로그가 열릴 때 할당된 스킬을 초기화하고 pending 변경사항을 초기화
  useEffect(() => {
    if ((assignedSkills?.result_data ?? []).length > 0) {
      const assignedSkillIds =
        assignedSkills?.result_data.flatMap((item) => item.skill_id) ?? [];
      setSelectedSkills(assignedSkillIds);
      setInitialSkills(assignedSkillIds);
      setPendingChanges({ added: [], removed: [] });
    } else {
      setSelectedSkills([]);
      setInitialSkills([]);
      setPendingChanges({ added: [], removed: [] });
    }
  }, [assignedSkills]);

  // 스킬 선택/해제 및 pending 변경사항 추적
  const handleSkillToggle = (skillId: number) => {
    setSelectedSkills((prev) => {
      const isCurrentlySelected = prev.includes(skillId);

      // 할당 모드일 때 최대 10개 체크
      if (!isCurrentlySelected && prev.length >= 10 && !isUnassignMode) {
        toast.error("최대 10개의 스킬만 할당할 수 있습니다.");
        return prev;
      }

      // pending 변경사항 업데이트
      setPendingChanges((current) => {
        if (isCurrentlySelected) {
          // 체크 해제: 원래 있던 항목은 removed에 추가
          return {
            added: current.added.filter((id) => id !== skillId),
            removed: initialSkills.includes(skillId)
              ? [...current.removed, skillId]
              : current.removed,
          };
        } else {
          // 체크: 원래 없던 항목은 added에 추가
          return {
            added: !initialSkills.includes(skillId)
              ? [...current.added, skillId]
              : current.added,
            removed: current.removed.filter((id) => id !== skillId),
          };
        }
      });

      return isCurrentlySelected
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId];
    });
  };

  const handleCancel = () => {
    onClose();
  };

  const handleConfirm = async () => {
    const { added, removed } = pendingChanges;

    if (added.length === 0 && removed.length === 0) {
      toast.info("변경된 사항이 없습니다.");
      onClose();
      return;
    }

    try {
      // 추가할 스킬이 있으면 배치 처리
      if (added.length > 0) {
        const addResult = await addSkillsMutation.mutateAsync({
          skillIds: added,
          counselorIds: [counselorId],
          tenantId,
          isUnassignment: false,
        });
        if (addResult.success) {
          // toast.success(`${added.length}개 스킬이 할당되었습니다.`);
        } else {
          toast.warning(
            `${addResult.successCount}개 스킬만 할당되었습니다. ${addResult.failedSkills.length}개 실패.`
          );
        }
      }

      // 제거할 스킬이 있으면 배치 처리
      if (removed.length > 0) {
        const removeResult = await deleteSkillsMutation.mutateAsync({
          skillIds: removed,
          counselorIds: [counselorId],
          tenantId,
        });
        if (removeResult.success) {
          // toast.success(`${removed.length}개 스킬이 해제되었습니다.`);
        } else {
          toast.warning(
            `${removeResult.successCount}개 스킬만 해제되었습니다. ${removeResult.failedSkills.length}개 실패.`
          );
        }
      }

      onClose();
    } catch (error) {
      // console.error("스킬 할당/해제 중 오류 발생:", error);
      toast.error("스킬 처리 중 오류가 발생했습니다.");
    }
  };

  const getConfirmButtonText = () => {
    const { added, removed } = pendingChanges;
    if (isUnassignMode) {
      return `스킬 해제 (${removed.length}개)`;
    } else if (added.length > 0 && removed.length > 0) {
      return `스킬 변경 (추가: ${added.length}, 해제: ${removed.length})`;
    } else if (added.length > 0) {
      return `스킬 할당 (${added.length}개)`;
    } else if (removed.length > 0) {
      return `스킬 해제 (${removed.length}개)`;
    }
    return isUnassignMode ? "스킬 해제" : "스킬 할당";
  };

  const renderContent = () => {
    if (error) {
      return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    if (isLoading) {
      return <div className="p-4">데이터를 불러오는 중...</div>;
    }

    return (
      <div className="">
        <div className="text-sm text-[#333] mb-4">
          {isUnassignMode
            ? "할당된 스킬을 해제할 수 있습니다."
            : "상담사에게 스킬을 할당할 수 있습니다."}
          <br />
          체크 후 확인 버튼을 누르시면 선택한 작업이 적용됩니다.
        </div>

        <div className="max-h-[300px] overflow-y-auto border rounded">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center bg-[#F8F8F8] border-r text-[#333]" style={{ height: '30px' }}>
                  선택
                </TableHead>
                {/* 0522 QA 요청으로 인한 아이디 -> 스킬 아이디, 이름 -> 스킬 이름 변경 및 w-16 -> w-20  */}
                <TableHead className="w-20 text-center bg-[#F8F8F8] border-r text-[#333]" style={{ height: '30px' }}>
                  스킬 아이디
                </TableHead>
                <TableHead className="text-center bg-[#F8F8F8] text-[#333]" style={{ height: '30px' }}>
                  스킬 이름
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignableSkills?.result_data.sort((a,b)=> a.skill_id - b.skill_id).map((skill: CounselorSkill) => {
                const isInitiallySelected = initialSkills.includes(skill.skill_id);
                const isCurrentlySelected = selectedSkills.includes(skill.skill_id);
                const hasChanged = isInitiallySelected !== isCurrentlySelected;
                return (
                  <TableRow
                    key={`${skill.tenant_id}-${skill.skill_id}`}
                    className={`custom-hover ${
                      hasChanged ? "bg-[#FFFAEE]" : ""
                    }`}
                  >
                    <TableCell className="text-center text-[#444]" style={{ height: '30px', padding: 0 }}>
                      <CustomCheckbox
                        checked={selectedSkills.includes(skill.skill_id)}
                        onCheckedChange={() => handleSkillToggle(skill.skill_id)}
                        disabled={isProcessing}
                      />
                    </TableCell>
                    <TableCell className="text-center text-[#444]" style={{ height: '30px', padding: 0 }}>
                      {skill.skill_id}
                    </TableCell>
                    <TableCell className="text-center text-[#444]" style={{ height: '30px', padding: 0 }}>
                      {skill.skill_name}
                      {hasChanged && (
                        <span className="ml-2 text-xs text-blue-500">
                          {isCurrentlySelected
                            ? "(추가 예정)"
                            : "(해제 예정)"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 flex justify-end gap-1.5">
          <CommonButton
            onClick={handleConfirm}
            disabled={
              isProcessing ||
              (pendingChanges.added.length === 0 &&
                pendingChanges.removed.length === 0)
            }
          >
            {isProcessing ? "처리 중..." : getConfirmButtonText()}
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
      onClose={onClose}
      title={
        dialogTitle ||
        `스킬 ${isUnassignMode ? "해제" : "할당"} - ${counselorName || ""}`
      }
      message={renderContent()}
      type="custom"
      showButtons={false} // 내부 커스텀 버튼 사용
    />
  );
}
