
"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTabStore } from "@/store/tabStore";
import { CounselorSkill } from "../../types/typeForCounselorSkill";
import { useCounselorFilterStore } from "@/store/storeForSideMenuCounselorTab";
import { useApiForDeleteCounselorsForSpecificSkill } from "@/features/campaignManager/hooks/useApiForDeleteCounselorsForSpecificSkill";
import { useApiForAddCounselorsForSpecificSkill } from "@/features/campaignManager/hooks/useApiForAddCounselorsForSpecificSkill";
import { useApiForGetRelatedInfoForAssignSkilToCounselor } from "@/features/preferences/hooks/useApiForGetRelatedInfoForAssignSkilToCounselor";
import { X, ChevronDown, ChevronUp, Users } from "lucide-react";
import { toast } from "react-toastify";
import { useAssignableSkills } from "@/features/preferences/hooks/useAssignableSkills";
import { CustomCheckbox } from "@/components/shared/CustomCheckbox";
import Image from "next/image";

export function TeamSkillAssignmentTab() {
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [initialSkills, setInitialSkills] = useState<number[]>([]);
  const [showCounselors, setShowCounselors] = useState(false);
  const [showRawData, setShowRawData] = useState(false);  // 디버깅용 raw 데이터 표시 상태
  const removeTab = useTabStore((state) => state.removeTab);
  const activeTabKey = useTabStore((state) => state.activeTabKey);
  const { candidateMembersForSkilAssign } = useCounselorFilterStore();

  // 컴포넌트 마운트 시 상담사 정보 디버깅
  // useEffect(() => {
  //   console.group("🔍 [TeamSkillAssignmentTab] 컴포넌트 마운트");
  //   console.log("📋 candidateMembersForSkilAssign 데이터:", candidateMembersForSkilAssign);
  //   if (Array.isArray(candidateMembersForSkilAssign) && candidateMembersForSkilAssign.length > 0) {
  //     console.log("👤 첫 번째 상담사:", candidateMembersForSkilAssign[0]);
  //     console.log("👥 총 상담사 수:", candidateMembersForSkilAssign.length);
  //     // 상담사 ID 목록 추출
  //     const counselorIds = candidateMembersForSkilAssign
  //       .filter(c => c && c.counselorId)
  //       .map(c => c.counselorId);
  //     console.log("🆔 유효한 상담사 ID 목록:", counselorIds);
  //   } else {
  //     console.warn("⚠️ 상담사 데이터가 없거나 형식이 올바르지 않습니다.");
  //   }
  //   console.groupEnd();
  // }, [candidateMembersForSkilAssign]);

  // 상담사 배열이 유효한지 확인
  const isValidCounselorsArray = Array.isArray(candidateMembersForSkilAssign) && candidateMembersForSkilAssign.length > 0;

  // 첫 번째 상담사의 테넌트 ID를 사용
  const firstCounselor = isValidCounselorsArray ? candidateMembersForSkilAssign[0] : null;
  const tenantId = firstCounselor?.tenantId ? Number(firstCounselor.tenantId) : undefined;
  const counselorId = firstCounselor?.counselorId || "";

  // useAssignableSkills 훅 사용
  const { data: assignableSkills, isLoading, error } = useAssignableSkills(tenantId);

  // 기존 로직에서 assignedSkills를 가져오기 위한 API 호출
  const { assignedSkills } = useApiForGetRelatedInfoForAssignSkilToCounselor(
    counselorId,
    Number(tenantId)
  );

  const deleteCounselorMutation = useApiForDeleteCounselorsForSpecificSkill(String(tenantId) ?? "0");
  const addCounselorMutation = useApiForAddCounselorsForSpecificSkill(String(tenantId) ?? "0");

  // 할당된 스킬 설정
  useEffect(() => {
    if (assignedSkills?.result_data && assignedSkills.result_data.length > 0) {
      const assignedSkillIds = assignedSkills.result_data.map(item => item.skill_id);
      setSelectedSkills(assignedSkillIds);
      setInitialSkills(assignedSkillIds);
      // console.log("✅ 할당된 스킬 ID:", assignedSkillIds);
    } else {
      // console.log("ℹ️ 할당된 스킬 없음");
    }
  }, [assignedSkills]);

  // 할당 가능한 스킬 로그
  useEffect(() => {
    if (assignableSkills) {
      // console.log("✅ 할당 가능한 스킬 데이터:", assignableSkills);
    }
  }, [assignableSkills]);

  // 유효한 상담사 ID 배열 생성 함수
// 유효한 상담사 ID 배열 생성 함수
const getValidCounselorIds = () => {
  if (!isValidCounselorsArray) {
    // console.warn("⚠️ 유효한 상담사 배열이 없습니다.");
    return [];
  }

  // 유효한 ID만 필터링 - 여기가 문제!
  const validIds = candidateMembersForSkilAssign
    .filter(counselor => {
      // 더 자세한 디버깅
      
      // 여러 경로로 ID 접근 시도
      const id = 
        (counselor.data && counselor.data.counselorId) || // data 안에 있는 경우
        counselor.counselorId ||                          // 직접 접근하는 경우
        (typeof counselor === 'object' ? JSON.stringify(counselor) : counselor); // 객체 구조 자체 확인
      
      
      return id && id !== '-';
    })
    .map(counselor => {
      // ID 추출 로직
      return (counselor.data && counselor.data.counselorId) || counselor.counselorId;
    });
  
  // console.log("✅ 추출된 상담사 ID 목록:", validIds, "개수:", validIds.length);
  
  // 빈 배열이라면 다시 검증
  // if (validIds.length === 0) {
  //   console.error("❌ 상담사 데이터는 있지만 유효한 ID를 추출하지 못했습니다.");
  //   console.log("전체 객체 구조:", JSON.stringify(candidateMembersForSkilAssign));
  // }
  
  return validIds;
};

  // 스킬 선택/해제 핸들러
  const handleSkillToggle = (skillId: number) => {
    const counselorIds = getValidCounselorIds();

    if (counselorIds.length === 0) {
      toast.error('유효한 상담사가 없습니다.');
      return;
    }

    setSelectedSkills((prev) => {
      const isCurrentlySelected = prev.includes(skillId);

      if (isCurrentlySelected) {
        
        deleteCounselorMutation.mutate({
          skillId: skillId,
          counselorIds: counselorIds
        }, {
          onSuccess: () => {
            toast.success('스킬이 해제되었습니다.');
          },
          onError: (error) => {
            // console.error('스킬 해제 오류:', error);
            toast.error('스킬 해제 중 오류가 발생했습니다.');
          }
        });
      } else {
        
        addCounselorMutation.mutate({
          skillId: skillId,
          counselorIds: counselorIds
        }, {
          onSuccess: () => {
            toast.success('스킬이 할당되었습니다.');
          },
          onError: (error) => {
            // console.error('스킬 할당 오류:', error);
            toast.error('스킬 할당 중 오류가 발생했습니다.');
          }
        });
      }

      return isCurrentlySelected
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId];
    });
  };

  // 취소 버튼 핸들러
  const handleCancel = () => {
    if (activeTabKey) {
      removeTab(601, activeTabKey);
    }
  };

  // 확인 버튼 핸들러
  const handleConfirm = () => {
    const counselorIds = getValidCounselorIds();

    if (counselorIds.length === 0) {
      toast.error('유효한 상담사가 없습니다.');
      return;
    }

    const skillsToAdd = selectedSkills.filter(skillId => !initialSkills.includes(skillId));
    const skillsToRemove = initialSkills.filter(skillId => !selectedSkills.includes(skillId));

    // 변경사항이 있는지 확인
    const hasChanges = skillsToAdd.length > 0 || skillsToRemove.length > 0;

    if (!hasChanges) {
      toast.info('변경된 내용이 없습니다.');
      if (activeTabKey) {
        removeTab(601, activeTabKey);
      }
      return;
    }

    // 변경 작업 시작
    let completedTasks = 0;
    const totalTasks = skillsToAdd.length + skillsToRemove.length;

    // 스킬 변경 작업이 모두 완료되었는지 확인하는 함수
    const checkCompletion = () => {
      completedTasks++;
      if (completedTasks === totalTasks) {
        toast.success('모든 스킬 할당 작업이 완료되었습니다.');
        if (activeTabKey) {
          removeTab(601, activeTabKey);
        }
      }
    };

    // 추가할 스킬 처리
    if (skillsToAdd.length > 0) {
      skillsToAdd.forEach(skillId => {
        addCounselorMutation.mutate({
          skillId,
          counselorIds
        }, {
          onSuccess: () => {
            // console.log(`✅ 스킬(ID: ${skillId}) 할당 성공`);
            checkCompletion();
          },
          onError: (error) => {
            // console.error(`❌ 스킬(ID: ${skillId}) 할당 실패:`, error);
            checkCompletion();
          }
        });
      });
    }

    // 제거할 스킬 처리
    if (skillsToRemove.length > 0) {
      skillsToRemove.forEach(skillId => {
        deleteCounselorMutation.mutate({
          skillId,
          counselorIds
        }, {
          onSuccess: () => {
            // console.log(`✅ 스킬(ID: ${skillId}) 해제 성공`);
            checkCompletion();
          },
          onError: (error) => {
            // console.error(`❌ 스킬(ID: ${skillId}) 해제 실패:`, error);
            checkCompletion();
          }
        });
      });
    }
  };

  // 상담사 목록 토글
  const toggleCounselors = () => {
    setShowCounselors(!showCounselors);
  };

  // raw 데이터 토글 (디버깅용)
  const toggleRawData = () => {
    setShowRawData(!showRawData);
  };

  // 로딩 상태 UI
  if (isLoading) {
    return (
      <div className="">
        <Card className="w-[480px]">
          <div className="p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <div>데이터를 불러오는 중입니다...</div>
          </div>
        </Card>
      </div>
    );
  }

  // 오류 상태 UI
  if (error) {
    return (
      <div className="fixed top-[100px] left-[50px] z-50">
        <Card className="w-[480px] relative">
          <div className="p-6">
            <div className="text-red-500 mb-3">Error: {String(error)}</div>
            <Button
              onClick={handleCancel}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
            >
              닫기
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 상담사가 없는 경우 UI
  if (!isValidCounselorsArray) {
    return (
      <div className="">
        <Card className="w-[520px] relative bg-white shadow-lg">
          <div className="flex flex-col space-y-2 text-center sm:text-left bg-[#AAA] px-4 py-2 border-b rounded-tl-[.5rem] rounded-tr-[.5rem]">
            <h2 className="text-sm text-[#fff] font-normal">팀 스킬 할당</h2>
            {/* <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button> */}
          </div>
          <div className="px-[30px] py-[20px]">
             <div className="flex items-center">
                <Image src="/tree-menu/team_icon_for_tree.png" alt="팀" width={14} height={12} className="mr-2" />
                <span className="text-sm text-[#333]">상담사 정보를 찾을 수 없습니다</span>
            </div>
            <p className="text-[#333] mb-4 text-sm">
              선택된 그룹의 상담사 정보를 불러올 수 없습니다.<br />
              다시 시도하거나 관리자에게 문의하세요.
            </p>
            {/* <Button onClick={handleCancel} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
              닫기
            </Button> */}
          </div>
        </Card>
      </div>
    );
  }

  return (
    
    <div className="">
      <Card className="w-[520px] relative bg-white shadow-lg">
        <div className="flex flex-col space-y-2 text-center sm:text-left bg-[#AAA] px-4 py-2 border-b rounded-tl-[.5rem] rounded-tr-[.5rem]">
          <h2 className="text-sm text-[#fff] font-normal">팀 스킬 할당</h2>
          {/* <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button> */}
        </div>

        <div className="px-[30px] py-[20px]">
          <div className="text-sm text-gray-600 mb-4">
            팀의 모든 상담사({candidateMembersForSkilAssign.length}명)에게 스킬을 일괄 할당할 수 있습니다.<br />
            할당할 스킬을 선택하고 확인 버튼을 누르면 팀의 모든 상담사에게 선택된 스킬이 할당됩니다.
          </div>

          {/* 디버깅 버튼 */}
          {/* <div className="mb-2">
            <button
              onClick={toggleRawData}
              className="text-xs text-blue-500 underline"
            >
              {showRawData ? '원본 데이터 숨기기' : '원본 데이터 보기 (디버깅용)'}
            </button>
          </div> */}

          {/* 디버깅용 Raw 데이터 표시 */}
          {/* {showRawData && (
            <div className="mb-4 overflow-auto max-h-[150px] text-xs border rounded p-2 bg-gray-50 whitespace-pre">
              {JSON.stringify(candidateMembersForSkilAssign, null, 2)}
            </div>
          )} */}

          {/* 상담사 목록 표시 */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center p-2 border rounded cursor-pointer bg-gray-50 hover:bg-gray-100"
              onClick={toggleCounselors}
            >
               <div className="flex items-center">
                  <Image src="/tree-menu/team_icon_for_tree.png" alt="팀" width={14} height={12} className="mr-2" />
                  <span className="text-sm text-[#333]">상담사 정보를 찾을 수 없습니다</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm text-[#333]">{candidateMembersForSkilAssign.length}명</span>
                {showCounselors ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </div>

            {showCounselors && (
              <div className="mt-2 max-h-[150px] overflow-y-auto border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center bg-[#F8F8F8] border-r text-[#333]" style={{ height: '30px' }}>상담사 아이디</TableHead>
                      <TableHead className="w-16 text-center bg-[#F8F8F8] border-r text-[#333]" style={{ height: '30px' }}>상담사 이름</TableHead>
                      <TableHead className="w-16 text-center bg-[#F8F8F8] text-[#333]" style={{ height: '30px' }}>테넌트 아이디</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidateMembersForSkilAssign.map((counselor, index) => {
                      // 필드에 올바르게 접근
                      const id = counselor.data?.counselorId || counselor.counselorId || '-';
                      const name = counselor.data?.counselorname || counselor.counselorname || '-';
                      const tenantId = counselor.data?.tenantId || counselor.tenantId || '-';

                      // console.log(`상담사 ${index} 데이터:`, counselor);
                      // console.log(`추출한 값:`, { id, name, tenantId });

                      return (
                        <TableRow key={`counselor-${index}`} className="custom-hover">
                          <TableCell className="py-1 text-sm text-center text-[#444]">{id}</TableCell>
                          <TableCell className="py-1 text-sm text-center text-[#444]">{name}</TableCell>
                          <TableCell className="py-1 text-sm text-center text-[#444]">{tenantId}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* 테넌트 ID 정보 */}
          <div className="p-2 bg-gray-50 border rounded text-sm text-[#333] mb-4">
            <span>테넌트 아이디 : {tenantId || 'N/A'}</span>
            <span>대표 상담사 아이디 : {counselorId || 'N/A'}</span>
          </div>

          {/* 스킬 목록 테이블 */}
          <div className="max-h-[250px] overflow-y-auto border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center bg-[#F8F8F8] border-r text-[#333]" style={{ height: '30px' }}>선택</TableHead>
                  <TableHead className="w-16 text-center bg-[#F8F8F8] border-r text-[#333]" style={{ height: '30px' }}>스킬 아이디</TableHead>
                  <TableHead className="w-16 text-center bg-[#F8F8F8] text-[#333]" style={{ height: '30px' }}>스킬 이름</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignableSkills && assignableSkills.length > 0 ? (
                  assignableSkills.map((skill) => (
                    <TableRow key={`skill-${skill.skill_id}`} className="custom-hover">
                      <TableCell className="text-center text-[#444]" style={{ height: '30px' , padding:0}}>
                        <CustomCheckbox
                          checked={selectedSkills.includes(skill.skill_id)}
                          onCheckedChange={() => handleSkillToggle(skill.skill_id)}
                        />
                      </TableCell>
                      <TableCell className="text-center text-[#444]" style={{ height: '30px' , padding:0}}>{skill.skill_id}</TableCell>
                      <TableCell className="text-center text-[#444]" style={{ height: '30px' , padding:0}}>{skill.skill_name}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      할당 가능한 스킬이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
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