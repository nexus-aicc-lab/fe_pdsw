"use client";

import React, { useState, useEffect } from 'react';
import CommonButton from '@/components/shared/CommonButton';
import CustomAlert, { CustomAlertRequest } from '@/components/shared/layout/CustomAlert';
import { useSideMenuCampaignGroupTabStore } from '@/store/storeForSideMenuCampaignGroupTab';
import { toast } from 'react-toastify';
import { useDeleteCampaignHelper } from '@/features/campaignManager/utils/deleteCampaignHelper';
import { useRouter } from 'next/navigation';
import logoutFunction from '@/components/common/logoutFunction';

interface Props {
  campaignId?: string | number;
  campaignName?: string;
  variant?: 'outline' | 'destructive' | 'default' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  buttonText?: string;
  isDisabled?: boolean;
  isOpen?: boolean;
  tenant_id: number;
  onOpenChange?: (open: boolean) => void;
  onFocusID?: (focusId: string | number) => void;
  onDeleteSuccess?: () => void;
  preventAutoClose?: boolean; // preventAutoClose prop 추가
}

const errorMessage: CustomAlertRequest = {
  isOpen: false,
  message: '',
  title: '캠페인',
  type: '1',
  onClose: () => { },
  onCancel: () => { },
};

const IDialogButtonForCampaingDelete: React.FC<Props> = ({
  campaignId,
  campaignName = '캠페인',
  variant = 'destructive',
  size = 'sm',
  className = '',
  buttonText = '삭제',
  isDisabled = false,
  isOpen: externalIsOpen,
  onOpenChange,
  tenant_id,
  onFocusID,
  onDeleteSuccess,
  preventAutoClose = false, // preventAutoClose 기본값을 false로 설정
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isDialogOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  const goLogin = () => {
    logoutFunction();
    router.push('/login');
  };

  const [alertState, setAlertState] = useState<CustomAlertRequest>(errorMessage);

  const { commonDeleteCampaign } = useDeleteCampaignHelper();

  const handleDelete = async () => {
    if (!campaignId) {
      toast.error('삭제할 캠페인 정보가 없습니다.');
      return;
    }
    setIsDeleting(true);

    try{
      const callbackCampaignId = await commonDeleteCampaign(Number(tenant_id), Number(campaignId));

      // 내부 알림 상태 설정 (필요하다면)
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: `'${campaignName}' 캠페인이 삭제되었습니다.`,
        type: '1',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
      });

      // 삭제 성공 콜백을 먼저 호출
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }

      // preventAutoClose가 false일 때만 다이얼로그를 닫음
      if (!preventAutoClose) {
        closeDialog();
      }

      if(onFocusID && callbackCampaignId){
        setIsDeleting(false);
        onFocusID(callbackCampaignId);
      }

    } catch (e: any){

      if (e.message === 'SESSION_EXPIRED') {
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
          type: '2',
          onClose: () => goLogin(),
        });
      } else {
        console.error('캠페인 삭제 중 오류 발생:', e);
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: '캠페인 삭제 중 알 수 없는 오류가 발생했습니다.',
          onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
        });
      }

      // 에러 발생 시 처리 중 상태 해제
      setIsDeleting(false);
    }
  };

  const openDialog = () => (onOpenChange ? onOpenChange(true) : setInternalIsOpen(true));
  const closeDialog = () => (onOpenChange ? onOpenChange(false) : setInternalIsOpen(false));

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDialog();
      }
    };
    window.addEventListener('keydown', handleEscapeKey);
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const alertMessage = `캠페인 아이디: ${campaignId} 캠페인 이름: ${campaignName} 삭제된 캠페인은 복구가 불가능합니다 캠페인을 삭제하시겠습니까?`;

  return (
    <>
      <CommonButton
        variant={variant}
        size={size}
        className={className}
        onClick={openDialog}
        disabled={isDisabled || isDeleting}
      >
        {buttonText}
      </CommonButton>

      {isDialogOpen && (
        <CustomAlert
          isOpen={isDialogOpen}
          title="캠페인 삭제"
          message={alertMessage}
          onClose={handleDelete}
          onCancel={closeDialog}
          type="1"
          confirmDisabled={isDeleting}
          preventAutoClose={preventAutoClose} // preventAutoClose prop 전달
        />
      )}

      {/* 내부 알림 다이얼로그 */}
      {alertState.isOpen && (
        <CustomAlert
          isOpen={alertState.isOpen}
          title={alertState.title}
          message={alertState.message}
          onClose={alertState.onClose}
          onCancel={alertState.onCancel || alertState.onClose}
          type={alertState.type}
        />
      )}
    </>
  );
};

export default IDialogButtonForCampaingDelete;