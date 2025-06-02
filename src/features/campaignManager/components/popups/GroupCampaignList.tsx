// "use client";

// import React, { useState, useEffect, useMemo } from 'react';
// import CommonCheckBox2 from "@/components/shared/CommonCheckBox2";
// import { useCampainManagerStore } from '@/store';

// interface GroupCampaign {
//   campaign_id: number;
//   tenant_id?: number;
//   group_id: number;
//   skill_id?: number[];
// }

// interface Props {
//   isLoading: boolean;
//   groupCampaigns: GroupCampaign[];
//   toggleAllGroupCampaigns: (checked: boolean, selectedIds: number[]) => void;
// }

// const GroupCampaignList: React.FC<Props> = ({
//   isLoading,
//   groupCampaigns = [],
//   toggleAllGroupCampaigns
// }) => {
//   const [selectedRows, setSelectedRows] = useState<number[]>([]);
//   const { skills: dataForSkilMaster } = useCampainManagerStore();

//   console.log("dataForSkilMaster :: ", dataForSkilMaster);
//   console.log("groupCampaigns :: ", groupCampaigns);
  
  
//   // 초기에 모든 캠페인 선택 상태 제거 (새로 선택 가능하도록)
//   useEffect(() => {
//     if (groupCampaigns.length > 0) {
//       setSelectedRows([]);
//       // 부모 컴포넌트에 선택 상태 초기화 알림
//       toggleAllGroupCampaigns(false, []);
//     } else {
//       setSelectedRows([]);
//     }
//   }, [groupCampaigns]);

//   // 전체 선택 상태 계산
//   const allSelected = useMemo(() => {
//     return groupCampaigns.length > 0 && selectedRows.length === groupCampaigns.length;
//   }, [groupCampaigns, selectedRows]);
  
//   // 부분 선택 상태 계산
//   const hasPartialSelection = useMemo(() => {
//     return selectedRows.length > 0 && selectedRows.length < groupCampaigns.length;
//   }, [groupCampaigns, selectedRows]);

//   // 개별 행 토글
//   const toggleRow = (campaignId: number) => {
//     const isSelected = selectedRows.includes(campaignId);
//     const newSelection = isSelected
//       ? selectedRows.filter(id => id !== campaignId)
//       : [...selectedRows, campaignId];
    
//     setSelectedRows(newSelection);
//     // 부모 컴포넌트에 알림 - 선택된 ID 목록 전달
//     toggleAllGroupCampaigns(newSelection.length > 0, newSelection);
//   };

//   // 모든 행 토글
//   const toggleAllRows = (checked: boolean) => {
//     const newSelection = checked ? groupCampaigns.map(item => item.campaign_id) : [];
//     setSelectedRows(newSelection);
//     // 부모 컴포넌트에 알림 - 선택된 ID 목록 전달
//     toggleAllGroupCampaigns(checked, newSelection);
//   };

//   if (isLoading) {
//     return <div className="flex items-center justify-center h-full text-sm">로딩 중...</div>;
//   }

//   if (groupCampaigns.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-full text-gray-500 text-sm">
//         그룹에 속한 캠페인이 없습니다.
//       </div>
//     );
//   }

//   return (
//     <div className="overflow-y-auto"  style={{ height: '340px' }}>
//       <div className="flex-1 overflow-auto" style={{ paddingBottom: '20px' }}>
//         <table className="w-full border-collapse table-fixed text-xs">
//           <thead>
//             <tr className="bg-gray-50 border-b sticky top-0 z-10">
//               <th className="w-12  px-2 text-center border-r align-bottom" style={{ height: '30px',  }}>
//                 <CommonCheckBox2
//                   checked={allSelected}
//                   indeterminate={hasPartialSelection}
//                   onChange={toggleAllRows}
//                   title="전체 선택"
//                 />
//               </th>
//               <th className="text-left px-2 font-medium text-[#333] border-r" style={{ height: '30px' }}>캠페인 아이디</th>
//               <th className="text-left px-2 font-medium text-[#333] border-r" style={{ height: '30px' }}>캠페인 이름</th>
//               <th className="text-left px-2 font-medium text-[#333] border-r" style={{ height: '30px' }}>스킬 아이디</th>
//               <th className="text-left px-2 font-medium text-[#333]" style={{ height: '30px' }}>스킬명</th>
//             </tr>
//           </thead>
//           <tbody>
//             {groupCampaigns.map((campaign) => (
//               <tr 
//                 key={`campaign-${campaign.campaign_id}`}
//                 className="border-b bg-white hover:bg-[#FFFAEE]"
//               >
//                 <td className="px-2 align-middle text-center" style={{ height: '30px' }}>
//                   <CommonCheckBox2
//                     checked={selectedRows.includes(campaign.campaign_id)}
//                     onChange={() => toggleRow(campaign.campaign_id)}
//                   />
//                 </td>
//                 <td className="px-2 align-middle font-medium" style={{ height: '30px' }}>{campaign.campaign_id}</td>
//                 <td className="px-2 align-middle text-blue-700" style={{ height: '30px' }}>{`캠페인 ${campaign.campaign_id}`}</td>
//                 <td className="px-2 align-middle" style={{ height: '30px' }}>14</td>
//                 <td className="px-2 align-middle" style={{ height: '30px' }}>스킬1</td>
//               </tr>
//             ))}
//             {/* 마지막 행 이후 추가 여백을 위한 빈 행 */}
//             {/* <tr>
//               <td colSpan={5} className="h-16"></td>
//             </tr> */}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default GroupCampaignList;

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import CommonCheckBox2 from "@/components/shared/CommonCheckBox2";
import { useCampainManagerStore } from '@/store';
import { useMainStore } from '@/store';

interface GroupCampaign {
  campaign_id: number;
  campaign_name?: string;
  tenant_id?: number;
  group_id: number;
  skill_id?: number[];
}

interface Props {
  isLoading: boolean;
  groupCampaigns: GroupCampaign[];
  toggleAllGroupCampaigns: (checked: boolean, selectedIds: number[]) => void;
  campaignListData?: {
    result_data: {
      campaign_id: number;
      campaign_name: string;
      campaign_desc: string;
      tenant_id: number;
    }[];
  };
}

const GroupCampaignList: React.FC<Props> = ({
  isLoading,
  groupCampaigns = [],
  toggleAllGroupCampaigns,
  campaignListData
}) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const { skills: dataForSkilMaster } = useCampainManagerStore();
  const { campaignSkills } = useMainStore();

  console.log("dataForSkilMaster :: ", dataForSkilMaster);
  console.log("groupCampaigns :: ", groupCampaigns);
  console.log("campaignSkills :: ", campaignSkills);
  console.log("campaignListData :: ", campaignListData);
  
  // 캠페인 ID로 해당 캠페인이 속한 스킬들을 찾는 함수
  const getSkillsForCampaign = (campaignId: number) => {
    if (!campaignSkills || campaignSkills.length === 0) {
      return { displaySkillIds: '-', displaySkillNames: '-' };
    }

    // campaignSkills에서 해당 캠페인이 포함된 스킬들을 찾기
    const belongingSkills = campaignSkills.filter(skillData => 
      Array.isArray(skillData.campaign_id) && skillData.campaign_id.includes(campaignId)
    );

    if (belongingSkills.length === 0) {
      return { displaySkillIds: '-', displaySkillNames: '-' };
    }

    const skillInfos = belongingSkills.map(skillData => {
      const skill = dataForSkilMaster?.find(skill => skill.skill_id === skillData.skill_id);
      return {
        id: skillData.skill_id,
        name: skill?.skill_name || `스킬${skillData.skill_id}`
      };
    });

    return {
      displaySkillIds: skillInfos.map(info => info.id).join(', '),
      displaySkillNames: skillInfos.map(info => info.name).join(', ')
    };
  };

  // 캠페인 ID로 캠페인 이름을 찾는 함수
  const getCampaignName = (campaignId: number) => {
    if (!campaignListData?.result_data) {
      return `캠페인 ${campaignId}`;
    }
    
    const campaign = campaignListData.result_data.find(c => c.campaign_id === campaignId);
    return campaign?.campaign_name || `캠페인 ${campaignId}`;
  };
  
  // 초기에 모든 캠페인 선택 상태 제거 (새로 선택 가능하도록)
  useEffect(() => {
    if (groupCampaigns.length > 0) {
      setSelectedRows([]);
      // 부모 컴포넌트에 선택 상태 초기화 알림
      toggleAllGroupCampaigns(false, []);
    } else {
      setSelectedRows([]);
    }
  }, [groupCampaigns]);

  // 전체 선택 상태 계산
  const allSelected = useMemo(() => {
    return groupCampaigns.length > 0 && selectedRows.length === groupCampaigns.length;
  }, [groupCampaigns, selectedRows]);
  
  // 부분 선택 상태 계산
  const hasPartialSelection = useMemo(() => {
    return selectedRows.length > 0 && selectedRows.length < groupCampaigns.length;
  }, [groupCampaigns, selectedRows]);

  // 개별 행 토글
  const toggleRow = (campaignId: number) => {
    const isSelected = selectedRows.includes(campaignId);
    const newSelection = isSelected
      ? selectedRows.filter(id => id !== campaignId)
      : [...selectedRows, campaignId];
    
    setSelectedRows(newSelection);
    // 부모 컴포넌트에 알림 - 선택된 ID 목록 전달
    toggleAllGroupCampaigns(newSelection.length > 0, newSelection);
  };

  // 모든 행 토글
  const toggleAllRows = (checked: boolean) => {
    const newSelection = checked ? groupCampaigns.map(item => item.campaign_id) : [];
    setSelectedRows(newSelection);
    // 부모 컴포넌트에 알림 - 선택된 ID 목록 전달
    toggleAllGroupCampaigns(checked, newSelection);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-sm">로딩 중...</div>;
  }

  if (groupCampaigns.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        그룹에 속한 캠페인이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-y-auto"  style={{ height: '340px' }}>
      <div className="flex-1 overflow-auto" style={{ paddingBottom: '20px' }}>
        <table className="w-full border-collapse table-fixed text-xs">
          <thead>
            <tr className="bg-gray-50 border-b sticky top-0 z-10">
              <th className="w-12  px-2 text-center border-r align-bottom" style={{ height: '30px',  }}>
                <CommonCheckBox2
                  checked={allSelected}
                  indeterminate={hasPartialSelection}
                  onChange={toggleAllRows}
                  title="전체 선택"
                />
              </th>
              <th className="text-left px-2 font-medium text-[#333] border-r" style={{ height: '30px' }}>캠페인 아이디</th>
              <th className="text-left px-2 font-medium text-[#333] border-r" style={{ height: '30px' }}>캠페인 이름</th>
              <th className="text-left px-2 font-medium text-[#333] border-r" style={{ height: '30px' }}>스킬 아이디</th>
              <th className="text-left px-2 font-medium text-[#333]" style={{ height: '30px' }}>스킬명</th>
            </tr>
          </thead>
          <tbody>
            {groupCampaigns.map((campaign) => {
              const { displaySkillIds, displaySkillNames } = getSkillsForCampaign(campaign.campaign_id);
              
              return (
                <tr 
                  key={`campaign-${campaign.campaign_id}`}
                  className="border-b bg-white hover:bg-[#FFFAEE]"
                >
                  <td className="px-2 align-middle text-center" style={{ height: '30px' }}>
                    <CommonCheckBox2
                      checked={selectedRows.includes(campaign.campaign_id)}
                      onChange={() => toggleRow(campaign.campaign_id)}
                    />
                  </td>
                  <td className="px-2 align-middle font-medium" style={{ height: '30px' }}>{campaign.campaign_id}</td>
                  <td className="px-2 align-middle text-blue-700" style={{ height: '30px' }}>{campaign.campaign_name}</td>
                  <td className="px-2 align-middle" style={{ height: '30px' }}>{displaySkillIds}</td>
                  <td className="px-2 align-middle" style={{ height: '30px' }}>{displaySkillNames}</td>
                </tr>
              );
            })}
            {/* 마지막 행 이후 추가 여백을 위한 빈 행 */}
            {/* <tr>
              <td colSpan={5} className="h-16"></td>
            </tr> */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupCampaignList;