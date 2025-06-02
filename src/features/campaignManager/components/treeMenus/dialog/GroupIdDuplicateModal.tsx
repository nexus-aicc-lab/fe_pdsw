// src/features/campaignManager/components/modals/GroupIdDuplicateModal.tsx

import React, { useState } from 'react';
import CustomAlert from '@/components/shared/layout/CustomAlert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface GroupIdDuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  tenantName: string;
  groupIdList: string[];
  onNewIdSubmit: (newId: string) => void;
}

const GroupIdDuplicateModal = ({
  isOpen,
  onClose,
  groupId,
  tenantName,
  groupIdList,
  onNewIdSubmit,
}: GroupIdDuplicateModalProps) => {
  const [newGroupId, setNewGroupId] = useState('');

  // 중복 체크
  const isDuplicate = newGroupId.trim() ? groupIdList.includes(newGroupId) : false;

  const handleSubmit = () => {
    if (newGroupId && !isDuplicate) {
      onNewIdSubmit(newGroupId);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newGroupId && !isDuplicate) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <CustomAlert
      isOpen={isOpen}
      onClose={onClose}
      title="그룹 아이디 중복"
      type="1"
      message={
        <div>
          <p className="mb-2 font-medium text-red-500">
            입력하신 그룹 아이디 &apos;{groupId}&apos;는 이미 사용 중입니다.
          </p>
          <p className="mb-2">현재 테넌트({tenantName})의 그룹 아이디 목록:</p>
          <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 border rounded text-xs mb-4">
            {groupIdList.length > 0 ? (
              <ul className="list-disc pl-4">
                {groupIdList.map((id, index) => (
                  <li key={index} className="py-0.5">{id}</li>
                ))}
              </ul>
            ) : (
              <p>등록된 그룹이 없습니다.</p>
            )}
          </div>
          
          <div className="mt-4">
            <p className="text-sm mb-2">새 그룹 아이디를 입력해주세요:</p>
            <div className="flex space-x-2">
              <Input
                value={newGroupId}
                onChange={(e) => setNewGroupId(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="새 그룹 아이디"
                className="flex-1"
                autoFocus
              />
              <Button 
                onClick={handleSubmit}
                disabled={!newGroupId || isDuplicate}
              >
                적용
              </Button>
            </div>
            {newGroupId && isDuplicate && (
              <p className="text-xs text-red-500 mt-1">이 아이디도 이미 사용 중입니다.</p>
            )}
          </div>
        </div>
      }
      width="max-w-md"
      showButtons={false}
    />
  );
};

export default GroupIdDuplicateModal;