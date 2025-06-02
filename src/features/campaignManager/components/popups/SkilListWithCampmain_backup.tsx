// "use client";

// import React from "react";
// import { ChevronDown, ChevronRight } from "lucide-react";
// import CommonCheckBox2 from "@/components/shared/CommonCheckBox2";

// interface SkillWithCampaigns {
//   skillId: number;
//   campaigns: { campaignId: number; tenantId: number }[];
// }

// interface Props {
//   filteredSkills: SkillWithCampaigns[];
//   expandedSkills: number[];
//   selectedLeftCampaigns: number[];
//   isLoading: boolean;
//   hasError: boolean;
//   toggleSkill: (skillId: number) => void;
//   toggleLeftCampaignSelection: (campaignId: number) => void;
//   toggleAllCampaigns: (checked: boolean) => void;
//   getCampaignName: (campaignId: number) => string;
//   getSkillName: (skillId: number) => string;
// }

// const ITableForSkillListWithCampaign: React.FC<Props> = ({
//   filteredSkills = [],
//   expandedSkills = [],
//   selectedLeftCampaigns = [],
//   isLoading,
//   hasError,
//   toggleSkill,
//   toggleLeftCampaignSelection,
//   toggleAllCampaigns,
//   getCampaignName,
//   getSkillName,
// }) => {
//   // Calculate if all visible campaigns are selected
//   const allCampaignsCount = filteredSkills.reduce(
//     (count, skill) => count + skill.campaigns.length,
//     0
//   );
  
//   const allVisibleCampaignIds = filteredSkills.flatMap(skill => 
//     skill.campaigns.map(campaign => campaign.campaignId)
//   );
  
//   const allSelected = allCampaignsCount > 0 && 
//     allVisibleCampaignIds.every(id => selectedLeftCampaigns.includes(id));

//   return (
//     <div className="flex flex-col h-full">
//       {isLoading ? (
//         <div className="flex items-center justify-center h-full text-sm">로딩 중...</div>
//       ) : hasError ? (
//         <div className="flex items-center justify-center h-full text-red-500 text-sm">
//           데이터 로드 중 오류 발생
//         </div>
//       ) : filteredSkills.length === 0 ? (
//         <div className="flex items-center justify-center h-full text-gray-500 text-sm">
//           검색 결과가 없습니다.
//         </div>
//       ) : (
//         <div className="flex-1 overflow-auto" style={{ paddingBottom: '20px' }}>
//           <table className="w-full border-collapse table-fixed text-xs">
//             <thead>
//               <tr className="bg-white border-b sticky top-0 z-10">
//                 <th className="w-8 py-1 px-2 text-center">
//                   <CommonCheckBox2
//                     checked={allSelected}
//                     onChange={toggleAllCampaigns}
//                     title="전체 선택"
//                   />
//                 </th>
//                 <th className="text-left py-1 px-2 font-medium">스킬</th>
//                 <th className="text-left py-1 px-2 font-medium w-1/4">캠페인ID</th>
//                 <th className="text-left py-1 px-2 font-medium w-1/2">캠페인 이름</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredSkills.map((skill) => {
//                 const isExpanded = expandedSkills.includes(skill.skillId);
//                 return (
//                   <React.Fragment key={`skill-${skill.skillId}`}>
//                     {/* 스킬 행 */}
//                     <tr className={`border-b ${isExpanded ? "bg-blue-100" : "bg-blue-50"}`}>
//                       <td className="py-1 px-2 align-middle text-center">
//                         {/* 스킬 레벨에는 체크박스 없음 */}
//                       </td>
//                       <td className="py-1 px-2 align-middle cursor-pointer" onClick={() => toggleSkill(skill.skillId)}>
//                         <div className="flex items-center">
//                           {isExpanded ? (
//                             <ChevronDown size={14} className="mr-1 flex-shrink-0" />
//                           ) : (
//                             <ChevronRight size={14} className="mr-1 flex-shrink-0" />
//                           )}
//                           <span className="font-medium">{getSkillName(skill.skillId)}</span>
//                         </div>
//                       </td>
//                       <td className="py-1 px-2 align-middle"></td>
//                       <td className="py-1 px-2 align-middle"></td>
//                     </tr>

//                     {/* 캠페인 목록 (확장 시 표시) */}
//                     {isExpanded &&
//                       (skill.campaigns ?? []).map((campaign) => (
//                         <tr
//                           key={`campaign-${skill.skillId}-${campaign.campaignId}`}
//                           className="border-b bg-white hover:bg-gray-50"
//                         >
//                           <td className="py-1 px-2 align-middle text-center">
//                             <CommonCheckBox2
//                               checked={selectedLeftCampaigns.includes(campaign.campaignId)}
//                               onChange={() => toggleLeftCampaignSelection(campaign.campaignId)}
//                             />
//                           </td>
//                           <td className="py-1 px-2 align-middle text-gray-600">
//                             <div className="pl-5">{getSkillName(skill.skillId)}</div>
//                           </td>
//                           <td className="py-1 px-2 align-middle">{campaign.campaignId}</td>
//                           <td className="py-1 px-2 align-middle text-blue-600">
//                             {getCampaignName(campaign.campaignId)}
//                           </td>
//                         </tr>
//                       ))}
//                   </React.Fragment>
//                 );
//               })}
//               {/* 마지막 행 이후 추가 여백을 위한 빈 행 */}
//               <tr>
//                 <td colSpan={4} className="h-16"></td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ITableForSkillListWithCampaign;

"use client";

import React, { useMemo } from "react";
import DataGrid from "react-data-grid";
import { ChevronDown, ChevronRight } from "lucide-react";
import 'react-data-grid/lib/styles.css';

interface SkillWithCampaigns {
  skillId: number;
  campaigns: { campaignId: number; tenantId: number }[];
}

interface TreeRow {
  id: string;
  level: number;
  isExpanded?: boolean;
  skillId: number;
  skillName: string;
  campaignId?: number;
  campaignName?: string;
  tenantId?: number;
}

interface Props {
  filteredSkills: SkillWithCampaigns[];
  expandedSkills: number[];
  selectedLeftCampaigns: number[];
  isLoading: boolean;
  hasError: boolean;
  toggleSkill: (skillId: number) => void;
  toggleLeftCampaignSelection: (campaignId: number) => void;
  toggleAllCampaigns: (checked: boolean) => void;
  getCampaignName: (campaignId: number) => string;
  getSkillName: (skillId: number) => string;
}

const ITableForSkillListWithCampaign: React.FC<Props> = ({
  filteredSkills = [],
  expandedSkills = [],
  selectedLeftCampaigns = [],
  isLoading,
  hasError,
  toggleSkill,
  toggleLeftCampaignSelection,
  toggleAllCampaigns,
  getCampaignName,
  getSkillName,
}) => {
  // Calculate if all visible campaigns are selected
  const allCampaignsCount = filteredSkills.reduce(
    (count, skill) => count + skill.campaigns.length, 0
  );
  
  const allVisibleCampaignIds = filteredSkills.flatMap(skill => 
    skill.campaigns.map(campaign => campaign.campaignId)
  );
  
  const allSelected = allCampaignsCount > 0 && 
    allVisibleCampaignIds.every(id => selectedLeftCampaigns.includes(id));
    
  // Custom checkbox component to match UI styling
  const CustomCheckbox = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => {
    return (
      <div 
        className="flex justify-center items-center h-full cursor-pointer"
        onClick={onChange}
      >
        <div className={`w-4 h-4 flex items-center justify-center border ${checked ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'} rounded`}>
          {checked && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
            </svg>
          )}
        </div>
      </div>
    );
  };

  // Create tree data for DataGrid with unique keys
  const treeData = useMemo(() => {
    const rows: TreeRow[] = [];
    
    filteredSkills.forEach(skill => {
      const isExpanded = expandedSkills.includes(skill.skillId);
      
      // Add skill row (parent)
      rows.push({
        id: `skill-${skill.skillId}`,
        level: 0,
        isExpanded,
        skillId: skill.skillId,
        skillName: getSkillName(skill.skillId),
        campaignName: "" // Empty for parent rows
      });
      
      // Add campaign rows (children) if expanded
      if (isExpanded) {
        skill.campaigns.forEach((campaign, index) => {
          // Create a unique ID by combining skillId, campaignId and index
          rows.push({
            id: `skill-${skill.skillId}-campaign-${campaign.campaignId}-${index}`,
            level: 1,
            skillId: skill.skillId,
            skillName: getSkillName(skill.skillId),
            campaignId: campaign.campaignId,
            campaignName: getCampaignName(campaign.campaignId),
            tenantId: campaign.tenantId
          });
        });
      }
    });
    
    return rows;
  }, [filteredSkills, expandedSkills, getCampaignName, getSkillName]);

  // Define columns for DataGrid with custom checkbox
  const columns = [
    {
      key: 'selection',
      name: '',
      width: 35,
      headerRenderer: () => (
        <div className="flex justify-center items-center h-full">
          <CustomCheckbox
            checked={allSelected}
            onChange={() => toggleAllCampaigns(!allSelected)}
          />
        </div>
      ),
      renderCell: ({ row }: { row: TreeRow }) => {
        // Only show checkboxes for campaign rows (level 1)
        if (row.level === 0) {
          return <div></div>;
        }
        
        const isRowSelected = row.campaignId && selectedLeftCampaigns.includes(row.campaignId);
        return (
          <div className="flex justify-center items-center h-full">
            <CustomCheckbox
              checked={!!isRowSelected}
              onChange={() => row.campaignId && toggleLeftCampaignSelection(row.campaignId)}
            />
          </div>
        );
      }
    },
    {
      key: 'skillName',
      name: '스킬',
      width: 150,
      renderCell: ({ row }: { row: TreeRow }) => {
        if (row.level === 0) {
          return (
            <div 
              className="flex items-center cursor-pointer font-medium" 
              onClick={(e) => {
                e.stopPropagation();
                toggleSkill(row.skillId);
              }}
            >
              {row.isExpanded ? (
                <ChevronDown size={14} className="mr-1 flex-shrink-0" />
              ) : (
                <ChevronRight size={14} className="mr-1 flex-shrink-0" />
              )}
              <span>{row.skillName}</span>
            </div>
          );
        }
        
        return (
          <div className="text-gray-600 pl-5">
            {row.skillName}
          </div>
        );
      }
    },
    { 
      key: 'campaignId', 
      name: '캠페인ID',
      width: 120,
      renderCell: ({ row }: { row: TreeRow }) => {
        return row.level === 0 ? null : row.campaignId;
      }
    },
    { 
      key: 'campaignName', 
      name: '캠페인 이름',
      width: 200,
      renderCell: ({ row }: { row: TreeRow }) => {
        return row.level === 0 ? null : (
          <span className="text-blue-600">{row.campaignName}</span>
        );
      }
    }
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-sm">로딩 중...</div>;
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 text-sm">
        데이터 로드 중 오류 발생
      </div>
    );
  }

  if (filteredSkills.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DataGrid
        columns={columns}
        rows={treeData}
        className="text-xs border-none h-full"
        rowKeyGetter={(row) => row.id}
        onCellClick={({ row, column }) => {
          if (row.level === 0 && column.key === 'skillName') {
            toggleSkill(row.skillId);
          }
        }}
        rowHeight={30}
        headerRowHeight={30}
        enableVirtualization={false}
        rowClass={(row) => 
          row.level === 0 
            ? (row.isExpanded ? 'bg-blue-100' : 'bg-blue-50') 
            : 'bg-white hover:bg-gray-50'
        }
      />
      {/* Add empty row at bottom for padding */}
      <div className="h-16"></div>
    </div>
  );
};

export default ITableForSkillListWithCampaign;