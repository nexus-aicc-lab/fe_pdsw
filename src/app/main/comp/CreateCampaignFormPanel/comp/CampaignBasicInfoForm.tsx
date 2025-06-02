"use client";
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { CustomInput } from "@/components/shared/CustomInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import ISelectorForTeanantForCreateNewCampaign from './ISelectorForTeanantForCreateNewCampaign';
import { Search, Plus } from "lucide-react";
import SkillListPopupForNewCampaign from '@/components/shared/layout/SkillListPopupForNewCampaign';

const dialModeList = [
  { dial_id: 1, dial_name: 'Power' },
  { dial_id: 2, dial_name: 'Progressive' },
  { dial_id: 3, dial_name: 'Predictive' },
  { dial_id: 4, dial_name: 'System Preview' },
];

type Props = {
  tenantId?: string;
  tempCampaignInfo: any;
  inputSkills: string; // 예: "1,2,3,"
  onUpdateSkill: (param: string) => void;
  onInputChange: (value: string, field: string) => void;
  onSelectChange: (value: string, field: 'tenant' | 'dialMode') => void;
};

const CampaignBasicInfoForm = ({
  tenantId: initialTenantId,
  tempCampaignInfo,
  inputSkills,
  onUpdateSkill,
  onInputChange,
  onSelectChange
}: Props) => {
  // 내부적으로 tenantId 상태 관리 (초기값은 props에서 받음)
  const [currentTenantId, setCurrentTenantId] = useState<string>(
    initialTenantId || (tempCampaignInfo.tenant_id > 0 ? tempCampaignInfo.tenant_id.toString() : '')
  );
  const [skillPopupState, setSkillPopupState] = useState({ isOpen: false, type: '1' });
  const [callingNumber, setCallingNumber] = useState('');
  const [formattedSkills, setFormattedSkills] = useState('');

  // initialTenantId가 변경될 때 currentTenantId 업데이트
  useEffect(() => {
    if (initialTenantId) {
      setCurrentTenantId(initialTenantId);
    }
  }, [initialTenantId]);

  // inputSkills 변경 시 화면에 표시할 형식으로 가공
  useEffect(() => {
    // 쉼표로 구분된 스킬 ID 문자열에서 마지막 쉼표를 제거하고 표시
    const skillsDisplay = inputSkills.endsWith(',') 
      ? inputSkills.slice(0, -1) 
      : inputSkills;
      
    setFormattedSkills(skillsDisplay);
  }, [inputSkills]);

  // tenant 선택 변경 처리
  const handleTenantChange = (tenantId: number) => {
    const tenantIdStr = tenantId.toString();
    setCurrentTenantId(tenantIdStr);
    onSelectChange(tenantIdStr, 'tenant');
    
    // tenant가 변경되면 스킬을 초기화 (선택적으로 구현)
    // onUpdateSkill("");
  };

  // 스킬 선택 결과를 처리하는 함수
  const handleSelectSkills = (param: string, updatedTenantId?: number) => {
    onUpdateSkill(param);
    
    // SkillListPopup에서 tenantId가 변경된 경우 처리
    if (updatedTenantId && updatedTenantId.toString() !== currentTenantId) {
      setCurrentTenantId(updatedTenantId.toString());
      onSelectChange(updatedTenantId.toString(), 'tenant');
    }
  };

  // 스킬 팝업 열기
  const handleOpenSkillPopup = () => {
    if (!currentTenantId || currentTenantId === '-1') {
      alert('테넌트를 선택해주세요.');
    } else {
      setSkillPopupState({ ...skillPopupState, isOpen: true });
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-x-[24px] gap-y-2">
        <div className="flex items-center gap-2">
          <Label className="w-[90px] min-w-[90px]">캠페인 ID</Label>
          <CustomInput
            type="number"
            value={tempCampaignInfo.campaign_id}
            onChange={(e) => onInputChange(e.target.value, 'campaign_id')}
            min="0"
          />
        </div>

        <ISelectorForTeanantForCreateNewCampaign
          tenantId={currentTenantId}
          onChange={handleTenantChange}
        />

        <div className="flex items-center gap-2">
          <Label className="w-[74px] min-w-[74px]">캠페인명</Label>
          <CustomInput
            value={tempCampaignInfo.campaign_name || ''}
            onChange={(e) => onInputChange(e.target.value, 'campaign_name')}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label className="w-[90px] min-w-[90px]">다이얼 모드</Label>
          <Select
            onValueChange={(value) => onSelectChange(value, 'dialMode')}
            value={tempCampaignInfo.dial_mode + ''}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="다이얼 모드 선택" />
            </SelectTrigger>
            <SelectContent>
              {dialModeList.map(option => (
                <SelectItem key={option.dial_id} value={option.dial_id.toString()}>
                  {option.dial_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 relative">
          <Label className="w-[74px] min-w-[74px]">스킬</Label>
          <CustomInput 
            value={formattedSkills} 
            className="w-full" 
            readOnly
            placeholder="스킬을 선택해 주세요" 
          />
          <button
            className="absolute right-2 top-[52%] transform -translate-y-1/2 hover:bg-gray-100 p-1 rounded-full"
            onClick={handleOpenSkillPopup}
            title="스킬 선택"
            type="button"
          >
            <Search size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="flex items-center gap-2 relative">
          <Label className="w-[74px] min-w-[74px]">발신번호</Label>
          <CustomInput 
            value={callingNumber} 
            onChange={(e) => setCallingNumber(e.target.value)}
            className="w-full" 
            placeholder="발신번호를 입력하세요"
          />
          <button
            className="absolute right-2 top-[52%] transform -translate-y-1/2 hover:bg-gray-100 p-1 rounded-full"
            onClick={() => { /* 발신번호 추가 로직 */ }}
            title="발신번호 추가"
            type="button"
          >
            <Plus size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="flex items-center gap-2 col-span-3">
          <Label className="w-[90px] min-w-[90px]">설명</Label>
          <CustomInput
            value={tempCampaignInfo.campaign_desc || ''}
            className="w-full"
            onChange={(e) => onInputChange(e.target.value, 'campaign_desc')}
            placeholder="캠페인 설명을 입력하세요"
          />
        </div>
      </div>

      {/* SkillListPopup 컴포넌트 */}
      {skillPopupState.isOpen && (
        <SkillListPopupForNewCampaign
          param={inputSkills.split(',').filter(id => id !== '').map(id => Number(id))}
          tenantId={Number(currentTenantId)}
          type={skillPopupState.type}
          isOpen={skillPopupState.isOpen}
          onConfirm={(param, updatedTenantId) => {
            handleSelectSkills(param, updatedTenantId);
            setSkillPopupState(prev => ({ ...prev, isOpen: false }));
          }}
          onCancel={() => setSkillPopupState(prev => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
};

export default CampaignBasicInfoForm;