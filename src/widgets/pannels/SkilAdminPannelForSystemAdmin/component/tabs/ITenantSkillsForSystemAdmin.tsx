// src/widgets/panels/TenantAdmin/components/ITenantSkillsForSystemAdmin.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useStoreForTenantDataForSystemAdmin } from "@/shared/store/useStoreForTenantDataForSystemAdmin";
import { SkillItemForSystemAdmin } from "@/shared/api/skill/apiForGetSkillListForSystemAdmin";
import { useApiForGetSkillListForSystemAdmin } from "@/shared/hooks/skill/useApiForGetSkillListForSystemAdmin";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient } from "@tanstack/react-query";
import IDialogButtonForSkilMasterForSystemAdmin from "../IDialogButtonForSkilMasterForSystemAdmin";

const ITenantSkillsForSystemAdmin = () => {
  const queryClient = useQueryClient();
  const tenants = useStoreForTenantDataForSystemAdmin((state) => state.tenants);
  const [selectedTenantIds, setSelectedTenantIds] = useState<number[]>([]);

  const tenantIds = useMemo(() => tenants.map((t) => t.tenant_id), [tenants]);

  const { data: skillData } = useApiForGetSkillListForSystemAdmin({
    request: {
      // filter: { 
      //   tenant_id: tenantIds, 
      //   skill_id: { start: 0, end: 99999 } 
      // },
      page: { index: 1, items: 9999 },
    },
    enabled: tenantIds.length > 0,
  });

  const groupedSkillsByTenantId = useMemo(() => {
    const grouped: Record<number, string[]> = {};
    skillData?.result_data.forEach((skill: SkillItemForSystemAdmin) => {
      if (!grouped[skill.tenant_id]) grouped[skill.tenant_id] = [];
      grouped[skill.tenant_id].push(skill.skill_name);
    });
    return grouped;
  }, [skillData]);

  const handleToggleTenant = (tenantId: number) => {
    setSelectedTenantIds((prev) =>
      prev.includes(tenantId)
        ? prev.filter((id) => id !== tenantId)
        : [...prev, tenantId]
    );
  };

  const handleToggleAll = () => {
    setSelectedTenantIds(
      selectedTenantIds.length === tenantIds.length ? [] : tenantIds
    );
  };

  // 공통으로 사용할 옵션 리스트
  const tenantOptions = tenants.map((t) => ({
    label: t.tenant_name,
    value: t.tenant_id,
  }));

  return (
    <div className="border rounded-md overflow-hidden">
      {/* 상단 헤더: 제목과 스킬 추가 버튼 */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b">
        <h2 className="text-sm font-medium text-gray-700">테넌트 스킬 관리</h2>
        <IDialogButtonForSkilMasterForSystemAdmin
          tenantOptions={tenantOptions}
          onSuccess={() =>
            queryClient.invalidateQueries({ queryKey: ["skillListForSystemAdmin"] })
          }
        />
      </div>

      {/* 테이블 */}
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border w-4 text-center">
              <Checkbox
                checked={selectedTenantIds.length === tenantIds.length}
                onCheckedChange={handleToggleAll}
              />
            </th>
            <th className="p-2 border w-[80px] text-xs text-gray-500">ID</th>
            <th className="p-2 border w-[200px]">Tenant Name</th>
            <th className="p-2 border">Skill List</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => (
            <tr key={tenant.tenant_id} className="border-t">
              <td className="p-2 border text-center">
                <Checkbox
                  checked={selectedTenantIds.includes(tenant.tenant_id)}
                  onCheckedChange={() => handleToggleTenant(tenant.tenant_id)}
                />
              </td>
              <td className="p-2 border text-xs text-gray-500">
                {tenant.tenant_id}
              </td>
              <td className="p-2 border">{tenant.tenant_name}</td>
              <td className="p-2 border">
                <div className="flex flex-wrap gap-2">
                  {(groupedSkillsByTenantId[tenant.tenant_id] ?? []).map(
                    (skillName, i) => (
                      <span
                        key={i}
                        className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded"
                      >
                        {skillName}
                      </span>
                    )
                  )}
                  {!(groupedSkillsByTenantId[tenant.tenant_id] ?? []).length && (
                    <span className="text-gray-500 text-xs">
                      등록된 스킬 없음
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ITenantSkillsForSystemAdmin;
