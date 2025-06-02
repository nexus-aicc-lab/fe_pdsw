"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import { Label } from "@/components/ui/label";
import { useMainStore } from "@/store";
import { useEffect, useState } from "react";

type Props = {
  tenantId?: string;
  onChange: (tenantId: number) => void;
};

const ISelectorForTeanantForCreateNewCampaign = ({ tenantId, onChange }: Props) => {
  const { tenants } = useMainStore();

  // 내부 상태 추가
  const [selectedTenantId, setSelectedTenantId] = useState<string>(tenantId || "");

  // props로 받은 tenantId가 변경되면 내부 상태도 업데이트
  useEffect(() => {
    if (tenantId !== undefined && tenantId !== selectedTenantId) {
      setSelectedTenantId(tenantId);
    }
  }, [tenantId]);

  const handleChange = (value: string) => {
    setSelectedTenantId(value);
    onChange(Number(value));
  };

  return (
    <div className="flex items-center gap-2">
      <Label className="w-[74px] min-w-[74px]">테넌트</Label>
      <Select
        onValueChange={handleChange}
        value={selectedTenantId}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="테넌트를 선택해 주세요" />
        </SelectTrigger>
        <SelectContent>
          {tenants.map(option => (
            <SelectItem key={option.tenant_id} value={option.tenant_id.toString()}>
              {option.tenant_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ISelectorForTeanantForCreateNewCampaign;