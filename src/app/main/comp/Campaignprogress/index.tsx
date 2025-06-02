"use client";

import React, { useState, useMemo, useEffect } from 'react';
import DataGrid, { Column } from 'react-data-grid';
import { ChevronRight, ChevronDown } from 'lucide-react';
import 'react-data-grid/lib/styles.css';
import TitleWrap from "@/components/shared/TitleWrap";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useMainStore, useCampainManagerStore } from '@/store';
import { useApiForCampaignProgressInformation } from '@/features/monitoring/hooks/useApiForCampaignProgressInformation';
import { CampaignProgressInformationResponseDataType } from '@/features/monitoring/types/monitoringIndex';
import { useApiForCampaignSkill } from '@/features/campaignManager/hooks/useApiForCampaignSkill';
import { useApiForSkills } from '@/features/campaignManager/hooks/useApiForSkills';
import * as XLSX from 'xlsx';
// 모달
import ColumnSet, { defaultColumnsData, ColumnSettingItem } from './ColumnSet';
import { useEnvironmentStore } from '@/store/environmentStore';
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import ServerErrorCheck from '@/components/providers/ServerErrorCheck';
import { PulseBarsLoader } from '@/shared/ui/loading/PulseBarsLoader';

export interface TreeRow extends DispatchStatusDataType {
  parentId?: string;
  isExpanded?: boolean;
  level: number;
  hasChildren?: boolean;
  children?: TreeRow[];
  [key: string]: any;
}

// 실제 API 연동 시 사용할 데이터 타입
export interface DispatchStatusDataType extends CampaignProgressInformationResponseDataType {
  strFlag: string;
  senderId: number;
  startFlag: string;
  endFlag: string;
  id: string;
  centerId: string;
  campaignName: string;
  progressRate: number;
  successRateList: number;
  nonSendCount: number;
  successRateSend: number;
  dialAttemptCnt: number;
  failSendCount: number;
}

const initDispatchStatusData: DispatchStatusDataType = {
  tenantId: 0 //campaigns[selectedCampaignIdIndex].tenant_id
  , detectMachineRoaming: 0
  , detectMachineEtc: 0
  , detectMachineMissingNumber: 0
  , detectSilenceCnt: 0
  , detectMachineLineBusy: 0
  , deleteBeforeDial: 0
  , nogautoPopNotDial: 0
  , nogtimeOutCallback: 0
  , nogautoPopNoReady: 0
  , nogautoDialNoReady: 0
  , nogtimeContradictory: 0
  , nogautoDialFailMode: 0
  , agentNoAnswerCnt: 0
  , nogautoNoEmployeeId: 0
  , nogautoPopNoAnswer: 0
  , detectMachineNoanswer: 0
  , customerOnHookCnt: 0
  , detectMachinePowerOff: 0
  , nogautoPopFailMode: 0
  , reuseCnt: 0
  , campId: 0 //campaigns[selectedCampaignIdIndex].campaign_id
  , totLstCnt: 0
  , totDialCnt: 0
  , acct: 0
  , scct: 0
  , overDial: 0
  , nonTTCT: 0
  , campListQuery: ''
  , tect: 0
  , blackList: 0
  , abct: 0
  , retryCall: 0
  , dialingCall: 0
  , nonServiceCnt: 0
  , firstCall: 0
  , agentBusyCnt: 0
  , blackListCall: 0
  , fileIndex: 0
  , recallCnt: 0
  , lineStopCnt: 0
  , fact: 0
  , noAgentCnt: 0
  , nogdeleteGL: 0
  , nogaddBL: 0
  , agentDropCnt: 0
  , customerDropCnt: 0
  , nact: 0
  , deleteAfterDial: 0
  , etct: 0
  , timeoutRecall: 0
  , dialToneSilence: 0
  , buct: 0
  , agentConnect: 0
  , nognotDialAgent: 0
  , nogblockTime: 0
  , nognotDialReady: 0
  , strFlag: ''
  , senderId: 0
  , startFlag: ''// campaigns[selectedCampaignIdIndex].start_flag === 1?'시작':campaigns[selectedCampaignIdIndex].start_flag === 2?'멈충':'중지지'
  , endFlag: '' // campaigns[selectedCampaignIdIndex].end_flag=== 1?'진행중':'완료'
  , id: ''// 'campaign-'+ campaigns[selectedCampaignIdIndex].campaign_id
  , centerId: 'center-1'
  , campaignName: ''// campaigns[selectedCampaignIdIndex].campaign_name
  , progressRate: 0
  , successRateList: 0
  , nonSendCount: 0
  , successRateSend: 0
  , dialAttemptCnt: 0
  , failSendCount: 0
};

// campaigns → 캠페인 진행 정보 → 스킬 정보 → 캠페인 스킬 정보 → 데이터 가공
// todo 0428 새로고침 
export default function Campaignprogress() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['center-1']));
  const [selectedCampaign, setSelectedCampaign] = useState<string>('전체 보기');
  const [selectedSkill, setSelectedSkill] = useState<string>('total');
  const [selectedStatus, setSelectedStatus] = useState<string>('전체');
  const [isSortAscending, setIsSortAscending] = useState<boolean>(true);
  const { campaigns, campaignTotalProgressInfoCampaignId, setCampaignTotalProgressInfoCampaignId } = useMainStore();
  const [selectedCampaignId, setSelectedCampaignId] = useState<number>(0);
  const [selectedCampaignIdIndex, setSelectedCampaignIdIndex] = useState<number>(0);
  const [maxDispatchCount, setMaxDispatchCount] = useState<number>(0);
  const [campaignInfoList, setCampaignInfoList] = useState<DispatchStatusDataType[]>([]);
  const [tempCampaignInfoList, setTempCampaignInfoList] = useState<DispatchStatusDataType[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const { campaignSkills, setCampaignSkills, campaignTotalProgressInfoColumn, setcampaignTotalProgressInfoColumn } = useCampainManagerStore();
  const [isColumnSetOpen, setIsColumnSetOpen] = useState(false);
  const [initData, setInitData] = useState<TreeRow[]>([]);
  // const [columns, setColumns] = useState<Column<TreeRow>[]>(defaultColumnsData);

  const { statisticsUpdateCycle } = useEnvironmentStore();
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tempCampaignList, setTempCampaignList] = useState<MainDataResponse[]>([]);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  //campaigns: MainDataResponse[];

  const transformToTreeData = (dataList: DispatchStatusDataType[]) => {
    const result: any[] = [];

    dataList.forEach((data) => {
      let center = result.find(center => center.centerId === data.centerId);
      if (!center) {
        center = {
          ...initDispatchStatusData,
          id: `center-${data.centerId}`,
          level: 0,
          hasChildren: true,
          affiliationGroupId: data.centerId,
          children: []
        };
        result.push(center);
      }

      let tenant = center.children.find((tenant: TreeRow) => tenant.tenantId === data.tenantId);
      if (!tenant) {
        tenant = {
          ...initDispatchStatusData,
          id: `tenant-${data.tenantId}`,
          parentId: center.id,
          level: 1,
          hasChildren: true,
          affiliationTeamId: data.tenantId,
          children: [],
          tenantId: data.tenantId
        };
        center.children.push(tenant);
      }

      let campaign = tenant.children.find((campaign: TreeRow) => campaign.campId === data.campId);
      if (!campaign) {
        campaign = {
          ...initDispatchStatusData,
          id: `campaign-${data.campId}`,
          parentId: tenant.id,
          level: 2,
          hasChildren: true,
          affiliationTeamId: data.campId,
          children: [],
          campId: data.campId
        };
        tenant.children.push(campaign);
      }

      campaign.children.push({
        ...data,
        // id: data.campId + '-' + data.senderId,
        id: `${data.centerId}-${data.tenantId}-${data.campId}-${data.senderId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        parentId: campaign.id,
        level: 3
      });
    });

    return result;
  };

  const headercolumns: Column<TreeRow>[] = [
    {
      key: 'campaignName',
      name: '캠페인 이름',
      width: 300,
      renderCell: ({ row }) => {
        const indent = row.level * 20;
        const showToggle = row.hasChildren;
        let displayName = '';

        if (row.level === 0) {
          displayName = '센터: NEXUS(1센터)';
        } else if (row.level === 1) {
          displayName = `테넌트 아이디: ${row.id.split('-')[1]}`;
        } else if (row.level === 2) {
          displayName = `캠페인 아이디: ${row.id.split('-')[1]}`;
        } else {
          displayName = row.campaignName;
        }

        return (
          <div style={{ marginLeft: `${indent}px` }} className="flex items-center">
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
  ];
  const [_columns, _setColumns] = useState<Column<TreeRow>[]>(headercolumns);

  const getFilteredData = (data: TreeRow[]): TreeRow[] => {
    const filterRow = (row: TreeRow): TreeRow | null => {
      let filteredChildren: TreeRow[] = [];

      if (row.children) {
        filteredChildren = row.children
          .map(child => filterRow(child))
          .filter((child): child is TreeRow => child !== null);
      }

      // 캠페인 필터
      // const matchesCampaign = selectedCampaign === '전체보기' || 
      //   (row.level === 2 && row.id.split('-')[1] === selectedCampaign);

      // 스킬 필터 (level 3에만 적용)
      // const matchesSkill = selectedSkill === '스킬전체보기' || 
      //   (row.level !== 3) || 
      //   (row.level === 3 && selectedSkill.includes(row.id.split('-')[1][0]));

      // 상태 필터
      // const matchesStatus = selectedStatus === '전체' || 
      //   row.startFlag === selectedStatus;

      // 부모 노드는 항상 표시, 필터는 최하위 노드에만 적용
      if (row.level < 2 || filteredChildren.length > 0) {
        return {
          ...row,
          children: filteredChildren.length > 0 ? filteredChildren : undefined,
          hasChildren: filteredChildren.length > 0
        };
      }

      // if (matchesCampaign && matchesSkill && matchesStatus) {
      return row;
      // }

      // return null;
    };

    return data.map(row => filterRow(row)).filter((row): row is TreeRow => row !== null);
  };

  // 정렬 함수
  const getSortedData = (data: TreeRow[]): TreeRow[] => {
    const sortChildren = (rows: TreeRow[]): TreeRow[] => {
      const campaignRows = rows.filter(row => row.level === 2);
      const nonCampaignRows = rows.filter(row => row.level < 2);
      const campaignChildRows = rows.filter(row => row.level > 2);

      const sortedCampaignRows = [...campaignRows].sort((a, b) => {
        const idA = parseInt(a.id.split('-')[1]);
        const idB = parseInt(b.id.split('-')[1]);
        return isSortAscending ? idA - idB : idB - idA;
      });

      const sortedCampaignChildRows = [...campaignChildRows].sort((a, b) => {
        const idA = parseInt(a.id.split('-')[1]);
        const idB = parseInt(b.id.split('-')[1]);
        return isSortAscending ? idA - idB : idB - idA;
      });

      const sortedRows = [...nonCampaignRows, ...sortedCampaignRows, ...sortedCampaignChildRows].map(row => ({
        ...row,
        children: row.children ? sortChildren(row.children) : undefined
      }));

      return sortedRows;
    };

    return sortChildren(data);
  };

  const toggleRowExpand = (rowId: string) => {
    setExpandedRows(prevExpandedRows => {
      const newExpandedRows = new Set(prevExpandedRows);
      if (newExpandedRows.has(rowId)) {
        newExpandedRows.delete(rowId);
      } else {
        newExpandedRows.add(rowId);
      }
      return newExpandedRows;
    });
  };

  function flattenRows(rows: TreeRow[]): TreeRow[] {
    let flat: TreeRow[] = [];
    rows.forEach((row) => {
      const isExpanded = expandedRows.has(row.id);
      flat.push({ ...row, isExpanded });
      if (row.children && isExpanded) {
        flat = flat.concat(flattenRows(row.children));
      }
    });
    return flat;
  }

  const rowKeyGetter = (row: TreeRow) => row.id;

  // 스킬 선택 변경 핸들러
  const handleSkillChange = (value: string) => {
    setSelectedSkill(value);
    if (campaignSkills.length > 0) {
      processDataForGrid(campaignSkills, selectedCampaign, value, selectedStatus);
      processDataForList(selectedCampaign, value, selectedStatus);
    }
  };
  // 캠페인 아이디 변경 핸들러
  const handleCampaignChange = (value: string) => {
    // setSelectedCampaign(value);
    // if (campaignSkills.length > 0) {
    //   processDataForGrid(campaignSkills, value, selectedSkill, selectedStatus);
    //   processDataForList(value, selectedSkill, selectedStatus);
      setCampaignTotalProgressInfoCampaignId(value);
    // }
  };
  // 상태 별로 보기 변경 핸들러
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    if (campaignSkills.length > 0) {
      processDataForGrid(campaignSkills, selectedCampaign, selectedSkill, value);
      processDataForList(selectedCampaign, selectedSkill, value);
    }
  };
  const createExcelData = (list: TreeRow[], _columns: Column<TreeRow>[], hasChildren: boolean) => {
    let rtnList: any[] = [];
    for (let i = 0; i < list.length; i++) {
      let tempData: any[] = [];
      if (typeof list[i].children !== 'undefined') {
        if (list[i].id === 'center-center-1') {
          tempData = ['센터: NEXUS(1센터)', '', ''];
          for (let j = 0; j < _columns.length; j++) {
            tempData.push('');
          }
        } else if (list[i].id.indexOf('tenant') > -1) {
          tempData = ['', '테넌트 아이디: ' + list[i].id.split('-')[1], ''];
          for (let j = 0; j < _columns.length; j++) {
            tempData.push('');
          }
        } else if (list[i].id.indexOf('campaign') > -1) {
          tempData = ['', '', '캠페인 아이디: ' + list[i].id.split('-')[1]];
          for (let j = 0; j < _columns.length; j++) {
            tempData.push('');
          }
        }
        const childData = createExcelData(list[i].children || [], _columns, true);
        rtnList.push(tempData);
        rtnList = rtnList.concat(childData);
      } else {
        const rowData = _columns.map(col => {
          return col.key in list[i] ? list[i][col.key] : ''; // Make sure it returns a value for each column
        });
        rtnList.push(['', '', '', ...rowData]);
      }
    }

    return rtnList;
  };
  // 엑셀다운로드
  const handleExcelDownload = () => {
    // Convert rows to a format suitable for Excel
    const wsData = filteredAndSortedData.map(row => {
      // Map the row data to the appropriate columns
      return _columns.map(col => row[col.key]); // assuming each row has keys matching the column's 'key'
    });
    const tempList = createExcelData(filteredAndSortedData, _columns, true);

    // Add the headers
    // const headers = _columns.map(col => col.name);
    const headers = ['센터', '테넌트 아이디', '캠페인 아이디', ..._columns.map(col => col.name)];

    // Create the worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...tempList]);

    // Create the workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Export the file
    XLSX.writeFile(wb, 'CampaignProgress.xlsx');
  };
  //컬럼 설정 확인 이벤트.
  const handleColumnSetConfirm = (data: ColumnSettingItem[]) => {
    // setColumns(data);    
    setcampaignTotalProgressInfoColumn(data);
    setIsColumnSetOpen(false)
  };
  const handleColumnSetClose = () => setIsColumnSetOpen(false);

  const processDataForList = (
    currentCampaign: string,
    currentSkill: string,
    currentStatus: string,
  ) => {
    let _tempCampaignList = [];

    // 스킬 필터링
    if (currentSkill !== 'total') {
      const filteredCampaigns = campaignSkills.filter(campaign =>
        campaign.skill_id?.includes(Number(currentSkill))
      );
      const filteredIds = new Set(filteredCampaigns.map(c => c.campaign_id));
      _tempCampaignList = campaigns.filter(c => filteredIds.has(c.campaign_id));
    } else {
      _tempCampaignList = campaigns;
    }
    if (currentCampaign !== '전체 보기') {
      _tempCampaignList = _tempCampaignList.filter(campaign=>campaign.campaign_id === Number(currentCampaign));
    }
    setTempCampaignList(_tempCampaignList);
    if( _tempCampaignList.length > 0){
      setSelectedCampaignId(_tempCampaignList[0].campaign_id);
      setSelectedCampaignIdIndex(0);
      setTempCampaignInfoList([]);
      setCampaignInfoList([]);
      setIsLoading(true);
    }
  };

  // 차트 데이터 처리 함수
  const processDataForGrid = (
    campaignSkillsData: any[],
    currentCampaign: string,
    currentSkill: string,
    currentStatus: string,
  ) => {
    let filteredCampaigns = campaignSkillsData.sort((a, b) => a.tenant_id - b.tenant_id);

    // 스킬 필터링
    if (currentSkill !== 'total') {
      filteredCampaigns = campaignSkillsData.filter(campaign =>
        campaign.skill_id?.includes(Number(currentSkill))
      );
      const filteredIds = new Set(filteredCampaigns.map(c => c.campaign_id));
    } else {
      filteredCampaigns = campaigns.sort((a, b) => a.campaign_id - b.campaign_id);
    }

    // 각 캠페인에 대해 데이터 생성
    const processedData = filteredCampaigns.map((campaign, index: number) => {
      let tempList = tempCampaignInfoList.filter(data => data.campId === campaign.campaign_id);
      // 상태 별로 필터링
      if (currentStatus !== '전체') {
        tempList = tempList.filter(campaignInfo => campaignInfo.startFlag === currentStatus);
      }
      // 캠페인 아이디 필터링
      if (currentCampaign !== '전체 보기') {
        tempList = tempList.filter(campaignInfo => campaignInfo.campId === Number(currentCampaign));
      }
      return tempList;
    });
    const transformedData = transformToTreeData(processedData.flat().sort((a, b) => {
      if (a.tenantId !== b.tenantId) {
        return a.tenantId - b.tenantId;
      }
      return a.campId - b.campId
    }));
    setInitData(transformedData);
  };
  

  // 스킬 조회
  const { mutate: fetchSkills } = useApiForSkills({
    onSuccess: (data) => {
      setSkills(data.result_data);
      fetchCampaignSkills({
        session_key: '',
        tenant_id: 0,
      });
    },
    onError: (error) => {
      ServerErrorCheck('스킬 조회', error.message);
    }
  });

  // 캠페인 스킬 조회
  const { mutate: fetchCampaignSkills } = useApiForCampaignSkill({
    onSuccess: (data) => {
      setCampaignSkills(data.result_data);
      // 여기에 나중에 발신 상태 API 연동
      processDataForGrid(data.result_data, selectedCampaign, selectedSkill, selectedStatus);
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 스킬 조회', error.message);
    }
  });

  // 캠페인 진행 정보 api 호출
  const { mutate: fetchCampaignProgressInformation } = useApiForCampaignProgressInformation({
    onSuccess: (data) => {
      const tempList = data.progressInfoList.sort((a, b) => a.reuseCnt - b.reuseCnt);
      if (tempList.length > 0) {
        const tempDataList: DispatchStatusDataType[] = tempList.map((item, i) => ({
          ...item
          , strFlag: i === 0 ? '최초 발신' : `${i}번째 재발신`
          , senderId: i
          , startFlag: tempCampaignList[selectedCampaignIdIndex].start_flag === 1 ? '시작' : tempCampaignList[selectedCampaignIdIndex].start_flag === 2 ? '멈춤' : '중지'
          , endFlag: tempCampaignList[selectedCampaignIdIndex].end_flag === 1 ? '진행중' : '완료'
          , id: 'campaign-' + item.campId
          , centerId: 'center-1'
          , campaignName: tempCampaignList[selectedCampaignIdIndex].campaign_name
          , progressRate: item.totLstCnt === 0 ? 0 : parseFloat(((item.nonTTCT / item.totLstCnt) * 100).toFixed(1))
          , successRateList: item.totLstCnt === 0 ? 0 : parseFloat(((item.scct / item.totLstCnt) * 100).toFixed(1))
          , nonSendCount: item.totLstCnt - item.nonTTCT - item.nogdeleteGL //미발신 건수.
          , successRateSend: item.scct === 0 ? 0 : parseFloat(((item.scct / item.totDialCnt) * 100).toFixed(1))
          , dialAttemptCnt: item.firstCall
          , failSendCount: item.buct + item.fact + item.tect + item.customerOnHookCnt + item.dialToneSilence + item.nact
            + item.etct + item.lineStopCnt + item.detectSilenceCnt + item.acct
        }));
        setTempCampaignInfoList(prev => [...prev, ...tempDataList]);
        if (maxDispatchCount < tempList.length) {
          setMaxDispatchCount(tempList.length);
        }
      } else {
        const tempData: DispatchStatusDataType = {
          ...initDispatchStatusData
          , strFlag: '최초 발신'
          , tenantId: tempCampaignList[selectedCampaignIdIndex].tenant_id
          , campId: tempCampaignList[selectedCampaignIdIndex].campaign_id
          , startFlag: tempCampaignList[selectedCampaignIdIndex].start_flag === 1 ? '시작' : tempCampaignList[selectedCampaignIdIndex].start_flag === 2 ? '멈춤' : '중지'
          , endFlag: tempCampaignList[selectedCampaignIdIndex].end_flag === 1 ? '진행중' : '완료'
          , id: 'campaign-' + tempCampaignList[selectedCampaignIdIndex].campaign_id
          , campaignName: tempCampaignList[selectedCampaignIdIndex].campaign_name
        };
        setTempCampaignInfoList(prev => [...prev, tempData]);
      }

      const index = selectedCampaignIdIndex + 1;

      if (index < tempCampaignList.length) {
        setSelectedCampaignId(tempCampaignList[index].campaign_id);
        setSelectedCampaignIdIndex(index);
      } else {
        fetchSkills({
          tenant_id_array: []
        });
        setSelectedCampaignId(0);
        setSelectedCampaignIdIndex(0);
        setIsLoading(false);
      }
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 진행 정보', error.message);
    }
  });

  const filteredAndSortedData = useMemo(() => {
    const filteredData = getFilteredData(initData);

    const expandedData = filteredData.map(group => ({
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

    return getSortedData(filteredData);
  }, [selectedCampaign, selectedSkill, selectedStatus, isSortAscending, initData]);

  // useEffect(() => {
  //   if (columns.length > 0) {
  //     _setColumns([...headercolumns, ...columns]);
  //   }
  // }, [columns]);

  // const searchCampaignProgressInformation = (_campaignId:number, _index:number) => {
  //   if (_campaignId > 0 && tempCampaignList[_index]) {
  //     fetchCampaignProgressInformation({
  //       tenantId: tempCampaignList[_index].tenant_id,
  //       campaignId: _campaignId
  //     });
  //   } 
  // }

  useEffect(() => {
    if (selectedCampaignId > 0 && tempCampaignList[selectedCampaignIdIndex]) {
      fetchCampaignProgressInformation({
        tenantId: tempCampaignList[selectedCampaignIdIndex].tenant_id,
        campaignId: selectedCampaignId
      });
    }
  }, [selectedCampaignId, selectedCampaignIdIndex]);


  useEffect(() => {
    // if (campaigns.length > 0) {
    //   // 캠페인즈를 가져와서 캠페인 아이디를 설정합니다.
    //   setSelectedCampaignId(campaigns[0].campaign_id);
    //   setSelectedCampaignIdIndex(0);
    //   setTempCampaignInfoList([]);
    //   setCampaignInfoList([]);
    // }
    if(campaigns.length > 0 && tempCampaignList.length === 0){
      setTempCampaignList(campaigns);
      // setSelectedCampaignId(campaigns[0].campaign_id);
      // setSelectedCampaignIdIndex(0);
      // setTempCampaignInfoList([]);
      // setCampaignInfoList([]);
    }
    if( tempCampaignList.length > 0){
      setSelectedCampaignId(tempCampaignList[0].campaign_id);
      setSelectedCampaignIdIndex(0);
      setTempCampaignInfoList([]);
      setCampaignInfoList([]);
      setIsLoading(true);
    }
  }, [campaigns,tempCampaignList]);

  useEffect(() => {
    if (campaignTotalProgressInfoCampaignId != '') {
      // handleCampaignChange(campaignTotalProgressInfoCampaignId);
      setSelectedCampaign(campaignTotalProgressInfoCampaignId);
      if (campaignSkills.length > 0) {
        processDataForGrid(campaignSkills, campaignTotalProgressInfoCampaignId, selectedSkill, selectedStatus);
        processDataForList(campaignTotalProgressInfoCampaignId, selectedSkill, selectedStatus);
      }
    }
  }, [campaignTotalProgressInfoCampaignId]);

  useEffect(() => {
    if (campaignTotalProgressInfoColumn.length === 0) {
      setcampaignTotalProgressInfoColumn(defaultColumnsData);
    } else {
      _setColumns([
        ...headercolumns,
        ...campaignTotalProgressInfoColumn.map((col) => ({
          ...col,
          renderCell: ({ row }: { row: TreeRow }) =>
            row.level === 3 ? row[col.key] : ''
        }))
      ]);
    }
  }, [campaignTotalProgressInfoColumn]);  

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setIsRefreshing(true);
      setSelectedCampaignId(0);

      setTimeout(function() {
        // 기존 갱신 로직 실행
        setSelectedCampaignId(tempCampaignList[0].campaign_id);
        setSelectedCampaignIdIndex(0);
        setTempCampaignInfoList([]);
        setCampaignInfoList([]);
        setIsLoading(true);
      }, 50);

      setLastRefreshTime(new Date());

      setTimeout(() => setIsRefreshing(false), 1000); // 짧은 갱신 애니메이션 처리
    }, statisticsUpdateCycle * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [statisticsUpdateCycle, tempCampaignList]);


  return (
    isLoading ? (
      <div className="flex items-center justify-center h-full">
        <PulseBarsLoader message="데이터 로딩 중입니다..." showMessage />
      </div>
    ) : (
    <div className="limit-width">

      <TitleWrap
        className="border-b border-gray-300 pb-3"
        title="상담사 상태"
        buttons={[
          { label: "새로고침", onClick: () => {
            setSelectedCampaignId(tempCampaignList[0].campaign_id);
            setSelectedCampaignIdIndex(0);
            setTempCampaignInfoList([]);
            setCampaignInfoList([]);
            setIsLoading(true);
          } },
          { label: "엑셀로 저장", onClick: () => handleExcelDownload() },
          { label: "컬럼 설정", onClick: () => setIsColumnSetOpen(true) },
        ]}
      />


      <div className="flex items-center justify-between pb-3">
        <div className="flex gap-5">
          <div className='flex items-center gap-2'>
            <Label className="pr-2">캠페인 아이디</Label>
            <div className="w-[120px]">
              <Select value={selectedCampaign} onValueChange={handleCampaignChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="전체 보기" />
                </SelectTrigger>
                <SelectContent style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <SelectItem value="전체 보기">캠페인 전체</SelectItem>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.campaign_id} value={campaign.campaign_id + ''}>
                      {campaign.campaign_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Label className="pr-2">스킬 별로 보기</Label>
            <div className="w-[120px]">
              <Select value={selectedSkill} onValueChange={handleSkillChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="total" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total">스킬 전체 보기</SelectItem>
                  {skills.map(skill => (
                    <SelectItem key={skill.skill_id} value={skill.skill_id.toString()}>
                      {skill.skill_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Label className="pr-2">상태 별로 보기</Label>
            <div className="w-[120px]">
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="시작">시작</SelectItem>
                  <SelectItem value="멈춤">멈춤</SelectItem>
                  <SelectItem value="중지">중지</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <button onClick={() => setIsSortAscending(!isSortAscending)}>
            <Image src="/sort_button.svg" alt="오름,내림차순 버튼" width={12} height={12} />
          </button>

        </div>

        <div className="flex justify-end gap-2">

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-md">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>갱신 주기: <span className="font-medium text-blue-600">{statisticsUpdateCycle}초</span></span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-md">
              <span>마지막 갱신:</span>
              <span className="font-medium text-blue-600">
                {lastRefreshTime ? lastRefreshTime.toLocaleTimeString() : '갱신 안됨'}
              </span>
            </div>
          </div>

          {/* 새로고침 버튼 */}
          {/* <CommonButton variant="secondary" onClick={() => {
            setSelectedCampaignId(tempCampaignList[0].campaign_id);
            setSelectedCampaignIdIndex(0);
            setTempCampaignInfoList([]);
            setCampaignInfoList([]);
          }}>
            새로고침
          </CommonButton>

          <CommonButton variant="secondary" onClick={handleExcelDownload}>엑셀로 저장</CommonButton>
          <CommonButton variant="secondary" onClick={() => setIsColumnSetOpen(true)}>
            컬럼 설정
          </CommonButton> */}

        </div>
      </div>
      <div className="h-[500px] w-full grid-custom-wrap">
        <DataGrid
          columns={_columns}
          rows={flattenRows(filteredAndSortedData)}
          rowKeyGetter={rowKeyGetter}
          className="w-full h-auto grid-custom"
          rowHeight={30}
          headerRowHeight={30}
          rowClass={(row) => {
            if (row.level === 0 || row.level === 1) {
              return 'bg-[#fafafa]';
            } else if (row.level === 2) {
              return 'bg-[#f5faff]';
            }
            return '';
          }}
        />
      </div>
      <ColumnSet
        isOpen={isColumnSetOpen}
        onClose={handleColumnSetClose}
        onConfirm={handleColumnSetConfirm}
        columns={campaignTotalProgressInfoColumn}
      />
    </div>
    )
  );
}

