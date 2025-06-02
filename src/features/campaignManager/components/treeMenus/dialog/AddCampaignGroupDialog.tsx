"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useApiForCreateCampaignGroup } from "@/features/preferences/hooks/useApiForCreateCampaignGroup";
import { useSideMenuCampaignGroupTabStore } from "@/store/storeForSideMenuCampaignGroupTab";
import GroupIdDuplicateModal from "./GroupIdDuplicateModal";
import CommonDialogWithCustomAlertStyle from "@/components/shared/layout/CommonDialogWithCustomAlertStyle";

interface AddCampaignGroupDialogProps {
  isOpen: boolean;
  onClose: (e?: React.MouseEvent | React.KeyboardEvent | Event) => void;
  tenantId: number;
  tenantName: string;
  onAddGroup?: (groupName: string, groupCode: string) => void;
}

export function AddCampaignGroupDialog({
  isOpen,
  onClose,
  tenantId,
  tenantName,
  onAddGroup,
}: AddCampaignGroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [groupIdList, setGroupIdList] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  const { refetchTreeDataForCampaignGroupTab, treeData } = useSideMenuCampaignGroupTabStore();

  // 다이얼로그 열 때 초기화
  useEffect(() => {
    if (isOpen) {
      setGroupName("");
      setGroupId("");
      setIsValidated(false);
    }
  }, [isOpen]);

  // 현재 테넌트의 그룹 ID 목록 조회
  const getGroupIdsInTenant = (tenantId: number) => {
    const groupIds: string[] = [];
    const findGroupsInTenant = (nodes: any[]) => {
      nodes.forEach(node => {
        if (node.type === "tenant" && node.tenant_id === tenantId) {
          node.children?.forEach((child: any) => {
            if (child.type === "group" && child.group_id) {
              groupIds.push(child.group_id.toString());
            }
          });
        } else if (node.children) {
          findGroupsInTenant(node.children);
        }
      });
    };
    findGroupsInTenant(treeData);
    return groupIds;
  };

  const checkDuplicateGroupId = (id: string) => getGroupIdsInTenant(tenantId).includes(id);

  const handleCheckDuplicate = () => {
    if (!groupId.trim()) return false;

    setIsCheckingDuplicate(true);
    const existingIds = getGroupIdsInTenant(tenantId);
    setGroupIdList(existingIds);

    if (checkDuplicateGroupId(groupId)) {
      setIsDuplicateModalOpen(true);
      setIsValidated(false);
    } else {
      setIsValidated(true);
      toast.success("사용 가능한 그룹 ID입니다.");
    }
    setIsCheckingDuplicate(false);
    return false;
  };

  const handleNewGroupId = (newId: string) => {
    setGroupId(newId);
    setIsDuplicateModalOpen(false);
    setIsValidated(true);
  };

  // 숫자 이외 제거
  const handleGroupIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, "");
    if (onlyDigits.length > 3) {
      setGroupId('999');
    }else{
      setGroupId(onlyDigits);
    }
    setIsValidated(false);
  };

  const { mutate, isPending } = useApiForCreateCampaignGroup({
    onSuccess: () => {
      toast.success("캠페인 그룹이 추가되었습니다.");
      onAddGroup?.(groupName, groupId);
      refetchTreeDataForCampaignGroupTab();
      handleClose();
    },
    onError: (error: any) => {
      alert(error.message || "캠페인 그룹 생성에 실패하였습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!groupName.trim() || !groupId.trim()) return;
    if (!isValidated) {
      toast.warning("먼저 그룹 ID 중복 확인을 해주세요.");
      return;
    }
    mutate({
      group_id: groupId,
      tenant_id: tenantId,
      group_name: groupName,
    });
  };

  const handleClose = (e?: React.MouseEvent | React.KeyboardEvent | Event) => {
    e?.preventDefault();
    onClose(e!);
  };

  const stopPropagation = (e: React.UIEvent) => e.stopPropagation();

  return (
    <>
      <CommonDialogWithCustomAlertStyle
        isOpen={isOpen}
        onClose={handleClose}
        title="그룹 추가"
        showButtons={false}
        width="max-w-sm"
      >
        <div>
          <p className="mb-4">새로운 캠페인 그룹을 등록합니다.</p>
          <form onSubmit={handleSubmit} onClick={stopPropagation} onPointerDown={stopPropagation}>
            <div className="space-y-4">
              {/* 그룹 아이디 입력 */}
              <div className="flex flex-col space-y-1">
                <Label htmlFor="groupId">캠페인 그룹 아이디</Label>
                <div className="flex gap-2">
                  <Input
                    id="groupId"
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={groupId}
                    onChange={handleGroupIdChange}
                    placeholder="그룹 아이디를 입력하세요"
                    onClick={stopPropagation}
                    onPointerDown={stopPropagation}
                    className="rounded-r-none"
                  />
                  <Button
                    type="button"
                    onClick={handleCheckDuplicate}
                    disabled={!groupId.trim() || isCheckingDuplicate}
                    className="rounded-l-none"
                    onPointerDown={stopPropagation}
                  >
                    {isCheckingDuplicate ? "확인중..." : isValidated ? "✓ 확인됨" : "중복 확인"}
                  </Button>
                </div>
                {isValidated && (
                  <p className="text-xs text-green-500 mt-1">사용 가능한 그룹 아이디입니다.</p>
                )}
              </div>

              {/* 그룹명 입력 */}
              <div className="flex flex-col space-y-1">
                <Label htmlFor="groupName">캠페인 그룹명</Label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="그룹명을 입력하세요"
                  onClick={stopPropagation}
                  onPointerDown={stopPropagation}
                />
              </div>

              {/* 액션 버튼 */}
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  onPointerDown={stopPropagation}
                  disabled={isPending}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !groupName.trim() || !groupId.trim() || !isValidated}
                  onPointerDown={stopPropagation}
                >
                  {isPending ? "생성 중..." : "그룹 추가"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </CommonDialogWithCustomAlertStyle>

      {/* 중복 확인 모달 */}
      {isDuplicateModalOpen && (
        <GroupIdDuplicateModal
          isOpen={isDuplicateModalOpen}
          onClose={() => setIsDuplicateModalOpen(false)}
          groupId={groupId}
          tenantName={tenantName}
          groupIdList={groupIdList}
          onNewIdSubmit={handleNewGroupId}
        />
      )}
    </>
  );
}

export default AddCampaignGroupDialog;
