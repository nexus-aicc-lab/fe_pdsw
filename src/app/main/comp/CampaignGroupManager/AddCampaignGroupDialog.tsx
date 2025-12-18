// src/components/AddCampaignGroupDialog.tsx

"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CommonDialogForSideMenu from "@/components/shared/CommonDialog/CommonDialogForSideMenu";
import { useApiForCampaignGroupCreate } from '@/features/campaignGroupManager/hooks/useApiForCampaignGroupCreate';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import { useAuthStore, useMainStore } from '@/store';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import CustomAlert from '@/components/shared/layout/CustomAlert';
import { DataProps } from './CampaignGroupManagerList';
import { CustomInput } from "@/components/shared/CustomInput";
import logoutFunction from "@/components/common/logoutFunction";

const errorMessage = {
  isOpen: false,
  message: '',
  title: '로그인',
  type: '0',
  onClose: () => { },
  onCancel: () => { },
};

interface AddCampaignGroupDialogProps {
  isOpen: boolean;
  onClose: (e?: React.MouseEvent | React.KeyboardEvent | Event) => void;
  tenantId: number; // string에서 number로 변경
  tenantName: string;
  campaignGroupList: DataProps[];
  onAddGroup?: (groupName: string, groupCode: string) => void;
}

export function AddCampaignGroupDialog({
  isOpen,
  onClose,
  tenantId,
  tenantName,
  campaignGroupList,
  onAddGroup,
}: AddCampaignGroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [_tenantId, setTenantId] = useState(tenantId+''); // 테넌트
  const { tenants } = useMainStore();
  const [alertState, setAlertState] = useState(errorMessage);
  const router = useRouter();
  const [isValidated, setIsValidated] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  // 다이얼로그가 열릴 때마다 폼 초기화
  useEffect(() => {
    if (isOpen) {
      setGroupName("");
      setGroupId("");
    }
  }, [isOpen]);

  // 캠페인 그룹 추가
  const { mutate: fetchCampaignGroupCreate } = useApiForCampaignGroupCreate({
    onSuccess: (data) => {
      if (onAddGroup) {
        onAddGroup(groupName, groupId);
      }
      handleClose();      
    },onError: (data) => {      
      // console.log('error', data.message.split('||')[1]);
      if (data.message.split('||')[0] === '5') {
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: 'API 연결 세션이 만료되어 캠페인그룹을 생성할 수 없습니다. 로그인을 다시 하신 후 시도해 주시기 바랍니다.',
          type: '2',
          onClose: () => goLogin(),
        });
      }else if (data.message.split('||')[0] === '501') {
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: '이미 존재하는 그룹입니다.',
          type: '2',
          onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
        });
      }else{
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: data.message.split('||')[1],
          type: '2',
          onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
        });
      }
    }
  });

  const goLogin = () => {
    logoutFunction();
    // router.push('/login');
  };
  // 캠페인 그룹 생성 API 호출 훅 사용
  // const { mutate, isPending } = useApiForCreateCampaignGroup({
  //   onSuccess: (data, variables, context) => {
  //     console.log("캠페인 그룹 생성 성공:", data);
  //     toast.success("캠페인 그룹이 추가되었습니다.");
  //     // onAddGroup 콜백이 존재하면 호출 (추가적인 작업이 필요할 경우)
  //     if (onAddGroup) {
  //       onAddGroup(groupName, groupId);
  //     }
  //     handleClose();
  //   },
  //   onError: (error, variables, context) => {
  //     console.error("캠페인 그룹 생성 실패:", error);
  //     // 필요시 에러 메시지를 사용자에게 보여줄 수 있습니다.
  //     alert(error.message || "캠페인 그룹 생성에 실패하였습니다.");
  //   },
  // });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation(); // 이벤트 전파 방지
    if( campaignGroupList.filter((group) => group.campaignGroupId === Number(groupId)).length > 0 ){
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: '이미 존재하는 그룹입니다.',
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }
    if( _tenantId === 'all'){      
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: '테넌트를 선택해 주세요.',
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
      });
    }else if( groupId.trim() === ''){
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: '그룹 아이디를 입력해 주세요.',
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
      });
    }else if( groupName.trim() === ''){
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: '그룹명을 입력해 주세요.',
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
      });
    }else{
      fetchCampaignGroupCreate({
        group_id: Number(groupId),
        tenant_id: Number(_tenantId), 
        group_name: groupName,
      });
    }
  };

  const handleClose = (e?: React.MouseEvent | React.KeyboardEvent | Event) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // 이벤트 전파 방지
    }
    onClose(e);
  };

  // 모든 인풋에 이벤트 전파 방지 적용
  const stopPropagation = (e: React.UIEvent) => {
    e.stopPropagation();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const currentValue = e.target.value;
    if (currentValue.startsWith("0") && currentValue.length > 1) {
      e.target.value = currentValue.replace(/^0+/, "");
    }
  };

  const handleCheckDuplicate = () => {
    if (!groupId.trim()) return false;

    setIsCheckingDuplicate(true);
    
    if( campaignGroupList.filter((group) => group.campaignGroupId === Number(groupId)).length > 0 ){
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: '이미 존재하는 그룹입니다.',
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
      });
      setIsValidated(false);
    } else {
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: '사용 가능한 그룹 ID입니다.',
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
      });
      setIsValidated(true);
      // toast.success("사용 가능한 그룹 ID입니다.");
    }
    setIsCheckingDuplicate(false);
    return false;
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

  return (
    <CommonDialogForSideMenu
      isOpen={isOpen}
      onClose={handleClose}
      title="그룹 추가"
      description="새로운 캠페인 그룹을 등록합니다."
    >
      <form onSubmit={handleSubmit} onClick={stopPropagation} onPointerDown={stopPropagation}>
        <div className="space-y-4">
          {/* 테넌트 아이디 */}
          <div className="flex flex-col space-y-1">
            <Label className="pr-[15px]">테넌트</Label>
            <Select defaultValue='all' value={_tenantId} onValueChange={setTenantId} disabled={tenants.length === 1}>
                <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="테넌트" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value='all'>전체</SelectItem>
                { tenants.map(option => (
                  <SelectItem key={option.tenant_id} value={option.tenant_id+''}>{option.tenant_name}</SelectItem>
                )) }
                </SelectContent>
            </Select>
          </div>

          {/* 그룹 아이디 */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="groupId">캠페인 그룹 아이디</Label>
            <CustomInput 
              type="number" 
              value={groupId}
              // onChange={(e) => {
              //   setGroupId(e.target.value);
              //   setIsValidated(false);
              // }}   
              onChange={handleGroupIdChange}   
              placeholder="그룹 아이디를 입력해 주세요."     
              className="" 
              min="0" 
              onBlur={handleBlur}
              maxLength={3}
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

          {/* 그룹명 */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="groupName">캠페인 그룹명</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="그룹명을 입력해 주세요."
              onClick={stopPropagation}
              onPointerDown={stopPropagation}
            />
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-end space-x-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              onPointerDown={stopPropagation}
              disabled={false}
            >
              취소
            </Button>
            <Button 
              type="submit" 
              disabled={false}
              onPointerDown={stopPropagation}
            >
              {false ? "생성 중..." : "그룹 추가"}
            </Button>
          </div>
        </div>
      </form>
      <CustomAlert
        message={alertState.message}
        title={alertState.title}
        type={alertState.type}
        isOpen={alertState.isOpen}
        onClose={() => {
          alertState.onClose()
        }}
        onCancel={() => setAlertState((prev) => ({ ...prev, isOpen: false }))} />
    </CommonDialogForSideMenu>
  );
}

export default AddCampaignGroupDialog;