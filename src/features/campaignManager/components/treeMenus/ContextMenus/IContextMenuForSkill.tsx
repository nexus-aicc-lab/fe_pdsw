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
  //  React Query의 기본 상태만 사용
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
        // console.error('스킬 삭제 오류:', error);
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