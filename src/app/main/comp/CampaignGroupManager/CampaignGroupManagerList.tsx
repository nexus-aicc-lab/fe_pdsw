// components/main/CampaignList.tsx
import { useMainStore } from '@/store';
import {CampaignGroupHeaderSearch} from './CampaignGroupManagerHeader';
import { useEffect, useState, useMemo } from 'react';
import TitleWrap from "@/components/shared/TitleWrap";
import { useApiForCampaignAgent } from '@/features/campaignManager/hooks/useApiForCampaignAgent';
import DataGrid, { CellClickArgs, SelectColumn } from "react-data-grid";
import ServerErrorCheck from '@/components/providers/ServerErrorCheck';

type Column = {
  key: string;
  name: string;
};

type Row = {
  no: number;
  tenantId: number;
  tenantName: string;
  campaignGroupId: number;
  campaignGroupName: string;
};

const columns: Column[] = [
  { key: "no", name: "NO." },
  { key: "tenantName", name: "테넌트" },
  { key: "campaignGroupId", name: "캠페인 그룹 아이디" },
  { key: "campaignGroupName", name: "캠페인 그룹명" },
];

const downColumns = [
    SelectColumn,
  { key: "no", name: "NO." },
  { key: "campaignGroupName", name: "캠페인 그룹명" },
  { key: "campaignId", name: "캠페인 아이디" },
  { key: "campaignName", name: "캠페인명" },
];

export interface DataProps {
  no: number;
  tenantId: number;
  tenantName: string;
  campaignGroupId: number;
  campaignGroupName: string;
}

export interface downDataProps {
  no: number;
  campaignGroupId: number;
  campaignGroupName: string;
  campaignId: number;
  campaignName: string;
}

const rows: Row[] = [
  { no: 1, tenantId: 1, tenantName: "00:00",campaignGroupId:1, campaignGroupName: "00:00" },
];

type Props = {
  campaignId?: string;
  campaignGroupHeaderSearchParam?: CampaignGroupHeaderSearch;
  campaignGroupList?: DataProps[];
  groupCampaignListData?: downDataProps[];
  selectedGroupId?: string;
  onGroupSelect: (id: string) => void;
  onCampaignSelect: (id: string) => void;
  onSelectCampaignList: (data: Set<number>) => void;
}

export default function CampaignGroupManagerList({campaignId,campaignGroupHeaderSearchParam,campaignGroupList,groupCampaignListData,selectedGroupId
    ,onGroupSelect,onCampaignSelect,onSelectCampaignList}: Props) {
  const { campaigns, selectedCampaign , setSelectedCampaign } = useMainStore();
  const [selectedCampaignGroups, setSelectedCampaignGroups] = useState<Set<number>>(new Set([]));
  const [tempCampaigns, setTempCampaigns] = useState<DataProps[]>([]);
  const memoizedColumns = useMemo(() => columns, [columns]);
  const memoizedRows = useMemo(() => campaignGroupList || [], [campaignGroupList]);
  const memoizedDownDataRows = useMemo(() => groupCampaignListData || [], [groupCampaignListData]);
  const [selectedGroupRow, setSelectedGroupRow] = useState<DataProps | null>(null);
  const [selectedCampaignRow, setSelectedCampaignRow] = useState<downDataProps | null>(null);
    
  // 캠페인 소속 상담사 리스트 요청
  const { mutate: fetchCampaignAgents } = useApiForCampaignAgent({
    onSuccess: (data) => {
      // TODO..
      // setSchedules(data.result_data);  
      // const tempTenantIdArray = tenants.map((tenant) => tenant.tenant_id); 
      // fetchSkills({
      //   tenant_id_array: tempTenantIdArray
      // });   
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 소속 상담사 리스트 요청', error.message);
    }
  });
  
  useEffect(() => {
    if( groupCampaignListData && groupCampaignListData.length > 0 ){
      const campaignIds = groupCampaignListData.map((campaign) => campaign.campaignId);
      setSelectedCampaignGroups(new Set(campaignIds));
      onSelectCampaignList(new Set(campaignIds));
    }    
  }, [groupCampaignListData]);

  useEffect(() => {
    if( selectedCampaign ){
      fetchCampaignAgents({ campaign_id: selectedCampaign.campaign_id });
    }
  }, [selectedCampaign]);

  useEffect(() => {
    if( selectedGroupId && selectedGroupId !== '-1' && (campaignGroupList?.length ?? 0) > 0 ){      
      const foundRow = (campaignGroupList ?? []).find(group => group.campaignGroupId === Number(selectedGroupId));
      setSelectedGroupRow(foundRow ?? null);
      onGroupSelect(selectedGroupId);
    }
  }, [selectedGroupId,campaignGroupList]);

  useEffect(() => {
    if( typeof campaignGroupHeaderSearchParam != 'undefined' ){
      let _tempCampaignGroupList:DataProps[] = campaignGroupList || [];
      if( campaignGroupHeaderSearchParam.tenantId > -1 ){
        _tempCampaignGroupList = _tempCampaignGroupList.filter((ampaignGroup) => ampaignGroup.tenantId === Number(campaignGroupHeaderSearchParam.tenantId))
          .map((group,index) => {
            return {
              no: index+1,
              tenantId: group.tenantId,
              tenantName: group.tenantName,
              campaignGroupId: group.campaignGroupId,
              campaignGroupName: group.campaignGroupName
            }
        });
      }
      if( campaignGroupHeaderSearchParam.campaignGroupName != '' ){
        _tempCampaignGroupList = _tempCampaignGroupList.filter((ampaignGroup) => ampaignGroup.campaignGroupName.includes(campaignGroupHeaderSearchParam.campaignGroupName))
          .map((group,index) => {
            return {
              no: index+1,
              tenantId: group.tenantId,
              tenantName: group.tenantName,
              campaignGroupId: group.campaignGroupId,
              campaignGroupName: group.campaignGroupName
            }
        });
      }
      setTempCampaigns(_tempCampaignGroupList as unknown as DataProps[]);
      if( _tempCampaignGroupList.length > 0 && selectedGroupRow == null ){
        setSelectedGroupRow(_tempCampaignGroupList[0]);
        onGroupSelect(_tempCampaignGroupList[0].campaignGroupId.toString());
      }else{
        setSelectedGroupRow(null);
        onGroupSelect('');
      }
    }else{
      setTempCampaigns(campaignGroupList as unknown as DataProps[]);
      if( (campaignGroupList ?? []).length > 0 ){
        if( selectedGroupRow != null){
          // onGroupSelect(selectedGroupRow.campaignGroupId.toString());
        }else{
          setSelectedGroupRow((campaignGroupList ?? [])[0]);
        }
      }
    }
  }, [campaignGroupHeaderSearchParam, campaignGroupList]);

  const handleCellClick = ({ row }: CellClickArgs<Row>) => {
    setSelectedGroupRow(row);
    onGroupSelect(row.campaignGroupId.toString());
  };
  const handleDownCellClick = ({ row }: CellClickArgs<downDataProps>) => {
    onCampaignSelect(row.campaignId.toString());
    setSelectedCampaignRow(row);
  };

  const handleSelectedRowsChange = (newSelection: Set<number>) => {
    // 혹시 모를 0값이 포함되는 것을 방지
    const filteredSelection = new Set(
        Array.from(newSelection).filter(id => id !== 0)
    );
    setSelectedCampaignGroups(filteredSelection);
    onSelectCampaignList(filteredSelection);
  };

  const getGroupRowClass = (row: DataProps) => {
    return selectedGroupRow?.campaignGroupId === row.campaignGroupId ? 'bg-[#FFFAEE]' : '';
  };

  const getGroupDownRowClass = (row: downDataProps) => {
    return selectedCampaignRow?.campaignId === row.campaignId ? 'bg-[#FFFAEE]' : '';
  };

  return (
    <div className="w-[40%] shrink-0">
      <TitleWrap title="캠페인 그룹 검색목록" totalCount={tempCampaigns.length} />
      <div className="overflow-x-auto">
        <div className="grid-custom-wrap h-[200px]">
          <DataGrid 
            columns={memoizedColumns} 
            rows={tempCampaigns} 
            className="grid-custom" 
            rowHeight={30}
            rowClass={getGroupRowClass}
            headerRowHeight={30}
            onCellClick={handleCellClick}
            selectedRows={selectedGroupRow ? new Set<number>([selectedGroupRow.campaignGroupId]) : new Set<number>()}
            />
        </div>
      </div>
      <TitleWrap title="캠페인 그룹 소속 캠페인 검색목록" totalCount={memoizedDownDataRows.length} className="mt-5"/>        
      <div className="overflow-x-auto">
        <div className="grid-custom-wrap h-[200px]">
          <DataGrid 
            columns={downColumns} 
            rows={memoizedDownDataRows} 
            className="grid-custom" 
            rowKeyGetter={(row) => row.campaignId}
            selectedRows={selectedCampaignGroups}
            onSelectedRowsChange={handleSelectedRowsChange}
            rowHeight={30}
            headerRowHeight={30}
            rowClass={getGroupDownRowClass}
            onCellClick={handleDownCellClick}
            />
        </div>
      </div>
    </div>
  );
}