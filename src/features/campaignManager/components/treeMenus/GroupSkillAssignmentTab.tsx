// "use client";

// import { useCounselorFilterStore } from "@/store/storeForSideMenuCounselorTab";

// export function GroupSkillAssignmentTab() {
//   const { candidateMembersForSkilAssign } = useCounselorFilterStore();

//   return (
//     <div className="p-4">
//       <h2 className="text-lg font-semibold mb-4">그룹 스킬 할당</h2>
//       <div className="space-y-4">
//         <h3 className="text-md font-medium">소속 상담사 목록</h3>
//         <div className="space-y-2">
//           {candidateMembersForSkilAssign.map((counselor: any) => (
//             <div 
//               key={counselor.counselorId}
//               className="p-2 border rounded-lg hover:bg-gray-50"
//             >
//               <p className="text-sm">{counselor.counselorname}</p>
//               <p className="text-xs text-gray-500">ID: {counselor.counselorId}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { JSX, useEffect, useState } from "react";
import { useCounselorFilterStore } from "@/store/storeForSideMenuCounselorTab";
import { useQuery } from "@tanstack/react-query";
import { getAssignableSkillsForCounselor } from "@/features/campaignManager/api/apiForCounselorSkil";
import { useApiForDeleteCounselorsForSpecificSkill } from "@/features/campaignManager/hooks/useApiForDeleteCounselorsForSpecificSkill";
import { useApiForAddCounselorsForSpecificSkill } from "@/features/campaignManager/hooks/useApiForAddCounselorsForSpecificSkill";
import { CustomCheckbox } from "@/components/shared/CustomCheckbox";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Users, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "react-toastify";
import Image from "next/image";
interface Counselor {
  counselorId: string;
  counselorname: string;
  tenantId?: string | number;
  // data 필드가 있을 수도 있음
  data?: {
    counselorId: string;
    counselorname: string;
    tenantId?: string | number;
  };
}

interface Skill {
  skill_id: number;
  skill_name: string;
}

/**
 * 상담사에게 할당 가능한 스킬 목록을 가져오는 커스텀 훅
 */
const useAssignableSkills = (tenantId?: number) => {
  return useQuery({
    queryKey: ["assignableSkills", tenantId],
    queryFn: async () => {
      
      if (!tenantId) {
        // console.warn("⚠️ 테넌트 ID가 없습니다.");
        return [];
      }

      try {
        const response = await getAssignableSkillsForCounselor(tenantId);

        if (response.result_code === 0 && response.result_msg === "Success") {
          // console.log("✅ 불러온 스킬 목록:", response.result_data);

          return response.result_data.map((skill) => ({
            skill_id: skill.skill_id,
            skill_name: skill.skill_name,
          }));
        } else {
          throw new Error(`API 오류: ${response.result_msg}`);
        }
      } catch (error) {
        // console.error("❌ 스킬 목록 조회 실패:", error);
        throw error;
      }
    },
    enabled: !!tenantId,
  });
};

export function GroupSkillAssignmentTab(): JSX.Element {
  const { candidateMembersForSkilAssign } = useCounselorFilterStore();
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [showCounselors, setShowCounselors] = useState(false);
  const [showRawData, setShowRawData] = useState(false);  // 디버깅용

  // 상담사 데이터 검증 및 테넌트 ID 추출
  const isValidCounselorsArray = Array.isArray(candidateMembersForSkilAssign) && candidateMembersForSkilAssign.length > 0;
  const firstCounselor = isValidCounselorsArray ? candidateMembersForSkilAssign[0] : null;
  
  // 테넌트 ID 추출 (data 안에 있을 수도 있고, 직접 있을 수도 있음)
  const tenantId = firstCounselor?.tenantId 
    ? Number(firstCounselor.tenantId) 
    : firstCounselor?.data?.tenantId 
      ? Number(firstCounselor.data.tenantId) 
      : undefined;

  // 할당 가능한 스킬 목록 가져오기
  const { data: assignableSkills, isLoading, error } = useAssignableSkills(tenantId);

  // API 뮤테이션 훅 사용
  const deleteCounselorMutation = useApiForDeleteCounselorsForSpecificSkill(String(tenantId) ?? "0");
  const addCounselorMutation = useApiForAddCounselorsForSpecificSkill(String(tenantId) ?? "0");

  // 컴포넌트 마운트 시 디버깅 로그
  // useEffect(() => {
  //   console.group("🔍 [GroupSkillAssignmentTab] 컴포넌트 마운트");
  //   console.log("📋 candidateMembersForSkilAssign 데이터:", candidateMembersForSkilAssign);
  //   if (isValidCounselorsArray) {
  //     console.log("👤 첫 번째 상담사:", candidateMembersForSkilAssign[0]);
  //     console.log("👥 총 상담사 수:", candidateMembersForSkilAssign.length);
  //     const counselorIds = getValidCounselorIds();
  //     console.log("🆔 유효한 상담사 ID 목록:", counselorIds);
  //   } else {
  //     console.warn("⚠️ 상담사 데이터가 없거나 형식이 올바르지 않습니다.");
  //   }
  //   console.groupEnd();
  // }, [candidateMembersForSkilAssign]);

  // 유효한 상담사 ID 배열 생성 함수
  const getValidCounselorIds = (): string[] => {
    if (!isValidCounselorsArray) {
      // console.warn("⚠️ 유효한 상담사 배열이 없습니다.");
      return [];
    }

    const validIds = candidateMembersForSkilAssign
      .filter(counselor => {
        // 여러 경로로 ID 접근 시도
        const id = 
          (counselor.data && counselor.data.counselorId) || // data 안에 있는 경우
          counselor.counselorId;                           // 직접 접근하는 경우
        
        return id && id !== '-';
      })
      .map(counselor => {
        // ID 추출 로직
        return (counselor.data && counselor.data.counselorId) || counselor.counselorId;
      });
    
    // console.log("✅ 추출된 상담사 ID 목록:", validIds, "개수:", validIds.length);
    
    return validIds;
  };

  // 스킬 선택/해제 핸들러
  const toggleSkillSelection = (skillId: number): void => {
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
    // 아직 탭 스토어 연결되지 않음 - 필요시 추가
    // console.log("취소 버튼 클릭");
  };

  // 확인 버튼 핸들러
  const handleConfirm = () => {
    // console.log("확인 버튼 클릭 - 선택된 스킬:", selectedSkills);
    toast.success('스킬 할당이 완료되었습니다.');
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
        <Card className="w-full relative">
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
      <div className="">
        <Card className="w-full relative">
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
        <Card className="w-full relative bg-white shadow-lg">
          <div className="flex flex-col space-y-2 text-center sm:text-left bg-[#AAA] px-4 py-2 border-b rounded-tl-[.5rem] rounded-tr-[.5rem]">
            <h2 className="text-sm text-[#fff] font-normal">그룹 스킬 할당</h2>
            {/* <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button> */}
          </div>
          <div className="px-[30px] py-[20px]">
            <div className="flex items-center">
                <Image className="mr-2" src="/tree-menu/group_icon_for_tree.png" alt="그룹" width={15} height={12} />
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
      <Card className="w-full relative bg-white shadow-lg">
        <div className="flex flex-col space-y-2 text-center sm:text-left bg-[#AAA] px-4 py-2 border-b rounded-tl-[.5rem] rounded-tr-[.5rem]">
          <h2 className="text-sm text-[#fff] font-normal">그룹 스킬 할당</h2>
          {/* <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button> */}
        </div>

        <div className="px-[30px] py-[20px]">
          <div className="text-sm text-[#333] mb-4">
            그룹의 모든 상담사({candidateMembersForSkilAssign.length}명)에게 스킬을 일괄 할당할 수 있습니다.<br />
            할당할 스킬을 선택하면 그룹의 모든 상담사에게 선택된 스킬이 할당됩니다.
          </div>

          {/* 디버깅 버튼 - 개발 환경에서만 표시 */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div className="mb-2">
              <button
                onClick={toggleRawData}
                className="text-xs text-blue-500 underline"
              >
                {showRawData ? '원본 데이터 숨기기' : '원본 데이터 보기 (디버깅용)'}
              </button>
            </div>
          )} */}

          {/* 디버깅용 Raw 데이터 표시 */}
          {showRawData && (
            <div className="mb-4 overflow-auto max-h-[150px] text-sm border rounded p-2 bg-gray-50 whitespace-pre">
              {JSON.stringify(candidateMembersForSkilAssign, null, 2)}
            </div>
          )}

          {/* 상담사 목록 표시 */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center p-2 border rounded cursor-pointer bg-gray-50 hover:bg-gray-100"
              onClick={toggleCounselors}
            >
              <div className="flex items-center">
                <Image className="mr-2" src="/tree-menu/group_icon_for_tree.png" alt="그룹" width={15} height={12} />
                <span className="text-sm text-[#333]">소속 상담사 목록</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-[#333] mr-2">{candidateMembersForSkilAssign.length}명</span>
                {showCounselors ? (
                  <ChevronUp className="h-4 w-4 text-[#333]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#333]" />
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
                  assignableSkills.map((skill: Skill) => (
                    <TableRow key={`skill-${skill.skill_id}`} className="custom-hover">
                      <TableCell className="text-center text-[#444]" style={{ height: '30px' , padding:0}}>
                        <CustomCheckbox
                          checked={selectedSkills.includes(skill.skill_id)}
                          onCheckedChange={() => toggleSkillSelection(skill.skill_id)}
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