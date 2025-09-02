// "use client";

// import { useMemo, useState } from "react";
// import { Folder, Building2, Target } from "lucide-react";
// import { useStoreForTenantDataForSystemAdmin } from "@/shared/store/useStoreForTenantDataForSystemAdmin";
// import { useApiForCampaignListForSystemAdmin } from "@/shared/hooks/campaign/useApiForCampaignListForSystemAdmin";
// import { Tree, TreeNodeType } from "./Tree";

// interface Campaign {
//   campaign_id: number;
//   campaign_name: string;
//   tenant_id: number;
// }

// export const TreeRoot = () => {
//   const { tenants } = useStoreForTenantDataForSystemAdmin();
//   const { data: campaignData, isLoading } = useApiForCampaignListForSystemAdmin();
  
//   // State for tracking checked items
//   const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

//   // 테넌트별로 캠페인 그룹핑
//   const groupedCampaigns = useMemo(() => {
//     if (!campaignData?.result_data) return {};
//     return campaignData.result_data.reduce<Record<number, Campaign[]>>((acc, c) => {
//       (acc[c.tenant_id] ??= []).push(c);
//       return acc;
//     }, {});
//   }, [campaignData]);

//   // TreeNodeType 배열로 변환 (root → tenant → campaign)
//   const treeData: TreeNodeType[] = useMemo(() => {
//     const tenantsNodes: TreeNodeType[] = tenants.map((t) => ({
//       id: `tenant-${t.tenant_id}`,
//       label: `[${t.tenant_id}] ${t.tenant_name}`,
//       icon: <Building2 className="w-4 h-4 text-sky-600" />,
//       data: t,
//       children: (groupedCampaigns[t.tenant_id] || []).map((c) => ({
//         id: `campaign-${c.campaign_id}`,
//         label: `[${c.campaign_id}] ${c.campaign_name}`,
//         icon: <Target className="w-4 h-4 text-gray-600" />,
//         data: c,
//       })),
//     }));

//     return [
//       {
//         id: "nexus-root",
//         label: "Nexus",
//         icon: <Folder className="w-5 h-5 text-yellow-600" />,
//         children: tenantsNodes,
//       },
//     ];
//   }, [tenants, groupedCampaigns]);

//   // 체크 상태 변경 핸들러
//   const handleCheckChange = (newCheckedIds: Set<string>) => {
//     setCheckedIds(newCheckedIds);
    
//     // Here you can add logic to handle the checked items
//     // For example, you might want to extract the selected campaigns or tenants:
//     const selectedCampaignIds = Array.from(newCheckedIds)
//       .filter(id => id.startsWith('campaign-'))
//       .map(id => parseInt(id.replace('campaign-', '')));
    
//     const selectedTenantIds = Array.from(newCheckedIds)
//       .filter(id => id.startsWith('tenant-'))
//       .map(id => parseInt(id.replace('tenant-', '')));
    
//     console.log('Selected campaigns:', selectedCampaignIds);
//     console.log('Selected tenants:', selectedTenantIds);
//   };

//   if (isLoading) {
//     return (
//       <div className="p-4 text-center text-blue-500">
//         캠페인 데이터를 불러오는 중...
//       </div>
//     );
//   }

//   return (
//     <div>
//       <Tree
//         nodes={treeData}
//         onSelect={(node) => console.log("선택된 객체:", node.data)}
//         checkedIds={checkedIds}
//         onCheckChange={handleCheckChange}
//       />
      
//       {/* 선택된 항목 표시 (디버깅 용도) */}
//       <div className="mt-4 p-2 border-t pt-4">
//         <h3 className="font-medium text-gray-700">선택된 항목: {checkedIds.size}개</h3>
//         <div className="mt-2 text-sm text-gray-600">
//           {Array.from(checkedIds).map(id => (
//             <div key={id}>{id}</div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

"use client";

import { useMemo, useState } from "react";
import { Folder, Building2, Target } from "lucide-react";
import { useStoreForTenantDataForSystemAdmin } from "@/shared/store/useStoreForTenantDataForSystemAdmin";
import { useApiForCampaignListForSystemAdmin } from "@/shared/hooks/campaign/useApiForCampaignListForSystemAdmin";
import { Tree, TreeNodeType } from "./Tree";

interface Campaign {
  campaign_id: number;
  campaign_name: string;
  tenant_id: number;
}

export const TreeRoot = () => {
  const { tenants } = useStoreForTenantDataForSystemAdmin();
  const { data: campaignData, isLoading } = useApiForCampaignListForSystemAdmin();
  
  // State for tracking checked items
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  // State for displaying selected campaign IDs after confirmation
  const [confirmedCampaignIds, setConfirmedCampaignIds] = useState<number[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // 테넌트별로 캠페인 그룹핑
  const groupedCampaigns = useMemo(() => {
    if (!campaignData?.result_data) return {};
    return campaignData.result_data.reduce<Record<number, Campaign[]>>((acc, c) => {
      (acc[c.tenant_id] ??= []).push(c);
      return acc;
    }, {});
  }, [campaignData]);

  // TreeNodeType 배열로 변환 (root → tenant → campaign)
  const treeData: TreeNodeType[] = useMemo(() => {
    const tenantsNodes: TreeNodeType[] = tenants.map((t) => ({
      id: `tenant-${t.tenant_id}`,
      label: `[${t.tenant_id}] ${t.tenant_name}`,
      icon: <Building2 className="w-4 h-4 text-sky-600" />,
      data: t,
      children: (groupedCampaigns[t.tenant_id] || []).map((c) => ({
        id: `campaign-${c.campaign_id}`,
        label: `[${c.campaign_id}] ${c.campaign_name}`,
        icon: <Target className="w-4 h-4 text-gray-600" />,
        data: c,
      })),
    }));

    return [
      {
        id: "nexus-root",
        label: "Nexus",
        icon: <Folder className="w-5 h-5 text-yellow-600" />,
        children: tenantsNodes,
      },
    ];
  }, [tenants, groupedCampaigns]);

  // 체크 상태 변경 핸들러
  const handleCheckChange = (newCheckedIds: Set<string>) => {
    setCheckedIds(newCheckedIds);
    
    // Reset confirmation when selection changes
    if (showConfirmation) {
      setShowConfirmation(false);
    }
  };

  // 확인 버튼 클릭 핸들러
  const handleConfirmClick = () => {
    const selectedCampaignIds = Array.from(checkedIds)
      .filter(id => id.startsWith('campaign-'))
      .map(id => parseInt(id.replace('campaign-', '')));
    
    setConfirmedCampaignIds(selectedCampaignIds);
    setShowConfirmation(true);
    
    // console.log('Confirmed campaign IDs:', selectedCampaignIds);
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-blue-500">
        캠페인 데이터를 불러오는 중...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <button 
          onClick={handleConfirmClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          확인
        </button>
      </div>
      
      <Tree
        nodes={treeData}
        onSelect={(node) => {
          // console.log("선택된 객체:", node.data)
        }}
        checkedIds={checkedIds}
        onCheckChange={handleCheckChange}
      />
      
      {/* 확인 결과 표시 */}
      {showConfirmation && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="font-medium text-gray-800">선택된 캠페인 ID</h3>
          {confirmedCampaignIds.length > 0 ? (
            <div className="mt-2">
              <ul className="list-disc pl-5">
                {confirmedCampaignIds.map(id => (
                  <li key={id} className="text-gray-700">{id}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-gray-600">총 {confirmedCampaignIds.length}개의 캠페인이 선택되었습니다.</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-600">선택된 캠페인이 없습니다.</p>
          )}
        </div>
      )}
      
      {/* 디버깅용 선택 항목 표시 (필요시 주석 해제) */}
      {/*
      <div className="mt-4 p-2 border-t pt-4">
        <h3 className="font-medium text-gray-700">선택된 항목: {checkedIds.size}개</h3>
        <div className="mt-2 text-sm text-gray-600">
          {Array.from(checkedIds).map(id => (
            <div key={id}>{id}</div>
          ))}
        </div>
      </div>
      */}
    </div>
  );
};