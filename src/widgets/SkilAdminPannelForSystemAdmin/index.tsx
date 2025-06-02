// src/widgets/panels/SkilAdminPannelForSystemAdmin/index.tsx
"use client";

import { useEffect } from "react";
import { useApiForGetTenants } from "@/shared/hooks/tenant/useApiGetTenantsForSystemAdmin";
import { useStoreForTenantDataForSystemAdmin } from "@/shared/store/useStoreForTenantDataForSystemAdmin";

import { CommonTabsWithHeadless } from "@/shared/ui/Tabs/CommonTabsWithHeadless";
import ITenantSkillsForSystemAdmin from "./component/tabs/ITenantSkillsForSystemAdmin";
import CounselorSkillsForSystemAdmin from "./component/tabs/CounselorSkillsForSystemAdmin";
import CampaignSkillsForSystemAdmin from "./component/tabs/CampaignSkillsForSystemAdmin";

export default function SkilAdminPannelForSystemAdmin() {
  // const { data, isLoading, error } = useApiForGetTenants();
  const { data, isLoading, error } =
    useApiForGetTenants({
      request: {
        sort: {
          tenant_id: 1, // 내림차순
        },
      },
    });


  const { setTenants, setLoading, setError } = useStoreForTenantDataForSystemAdmin();

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (data?.result_data) {
      setTenants(data.result_data);
    }
  }, [data, setTenants]);

  useEffect(() => {
    if (error) {
      setError(error);
    }
  }, [error]);

  const tabs = [
    { label: "테넌트 스킬 관리", content: <ITenantSkillsForSystemAdmin /> },
    { label: "캠페인 스킬 관리", content: <CampaignSkillsForSystemAdmin /> },
    { label: "상담원 스킬 관리", content: <CounselorSkillsForSystemAdmin /> },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">스킬 관리</h1>
      <CommonTabsWithHeadless tabs={tabs} />
    </div>
  );
}
