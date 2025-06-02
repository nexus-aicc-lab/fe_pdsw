// import React from "react";
// import {
//   ContextMenu,
//   ContextMenuTrigger,
//   ContextMenuContent,
//   ContextMenuItem,
// } from "@/components/ui/context-menu";
// import { useApiDeleteCounselorsFromSkills } from "@/features/campaignManager/hooks/useApiDeleteCounselorsFromSkills";

// interface IContextMenuForSkillProps {
//   children: React.ReactNode;
//   item: {
//     id: string;
//     name: string;
//     // 필요시 추가 필드
//   };
//   counselorIds: string[]; // 해제할 상담사 ID들 ✅
//   tenantId: string; // tenant ID ✅
//   onUnassignSkill?: (item: { id: string; name: string }) => void;
// }

// const IContextMenuForSkill: React.FC<IContextMenuForSkillProps> = ({
//   children,
//   item,
//   counselorIds,
//   tenantId,
//   onUnassignSkill,
// }) => {
//   // 기존 훅 사용 ✅
//   const { mutate: deleteSkill, isPending } = useApiDeleteCounselorsFromSkills(tenantId);

//   const handleUnassign = () => {
//     console.log("[컨텍스트메뉴] 스킬 할당 해제 클릭", {
//       skill: item,
//       counselorIds,
//       tenantId
//     });
    
//     // 상담원 정보가 없으면 경고하고 return
//     if (!counselorIds.length || !tenantId) {
//       console.warn("스킬 할당 해제에 필요한 정보가 부족합니다:", {
//         counselorIds,
//         tenantId
//       });
//       return;
//     }
    
//     // 기존 콜백 호출 (옵션)
//     if (onUnassignSkill) {
//       onUnassignSkill(item);
//     }

//     // API 호출 - 실제 스킬 해제 ✅
//     deleteSkill({
//       skillIds: [parseInt(item.id)], // string을 number로 변환
//       counselorIds: counselorIds,
//       tenantId: tenantId,
//       concurrentLimit: 1 // 단일 스킬이므로 1로 설정
//     }, {
//       onSuccess: (result) => {
//         if (result.success) {
//           console.log("스킬 해제 성공:", result);
//           // 성공 처리 로직 (토스트 메시지 등)
//         } else {
//           console.error("스킬 해제 실패:", result.failedSkills);
//           // 실패 처리 로직
//         }
//       },
//       onError: (error) => {
//         console.error("스킬 해제 중 오류:", error);
//         // 에러 처리 로직
//       }
//     });
//   };

//   return (
//     <ContextMenu>
//       <ContextMenuTrigger asChild>
//         {children}
//       </ContextMenuTrigger>
//       <ContextMenuContent>
//         <ContextMenuItem 
//           onClick={handleUnassign}
//           disabled={isPending || !counselorIds.length || !tenantId} // 조건 체크 ✅
//         >
//           {isPending ? "해제 중..." : "스킬 할당 해제"}
//         </ContextMenuItem>
//       </ContextMenuContent>
//     </ContextMenu>
//   );
// };

// export default IContextMenuForSkill;

// IContextMenuForSkill.tsx - 간단한 버전
import React from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { useApiDeleteCounselorsFromSkills } from "@/features/campaignManager/hooks/useApiDeleteCounselorsFromSkills";
import { toast } from "react-toastify";

interface IContextMenuForSkillProps {
  children: React.ReactNode;
  item: {
    id: string;
    name: string;
  };
  counselorIds: string[];
  tenantId: string;
  onUnassignSkill?: (item: { id: string; name: string }) => void;
}

const IContextMenuForSkill: React.FC<IContextMenuForSkillProps> = ({
  children,
  item,
  counselorIds,
  tenantId,
  onUnassignSkill,
}) => {
  // 🎯 React Query의 기본 상태만 사용
  const { mutate: deleteSkill, isPending } = useApiDeleteCounselorsFromSkills(tenantId);

  const handleUnassign = () => {
    if (!counselorIds.length || !tenantId) {
      toast.error("삭제할 수 없습니다. 필요한 정보가 부족합니다.");
      return;
    }

    if (isPending) {
      toast.warning("이미 처리 중입니다...");
      return;
    }

    console.log('🎯 스킬 삭제 요청:', { item, counselorIds, tenantId });
    
    if (onUnassignSkill) {
      onUnassignSkill(item);
    }

    deleteSkill({
      skillIds: [Number(item.id)], // 숫자로 변환
      counselorIds: counselorIds,
      tenantId: tenantId,
    }, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success(`"${item.name}" 스킬이 해제되었습니다.`, {
            autoClose: 2000
          });
        } else {
          toast.error(`"${item.name}" 스킬 해제에 실패했습니다.`, {
            autoClose: 3000
          });
        }
      },
      onError: (error) => {
        console.error('스킬 삭제 오류:', error);
        toast.error(`"${item.name}" 스킬 해제 중 오류가 발생했습니다.`, {
          autoClose: 3000
        });
      }
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem 
          onClick={handleUnassign}
          disabled={isPending || !counselorIds.length || !tenantId}
          className={`transition-colors duration-200 ${
            isPending 
              ? 'text-blue-600 cursor-wait' 
              : 'text-gray-900 hover:text-red-600'
          }`}
        >
          <div className="flex items-center gap-2">
            {isPending && (
              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
            )}
            <span>
              {isPending ? "해제 중..." : "스킬 할당 해제"}
            </span>
          </div>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default IContextMenuForSkill;