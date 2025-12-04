"use client";
// components/main/CampaignManager.tsx
import React, { useEffect, useState } from 'react';
import { useMainStore, useAuthStore } from '@/store';
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

export interface CampaignGroupHeaderSearch {
  tenantId: number;
  campaignGroupName: string;
}

type Props = {
  groupId: number;
  onSearch: (param: CampaignGroupHeaderSearch) => void;
}

export default function CampaignGroupManagerHeader({ groupId, onSearch }: Props) {
  const { tenants } = useMainStore();
  const [tenantId, setTenantId] = useState('all'); // 테넌트
  const [campaignGroupName, setCampaignGroupName] = useState(''); // 캠페인이름
  const [readonly, setReadonly] = useState(false);
  const { tenant_id } = useAuthStore();
  const [isTenantManager, setIsTenantManager] = useState(false);

  const onHeaderSearch = () => {
    const param: CampaignGroupHeaderSearch = {
      tenantId: tenantId === 'all' ? -1 : Number(tenantId),
      campaignGroupName: campaignGroupName,
    }
    onSearch(param);
  }

  useEffect(() => {
    if (tenant_id !== 0) {
      setTenantId(tenant_id + ''); // 첫 번째 항목 자동 선택
      setIsTenantManager(true); // 드롭다운 비활성화
    } else {
      setIsTenantManager(false); // 드롭다운 활성화
    }
  }, [tenants, tenant_id]);

  return (
    <div className="flex title-background justify-between">
      <div className="flex gap-[40px] items-center">
        <div className="flex items-center gap-1r">
          <Label className="pr-[15px]">테넌트</Label>
          <Select defaultValue="all" value={tenant_id !== 0 ? tenant_id.toString() : tenantId} onValueChange={setTenantId} disabled={isTenantManager}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="테넌트" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>전체</SelectItem>
              {tenants.map(option => (
                <SelectItem key={option.tenant_id} value={option.tenant_id + ''}>{option.tenant_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center">
          <Label className="pr-[15px] whitespace-nowrap flex-shrink-0">캠페인 그룹명</Label>
          <CustomInput
            type="text"
            value={campaignGroupName}
            onChange={(e) => setCampaignGroupName(e.target.value)}
            className="w-[180px]"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {groupId < 0 &&
          <CommonButton onClick={onHeaderSearch}>조회</CommonButton>
        }
      </div>
      {/* ... 나머지 필드들 ... */}
    </div>
  );
}