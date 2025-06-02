"use client";

import React from 'react';
import CustomAlert from '@/components/shared/layout/CustomAlert';

export interface IDialogButtonForDeleteCampaignGroupProps {
  isOpen: boolean;
  groupName: string;
  onCancel: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const IDialogButtonForDeleteCampaignGroup: React.FC<IDialogButtonForDeleteCampaignGroupProps> = ({
  isOpen,
  groupName,
  onCancel,
  onDelete,
  isDeleting = false,
}) => {
  const message = (
    <div className="space-y-4">
      <p className="text-sm">정말로 캠페인 그룹 &apos;{groupName}&apos;을(를) 삭제하시겠습니까?</p>
      <p className="text-destructive font-medium">이 작업은 되돌릴 수 없습니다.</p>
    </div>
  );

  return (
    <CustomAlert
      isOpen={isOpen}
      title="캠페인 그룹 삭제"
      message={message}
      type="1"
      onClose={onDelete}
      onCancel={onCancel}
      width="max-w-md"
      confirmDisabled={isDeleting}
    />
  );
};

export default IDialogButtonForDeleteCampaignGroup;
