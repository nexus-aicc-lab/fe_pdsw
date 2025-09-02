"use client";

import React, { FC, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiForCampaignGroupNameUpdate } from "@/features/campaignManager/hooks/useApiForCampaignGroupNameUpdate";
import { toast } from "react-toastify";
import CustomAlert from "@/components/shared/layout/CustomAlert";
import { CommonButton } from "@/components/shared/CommonButton";
interface IDialogForUpdateCampaignGroupNameProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  tenantId: number;
  currentGroupName: string;
  onSuccess?: () => void;
}

const IDialogForUpdateCampaignGroupName: FC<IDialogForUpdateCampaignGroupNameProps> = ({
  isOpen,
  onClose,
  groupId,
  tenantId,
  currentGroupName,
  onSuccess,
}) => {
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setGroupName(currentGroupName);
      setError("");
    }
  }, [isOpen, currentGroupName]);

  const { mutate: updateGroupName, isPending } = useApiForCampaignGroupNameUpdate({
    onSuccess: () => {
      toast.success("캠페인 그룹 이름이 변경되었습니다.");
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      // console.error("캠페인 그룹 이름 변경 실패:", error);
      toast.error("캠페인 그룹 이름 변경에 실패했습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!groupName.trim()) {
      setError("그룹 이름을 입력해주세요.");
      return;
    }

    // 이름이 변경되지 않은 경우
    if (groupName === currentGroupName) {
      onClose();
      return;
    }

    // API 호출
    updateGroupName({
      group_id: groupId,
      group_name: groupName,
      tenant_id: tenantId,
    });
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        새로운 캠페인 그룹 이름을 입력해주세요.
      </p>
      <div className="space-y-2">
        <Label htmlFor="groupName">그룹 이름</Label>
        <Input
          id="groupName"
          value={groupName}
          onChange={(e) => {
            setGroupName(e.target.value);
            setError("");
          }}
          placeholder="그룹 이름을 입력하세요"
          className={error ? "border-red-500" : ""}
          disabled={isPending}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
      <div className="flex justify-end space-x-2 mt-6">
        <CommonButton
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
        >
          취소
        </CommonButton>
        <CommonButton type="submit" disabled={isPending} >
          {isPending ? "저장 중..." : "저장"}
        </CommonButton>
      </div>
    </form>
  );

  return (
    <CustomAlert
      isOpen={isOpen}
      title="캠페인 그룹 이름 변경"
      message={content}
      onClose={onClose}
      onCancel={onClose}
      type="1"
      showButtons={false} // 내부 커스텀 버튼 사용
    />
  );
};

export default IDialogForUpdateCampaignGroupName;
