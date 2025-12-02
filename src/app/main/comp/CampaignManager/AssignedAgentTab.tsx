"use client";

import React, { useState, useEffect } from 'react';
import DataGrid, { Column } from 'react-data-grid';
import { ChevronRight, ChevronDown } from 'lucide-react';
import 'react-data-grid/lib/styles.css';
import { CommonButton } from "@/components/shared/CommonButton";
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import { AdditionalInfoTabParam } from './CampaignManagerDetail';
import { useApiForCampaignAssignmentAgent } from '@/features/campaignManager/hooks/useApiForCampaignAssignmentAgent';
import ServerErrorCheck from '@/components/providers/ServerErrorCheck';
import { useEnvironmentStore } from '@/store/environmentStore';

interface ConsultingData {
  id: string;
  affiliationGroupId?: string;
  affiliationTeamId?: string;
  counselorEmplNum?: string;
  counselorId?: string;
  counselorname?: string;
}

interface TreeRow extends ConsultingData {
  parentId?: string;
  isExpanded?: boolean;
  level: number;
  hasChildren?: boolean;
  children?: TreeRow[];
}

const tempAdditionalInfoTab:AdditionalInfoTabParam = {
  changeYn: false,
  campaignInfoChangeYn: false,
  onSave: false,
  onClosed: false
};

type Props = {
  callCampaignMenu: string;
  campaignInfo: MainDataResponse;
  onHandleAdditionalInfoTabChange: (param:AdditionalInfoTabParam) => void;
}

const AssignedAgentTab: React.FC<Props> = ({callCampaignMenu,campaignInfo,onHandleAdditionalInfoTabChange}) => {
  const [initialData, setInitialData] = useState<TreeRow[]>([]);
  const { centerId } = useEnvironmentStore();
  const transformToTreeData = (counselors: any[]) => {
    const result: any[] = [];

    counselors.forEach((counselor) => {
        let group = result.find(group => group.affiliationGroupId === counselor.affiliationGroupId);
        if (!group) {
            group = {
                id: `group-${counselor.affiliationGroupId}`,
                level: 0,
                hasChildren: true,
                affiliationGroupId: counselor.affiliationGroupId,
                children: []
            };
            result.push(group);
        }

        let team = group.children.find((team: TreeRow) => team.affiliationTeamId === counselor.affiliationTeamId);
        if (!team) {
            team = {
                id: `team-${counselor.affiliationTeamId}`,
                parentId: group.id,
                level: 1,
                hasChildren: true,
                affiliationTeamId: counselor.affiliationTeamId,
                children: []
            };
            group.children.push(team);
        }
        // 상담사 그룹과 팀 아이디 표현을 위한 수정 0519
        team.children.push({
            id: team.parentId.split('group-')[1],
            parentId: (team.id).split('team-')[1],
            level: 2,
            counselorEmplNum: counselor.counselorEmplNum,
            counselorId: counselor.counselorId,
            counselorname: counselor.counselorname
        });
        group.children.sort((a: TreeRow, b: TreeRow) => a.id.localeCompare(b.id));
    });

    return result;
  };
  //할당상담사 정보 조회
  const { mutate: fetchCampaignAssignmentAgents } = useApiForCampaignAssignmentAgent({
    onSuccess: (data) => {
      const transformedData = transformToTreeData(data.assignedCounselorList);
      setInitialData(transformedData.sort((a, b) => a.id.localeCompare(b.id)));
    },
    onError: (error) => {
      ServerErrorCheck('할당상담사 정보 조회', error.message);
    }
  });
  
  useEffect(() => {
    if( initialData.length > 0){
      // const expandedRowIds = initialData.map(row => row.id);
      const expandedData = initialData.map(group => ({
        ...group,
        children: group.children?.map(team => ({
          ...team,
          children: team.children?.map(counselor => ({
            ...counselor,
            expanded: true  // Marking the counselors as expanded
          }))
        }))
      }));
      const expandedRowIds = new Set<string>();
      expandedData.forEach(group => {
        expandedRowIds.add(group.id);
        group.children?.forEach(team => {
          expandedRowIds.add(team.id);
          team.children?.forEach(counselor => {
            expandedRowIds.add(counselor.id);
          });
        });
      });
      setExpandedRows(expandedRowIds);
    }
  }, [initialData]);

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set([]));

  useEffect(() => {
    if (!(callCampaignMenu == 'NewCampaignManager') && campaignInfo && campaignInfo.campaign_id > 0 ) {  
      fetchCampaignAssignmentAgents({
        centerId: centerId,
        tenantId: campaignInfo.tenant_id+''
        , campaignId: campaignInfo.campaign_id+''
      });
    }
    setInitialData([]);
  }, [callCampaignMenu,campaignInfo]);

  const toggleRowExpand = (rowId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(rowId)) {
      newExpandedRows.delete(rowId);
    } else {
      newExpandedRows.add(rowId);
    }
    setExpandedRows(newExpandedRows);
  };

  function flattenRows(rows: TreeRow[]): TreeRow[] {
    let flat: TreeRow[] = [];
    if( rows.length > 0 ){
      rows.forEach((row) => {
        const isExpanded = expandedRows.has(row.id);
        flat.push({ ...row, isExpanded });
        
        if (row.children && isExpanded) {
          flat = flat.concat(flattenRows(row.children));
        }
      });
    }
    return flat;
  }

  // row level에 따라 다른 key를 반환해야 고유함
  const rowKeyGetter = (row: TreeRow): string => {
    switch (row.level) {
      case 0:
        return row.affiliationGroupId ?? '';
      case 1:
        return row.affiliationTeamId ?? '';
      default:
        return row.counselorId ?? '';
    }
  };

  const columns: Column<TreeRow>[] = [
    {
      key: 'groupName',
      name: '상담 그룹',
      width: 200,
      renderCell: ({ row }) => {
        const indent = row.level * 20;
        const showToggle = row.hasChildren;
        let displayName = '';

        if (row.level === 0) {
          displayName = `상담 그룹 : ${row.affiliationGroupId}`;
        } else if (row.level === 1) {
          displayName = `상담 팀 : ${row.affiliationTeamId}`;
        } else {
          displayName = row.id;
        }

        // row.level 0과 1을 제외하고 css 적용을 위한 boolean
        const isCentered = row.level > 1;

        return (
          <div style={{
          marginLeft: isCentered ? `0px`: `${indent}px`,
          justifyContent: isCentered ? 'center' : 'flex-start',
        }}
        className={`flex items-center w-full ${isCentered ? 'text-center' : ''}`}>
            {showToggle && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRowExpand(row.id);
                }}
                className="cursor-pointer mr-1"
              >
                {row.isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </span>
            )}
            <span>{displayName}</span>
          </div>
        );
      }
    },
    {
      key: 'parentId',
      name: '상담 팀',
      width: 100,
       renderCell: ({ row }) => {
        return row.level === 1  || row.level === 0 ? '' : row.parentId;
      }
    },
    {
      key: 'counselorEmplNum',
      name: '상담사 아이디'
    },
    {
      key: 'counselorId',
      name: '상담사 사번'
    },
    {
      key: 'counselorname',
      name: '상담사 이름'
    }
  ];

  return (
    <div className='py-5'>
      <div className="h-[280px] w-full grid-custom-wrap">
        <DataGrid
          columns={columns}
          rows={flattenRows(initialData)}
          rowKeyGetter={rowKeyGetter}
          className="w-full h-auto grid-custom"
          rowHeight={26}
          headerRowHeight={26}
          rowClass={(row) => {
            if (row.level === 0) {
              return 'bg-[#fafafa]';
            } else if (row.level === 1) {
              return 'bg-[#f5faff]';
            }
            return '';
          }}
        />
      </div>
      {!(callCampaignMenu == 'NewCampaignManager' || callCampaignMenu == 'CampaignGroupManager' || callCampaignMenu == 'CampaignClone')  &&
      <div className="flex justify-end gap-2 mt-5">
        <CommonButton variant="secondary" onClick={()=> 
          onHandleAdditionalInfoTabChange({...tempAdditionalInfoTab
            , onSave: true
          })
        }>확인</CommonButton>
        <CommonButton variant="secondary" onClick={()=> 
          onHandleAdditionalInfoTabChange({...tempAdditionalInfoTab
            , onClosed: true
          })
        }>취소</CommonButton>
      </div>
      }
    </div>
  );
};

export default AssignedAgentTab;