"use client";

// components/main/CampaignManager.tsx
import React, { useEffect, useState } from 'react';
import { useMainStore, useCampainManagerStore, useAuthStore } from '@/store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import { Label } from "@/components/ui/label";
import { CustomInput } from "@/components/shared/CustomInput";
import { CommonButton } from "@/components/shared/CommonButton";
import { SkillListDataResponse } from '@/features/campaignManager/types/campaignManagerIndex';

const dialModeList = [
  { dial_id: 1, dial_name: 'Power' },
  { dial_id: 2, dial_name: 'Progressive' },
  { dial_id: 3, dial_name: 'Predictive' },
  { dial_id: 4, dial_name: 'System Preview' },
];

export interface CampaignHeaderSearch {
  tenantId: number;
  campaignName: string;
  dailMode: number;
  skill: number;
  callNumber: string;
}

type Props = {
  onSearch: (param: CampaignHeaderSearch) => void;
  init: boolean;
  setInit: () => void;
}

export default function CampaignManagerHeader({ onSearch,init,setInit }: Props) {
  const { tenants } = useMainStore();
  const { skills, campaignManagerHeaderTenantId, campaignManagerHeaderCampaignName, campaignManagerHeaderDailMode, campaignManagerHeaderSkill, campaignManagerHeaderCallNumber } = useCampainManagerStore();
  const [tenantId, setTenantId] = useState('all'); // 테넌트
  const [campaignName, setCampaignName] = useState(''); // 캠페인이름
  const [dailMode, setDailMode] = useState('all'); // 다이얼모드
  const [skill, setSkill] = useState('all'); // 스킬
  const [callNumber, setCallNumber] = useState(''); // 발신번호
  const [tempSkills, setTempSkills] = useState<SkillListDataResponse[]>([]);

  const { tenant_id } = useAuthStore();
  const [isTenantManager, setIsTenantManager] = useState(false);

  const onHeaderSearch = () => {
    const param: CampaignHeaderSearch = {
      tenantId: tenantId === 'all' ? -1 : Number(tenantId),
      campaignName: campaignName,
      dailMode: dailMode === 'all' ? -1 : Number(dailMode),
      skill: skill === 'all' ? -1 : Number(skill),
      callNumber: callNumber,
    };
    onSearch(param);
  };

  useEffect(() => {
    if (typeof tenantId !== 'undefined') {
      if (tenantId === 'all') {
        setTempSkills(skills);
      } else {
        setTempSkills(skills.filter((skill) => skill.tenant_id === Number(tenantId)));
      }
    }
    // setSkill('all');
  }, [tenantId, skills]);

  useEffect(() => {
    if (init) {
      setInit();
      setTenantId('all');
      setCampaignName('');
      setDailMode('all');
      setSkill('all');
      setCallNumber('');
      onSearch({
        tenantId: -1,
        campaignName: '',
        dailMode: -1,
        skill: -1,
        callNumber: ''
      });
    }
  }, [init]);

  useEffect(() => {
    if (tenant_id !== 0) {
      setTenantId(tenant_id + ''); // 첫 번째 항목 자동 선택
      setIsTenantManager(true); // 드롭다운 비활성화
    } else {
      setIsTenantManager(false); // 드롭다운 활성화
    }
  }, [tenants]);

  useEffect(() => {
    if ( campaignManagerHeaderTenantId != '-1' ) {
      setTenantId(campaignManagerHeaderTenantId);
    }else{
      setTenantId('all');
    }
    if ( campaignManagerHeaderCampaignName != '' ) {
      setCampaignName(campaignManagerHeaderCampaignName);
    }else{
      setCampaignName('');
    }
    if ( campaignManagerHeaderDailMode != '-1' ) {
      setDailMode(campaignManagerHeaderDailMode);
    }else{
      setDailMode('all');
    }
    if ( campaignManagerHeaderSkill != '-1' ) {
      setSkill(campaignManagerHeaderSkill);
    }else{
      setSkill('all');
    }
    if ( campaignManagerHeaderCallNumber != '' ) {
      setCallNumber(campaignManagerHeaderCallNumber);
    }else{
      setCallNumber('');
    }
  }, [campaignManagerHeaderTenantId,campaignManagerHeaderCampaignName,campaignManagerHeaderDailMode,campaignManagerHeaderSkill,campaignManagerHeaderCallNumber]);

  return (
    <div className="flex title-background justify-between">
      <div className="flex gap-[40px] gap-use-10 items-center flex-wrap">
        <div className="flex items-center">
          <Label className="pr-[15px] whitespace-nowrap">테넌트</Label>
          <Select defaultValue="all" value={tenant_id !== 0 ? tenant_id.toString() :tenantId} onValueChange={setTenantId} disabled={isTenantManager}>
            <SelectTrigger className="w-[180px] w-use-140">
              <SelectValue placeholder="테넌트" className="truncate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="truncate">전체</SelectItem>
              {tenants.map(option => ( 

                <SelectItem
                  key={option.tenant_id}
                  value={option.tenant_id + ''}
                  className="truncate"
                >
                  {option.tenant_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center">
          <Label className="pr-[15px] whitespace-nowrap">캠페인 이름</Label>
          <CustomInput
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            className="w-[180px] w-use-140 truncate"
          />
        </div>
        <div className="flex items-center">
          <Label className="pr-[15px] whitespace-nowrap">다이얼 모드</Label>
          <Select defaultValue="all" value={dailMode} onValueChange={setDailMode}>
            <SelectTrigger className="w-[180px] w-use-140">
              <SelectValue placeholder="다이얼 모드" className="truncate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="truncate">전체</SelectItem>
              {dialModeList.map(option => (
                <SelectItem
                  key={option.dial_id}
                  value={option.dial_id + ''}
                  className="truncate"
                >
                  {option.dial_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center">
          <Label className="pr-[15px] whitespace-nowrap">스킬</Label>
          <Select defaultValue="all" value={skill} onValueChange={setSkill}>
            <SelectTrigger className="w-[180px] w-use-140">
              <SelectValue placeholder="스킬" className="truncate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="truncate">전체</SelectItem>
              {tempSkills.map(option => (
                <SelectItem
                  key={option.skill_id}
                  value={option.skill_id + ''}
                  className="truncate"
                >
                  [{option.skill_id}]{option.skill_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center">
          <Label className="pr-[15px] whitespace-nowrap">발신번호</Label>
          <CustomInput
            type="text"
            value={callNumber}
            onChange={(e) => setCallNumber(e.target.value)}
            className="w-[180px] w-use-140 truncate"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 items-center">
        <CommonButton onClick={onHeaderSearch}>조회</CommonButton>
      </div>
    </div>
  );
}
