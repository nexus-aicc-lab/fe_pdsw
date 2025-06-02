

"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CustomCheckbox } from "@/components/shared/CustomCheckbox";
import { useTabStore } from "@/store/tabStore";
import { useAuthStore } from "@/store/authStore";
import { CounselorSkill } from "../../types/typeForCounselorSkill";
import { useCounselorFilterStore } from "@/store/storeForSideMenuCounselorTab";
import { useApiForGetRelatedInfoForAssignSkilToCounselor } from "@/features/preferences/hooks/useApiForGetRelatedInfoForAssignSkilToCounselor";
import { useApiForDeleteCounselorsForSpecificSkill } from "@/features/campaignManager/hooks/useApiForDeleteCounselorsForSpecificSkill";
import { useApiForAddCounselorsForSpecificSkill } from "@/features/campaignManager/hooks/useApiForAddCounselorsForSpecificSkill";
import { X } from "lucide-react";
import { toast } from "react-toastify";

export function SkillAssignmentTab() {
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [initialSkills, setInitialSkills] = useState<number[]>([]);
  // const removeTab = useTabStore((state) => state.removeTab);
  // const activeTabKey = useTabStore((state) => state.activeTabKey);
  const userId = useAuthStore((state) => state.id);

  const { removeTab, activeTabKey, closeAllTabs, rows } = useTabStore();


  const selectedBlendKind = useCounselorFilterStore((state) => state.selectedBlendKind);
  const selectedCounselor = useCounselorFilterStore((state) => state.selectedCounselor);

  const { assignedSkills, assignableSkills, isLoading, error } = useApiForGetRelatedInfoForAssignSkilToCounselor(
    selectedCounselor.counselorId ?? "",
    Number(selectedCounselor.tenantId)
  );
  // alert(selectedCounselor.tenantId);

  const deleteCounselorMutation = useApiForDeleteCounselorsForSpecificSkill(
    selectedCounselor.tenantId ?? "0"
  );

  const addCounselorMutation = useApiForAddCounselorsForSpecificSkill(
    selectedCounselor.tenantId ?? "0"
  );

  useEffect(() => {
    if ((assignedSkills?.result_data ?? []).length > 0) {
      const assignedSkillIds = assignedSkills?.result_data.flatMap((item) => item.skill_id) ?? [];
      setSelectedSkills(assignedSkillIds);
      setInitialSkills(assignedSkillIds);
    }
  }, [assignedSkills]);

  const handleSkillToggle = (skillId: number) => {
    setSelectedSkills((prev) => {
      const isCurrentlySelected = prev.includes(skillId);

      if (isCurrentlySelected) {
        console.log("📌 체크 해제된 스킬 정보:", {
          skillId: skillId,
          counselorId: selectedCounselor.counselorId,
        });

        deleteCounselorMutation.mutate({
          skillId: skillId,
          counselorIds: [selectedCounselor.counselorId ?? ""]
        }, {
          onSuccess: () => {
            toast.success('스킬이 해제되었습니다.');
          }
        });
      } else {
        console.log("📌 체크된 스킬 정보:", {
          skillId: skillId,
          counselorId: selectedCounselor.counselorId,
        });

        if (prev.length >= 10) {
          toast.error('최대 10개의 스킬만 할당할 수 있습니다.');
          return prev;
        }

        addCounselorMutation.mutate({
          skillId: skillId,
          counselorIds: [selectedCounselor.counselorId ?? ""]
        }, {
          onSuccess: () => {
            toast.success('스킬이 할당되었습니다.');
          }
        });
      }

      return isCurrentlySelected
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId];
    });
  };

  // const handleCancel = () => {
  //   if (activeTabKey) {
  //     removeTab(600, activeTabKey);
  //     removeTab(601, activeTabKey);
  //     removeTab(602, activeTabKey);
  //   } else {
  //     alert('activeTabKey is not found');
  //   }
  // };

  const handleCancel = () => {
    if (activeTabKey) {
      const [firstRow] = rows;
      if (firstRow) {
        const [firstSection] = firstRow.sections;
        if (firstSection) {
          closeAllTabs(firstRow.id, firstSection.id);
          return;
        }
      }
      removeTab(500, activeTabKey);
    } else {
      alert('activeTabKey is not found');
    }
  };


  const handleConfirm = () => {
    const skillsToAdd = selectedSkills.filter(skillId => !initialSkills.includes(skillId));
    const skillsToRemove = initialSkills.filter(skillId => !selectedSkills.includes(skillId));

    // 추가할 스킬 처리
    if (skillsToAdd.length > 0) {
      skillsToAdd.forEach(skillId => {
        addCounselorMutation.mutate({
          skillId,
          counselorIds: [selectedCounselor.counselorId ?? ""]
        });
      });
    }

    // 제거할 스킬 처리
    if (skillsToRemove.length > 0) {
      skillsToRemove.forEach(skillId => {
        deleteCounselorMutation.mutate({
          skillId,
          counselorIds: [selectedCounselor.counselorId ?? ""]
        });
      });
    }

    if (activeTabKey) {
      removeTab(500, activeTabKey);
    }
  };

  if (error) {
    return (
      <div className="fixed top-[100px] left-[50px] z-50">
        <Card className="w-[480px] relative">
          <div className="p-6">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed top-[100px] left-[50px] z-50">
        <Card className="w-[480px]">
          <div className="p-6">Loading...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="">
      <Card className="w-[480px] relative bg-white shadow-lg">
        <div className="flex flex-col space-y-2 text-center sm:text-left bg-[#AAA] px-4 py-2 border-b rounded-tl-[.5rem] rounded-tr-[.5rem]">
          <h2 className="text-sm text-[#fff] font-normal">상담사 스킬 할당</h2>

        </div>

        <div className="px-[30px] py-[20px]">
          <div className="text-sm text-[#333] mb-4">
            상담사에게 스킬을 할당 할 수 있는 창입니다.<br />
            체크 후 확인 버튼을 누르시면 체크된 스킬들이 일괄 할당됩니다.<br />
            (상담사에게 최대 10개 스킬까지만 할당 가능 합니다.)
          </div>

          <div className="max-h-[300px] overflow-y-auto border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center bg-[#F8F8F8] border-r text-[#333]" style={{ height: '30px' }}>선택</TableHead>
                  <TableHead className="w-16 text-center bg-[#F8F8F8] border-r text-[#333]" style={{ height: '30px' }}>아이디</TableHead>
                  <TableHead className="text-center bg-[#F8F8F8] text-[#333]" style={{ height: '30px'}}>이름</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignableSkills?.result_data.map((skill: CounselorSkill) => (
                  <TableRow key={`${skill.tenant_id}-${skill.skill_id}`} className="custom-hover">
                    <TableCell className="text-center text-[#444]" style={{ height: '30px' , padding:0}}>
                      <CustomCheckbox
                        checked={selectedSkills.includes(skill.skill_id)}
                        onCheckedChange={() => handleSkillToggle(skill.skill_id)}
                      />
                    </TableCell>
                    <TableCell className="text-center text-[#444]" style={{ height: '30px' , padding:0 }}>{skill.skill_id}</TableCell>
                    <TableCell className="text-center text-[#444]" style={{ height: '30px' , padding:0 }}>{skill.skill_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* <div className="p-4 border-t border-gray-200 flex justify-center gap-2">
          <Button
            onClick={handleConfirm}
            className="px-8 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            확인
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-8 py-2 border border-gray-300 rounded"
          >
            취소
          </Button>
        </div> */}
      </Card>
    </div>
  );
}