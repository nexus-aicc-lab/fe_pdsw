import React, { useState, useMemo, useEffect, useRef } from 'react';
import DataGrid from "react-data-grid";
import 'react-data-grid/lib/styles.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import { CommonButton } from "@/components/shared/CommonButton";
import { CustomInput } from "@/components/shared/CustomInput";
import { Label } from "@/components/ui/label";
import CustomAlert from '@/components/shared/layout/CustomAlert';
import CampaignModal from '../CampaignModal';
import { useAuthStore, useMainStore, useTabStore } from '@/store';
import { useApiForCreateMaxCall, useApiForDeleteMaxCall, useApiForMaxCallInitTimeList, useApiForMaxCallInitTimeUpdate, useApiForMaxCallList, useApiForUpdateMaxCall } from '@/features/preferences/hooks/useApiForMaxCall';
import { useApiForCampaignAgentList } from '@/features/preferences/hooks/useApiForCampaignAgent';
import { useRouter } from 'next/navigation';
import TimePickerComponent from './TimePicker';
import ContextMenu from './context_menu';
import OnlyNumberInput from '@/components/shared/OnlyNumberInput';
import { useOperationStore } from '../store/OperationStore';
import ServerErrorCheck from '@/components/providers/ServerErrorCheck';
import { useApiForCampaignAssignmentAgent } from '@/features/campaignManager/hooks/useApiForCampaignAssignmentAgent';
import { useEnvironmentStore } from '@/store/environmentStore';

interface Row {
  id: string;
  center: string;
  group: string;
  part: string;
  agent_id: string;
  agent_name: string;
  max_dist: string;
  current_resp: string;
  fix_flag: string;
  level: number;
  parentId?: string;
  children?: Row[];
  isExpanded?: boolean;
  hasChildren?: boolean;
  isEditing?: boolean;
  hasChanges?: boolean;
  groupName?: string; // 그룹 이름 추가
  partName?: string; // 파트 이름 추가
}

interface EditData {
  [key: string]: {
    max_dist: string;
    fix_flag: string;
    original: {
      max_dist: string;
      fix_flag: string;
    }
  }
}

const errorMessage = {
  isOpen: false,
  message: '',
  title: '로그인',
  type: '2'
}

const DistributionLimit = () => {
  const { tenant_id, role_id, menu_role_id } = useAuthStore();
  const { campaigns } = useMainStore(); // 다른 컴포넌트 영향으로 인하여 setSelectedCampaign 제거
  const [treeData, setTreeData] = useState<Row[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set([]));
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [selectedCampaignName, setSelectedCampaignName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaignAgents, setCampaignAgents] = useState<string[]>([]);
  const [initTime, setInitTime] = useState<string>('없음');
  const [viewFilter, setViewFilter] = useState('all');
  const [rawAgentData, setRawAgentData] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { activeTabId, openedTabs } = useTabStore();
  const [editedRows, setEditedRows] = useState<EditData>({});
  const [hasChanges, setHasChanges] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);

  // 운영설정용 데이터 유지용 store
  const { operationCampaignId, setOperationCampaignId, operationCampaignName, setOperationCampaignName } = useOperationStore();



  // 최대분배호수 일괄 변경 모달 상태
  const [bulkLimitModal, setBulkLimitModal] = useState({
    isOpen: false,
    maxLimit: '',
    fixFlag: false,
    targetLevel: 0,
    targetGroup: '',
    targetPart: ''
  });

  // 최대분배호수 일괄 변경 모달 열기
  const handleOpenBulkLimitModal = () => {
    // 컨텍스트 메뉴 닫기
    handleCloseContextMenu();
    
    setBulkLimitModal({
      isOpen: true,
      maxLimit: '',
      fixFlag: false,
      targetLevel: contextMenu.level || 0,
      targetGroup: contextMenu.group || '',
      targetPart: contextMenu.part || ''
    });
  };

  // 우클릭 컨텍스트 메뉴 상태
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    rowId: string | null;
    agentId: string | null;
    level?: number;    // 레벨 정보 추가
    group?: string;    // 그룹 정보 추가
    part?: string;     // 파트 정보 추가
  }>({
    visible: false,
    x: 0,
    y: 0,
    rowId: null,
    agentId: null
  });

  // 컨텍스트 메뉴 닫기 함수
  const handleCloseContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      rowId: null,
      agentId: null
    });
  };
  
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: '',
    title: '알림',
    type: '1',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showAlert = (message: string) => {
    setAlertState({
      isOpen: true,
      message,
      title: '알림',
      type: '2',
      onConfirm: closeAlert,
      onCancel: () => {}
    });
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setAlertState({
      isOpen: true,
      message,
      title: '확인',
      type: '1',
      onConfirm: () => {
        onConfirm();
        closeAlert();
      },
      onCancel: closeAlert
    });
  };

  // Footer에서 발생하는 이벤트 수신을 위한 이벤트 리스너 추가
  useEffect( ()=> {
    const campaignSkillUpdateStatusChange = (event: any) => {
      const { campaign_id, campaign_status } = event.detail;
      
      // 캠페인 할당 스킬이 변경되었는지 감지하는 조건문
      if( campaign_status.toString() === 'update' && campaign_id.toString() === selectedCampaignId){
        
        fetchCampaignAgentList({
          campaign_id: [Number(campaign_id)]
        })
        fetchMaxCallList({
          campaign_id: [Number(campaign_id)]
        });
      }
    };

    const agentSkillUpdateStatusChange = (event : any) => {
        const { agent_status } = event.detail;
        
        // 상담사 상태가 변경되었는지와 현재 선택된 캠페인이 있는지 감지하는 조건문
        if( agent_status === 'update' && selectedCampaignId ){
          
          fetchCampaignAgentList({
            campaign_id: [Number(selectedCampaignId)]
          })
          fetchMaxCallList({
            campaign_id: [Number(selectedCampaignId)]
          });
        }
    };
    
    window.addEventListener('campaignSkillUpdateStatus', campaignSkillUpdateStatusChange as EventListener);
    window.addEventListener('agentSkillUpdateStatus', agentSkillUpdateStatusChange as EventListener);

    // 캠페인 조회 아이디를 유지하는 조건문
    if(operationCampaignId !== null && operationCampaignId ){
      setSelectedCampaignId(operationCampaignId.toString());
    }
          
    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
        window.removeEventListener('campaignSkillUpdateStatus', campaignSkillUpdateStatusChange as EventListener);
        window.removeEventListener('agentSkillUpdateStatus', agentSkillUpdateStatusChange as EventListener);
    };
  },[])

  const transformToTreeData = (agentData: Row[]) => {
    const result: Row[] = [];
    
    agentData.forEach((agent) => {
      let center = result.find(c => c.center === agent.center);
      if (!center) {
        center = {
          id: `center-${agent.center}`,
          center: agent.center,
          group: '',
          part: '',
          agent_id: '',
          agent_name: '',
          max_dist: '',
          current_resp: '',
          fix_flag: '',
          level: 0,
          hasChildren: true,
          children: []
        };
        result.push(center);
      }

      let group = center.children?.find(g => g.group === agent.group);
      if (!group) {
        group = {
          id: `group-${agent.center}-${agent.group}`,
          parentId: center.id,
          // Keep center value
          center: agent.center,
          group: agent.group,
          part: '',
          agent_id: '',
          agent_name: '',
          max_dist: '',
          current_resp: '',
          fix_flag: '',
          level: 1,
          hasChildren: true,
          children: []
        };
        center.children?.push(group);
      }

      let part = group.children?.find(p => p.part === agent.part);
      if (!part) {
        part = {
          id: `part-${agent.center}-${agent.group}-${agent.part}`,
          parentId: group.id,
          center: agent.center,
          group: agent.group,
          part: agent.part,
          agent_id: '',
          agent_name: '',
          max_dist: '',
          current_resp: '',
          fix_flag: '',
          level: 2,
          hasChildren: true,
          children: []
        };
        group.children?.push(part);
      }

      part.children?.push({
        id: `agent-${agent.agent_id}`,
        parentId: part.id,
        center: agent.center,
        group: `[${agent.group}]${agent.groupName}`, 
        part: `[${agent.part}]${agent.partName}`,
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        max_dist: agent.max_dist,
        current_resp: agent.current_resp,
        fix_flag: agent.fix_flag,
        level: 3
      });
    });

    result.sort((a, b) => a.center.localeCompare(b.center));
    result.forEach(center => {
      center.children?.sort((a, b) => a.group.localeCompare(b.group));
      center.children?.forEach(group => {
        group.children?.sort((a, b) => a.part.localeCompare(b.part));
        group.children?.forEach(part => {
          part.children?.sort((a, b) => a.agent_id.localeCompare(b.agent_id));
        });
      });
    });

    return result;
  };

  const flattenRows = (rows: Row[]): Row[] => {
    const getVisibleAgents = (nodes: Row[]): Row[] => {
      let visibleAgents: Row[] = [];
      
      nodes.forEach(node => {
        if (node.level === 3) {
          let shouldInclude = true;
          
          if (viewFilter !== 'all') {
            const maxDist = parseInt(node.max_dist || '0');
            const currentResp = parseInt(node.current_resp || '0');
            
            switch (viewFilter) {
              case 'remaining':
                // 잔여 호수가 남은 상담사 (최대 분배호수 > 현재 응답호수)
                shouldInclude = maxDist > currentResp && (maxDist > 0 || currentResp > 0);
                break;
              case 'no-remaining':
                // 잔여 호수가 없는 상담사 (최대 분배호수 = 현재 응답호수)
                shouldInclude = maxDist === currentResp && (maxDist > 0 || currentResp > 0);
                break;
              case 'no-limit':
                // 최대 분배호수가 설정되지 않은 상담사 (데이터가 없거나 둘 다 0인 경우)
                shouldInclude = maxDist === 0 && currentResp === 0;
                break;
              case 'has-limit':
                // 최대 분배호수가 설정된 상담사 (최대 분배호수나 현재 응답호수 중 하나라도 값이 있는 경우)
                shouldInclude = maxDist > 0 || currentResp > 0;
                break;
            }
          }
          
          if (shouldInclude) {
            visibleAgents.push(node);
          }
        } else if (node.children) {
          visibleAgents = visibleAgents.concat(getVisibleAgents(node.children));
        }
      });
      
      return visibleAgents;
    };
  
    const visibleAgents = getVisibleAgents(rows);
    
    const parentsWithVisibleChildren = new Set<string>();
    
    visibleAgents.forEach(agent => {
      if (agent.parentId) parentsWithVisibleChildren.add(agent.parentId);
      
      const partParentId = rows.find(center => 
        center.children?.some(group => 
          group.children?.some(part => part.id === agent.parentId)
        )
      )?.children?.find(group => 
        group.children?.some(part => part.id === agent.parentId)
      )?.id;
      
      if (partParentId) parentsWithVisibleChildren.add(partParentId);
      
      const groupParentId = rows.find(center => 
        center.children?.some(group => group.id === partParentId)
      )?.id;
      
      if (groupParentId) parentsWithVisibleChildren.add(groupParentId);
    });
    
    const flatten = (nodes: Row[]): Row[] => {
      let flat: Row[] = [];
      
      nodes.forEach(node => {
        const isExpanded = expandedRows.has(node.id);
        const hasChildren = node.children && node.children.length > 0;
        
        if (node.level < 3) {
          if (viewFilter !== 'all' && !parentsWithVisibleChildren.has(node.id) && !visibleAgents.some(agent => agent.id === node.id)) {
            return;
          }
          
          flat.push({ ...node, isExpanded, hasChildren });
          
          if (hasChildren && isExpanded) {
            flat = flat.concat(flatten(node.children!));
          }
        } 
        else {
          let shouldInclude = true;
          
          if (viewFilter !== 'all') {
            const maxDist = parseInt(node.max_dist || '0');
            const currentResp = parseInt(node.current_resp || '0');
            
            switch (viewFilter) {
              case 'remaining':
                // 잔여 호수가 남은 상담사 (최대 분배호수 > 현재 응답호수)
                shouldInclude = maxDist > currentResp && (maxDist > 0 || currentResp > 0);
                break;
              case 'no-remaining':
                // 잔여 호수가 없는 상담사 (최대 분배호수 = 현재 응답호수)
                shouldInclude = maxDist === currentResp && (maxDist > 0 || currentResp > 0);
                break;
              case 'no-limit':
                // 최대 분배호수가 설정되지 않은 상담사 (데이터가 없거나 둘 다 0인 경우)
                shouldInclude = maxDist === 0 && currentResp === 0;
                break;
              case 'has-limit':
                // 최대 분배호수가 설정된 상담사 (최대 분배호수나 현재 응답호수 중 하나라도 값이 있는 경우)
                shouldInclude = maxDist > 0 || currentResp > 0;
                break;
            }
          }
          
          if (shouldInclude) {
            // 편집된 데이터가 있으면 그 값으로 업데이트
            if (editedRows[node.id]) {
              flat.push({ 
                ...node, 
                isExpanded, 
                max_dist: editedRows[node.id].max_dist,
                fix_flag: editedRows[node.id].fix_flag,
                hasChanges: true
              });
            } else {
              flat.push({ ...node, isExpanded });
            }
          }
        }
      });
      
      return flat;
    };
  
    return flatten(rows);
  };

  // Apply filter to raw agent data - 필터는 최종 표시 시 적용
  const filteredAgentData = useMemo(() => {
    // 필터링하지 않고 모든 상담사 데이터 반환
    // 실제 필터링은 트리 데이터 평탄화 과정에서 수행
    return rawAgentData;
  }, [rawAgentData]);

  useEffect(() => {
    if (filteredAgentData.length > 0) {
      const transformedData = transformToTreeData(filteredAgentData);
      setTreeData(transformedData);
    } else {
      setTreeData([]);
    }
  }, [filteredAgentData]);
  
  // 처음에 모든 레벨 확장
  const collectAllNodeIds = (nodes: Row[], ids: Set<string>) => {
    nodes.forEach(node => {
      // 현재 노드 ID 추가
      ids.add(node.id);
      
      // 자식 노드가 있는 경우 재귀적으로 수집
      if (node.children && node.children.length > 0) {
        collectAllNodeIds(node.children, ids);
      }
    });
    return ids;
  };
  useEffect(() => {
    if (treeData.length > 0) {
      // 모든 노드를 확장하기 위해 모든 노드 ID 수집
      const allNodeIds = collectAllNodeIds(treeData, new Set<string>());
      setExpandedRows(allNodeIds);
    }
  }, [treeData]);
  
  
  // 캠페인 ID Select 변경 핸들러
  const handleCampaignIdChange = (value: string) => {
    // 변경된 데이터가 있으면 확인 창 표시
    if (hasChanges) {
      showConfirm("저장되지 않은 변경사항이 있습니다. 계속하시겠습니까?", () => {
        proceedWithCampaignChange(value);
      });
    } else {
      proceedWithCampaignChange(value);
    }
  };

  const proceedWithCampaignChange = (value: string) => {
    setIsLoading(true); // 로딩 시작

    // 상태 초기화 추가
    setRawAgentData([]);  // 기존 에이전트 데이터 초기화
    setCampaignAgents([]); // 캠페인 에이전트 초기화
    setTreeData([]); // 트리 데이터 초기화
    setEditedRows({}); // 편집 데이터 초기화
    setHasChanges(false); // 변경사항 플래그 초기화
    
    setSelectedCampaignId(value);
    
    const campaign = campaigns.find(c => c.campaign_id.toString() === value);
    if (campaign) {
      setSelectedCampaignName(campaign.campaign_name);
      setOperationCampaignName(campaign.campaign_name);
      setOperationCampaignId(Number(value));
      // setSelectedCampaign(campaign);
    }
  };


  // 캠페인 모달에서 선택 시 핸들러
  const handleModalSelect = (campaignId: string, campaignName: string) => {

    if (hasChanges) {
      showConfirm("저장되지 않은 변경사항이 있습니다. 계속하시겠습니까?", () => {
        setSelectedCampaignId(campaignId);
        setSelectedCampaignName(campaignName);
        
        // const campaign = campaigns.find(c => c.campaign_id === Number(campaignId));
        // if (campaign) {
        //   setSelectedCampaign(campaign);
        // }
        // 위 코드 이유 무엇? ==> store set을 해줘서 다른 컴포넌트를 멀티탭으로 띄운경우 데이터 덮어씌우기 발생 ==> 주석처리로 사용 X

        // 편집 데이터와 변경사항 초기화
        setEditedRows({});
        setHasChanges(false);
      });
    } else {
      
      
      if(campaignId !== '' && campaignName !== ''){
        setSelectedCampaignId(campaignId);
        setSelectedCampaignName(campaignName);
        setOperationCampaignId(parseInt(campaignId));
        setOperationCampaignName(campaignName);
      }
        
      
      
      // const campaign = campaigns.find(c => c.campaign_id === Number(campaignId));
      // if (campaign) {
      //   setSelectedCampaign(campaign);
      // }
      // 위 코드 이유 무엇? ==> store set을 해줘서 다른 컴포넌트를 멀티탭으로 띄운경우 데이터 덮어씌우기 발생 ==> 주석처리로 사용 X
    }
  };

  const { centerId, centerName} = useEnvironmentStore();

  // 백엔드에서 가져온 상담사 리스트 정보 처리
  const { mutate : fetchCounselorList } = useApiForCampaignAssignmentAgent({
    onSuccess: (data) => {
      // console.log("#### fetchCounselorList : ",data);      
      if(data.assignedCounselorList && selectedCampaignId){
        const counselorRows: Row[] = [];
        
        data.assignedCounselorList.forEach(counselor => {
            counselorRows.push({
              id: `agent-${counselor.counselorId}`,
              center: centerName,
              group: counselor.affiliationGroupId,
              groupName : counselor.affiliationGroupName,
              part: counselor.affiliationTeamId,
              partName: counselor.affiliationTeamName,
              agent_id: counselor.counselorId,
              agent_name: counselor.counselorname,
              max_dist: '0',
              current_resp: '0',
              fix_flag: 'N',
              level: 3
            });
        });
        
        setRawAgentData(counselorRows);
      } else {
        setRawAgentData([]);
      }
    },
    onError: (error) => {
      ServerErrorCheck('상담사 리스트 정보 조회', error.message);
      setRawAgentData([]);
    }
  });


  // 캠페인별 상담사 목록 조회
  const { mutate: fetchCampaignAgentList } = useApiForCampaignAgentList({
    onSuccess: (response) => {
      // console.log("#### response : ",response);
      if (response?.result_data && response.result_data.length > 0) {
        // 캠페인에 소속된 상담사 ID 목록 저장
        const agentIds = response.result_data[0].agent_id;
        setCampaignAgents(agentIds);
      } else {
        setCampaignAgents([]);
      }
    },
    onError: (error) => {
      ServerErrorCheck('캠페인별 상담사 목록 조회', error.message);
    }
  });

  // 운영설정 분배호수 제한 설정 리스트 API 호출
  const { mutate: fetchMaxCallList } = useApiForMaxCallList({
    onSuccess: (maxCallResponse) => {
      if (maxCallResponse?.result_data) {
        setRawAgentData(prevRows => {
          return prevRows.map(row => {
            const maxCallInfo = maxCallResponse.result_data.find(
              call => call.agent_id === row.agent_id
            );
            
            if (maxCallInfo) {
              return {
                ...row,
                max_dist: maxCallInfo.max_call.toString(),
                current_resp: maxCallInfo.answered_call.toString(),
                fix_flag: maxCallInfo.fix_flag === 1 ? 'Y' : 'N'  
              };
            }
            // 매칭되는 정보가 없으면 기존 row 반환
            return row;
          });
        });
      }
      setIsLoading(false); // 로딩 완료
    },
    onError: (error) => {
      ServerErrorCheck('분배호수 제한 설정 조회', error.message);
      setIsLoading(false);
    }
  });

  const { mutate: createMaxCallMutation } = useApiForCreateMaxCall({
    onError: (error) => {
      ServerErrorCheck('분배호수 제한 추가', error.message);
    }
  });
  
  const { mutate: updateMaxCallMutation } = useApiForUpdateMaxCall({
    onError: (error) => {
      ServerErrorCheck('분배호수 제한 수정', error.message);
    }
  });
  
  const { mutate: fetchMaxCallInitTimeList } = useApiForMaxCallInitTimeList({
    onSuccess: (data) => {
      setInitTime(data.result_data.init_time);
    },
    onError: (error) => {
      ServerErrorCheck('초기화 시간 설정 조회', error.message);
    }
  });
  
  const { mutate: deleteMaxCallMutation } = useApiForDeleteMaxCall({
    onError: (error) => {
      ServerErrorCheck('초기화 시간 설정 삭제', error.message);
    
    }
  });

  // 응답호수 초기화 시각 수정
  const { mutate: updateMaxCallInitTime } = useApiForMaxCallInitTimeUpdate({
    onSuccess: (data) => {
      if (data.result_code === 0) {
        fetchMaxCallInitTimeList({}); // 변경 후 목록 재조회
      } else {
        showAlert(`초기화 시간 변경 실패: ${data.result_msg}`);
      }
    },
    onError: (error) => {
      ServerErrorCheck('초기화 시간 변경', error.message);
    }
  });

  useEffect(() => {
    fetchMaxCallInitTimeList({});
    if (selectedCampaignId) {
      // 1. 먼저 캠페인 상담사 목록을 가져옴
      fetchCampaignAgentList({
        campaign_id: [Number(selectedCampaignId)]
      });
    } else {
      setCampaignAgents([]);
      setRawAgentData([]);
    }
  }, [selectedCampaignId, fetchCampaignAgentList, fetchMaxCallInitTimeList]);
  
  // campaignAgents가 업데이트되면 상담사 목록 조회
  useEffect(() => {

    if (selectedCampaignId && campaignAgents.length > 0) {
      fetchCounselorList({
        centerId: centerId,
        campaignId: selectedCampaignId.toString(),
        tenantId: campaigns.filter(c => c.campaign_id.toString() === selectedCampaignId)[0].tenant_id.toString(),
      });

    }
  }, [tenant_id, role_id, selectedCampaignId, campaignAgents, fetchCounselorList]);

  // 캠페인이 선택되고 상담사 목록이 로드된 후에 분배호수 제한 설정 조회
  useEffect(() => {
    if (selectedCampaignId && rawAgentData.length > 0) {
      fetchMaxCallList({
        campaign_id: [Number(selectedCampaignId)]
      });
    }
  }, [selectedCampaignId, rawAgentData.length, fetchMaxCallList]);

  useEffect(() => {
    const handleGridContextMenu = (e: MouseEvent) => {
      // 기본 컨텍스트 메뉴 방지
      e.preventDefault();
      
      // 마우스 위치 정확히 저장
      const mouseX = e.clientX; 
      const mouseY = e.clientY;
      
      // 우클릭된 요소 찾기
      let targetElement = e.target as HTMLElement;
      
      // 행 찾기 - 각 행은 [role="row"] 속성을 가집니다
      let rowElement = null;
      while (targetElement && targetElement !== gridRef.current) {
        if (targetElement.getAttribute('role') === 'row') {
          rowElement = targetElement;
          break;
        }
        targetElement = targetElement.parentElement as HTMLElement;
      }
      
      // 유효한 행 요소를 찾지 못한 경우
      if (!rowElement) return;
      
      // 현재 화면에 표시된 행만 포함된 배열
      const visibleRows = flattenRows(treeData);
      
      // 행의 aria-rowindex는 1부터 시작하고 헤더 행도 포함하므로 -2를 해줍니다
      const rowIndex = parseInt(rowElement.getAttribute('aria-rowindex') || '0') - 2;
      
      // 인덱스 범위 체크
      if (rowIndex < 0 || rowIndex >= visibleRows.length) return;
      
      // 클릭된 행 데이터
      const row = visibleRows[rowIndex];
      
      // 레벨에 따라 컨텍스트 메뉴 표시 (센터 제외)
      if (row && (row.level === 1 || row.level === 2 || row.level === 3)) {
        setContextMenu({
          visible: true,
          x: mouseX,
          y: mouseY,
          rowId: row.id,
          agentId: row.agent_id,
          level: row.level,
          group: row.group,
          part: row.part
        });
      }
    };
    
    const gridElement = gridRef.current;
    if (gridElement) {
      gridElement.addEventListener('contextmenu', handleGridContextMenu);
    }
    
    return () => {
      if (gridElement) {
        gridElement.removeEventListener('contextmenu', handleGridContextMenu);
      }
    };
  }, [treeData, expandedRows]); // 확장 상태 변경 시에도 다시 실행되도록 의존성 추가
  

  const [isTimeSettingOpen, setIsTimeSettingOpen] = useState(false);
  const [isTimeRemoveOpen, setIsTimeRemoveOpen] = useState(false);
  const [timeValue, setTimeValue] = useState('');

  // 모달 열 때 시간 상태 초기화 함수 개선
  const openTimeSettingModal = () => {
    // 기존 설정 값이 있고 유효한 경우 기본값으로 설정
    if (initTime && initTime !== "9999") {
      setTimeValue(initTime);
    } else {
      // 기본값으로 00시 00분 설정
      setTimeValue("0000");
    }
    setIsTimeSettingOpen(true);
  };

  const handleTimeSettingSave = () => {
    if (!timeValue) {
      showAlert('시간을 입력해주세요.');
      return;
    }

    if (timeValue.length !== 4) {
      showAlert('올바른 시간 형식이 아닙니다.');
      return;
    }

    updateMaxCallInitTime({ init_time: timeValue });
    setTimeValue('');
    setIsTimeSettingOpen(false);
  };

  const handleTimeRemove = () => {
    updateMaxCallInitTime({ init_time: "9999" }); // 초기화 시간을 "없음"으로 설정
    setIsTimeRemoveOpen(false);
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  // 셀 값 변경 처리 함수
  const handleCellChange = (row: Row, field: 'max_dist' | 'fix_flag', value: string) => {
    // 상담사 행만 편집 가능
    if (row.level !== 3) return;
    
    // 값의 유효성 검사
    if (field === 'max_dist') {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 0) {
        showAlert('최대 분배호수는 0 이상의 숫자여야 합니다.');
        return;
      }
      if (numValue > 99999){
        showAlert('최대 분배호수는 99999 까지 입력 가능합니다.');
        return;
      }
    }
    
    // 편집된 데이터 추적
    setEditedRows(prev => {
      const newEditedRows = { ...prev };
      
      // 이 행에 대한 이전 편집 내용이 없는 경우 원본 값 저장
      if (!newEditedRows[row.id]) {
        newEditedRows[row.id] = {
          max_dist: row.max_dist,
          fix_flag: row.fix_flag,
          original: {
            max_dist: row.max_dist,
            fix_flag: row.fix_flag
          }
        };
      }
      
      // 편집된 값 업데이트
      newEditedRows[row.id][field] = value;
      
      // 변경사항 없으면 해당 행 제거
      if (
        newEditedRows[row.id].max_dist === newEditedRows[row.id].original.max_dist && 
        newEditedRows[row.id].fix_flag === newEditedRows[row.id].original.fix_flag
      ) {
        delete newEditedRows[row.id];
      }
      
      // 변경사항 플래그 업데이트
      setHasChanges(Object.keys(newEditedRows).length > 0);
      
      return newEditedRows;
    });
  };

  // 그리드 데이터에서 편집된 셀 값을 가져오는 함수
  const getCellValue = (row: Row, field: 'max_dist' | 'fix_flag'): string => {
    if (row.level === 3 && editedRows[row.id]) {
      return editedRows[row.id][field];
    }
    return row[field];
  };

  // 일괄 저장
  const handleBulkSave = () => {
    if (!selectedCampaignId) {
      showAlert('캠페인을 선택해주세요.');
      return;
    }
    
    if (Object.keys(editedRows).length === 0) {
      showAlert('변경된 내용이 없습니다.');
      return;
    }
    
    // 유효성 검사
    const invalidEntries = Object.entries(editedRows).filter(([_, data]) => {
      const maxDist = parseInt(data.max_dist);
      return isNaN(maxDist) || maxDist < 0 || (data.fix_flag === 'Y' && maxDist === 0);
    });
    
    if (invalidEntries.length > 0) {
      showAlert('최대 분배호수는 0 이상의 숫자여야 하며, 호수 고정이 설정된 경우 최대 분배호수는 0일 수 없습니다.');
      return;
    }

    // 0값 검사를 별도로 먼저 수행
    const zeroEntries = Object.entries(editedRows).filter(([_, data]) => {
      return parseInt(data.max_dist) === 0;
    });

    if (zeroEntries.length > 0) {
      showAlert('최대 분배호수는 0으로 설정할 수 없습니다.');
      return;
    }
    
    showConfirm(`${Object.keys(editedRows).length}개의 항목을 저장하시겠습니까?`, async () => {
      setIsLoading(true);
      let successCount = 0;
      let failCount = 0;
      
      // 변경된 각 항목에 대해 저장 또는 업데이트 요청
      for (const [rowId, data] of Object.entries(editedRows)) {
        const agentId = rowId.replace('agent-', '');
        const maxDist = parseInt(data.max_dist);
        const fixFlag = data.fix_flag === 'Y' ? 1 : 0;
        
        const saveData = {
          campaign_id: parseInt(selectedCampaignId),
          agent_id: agentId,
          max_call: maxDist,
          fix_flag: fixFlag
        };
        
        // 기존 설정 존재 여부 확인 (max_dist가 0이 아닌 경우)
        const isExisting = parseInt(data.original.max_dist) > 0;
        
        try {
          if (isExisting) {
            // 기존 설정 수정
            await new Promise<void>((resolve, reject) => {
              updateMaxCallMutation(saveData, {
                onSuccess: (response) => {
                  if (response.result_code === 0) {
                    successCount++;
                    resolve();
                  } else {
                    failCount++;
                    reject(new Error(response.result_msg));
                  }
                },
                onError: (error) => {
                  failCount++;
                  reject(error);
                }
              });
            });
          } else {
            // 새 설정 생성
            await new Promise<void>((resolve, reject) => {
              createMaxCallMutation(saveData, {
                onSuccess: (response) => {
                  if (response.result_code === 0) {
                    successCount++;
                    resolve();
                  } else {
                    failCount++;
                    reject(new Error(response.result_msg));
                  }
                },
                onError: (error) => {
                  failCount++;
                  reject(error);
                }
              });
            });
          }
        } catch (error) {
          // console.error('저장 중 오류 발생:', error);
          // 에러는 이미 각 API 호출의 onError에서 처리
        }
      }
      
      // 모든 요청 완료 후 결과 표시
      setIsLoading(false);
      // showAlert(`저장 완료: ${successCount}개 성공, ${failCount}개 실패`);
      showAlert(`수정된 자원을 적용합니다.`);
      
      if (successCount > 0) {
        // 변경된 데이터 초기화 및 목록 재조회
        setEditedRows({});
        setHasChanges(false);
        fetchMaxCallList({
          campaign_id: [parseInt(selectedCampaignId)]
        });
      }
    });
  };

  // 변경사항 취소
  const handleCancelChanges = () => {
    if (Object.keys(editedRows).length === 0) {
      return;
    }
    
    showConfirm('모든 변경사항을 취소하시겠습니까?', () => {
      setEditedRows({});
      setHasChanges(false);
    });
  };

  // 삭제 처리 함수
  const handleDeleteMaxCall = () => {
    if (!contextMenu.rowId || !selectedCampaignId) return;
    
    let confirmMessage = "";
    let agentIds: string[] = [];
    
    // 삭제 대상에 따라 메시지와 상담사 ID 목록 설정
    if (contextMenu.level === 3) {
      // 상담사 개인 삭제
      // confirmMessage = `${contextMenu.agentId} 상담사의 분배 제한 정보를 삭제하시겠습니까?`;
      confirmMessage = '분배 제한 정보를 삭제 하시겠습니까?';
      if (contextMenu.agentId) {
        agentIds = [contextMenu.agentId];
      }
    } else if (contextMenu.level === 2) {
      // 상담 파트 전체 삭제 - 분배호수가 설정된 상담사만 삭제
      confirmMessage = `파트 ${contextMenu.part} 의 할당된 콜수를 삭제하시겠습니까?`;
      
      // 파트에 속한 상담사 중 최대분배호수가 0보다 큰 상담사만 ID 수집
      
      agentIds = rawAgentData
        .filter(agent => 
          agent.part === contextMenu.part  && 
          parseInt(agent.max_dist) > 0
        )
        .map(agent => agent.agent_id);
        
    } else if (contextMenu.level === 1) {
      // 상담 그룹 전체 삭제 - 분배호수가 설정된 상담사만 삭제
      confirmMessage = `그룹 ${contextMenu.group} 의 할당된 콜수를 삭제하시겠습니까?`;
      
      // 그룹에 속한 상담사 중 최대분배호수가 0보다 큰 상담사만 ID 수집
      agentIds = rawAgentData
        .filter(agent => 
          agent.group === contextMenu.group && 
          parseInt(agent.max_dist) > 0
        )
        .map(agent => agent.agent_id);
    }
    
    if (agentIds.length === 0) {
      showAlert('삭제할 상담사가 없습니다.');
      handleCloseContextMenu();
      return;
    }
    
    showConfirm(confirmMessage, async () => {
      setIsLoading(true);
      let successCount = 0;
      let failCount = 0;

      const deleteArr = []; // 삭제할 상담사 ID 배열 초기화

      // agentIds를 100개씩 묶어서 deleteArr에 추가
      for (let i = 0; i < agentIds.length; i += 100) {
        deleteArr.push(agentIds.slice(i, i+100));
      }

      // 선택된 모든 상담사에 대해 삭제 처리
      for(const agentId of deleteArr){
        // 100개씩 묶은 배열에 보내기

        const requestData = agentId.map(agentId => {
          return {
            campaign_id: parseInt(selectedCampaignId),
            agent_id: agentId
          };
        });
        // console.log("requestData : ", requestData);
        try {
          await new Promise<void>((resolve, reject) => {
            deleteMaxCallMutation(requestData, {
              onSuccess: (response) => {
                if (response.result_code === 0) {
                  successCount++;
                  resolve();
                } else {
                  failCount++;
                  reject(new Error(response.result_msg));
                }
              },
              onError: (error) => {
                failCount++;
                reject(error);
              }
            });
          });
        } catch (error) {
          // console.error('삭제 중 오류 발생:', error);
        }

      } // end of for

      setIsLoading(false);
      
      // 화면 데이터 업데이트
      setRawAgentData(prevData => 
        prevData.map(row => {
          if (agentIds.includes(row.agent_id)) {
            return {
              ...row,
              max_dist: '0',
              current_resp: '0',
              fix_flag: 'N'
            };
          }
          return row;
        })
      );
      
      // 편집 중인 데이터에서도 제거
      if (Object.keys(editedRows).length > 0) {
        const newEditedRows = { ...editedRows };
        
        // 해당하는 모든 행 ID에 대해 편집 데이터 제거
        Object.keys(newEditedRows).forEach(rowId => {
          const agentId = rowId.replace('agent-', '');
          if (agentIds.includes(agentId)) {
            delete newEditedRows[rowId];
          }
        });
        
        setEditedRows(newEditedRows);
        setHasChanges(Object.keys(newEditedRows).length > 0);
      }
      
      // showAlert(`삭제 완료`);
      
      // 컨텍스트 메뉴 닫기
      handleCloseContextMenu();
      
    });
  };

  // 최대분배호수 일괄 변경 적용 및 즉시 저장
  const handleApplyBulkLimit = async () => {
    if (!bulkLimitModal.maxLimit) {
      showAlert('최대 발신 건수를 입력해주세요.');
      return;
    }
    
    const maxLimit = parseInt(bulkLimitModal.maxLimit);
    if (isNaN(maxLimit) || maxLimit <= 0) {
      showAlert('최대 발신 건수는 0보다 큰 숫자여야 합니다.');
      return;
    }

    if (maxLimit > 99999) {
      showAlert('최대 발신 건수는 99999까지 입력 가능합니다.');
      return;
    }
    
    // 영향을 받는 상담사 ID 찾기 - 정확한 필터링으로 수정
    let targetAgents: Row[] = [];

    // console.log('bulkLimitModal.targetGroup' , bulkLimitModal.targetGroup);
    // console.log('agent.group' , rawAgentData.map(agent => agent.group));
    
    if (bulkLimitModal.targetLevel === 1) {
      // 상담 그룹에 속한 모든 상담사만 정확히 필터링
      targetAgents = rawAgentData.filter(agent => 
        agent.group === bulkLimitModal.targetGroup
      );
      // console.log(`그룹 ${bulkLimitModal.targetGroup}에 속한 상담사 ${targetAgents.length}명 선택됨`);
    } else if (bulkLimitModal.targetLevel === 2) {
      // 상담 파트에 속한 모든 상담사만 정확히 필터링
      targetAgents = rawAgentData.filter(agent => 
        agent.part === bulkLimitModal.targetPart
      );
      // console.log(`파트 ${bulkLimitModal.targetPart}에 속한 상담사 ${targetAgents.length}명 선택됨`);
    }
    
    if (targetAgents.length === 0) {
      showAlert('변경할 상담사가 없습니다.');
      return;
    }

    // 모달 닫기
    setBulkLimitModal(prev => ({ ...prev, isOpen: false }));
    
    // 로딩 시작
    setIsLoading(true);
    
    // 지연 추가
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let successCount = 0;
    let failCount = 0;
    
    // #### 일괄 수정은 update api로 보내기!
    const agentIds = targetAgents.map(agent => agent.agent_id);
    const updateArr = [];
    
    // 변경 대상 상담사 ID 100개씩 자르기 (한 요청에 최대 100개의 상담사 ID)
    for (let i = 0; i < targetAgents.length; i += 100) {
      updateArr.push(targetAgents.slice(i, i+100));
    }

    for(const agent of updateArr){

      const saveData = agent.map(row => {
        
        const agent_id = row.agent_id.replace('agent-', '')

        return {
          campaign_id: parseInt(selectedCampaignId),
          agent_id : agent_id,
          max_call : maxLimit,
          fix_flag : bulkLimitModal.fixFlag ? 1 : 0
        }
      });

      // console.log("saveData : ", saveData);

      await new Promise<void>((resolve, reject) => {
        updateMaxCallMutation(saveData, {
          onSuccess: (response) => {
            if (response.result_code === 0) {
              successCount++;
              resolve();
            } else {
              // 이미 적용된 설정이라면 성공으로 처리
              if (response.result_msg && response.result_msg.includes("No action is needed")) {
                successCount++;
                resolve();
              } else {
                failCount++;
                reject(new Error(response.result_msg));
              }
            }
          },
          onError: (error) => {
            // "No action is needed" 오류는 무시하고 성공으로 처리
            if (error.message && error.message.includes("No action is needed")) {
              successCount++;
              resolve();
            } else {
              failCount++;
              reject(error);
            }
          }
        });
      });


    } // end of for

    // console.log("successCount : ",successCount);
    // console.log("failcount : ", failCount);

    // 화면 데이터 직접 업데이트 (API 응답을 기다리지 않고)
    setRawAgentData(prevData => 
      prevData.map(row => {
        // 선택된 상담사 ID에 포함된 경우에만 업데이트
        if (agentIds.includes(row.agent_id)) {
          return {
            ...row,
            max_dist: maxLimit.toString(),
            fix_flag: bulkLimitModal.fixFlag ? 'Y' : 'N'
          };
        }
        return row;
      })
    );
    
    // 변경 후 목록 다시 조회
    await fetchMaxCallList({
      campaign_id: [parseInt(selectedCampaignId)]
    });
    
    // 로딩 종료
    setIsLoading(false);

  }; // end of handleApplyBulkLimit

  // Toggle row expansion - 행 확장/축소 토글 개선
  const toggleRowExpand = (rowId: string) => {
    // 새로운 확장 상태 세트 생성
    const newExpandedRows = new Set(expandedRows);
    
    // 현재 노드의 확장 상태 업데이트
    if (expandedRows.has(rowId)) {
      // 해당 노드 및 모든 하위 노드를 축소
      const nodeToCollapse = treeData.reduce((foundNode, center) => {
        if (foundNode) return foundNode;
        if (center.id === rowId) return center;
        
        // 센터 내 그룹에서 찾기
        if (center.children) {
          const groupNode = center.children.find(group => group.id === rowId);
          if (groupNode) return groupNode;
          
          // 그룹 내 파트에서 찾기
          for (const group of center.children) {
            if (group.children) {
              const partNode = group.children.find(part => part.id === rowId);
              if (partNode) return partNode;
            }
          }
        }
        
        return null;
      }, null as Row | null);
      
      // 하위 노드의 ID 수집 및 삭제
      const removeChildrenIds = (node: Row | null) => {
        if (!node || !node.children) return;
        
        node.children.forEach(child => {
          newExpandedRows.delete(child.id);
          removeChildrenIds(child);
        });
      };
      
      newExpandedRows.delete(rowId);
      removeChildrenIds(nodeToCollapse);
    } else {
      // 노드 확장
      newExpandedRows.add(rowId);
    }
    
    setExpandedRows(newExpandedRows);
  };

  const rowKeyGetter = (row: Row) => row.id;

  // 고급된 열 정의 - 이제 편집 가능한 셀 포함
  const columns = useMemo(() => [
    { 
      key: 'center', 
      name: '센터',
      width: 200, 
      renderCell: ({ row }: { row: Row }) => {
        const indent = row.level * 20;
        const hasToggle = row.hasChildren;
        
        const centerContent = row.level === 3 ? row.center : '';
        
        // 계층 구조 표시 (기존의 hierarchy 열 기능)
        let hierarchyContent = '';
        if (row.level === 0) {
          hierarchyContent = `센터: ${row.center}`;
        } else if (row.level === 1) {
          hierarchyContent = `상담 그룹: ${row.group}`;
        } else if (row.level === 2) {
          hierarchyContent = `상담 팀: ${row.part}`;
        } else if (row.level === 3) {
          // 상담사 레벨에서는 계층 표시 없이 센터 값만 보여줌
          return <div style={{ marginLeft: `${indent}px` }}>{centerContent}</div>;
        }
        
        return (
          <div style={{ marginLeft: `${indent}px` }} className="flex items-center">
            {hasToggle && (
              <span
                // onClick={(e) => {
                //   e.stopPropagation();
                //   toggleRowExpand(row.id);
                // }}
                // className="cursor-pointer mr-2"
                className="mr-2"
                style={{
                  display: 'inline-block',
                  width: '9px',
                  height: '9px',
                  border: '1px solid #999',
                  backgroundColor: '#f1f1f1',
                  lineHeight: '7px',
                  textAlign: 'center',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  color: '#333',
                  marginRight: '5px'
                }}
              >
                {row.isExpanded ? '-' : '+'}
              </span>
            )}
            <span className="font-medium">{hierarchyContent}</span>
          </div>
        );
      }
    },
    { 
      key: 'group', 
      name: '상담 그룹',
      renderCell: ({ row }: { row: Row }) => {
        // 상담사 행에만 데이터 표시
        return row.level === 3 ? row.group : '';
      }
    },
    { 
      key: 'part', 
      name: '상담 팀',
      renderCell: ({ row }: { row: Row }) => {
        // 상담사 행에만 데이터 표시
        return row.level === 3 ? row.part : '';
      }
    },
    { 
      key: 'agent_id', 
      name: '상담사 아이디',
      renderCell: ({ row }: { row: Row }) => {
        return row.level === 3 ? row.agent_id : '';
      }
    },
    { 
      key: 'agent_name', 
      name: '상담사 이름',
      renderCell: ({ row }: { row: Row }) => {
        return row.level === 3 ? row.agent_name : '';
      }
    },
    { 
      key: 'max_dist', 
      name: '최대 분배호수',
      width: 120,
      renderCell: ({ row }: { row: Row }) => {
        if (row.level !== 3) return '';
        
        // 편집 가능한 셀로 변경
        return (
          <div className={`px-2 flex justify-center w-full ${row.hasChanges ? 'bg-yellow-50' : ''}`}>
            <input
              type="number"
              min="0"
              max="99999"
              value={getCellValue(row, 'max_dist')}
              // onChange={(e) => handleCellChange(row, 'max_dist', e.target.value)}
              onChange={(e) => {
                let inputValue = e.target.value;
            
                // 강제로 99999 넘으면 잘라주기
                if (parseInt(inputValue) > 99999) {
                  showAlert('최대 분배호수는 99999 까지 입력 가능합니다.');
                  inputValue = "99999";
                }
            
                handleCellChange(row, 'max_dist', inputValue);
              }}
              className="w-full h-full px-2 text-center border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );
      }
    },
    { 
      key: 'current_resp', 
      name: '현재 응답호수',
      width: 120,
      renderCell: ({ row }: { row: Row }) => {
        return row.level === 3 ? row.current_resp : '';
      }
    },
    { 
      key: 'fix_flag', 
      name: '호수 고정',
      width: 120,
      renderCell: ({ row }: { row: Row }) => {
        if (row.level !== 3) return '';
        
        // 편집 가능한 드롭다운으로 변경
        return (
          <div className= {row.hasChanges ? 'bg-yellow-50' : ''}>
            <select
              value={getCellValue(row, 'fix_flag')}
              onChange={(e) => handleCellChange(row, 'fix_flag', e.target.value)}
              className="w-full h-full text-center border-0 bg-transparent focus:outline-none"
            >
              <option value="Y">고정</option>
              <option value="N">미고정</option>
            </select>
          </div>
        );
      }
    }
  ], [editedRows]);
  
  const handleCellClick = ({ row }: { row: Row }) => {
    // 계층 노드 클릭 시 확장/축소
    if (row.level !== 3 && row.hasChildren) {
      toggleRowExpand(row.id);
    }
  };

  const getRowClass = (row: Row) => {
    // 편집된 행은 강조 표시
    if (row.level === 3 && editedRows[row.id]) {
      return 'bg-[#FFFAEE]';
    }
    
    // 레벨별 배경색 설정
    if (row.level === 0) {
      return 'bg-[#fafafa]';
    } else if (row.level === 1) {
      return 'bg-[#f5faff]';
    }
    
    return '';
  };

  useEffect(() => {
    if (activeTabId === 9) {
      const tempData = openedTabs.filter(tab => tab.id === 9);
      if (tempData.length > 0 && tempData[0].campaignId && tempData[0].campaignName) {
        setSelectedCampaignId(tempData[0].campaignId);
        setSelectedCampaignName(tempData[0].campaignName);
        
        // 캠페인 객체도 업데이트
        // const campaign = campaigns.find(c => c.campaign_id.toString() === tempData[0].campaignId);
        // if (campaign) {
        //   setSelectedCampaign(campaign);
        // }
        // 위 코드 이유 무엇? ==> store set을 해줘서 다른 컴포넌트를 멀티탭으로 띄운경우 데이터 덮어씌우기 발생 ==> 주석처리로 사용 X
        
      }
    }
  }, [activeTabId, openedTabs, campaigns]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex title-background justify-between">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Label className="w-20 min-w-20">캠페인 아이디</Label>
            <Select
              value={selectedCampaignId}
              onValueChange={handleCampaignIdChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="캠페인 선택" />
              </SelectTrigger>
              <SelectContent style={{ maxHeight: '300px', overflowY: 'auto' }}> 
                {campaigns.map(campaign => (
                  <SelectItem 
                    key={campaign.campaign_id} 
                    value={campaign.campaign_id.toString()}
                  >
                    {campaign.campaign_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <CustomInput 
            value={selectedCampaignName !== '' ? selectedCampaignName ?? '' : operationCampaignName ?? ''}
            readOnly 
            className="w-[140px]"
            disabled={true}
          />


          <CommonButton 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (hasChanges) {
                showConfirm("저장되지 않은 변경사항이 있습니다. 계속하시겠습니까?", () => {
                  setSelectedCampaignId(operationCampaignId?.toString() || '');
                  setSelectedCampaignName(selectedCampaignName);
                  // setSelectedCampaign(null);
                  setEditedRows({});
                  setHasChanges(false);
                  setIsModalOpen(true);
                });
              } else {
                // setSelectedCampaignId('');
                // setSelectedCampaignName('');
                // setSelectedCampaign(null);
                setIsModalOpen(true);
              }
            }}
          >
            캠페인 조회
          </CommonButton>
          
          <div className="text-sm w-full ml-5">
            응답호수 초기화 시각 : {initTime === "9999" || initTime.slice(0, 2) === '-1' ? "없음" : `${initTime.slice(0, 2)}:${initTime.slice(2)}`}
          </div>
        </div>
        <div className="flex gap-2">
          {/* 시스템 권한별 초기화시각 버튼 노출 */}
          { (menu_role_id === 1 && role_id === 0)&& 
            ( 
              <>
              <CommonButton onClick={openTimeSettingModal}>초기화 시각 변경</CommonButton>
              <CommonButton onClick={() => setIsTimeRemoveOpen(true)}>초기화 시각 설정해제</CommonButton>
              {hasChanges && (
                <>
                  <CommonButton variant="outline" onClick={handleCancelChanges}>변경 취소</CommonButton>
                  <CommonButton onClick={handleBulkSave}>저장</CommonButton>
                </>
              )}
              </>
            )
          }
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div className="text-sm">할당 상담사 목록</div>
          <div className="flex items-center gap-2">
            <Label className="w-12 min-w-12">보기설정</Label>
            <Select 
              value={viewFilter}
              onValueChange={setViewFilter}
              defaultValue='all'
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="해당 상담사 전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>해당 상담사 전체</SelectItem>
                <SelectItem value='remaining'>잔여 분배호수가 남은 상담사</SelectItem>
                <SelectItem value='no-remaining'>잔여 분배호수가 없는 상담사</SelectItem>
                <SelectItem value='no-limit'>최대 분배호수가 설정되지 않은 상담사</SelectItem>
                <SelectItem value='has-limit'>최대 분배호수가 설정된 상담사</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='grid-custom-wrap h-[560px]' ref={gridRef} onContextMenu={(e) => e.preventDefault()}>
          <>
            <DataGrid
              columns={columns}
              rows={flattenRows(treeData)} 
              className="grid-custom"
              onCellClick={handleCellClick}
              rowKeyGetter={rowKeyGetter}
              rowHeight={30}
              headerRowHeight={30}
              rowClass={getRowClass}
              enableVirtualization={false}
            />
            
            {/* 컨텍스트 메뉴 컴포넌트 추가 */}
            {contextMenu.visible && (
              <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                onDelete={handleDeleteMaxCall}
                onChangeBulkLimit={handleOpenBulkLimitModal}
                onClose={handleCloseContextMenu}
                level={contextMenu.level}
              />
            )}
          </>
        </div>
        
        <div className="mt-[20px] text-sm">
          <ul className='space-y-1 notice-li'>
            <li>• 상담사에게 분배하는 콜 수를 제한합니다.</li>
            <li>• 운영시간 중의 일괄처리(Batch)작업은 많은 부하를 발생시켜 정상적인 운영이 불가능 할 수 있습니다.</li>
            <li>• 일괄처리작업의 경우, 발신 량이 적은 시간이나, 업무 종료 후 작업하시기를 권장합니다.</li>
          </ul>
        </div>
      </div>

      <CampaignModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (operationCampaignId && !selectedCampaignId) {
            setSelectedCampaignId(operationCampaignId.toString()); // operationCampaignId를 설정
          }
        }}
        onSelect={handleModalSelect}

      />

      <CustomAlert
        isOpen={isTimeSettingOpen}
        message={
          <div className="flex flex-col gap-4">
            <div className="text-center">
              {initTime === "9999" || initTime.slice(0, 2) === '-1'
                ? "현재 설정 값이 없습니다. 시간을 입력하세요" 
                : `현재 설정값 : ${initTime.slice(0, 2)}시 ${initTime.slice(2)}분`
              }
            </div>
            <div className="flex justify-center pt-2">
              <TimePickerComponent
                value={timeValue}
                onChange={setTimeValue}
              />
            </div>
          </div>
        }
        title="초기화 시간 설정"
        type="1"
        onClose={handleTimeSettingSave}
        onCancel={() => setIsTimeSettingOpen(false)}
      />

      {/* 최대분배호수 일괄 변경 모달 */}
      <CustomAlert
        isOpen={bulkLimitModal.isOpen}
        message={
          <div className="flex flex-col gap-4">
            <div className="text-center mb-2">
              {bulkLimitModal.targetLevel === 1
                ? `그룹 ${bulkLimitModal.targetGroup}의 할당된 콜수를 일괄 변경합니다.`
                : bulkLimitModal.targetLevel === 2
                ? `파트 ${bulkLimitModal.targetPart}의 할당된 콜수를 일괄 변경합니다.`
                : ''}
            </div>
            <div className="flex items-center gap-2">
              <Label className="w-32 min-w-32">최대 발신 건수</Label>
              <OnlyNumberInput
                type="text"
                min={1}
                max={99999}
                value={bulkLimitModal.maxLimit}
                onChange={(e) => {
                  const value = e.target.value;
                  const numericValue = parseInt(value, 10);

                  if(numericValue <= 0){
                    showAlert("최대 발신건수는 최소 1부터 입력 가능합니다.");
                    setBulkLimitModal((prev) => ({ ...prev, maxLimit: "1" }));
                    return; 
                  }

                  if (numericValue > 99999) {
                    showAlert("최대 발신건수는 99999까지 입력 가능합니다.");
                    setBulkLimitModal((prev) => ({ ...prev, maxLimit: "99999" }));
                    return; 
                  }

                  setBulkLimitModal((prev) => ({ ...prev, maxLimit: value }));
                }}
                className="w-[140px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="fixFlagCheckbox"
                checked={bulkLimitModal.fixFlag}
                onChange={(e) => setBulkLimitModal(prev => ({ ...prev, fixFlag: e.target.checked }))}
                className="mr-2"
              />
              <Label htmlFor="fixFlagCheckbox">호수 일괄고정</Label>
            </div>
          </div>
        }
        title="최대분배호수 일괄 변경"
        type="1"
        onClose={handleApplyBulkLimit}
        onCancel={() => setBulkLimitModal(prev => ({ ...prev, isOpen: false }))}
      />

      <CustomAlert
        isOpen={isTimeRemoveOpen}
        message="초기화 시간 설정을 해제 하시겠습니까?"
        title="초기화 시간 설정해제"
        type="1"
        onClose={handleTimeRemove}
        onCancel={() => setIsTimeRemoveOpen(false)}
      />

      <CustomAlert
        isOpen={alertState.isOpen}
        message={alertState.message}
        title={alertState.title}
        type={alertState.type}
        onClose={alertState.onConfirm}
        onCancel={alertState.onCancel}
      />
    </div>
  );
};

export default DistributionLimit;