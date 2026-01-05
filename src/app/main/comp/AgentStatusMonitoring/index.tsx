import React, { useState, useMemo, useEffect } from "react";
import TitleWrap from "@/components/shared/TitleWrap";
import { Table, TableRow, TableHeader, TableCell } from "@/components/ui/table-custom";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import { CustomCheckbox } from "@/components/shared/CustomCheckbox";
import { Label } from "@/components/ui/label";
import { useApiForAgentStateMonitoringList } from '@/features/monitoring/hooks/useApiForAgentStateMonitoringList';
import { useMainStore, useTabStore } from '@/store';
import { useEnvironmentStore } from '@/store/environmentStore';
import ServerErrorCheck from "@/components/providers/ServerErrorCheck";
import { logoutChannel } from "@/lib/broadcastChannel";
import CustomAlert from "@/components/shared/layout/CustomAlert";
import { useApiForCampaignAgentList } from '@/features/preferences/hooks/useApiForCampaignAgent';


// 타입 정의
interface AgentStatus {
  waiting: boolean;
  processing: boolean;
  afterprocessing: boolean;
  rest: boolean;
}

interface AgentData {
  id: number;
  status: 'waiting' | 'processing' | 'afterprocessing' | 'rest';
  agent: string;
  name: string;
  time: string;
  count?: string; // 옵셔널로 변경
}

interface StatusHeaderItem {
  status: AgentData['status'];
  bg: string;
  text: string;
  icon: string;
}

type SortField = 'time' | 'agent' | 'name' | 'status';
type SortDirection = 'asc' | 'desc';

interface AgentStatusMonitoringProps {
  campaignId?: number;
  sessionKey?: string;
  tenantId?: string;
}

const AgentStatusMonitoring: React.FC<AgentStatusMonitoringProps> = ({ campaignId,sessionKey,tenantId }) => {
  // 상태 관리
  const [selectedStatuses, setSelectedStatuses] = useState<AgentStatus>({
    waiting: true,
    processing: false,
    afterprocessing: false,
    rest: false
  });

  // 정렬 관련 상태
  const [sortField, setSortField] = useState<SortField>('time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { campaigns, tenants } = useMainStore();
  const [counter, setCounter] = useState(0);
  const [ searchAgentState, setSearchAgentState ] = useState<boolean>(false);

  const [agentData, setAgentData] = useState<AgentData[]>([]);
  const [_agentData, _setAgentData] = useState<AgentData[]>([]);
  const [campaignAgents, setCampaignAgents] = useState<string[]>([]);
  const { statisticsUpdateCycle, centerId } = useEnvironmentStore();
  const { activeTabId, openedTabs, secondActiveTabId, activeTabKey, secondActiveTabKey } = useTabStore();
  const intervalAgentStatusMonitoringRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isPopup, setIsPopup] = useState(false);

  const handleStatusChange = (status: keyof AgentStatus): void => {
    setSelectedStatuses(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const toggleSortDirection = (): void => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const getStatusColor = (status: AgentData['status']): string => {
    const colors = {
      waiting: 'text-[#3A9D6C]',
      processing: 'text-[#C95E5E]',
      afterprocessing: 'text-[#338BD3]',
      rest: 'text-[#9459BF]'
    };
    return colors[status];
  };

  const getStatusText = (status: AgentData['status']): string => {
    const statusMap = {
      waiting: '대기',
      processing: '처리',
      afterprocessing: '후처리',
      rest: '휴식'
    };
    return statusMap[status];
  };

  const sortedAndFilteredAgents = useMemo(() => {
    const filtered = agentData.filter(agent => selectedStatuses[agent.status]);
    
    return [...filtered].sort((a, b) => {
      let compareA: string | number = a[sortField];
      let compareB: string | number = b[sortField];
      
      if (sortField === 'status') {
        compareA = getStatusText(a.status);
        compareB = getStatusText(b.status);
      }

      if (sortField === 'time') {
        // 시간을 초 단위로 변환하여 비교
        const timeToSeconds = (time: string): number => {
          const [hours, minutes, seconds] = time.split(':').map(Number);
          return hours * 3600 + minutes * 60 + seconds;
        };
        compareA = timeToSeconds(a.time);
        compareB = timeToSeconds(b.time);
      }
      
      if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [agentData, selectedStatuses, sortField, sortDirection]);

  const getStatusCount = (status: AgentData['status']): number => {
    return agentData.filter(agent => agent.status === status).length;
  };

  const statusHeaderItems: StatusHeaderItem[] = [
    { status: 'waiting', bg: '!bg-[#DDF4F2]', text: '대기 상담사', icon: '/waiting.svg' },
    { status: 'processing', bg: '!bg-[#FEE9EC]', text: '처리', icon: '/processing.svg' },
    { status: 'afterprocessing', bg: '!bg-[#E8EFFA]', text: '후처리', icon: '/afterprocessing.svg' },
    { status: 'rest', bg: '!bg-[#F6F0FA]', text: '휴식', icon: '/rest.svg' }
  ];

  const getStatusTime = (time: number) => {
    const returnValue = "00:00:00";
    
    if (time !== 0) {
      // const date = new Date(1970, 0, 1);
      // date.setSeconds(time);
  
      // const hours = String(date.getUTCHours()).padStart(2, '0');
      // const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      // const seconds = String(date.getUTCSeconds()).padStart(2, '0');

      const hrs = Math.floor(time / 3600);
      const mins = Math.floor((time % 3600) / 60);
      const secs = time % 60;
    
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  
      // returnValue = `${hours}:${minutes}:${seconds}`;
    }
  
    return returnValue;
  };

  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: "",
    title: "",
    type:"1",
  });

  // 캠페인별 상담사 목록 조회
  const { mutate: fetchCampaignAgentList } = useApiForCampaignAgentList({
    onSuccess: (response) => {
      let uniqueAgentIds: string[] = [];
      setSearchAgentState(true);
      if (response?.result_data && response.result_data.length > 0) {
        // 중복 제거된 agent_id 목록 추출
        uniqueAgentIds = extractUniqueAgentIds(response.result_data);
        // 상태에 저장 (필요 시 주석 해제)
      }
      setCampaignAgents(uniqueAgentIds);
    },
    onError: (error) => {
      ServerErrorCheck('캠페인별 상담사 목록 조회', error.message);
    }
  });
  function extractUniqueAgentIds(data: { agent_id: string[] }[]): string[] {
    const agentIdSet = new Set<string>();

    data.forEach(item => {
      item.agent_id.forEach(agentId => {
        agentIdSet.add(agentId);
      });
    });

    return Array.from(agentIdSet);
  }

  // 할당 상담사 정보 조회 (campaignId를 props로 받아 사용)
  const { mutate: fetchAgentStateMonitoringList } = useApiForAgentStateMonitoringList({
    onSuccess: (data) => {
      if (data.counselorStatusList.length > 0) {
        const tempDataList: AgentData[] = data.counselorStatusList.map((item, index) => ({
          id: index,
          status: item.statusCode === '204'
            ? 'waiting'
            : item.statusCode === '205'
              ? 'processing'
              : item.statusCode === '206'
                ? 'afterprocessing'
                : 'rest',
          agent: item.counselorId,
          name: item.counselorName,
          time: item.statusTime || '0',
        }));
        _setAgentData(tempDataList);
        setCounter(counter+1);
      }else{
        _setAgentData([]);
      }
      
    },
    onError: (error) => {
      if(window.opener){
        if(error.message.split('||')[0] === '5'){
          logoutChannel.postMessage({
            type: 'logout',
            message: error.message,
          });
        }else{
          setAlertState({
            ...alertState,
            isOpen: true,
            message: "상담사 상태 통계 조회 요청이 실패하였습니다. \nPDS 서버 시스템에 확인하여 주십시오.",
            title: "알림",
          });
          // console.log('통합 모니터링 상담사 통계 조회 실패',error.message);
        }
      } else {
        ServerErrorCheck('상담사 상태 통계 조회',error.message);
      }
    }
  });

  useEffect(() => {
    if (_agentData.length > 0) {
      let tempCounter = 0;
      const interval = setInterval(() => {
        const tempData = [];
        for( let i=0; i<_agentData.length; i++ ) {
          tempData.push({..._agentData[i]
            , time: getStatusTime(Number(_agentData[i].time) + tempCounter)
          });
        }
        setAgentData(tempData);
        tempCounter++;
      }, 1000);
      return () => clearInterval(interval);
    }else{
      setAgentData([]);
    }
  }, [_agentData]);

  // useEffect(() => {
  //   if (campaignAgents.length === 0 && campaignId === 0) return;

  //   if (campaignId && campaigns.length > 0) {
  //     const _tenantId = campaigns.find(data => data.campaign_id === Number(campaignId))?.tenant_id;
  //     if (_tenantId) {
  //       fetchAgentStateMonitoringList({
  //         centerId: centerId,
  //         tenantId: _tenantId+'',
  //         campaignId: Number(campaignId),
  //         agentIds: campaignAgents
  //       });
  //       if( statisticsUpdateCycle > 0 ){        
  //         const campaignInterval = setInterval(() => {  
  //           fetchAgentStateMonitoringList({
  //             centerId: centerId,
  //             tenantId: _tenantId+'',
  //             campaignId: Number(campaignId),
  //             agentIds: campaignAgents
  //           });
  //         }, statisticsUpdateCycle * 1000);  
  //         return () => clearInterval(campaignInterval);
  //       }
  //     }
  //   }
  //   // 최초 로딩이나 새로고침시 BadRequest 방지를 위한 주석처리
  //   else if( tenantId !== 'undefined' && tenantId !== 'A' && campaigns.length > 0) {
  //     fetchAgentStateMonitoringList({
  //       centerId: centerId,
  //       tenantId: tenantId+'',
  //       campaignId: 0,
  //       agentIds: campaignAgents
  //     });
  //     if( statisticsUpdateCycle > 0 ){        
  //       const tenantInterval = setInterval(() => {  
  //         fetchAgentStateMonitoringList({
  //           centerId: centerId,
  //           tenantId: tenantId+'',
  //           campaignId: 0,
  //           agentIds: campaignAgents
  //         });
  //       }, statisticsUpdateCycle * 1000);  
  //       return () => clearInterval(tenantInterval);
  //     }
  //   }
  //   else if( tenantId !== 'undefined' && campaignId === 0 && tenantId === 'A' && campaigns.length > 0) {
  //     const _tenantId = campaigns && campaigns.length > 0 ? [...new Set(campaigns.map(data => data.tenant_id))].join(',') : 'A';
  //     fetchAgentStateMonitoringList({
  //       centerId: centerId,
  //       tenantId: _tenantId,
  //       campaignId: 0,
  //       agentIds: campaignAgents
  //     });
  //     if( statisticsUpdateCycle > 0 ){        
  //       const centerInterval = setInterval(() => {  
  //         fetchAgentStateMonitoringList({
  //           centerId: centerId,
  //           tenantId: _tenantId,
  //           campaignId: 0,
  //           agentIds: campaignAgents
  //         });
  //       }, statisticsUpdateCycle * 1000);  
  //       return () => clearInterval(centerInterval);
  //     }
  //   }
  // }, [campaignAgents, campaignId,tenantId,campaigns, tenants,statisticsUpdateCycle, centerId]);
  
  // useEffect(() => {
  //   console.log( "##### activeTabId, secondActiveTabId,openedTabs: ", activeTabId, secondActiveTabId, openedTabs ); 
  //   if ((activeTabId === 22 || secondActiveTabId === 22) && searchAgentState === false) {
  //     if( tenantId === 'A' && campaigns.length > 0 ){
  //       fetchCampaignAgentList({
  //         campaign_id: [...new Set(campaigns.map(c => c.campaign_id))].filter((id): id is number => typeof id === 'number') as number[] 
  //       });
  //     }else if( campaignId === 0 && campaigns.length > 0 ){
  //       fetchCampaignAgentList({
  //         campaign_id: campaigns
  //           .filter(c => c.tenant_id === Number(tenantId))        // tenantId 일치하는 캠페인만 선택
  //           .map(c => c.campaign_id) as number[]                  // 캠페인 아이디만 추출하여 number[]로 변환
  //       });
  //     }else{
  //       fetchCampaignAgentList({
  //         campaign_id: [Number(campaignId) as number]
  //       });
  //     }
  //   }else if(!(activeTabId === 22 || secondActiveTabId === 22) ){
  //     clearInterval(intervalAgentStatusMonitoringRef.current!);
  //     intervalAgentStatusMonitoringRef.current = null;
  //     setSearchAgentState(false);
  //     // setIsLoading(false);
  //     // setIsRefreshing(false);
  //     // setSelectedCampaign('');
  //   }
  // }, [searchAgentState,activeTabId, openedTabs, secondActiveTabId, activeTabKey, secondActiveTabKey]);

  const clearAgentInterval = () => {
    if (intervalAgentStatusMonitoringRef.current) {
      clearInterval(intervalAgentStatusMonitoringRef.current);
      intervalAgentStatusMonitoringRef.current = null;
    }
  };

  useEffect(() => {
    if (campaignAgents.length === 0 ) return;

    clearAgentInterval(); //  기존 interval 무조건 정리

    let resolvedTenantId: string | null = null;

    if (campaignId && campaigns.length > 0) {
      resolvedTenantId =
        campaigns.find(c => c.campaign_id === Number(campaignId))?.tenant_id + '';
    } else if (tenantId !== 'undefined' && tenantId !== 'A') {
      resolvedTenantId = tenantId + '';
    } else if (tenantId === 'A' && campaigns.length > 0) {
      resolvedTenantId = [...new Set(campaigns.map(c => c.tenant_id))].join(',');
    }

    if (!resolvedTenantId) return;

    const fetchFn = () =>
      fetchAgentStateMonitoringList({
        centerId,
        tenantId: resolvedTenantId!,
        campaignId: campaignId ? Number(campaignId) : 0,
        agentIds: campaignAgents
      });

    fetchFn(); // 최초 1회

    if (statisticsUpdateCycle > 0) {
      intervalAgentStatusMonitoringRef.current = setInterval(
        fetchFn,
        statisticsUpdateCycle * 1000
      );
    }

    return clearAgentInterval;
  }, [
    campaignAgents,
    campaignId,
    tenantId,
    campaigns,
    statisticsUpdateCycle,
    centerId
  ]);
  
  useEffect(() => {
    const isAgentTabActive = activeTabId === 22 || secondActiveTabId === 22;

    if ( (isAgentTabActive && !searchAgentState)  || (!isAgentTabActive && isPopup)) {
      setSearchAgentState(true);

      if (tenantId === 'A' && campaigns.length > 0) {
        fetchCampaignAgentList({
          campaign_id: [...new Set(campaigns.map(c => c.campaign_id))].filter(
            (id): id is number => typeof id === 'number'
          )
        });
      } else if (campaignId === 0 && campaigns.length > 0) {
        fetchCampaignAgentList({
          campaign_id: campaigns
            .filter(c => c.tenant_id === Number(tenantId))
            .map(c => c.campaign_id)
        });
      } else {
        fetchCampaignAgentList({
          campaign_id: [Number(campaignId)]
        });
      }
    }

    if (!isAgentTabActive && !isPopup) {
      clearAgentInterval();
      setSearchAgentState(false);
    }
  }, [
    isPopup,
    activeTabId,
    secondActiveTabId,
    campaignId,
    tenantId,
    campaigns,
    searchAgentState, activeTabKey, secondActiveTabKey
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsPopup(!!(window.opener && window.opener !== window));
    }
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4 limit-700">
      <div>
        {campaignId && campaignId > 0?
        <TitleWrap
        title={`상담사 상태 통계${campaignId ? ` (캠페인 아이디: ${campaignId})` : ''}`}
        className="border-b border-gray-300 pb-1"
        />
        :
        tenantId && Number(tenantId) > 0?
        <TitleWrap
        title={`상담사 상태 통계${tenantId ? ` (테넌트 아이디: ${tenantId})` : ''}`}
        className="border-b border-gray-300 pb-1"
        />
        :
        <TitleWrap
        title={`전체 상담사 상태 통계`}
        className="border-b border-gray-300 pb-1"
        />
        }
        <Table>
          <tbody>
            <TableRow>
              {statusHeaderItems.map(item => (
                <TableHeader 
                  key={item.status}
                  className={`${item.bg} !text-center text-sm font-normal !h-[30px] ${getStatusColor(item.status)}`}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <Image 
                      src={item.icon} 
                      alt={item.text} 
                      width={14} 
                      height={14} 
                      priority
                    />
                    {item.text}
                  </div>
                </TableHeader>
              ))}
            </TableRow>
            <TableRow>
              {statusHeaderItems.map(item => (
                <TableCell key={item.status} className="!text-center text-sm !h-[30px]">
                  {getStatusCount(item.status)}
                </TableCell>
              ))}
            </TableRow>
          </tbody>
        </Table>
      </div>
      <div className="h-[calc(100%-115px)]">
        <TitleWrap
          title="상담사 상태"
          className="border-b border-gray-300 pb-1"
        />
        <div className="flex justify-between items-center bg-[#f8f8f8] h-[30px] px-5 border-t border-x rounded-t-[3px]">
          <div className="flex gap-4">
            {statusHeaderItems.map(item => (
              <div key={item.status} className="flex gap-1 items-center">
                <div className="flex items-center space-x-2">
                  <CustomCheckbox 
                    id={item.status}
                    checked={selectedStatuses[item.status]}
                    onCheckedChange={(checked: boolean) => handleStatusChange(item.status)}
                  />
                  <label
                    htmlFor={item.status}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {getStatusText(item.status)}
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label className="pr-2">정렬선택</Label>
              <div className="w-[120px]">
                <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="시간" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time">시간</SelectItem>
                    <SelectItem value="agent">상담사 아이디</SelectItem>
                    <SelectItem value="name">상담사 이름</SelectItem>
                    <SelectItem value="status">상태</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <button 
              onClick={toggleSortDirection}
              type="button"
              aria-label={sortDirection === 'asc' ? "오름차순" : "내림차순"}
            >
              <Image 
                src="/sort_button.svg" 
                alt={sortDirection === 'asc' ? "오름차순" : "내림차순"} 
                width={12} 
                height={12} 
                className={sortDirection === 'desc' ? "rotate-180" : ""}
              />
            </button>
          </div>
        </div>
        <div className="h-[calc(100%-59px)] overflow-auto border border-[#ebebeb] rounded-b-[3px]">
          <table className="w-full table-auto rounded-[3px] border-separate border-spacing-0">
            <tbody>
              {sortedAndFilteredAgents.map((agent) => (
                <tr key={agent.id}>
                  <td className="text-center text-sm border-b px-3 py-1 text-[#333]">
                    <div className={`flex items-center gap-2 justify-center ${getStatusColor(agent.status)}`}>
                      <Image 
                        src={`/${agent.status}.svg`} 
                        alt={getStatusText(agent.status)} 
                        width={14} 
                        height={14} 
                      />
                      {getStatusText(agent.status)}
                    </div>
                  </td>
                  <td className="text-center text-sm border-b px-3 py-1 text-[#333]">{agent.agent}</td>
                  <td className="text-center text-sm border-b px-3 py-1 text-[#333]">{agent.name}</td>
                  <td className="text-center text-sm border-b px-3 py-1 text-[#333]">{agent.time}</td>
                  <td className="text-center text-sm border-b px-3 py-1 text-[#333]">
                    ({agentData.filter(a => a.status === agent.status).length}/{agentData.length})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <CustomAlert
          message={alertState.message}
          title={alertState.title}
          type={alertState.type}
          isOpen={alertState.isOpen}
          onClose={() => {
            setAlertState((prev) => ({ ...prev, isOpen: false })); // Alert 닫기
          }}
        />
    </div>
  );
};

export default AgentStatusMonitoring;