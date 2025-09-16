import React, { useState, useMemo, useEffect } from 'react';
import DataGrid, { SelectColumn } from "react-data-grid";
import { CommonButton } from "@/components/shared/CommonButton";
import { CustomInput } from "@/components/shared/CustomInput";
import { Label } from "@/components/ui/label";
import CustomAlert from '@/components/shared/layout/CustomAlert';
import TitleWrap from "@/components/shared/TitleWrap";
import 'react-data-grid/lib/styles.css';
import { useApiForCounselorAssignList } from '@/features/preferences/hooks/useApiForCounselorList';
import { useApiForCampaignList, useApiForCreateSkill, useApiForDeleteAgentSkill, useApiForDeleteSkill, useApiForSkillAgentList, useApiForSkillCampaignList, useApiForSkillList, useApiForUpdateSkill } from '@/features/preferences/hooks/useApiForSkill';
import { useAuthStore, useCampainManagerStore, useMainStore } from '@/store';
import { CounselorAssignListResponse } from '@/features/preferences/types/SystemPreferences';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiForCampaignSkillUpdate } from '@/features/campaignManager/hooks/useApiForCampaignSkillUpdate';
import { useApiForCampaignSkill } from '@/features/campaignManager/hooks/useApiForCampaignSkill';
import { useRouter } from 'next/navigation';
import { SkillListDataResponse } from '@/features/campaignManager/types/campaignManagerIndex';
import { useAgentSkillStatusStore } from '@/store/agenSkillStatusStore';
import { logoutChannel } from '@/lib/broadcastChannel';
import ServerErrorCheck from '@/components/providers/ServerErrorCheck';
import logoutFunction from '@/components/common/logoutFunction';
import { useEnvironmentStore } from '@/store/environmentStore';

// 메인 스킬 정보
interface SkillRow {
  center: string;
  tenant: string;
  tenantId: number;
  skillId: string;
  skillName: string;
  description: string;
  campaignCount: number;
  agentCount: number;
}

// 캠페인 정보 (그리드용)
interface CampaignRow {
  skillId: string;
  campaignId: string;
  campaignName: string;
  mode: string;
}

// 상담사 정보 (그리드용)
interface AgentRow {
  skillId: string;
  teamId: string;
  teamName: string;
  loginId: string;
  agentId: string;
  agentName: string;
  consultMode: string;
}

const errorMessage = {
  isOpen: false,
  message: '',
  title: '로그인',
  type: '2',
}

const SkillEdit = () => {
  const { tenants, campaigns } = useMainStore();
  const { tenant_id, role_id } = useAuthStore();
  const [rows, setRows] = useState<SkillRow[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillRow | null>(null);
  const [selectedCampaignRows, setSelectedCampaignRows] = useState<Set<string>>(new Set());
  const [selectedAgentRows, setSelectedAgentRows] = useState<Set<string>>(new Set());
  const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignRow[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<AgentRow[]>([]);
  const [allCampaigns, setAllCampaigns] = useState<CampaignRow[]>([]);
  // 다중 선택 스킬 관리를 위한 상태 추가 (체크박스로 선택된 항목들)
  const [selectedSkillRows, setSelectedSkillRows] = useState<Set<string>>(new Set());

  const { centerId, centerName} = useEnvironmentStore();

  const { setSkills } = useCampainManagerStore();

  // 사이드바에서 상담사 스킬 할당 변경 감지용 store
  const { agentSkillStatus } = useAgentSkillStatusStore();
  
  const router = useRouter();

  // 신규 등록을 위한 초기 상태
  const initialSkillState = {
    center: '',
    tenant: '',
    tenantId: tenant_id,
    skillId: '',
    skillName: '',
    description: '',
    campaignCount: 0,
    agentCount: 0
  };

  // 수정 가능한 필드들을 위한 상태
  const [editableFields, setEditableFields] = useState({
    tenantId: tenant_id,
    skillId : '',
    skillName: '',
    description: ''
  });

  // 새로운 스킬 생성 모드인지 여부
  const [isNewMode, setIsNewMode] = useState(false);
  
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: '',
    title: '알림',
    type: '2',
    onConfirm: () => {},
    onCancel: () => {}
  });

  // 스킬 그리드 컬럼
  const skillColumns = useMemo(() => [
    SelectColumn,
    { key: 'center', name: '센터' },
    { key: 'tenant', name: '테넌트' },
    { key: 'skillId', name: '스킬 아이디' },
    { key: 'skillName', name: '스킬 이름' },
    { key: 'description', name: '설명' },
    { key: 'campaignCount', name: '소속 캠페인 수' },
    { key: 'agentCount', name: '소속 상담사 수' }
  ], []);

  // 캠페인 그리드 컬럼
  const campaignColumns = useMemo(() => [
    SelectColumn,
    { key: 'campaignId', name: '캠페인 아이디' },
    { key: 'campaignName', name: '캠페인 이름' },
    { key: 'mode', name: '캠페인 모드' }
  ], []);

  // 상담사 그리드 컬럼
  const agentColumns = useMemo(() => [
    SelectColumn,
    { key: 'teamId', name: '팀 아이디' },
    { key: 'teamName', name: '팀 이름' },
    { key: 'loginId', name: '로그인 아이디' },
    { key: 'agentId', name: '상담사 아이디' },
    { key: 'agentName', name: '상담사 이름' },
    { key: 'consultMode', name: '상담모드' }
  ], []);

  const getBlendKindText = (blendKind: string): string => {
    switch (blendKind) {
      case '1': return '인바운드';
      case '2': return '아웃바운드';
      case '3': return '블렌드';
      default: return 'Unknown';
    }
  };

  // 캠페인 발신 모드 변환 함수
  const getDialModeText = (dialMode: number): string => {
    switch (dialMode) {
      case 1: return 'Power Mode';
      case 2: return 'Progressive Mode';
      case 3: return 'Predictive Mode';
      case 5: return 'Preview Mode';
      default: return 'Unknown';
    }
  };

  const getRowClass = (row: any) => {
    return selectedSkill?.skillId === row.skillId ? 'bg-amber-50' : '';
  };

  // 스킬 ID 자동 생성 함수
  const generateSkillId = () => {
    // 스킬 ID가 없는 경우 기본값으로 1 사용
    if (rows.length === 0) return "1";
    
    // 모든 스킬 ID를 숫자로 변환 (숫자가 아닌 경우 필터링)
    const numericSkillIds = rows
      .map(row => row.skillId)
      .filter(id => /^\d+$/.test(id))  // 순수 숫자 형식만 필터링
      .map(id => parseInt(id, 10));
    
    // 최소값 찾아내기
    const minSkillId = numericSkillIds.find((skillId, idx) => {
      if(skillId === idx + 1){
        return skillId;
      }
    }); 
    
    // 비어있는(존재하지않는 스킬아이디) 최소값 반환
    return String(minSkillId ? minSkillId - 1 : 1);
  };

  // 사이드바에서 상담사 스킬 할당 변경 감지용 store
  useEffect(() => {

    if(agentSkillStatus === true){
      
      // fetchCounselorList({ tenantId: tenant_id, roleId: role_id });
      fetchSkillList({ tenant_id_array: tenants.map(tenant => tenant.tenant_id) });
      fetchSkillCampaignList();
      fetchSkillAgentList();
      fetchCampaignList();
      campaignSkillList({
        session_key: '',
        tenant_id: tenant_id
      });
      
      if( selectedSkill !== null && rows.length > 0){ 
        
        const skillId = rows.find((row) => row.skillId === selectedSkill.skillId)?.skillId;
        const tenantId = rows.find((row) => row.skillId === selectedSkill.skillId)?.tenantId;

        fetchCounselorAssignList({
          tenantId: Number(tenantId),
          skillId: Number(skillId)
        });

      }
      

      useAgentSkillStatusStore.getState().setAgentSkillStatus(false);
    }
    
  }, [agentSkillStatus]);

  // 스킬 로우 클릭 이벤트 핸들러
  const handleSkillClick = ({ row }: { row: SkillRow }) => {
    setSelectedSkill(row);
    setSelectedCampaignRows(new Set());
    setSelectedAgentRows(new Set());
    setEditableFields({
      tenantId: row.tenantId,
      skillName: row.skillName,
      description: row.description,
      skillId: row.skillId
    });
    setIsNewMode(false);

    // 캠페인 데이터 불러오기
    const loadCampaignData = () => {
      if (campaignData && campaignData.result_data) {
        const skillCampaignEntry = campaignData.result_data.find(
          (entry: any) => String(entry.skill_id) === row.skillId
        );
        const campaignIds: string[] = skillCampaignEntry ? skillCampaignEntry.campaign_id : [];
        const relatedCampaigns = allCampaigns.filter(campaign => campaignIds.includes(campaign.campaignId));
        setFilteredCampaigns(relatedCampaigns);
      } else {
        // 캠페인 데이터가 아직 없는 경우 다시 불러오기
        fetchSkillCampaignList();
      }
    };
    
    loadCampaignData();
    
    // 상담사 불러오기
    fetchCounselorAssignList({
      tenantId: row.tenantId,
      skillId: Number(row.skillId)
    });
  };  

  // 스킬 체크박스 선택 변경 이벤트 핸들러 (다중 선택)
  const handleSkillSelectionChange = (selectedRows: Set<string>) => {
    // 체크박스 선택 상태만 업데이트 (상세 정보는 변경하지 않음)
    setSelectedSkillRows(selectedRows);
  };

  const handleCampaignSelectionChange = (selectedRows: Set<string>) => {
    setSelectedCampaignRows(selectedRows);
  };

  const handleAgentSelectionChange = (selectedRows: Set<string>) => {
    setSelectedAgentRows(selectedRows);
  };

  const handleSkillUnassign = () => {
    if (selectedCampaignRows.size === 0) {
      showAlert('스킬을 해제할 캠페인을 선택해주세요.');
      return;
    }
    
    if (!selectedSkill) {
      showAlert('현재 선택된 스킬이 없습니다.');
      return;
    }
    
    const currentSkillId = parseInt(selectedSkill.skillId, 10);
    
    showConfirm('선택한 캠페인에서 현재 스킬을 해제하시겠습니까?', async () => {
      // 선택된 캠페인 ID 배열 생성
      const selectedCampaignIds = Array.from(selectedCampaignRows).map(campaignId => {
        const campaign = filteredCampaigns.find(c => c.campaignId === campaignId);
        return campaign ? parseInt(campaign.campaignId, 10) : 0;
      }).filter(id => id !== 0);
      
      // 최신 캠페인 스킬 데이터 가져오기 위한 호출
      campaignSkillList({
        session_key: '',
        tenant_id: tenant_id
      }, {
        onSuccess: async (data) => {
          const campaignSkillData = data.result_data || [];
          // console.log("최신 캠페인 스킬 데이터", data);
          // console.log("선택된 캠페인 ID", selectedCampaignIds);
          
          // 진행 상태 추적
          let successCount = 0;
          let failCount = 0;
          
          // 각 캠페인에 대해 API 호출
          for (const campaignId of selectedCampaignIds) {
            try {
              // 해당 캠페인의 스킬 데이터 찾기
              const campaignSkillInfo = campaignSkillData.find(
                (item) => item.campaign_id === campaignId
              );
              
              if (!campaignSkillInfo) {
                failCount++;
                // console.error(`캠페인 ID ${campaignId}의 스킬 정보를 찾을 수 없습니다.`);
                showAlert(`캠페인 ID ${campaignId}의 스킬 정보를 찾을 수 없습니다.`);
                continue;
              }
              
              // 현재 선택된 스킬을 제외한 스킬 ID 배열
              const remainingSkillIds = campaignSkillInfo.skill_id
                .filter((skillId) => skillId !== currentSkillId);
              
              // 업데이트 API 호출
              await new Promise((resolve) => {
                campaignSkillUpdate({
                  campaign_id: campaignId,
                  skill_id: remainingSkillIds
                }, {
                  onSuccess: () => {
                    successCount++;
                    resolve(null);
                  },
                  onError: (error) => {
                    failCount++;
                    // console.error(`캠페인 ID ${campaignId} 스킬 해제 실패:`, error);
                    showAlert(`캠페인 ID ${campaignId} 스킬 해제 실패: ${error}`);
                    resolve(null);
                  }
                });
              });
            } catch (error) {
              failCount++;
              // console.error(`캠페인 ID ${campaignId} 스킬 해제 오류:`, error);
              showAlert(`캠페인 ID ${campaignId} 스킬 해제 오류: ${error}`);
            }
          }
          
          // 작업 완료 후 메시지 표시
          if (failCount === 0) {
            showAlert(`${successCount}개 캠페인에서 스킬이 성공적으로 해제되었습니다.`);
          } else {
            showAlert(`${successCount}개 성공, ${failCount}개 실패하였습니다.`);
          }
          
          // 데이터 갱신
          fetchSkillList({ tenant_id_array: tenants.map(tenant => tenant.tenant_id) });
          fetchSkillCampaignList();
          
          // UI에서 선택된 캠페인 즉시 제거 (그리드 즉시 갱신)
          const updatedCampaigns = filteredCampaigns.filter(
            campaign => !selectedCampaignRows.has(campaign.campaignId)
          );
          setFilteredCampaigns(updatedCampaigns);
          
          // 선택 초기화
          setSelectedCampaignRows(new Set());
          
          // 선택된 스킬의 캠페인 카운트 업데이트
          if (selectedSkill) {
            setSelectedSkill(prev => prev ? ({
              ...prev,
              campaignCount: prev.campaignCount - successCount
            }) : prev);
          }
        },
        onError: (error) => {
          if(window.opener){
            if(error.message.split('||')[0] === '5'){
              logoutChannel.postMessage({
                type: 'logout',
                message: error.message,
              });
              window.close();
            }
          }else{
            ServerErrorCheck('캠페인 스킬 데이터 조회', error.message);  
          }
        }
      });
    });
  };

  const handleAgentSkillUnassign = () => {
    if (selectedAgentRows.size === 0) {
      showAlert('스킬을 해제할 상담사을 선택해주세요.');
      return;
    }
  
    // 선택된 상담사 ID 배열 생성
    const selectedAgentIds = Array.from(selectedAgentRows).map(agentId => {
      const agent = filteredAgents.find(agent => agent.agentId === agentId);
      return agent ? agent.agentId : '';
    }).filter(id => id !== ''); // 빈 ID 필터링
  
    // 실제로 API 호출하기 전에 확인 메시지 표시
    showConfirm(`선택한 ${selectedAgentIds.length}명의 상담사 스킬을 해제하시겠습니까?`, () => {
      // 먼저 UI 업데이트 - 이 부분이 중요!
      if (selectedSkill) {
        // 1. 소속상담사 목록에서 선택된 상담사들 제거
        const updatedAgents = filteredAgents.filter(
          agent => !selectedAgentRows.has(agent.agentId)
        );
        setFilteredAgents(updatedAgents);
  
        // 2. 스킬목록에서 소속상담사 수 갱신
        const newAgentCount = selectedSkill.agentCount - selectedAgentIds.length;
        
        // 전체 스킬 목록 업데이트
        setRows(prevRows => 
          prevRows.map(row => 
            row.skillId === selectedSkill.skillId 
              ? { ...row, agentCount: newAgentCount } 
              : row
          )
        );
        
        // 선택된 스킬 정보 업데이트
        setSelectedSkill({
          ...selectedSkill,
          agentCount: newAgentCount
        });
      }
      
      // 선택 초기화
      setSelectedAgentRows(new Set());
      
      // API 호출
      deleteAgentSkill({
        skill_id: Number(selectedSkill?.skillId || 0),
        agent_id: selectedAgentIds
      });
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleNew = () => {
    setSelectedSkill({ ...initialSkillState, skillId: generateSkillId() });
    setEditableFields({
      tenantId: tenant_id,
      skillName: '',
      description: '',
      skillId: generateSkillId()
    });
    setSelectedCampaignRows(new Set());
    setSelectedAgentRows(new Set());
    setFilteredCampaigns([]);
    setFilteredAgents([]);
    setIsNewMode(true);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSave = () => {
    if (isNewMode && (!editableFields.skillName || !editableFields.description)) {
      showAlert('스킬 이름과 설명을 모두 입력해주세요.');
      return;
    }
    if(isNewMode && !editableFields.skillId){
      showAlert('스킬 아이디를 입력해주세요.');
      return;
    }

    const skillData = {
      skill_id: Number(editableFields?.skillId),
      tenant_id: editableFields.tenantId,
      skill_name: editableFields.skillName,
      skill_description: editableFields.description
    };

    const savedSkillId = String(selectedSkill?.skillId);

    if (isNewMode) {
      createSkill(skillData, {
        onSuccess: () => {
          fetchSkillList({ tenant_id_array: tenants.map(tenant => tenant.tenant_id) });
          setTimeout(() => {
            const newSkill = rows.find(r => r.skillId === savedSkillId);
            if (newSkill) {
              handleSkillClick({ row: newSkill });
            }
          }, 300);
          
        },
        onError: (error) => {
          if ( error.message.split('||')[0] === '403') {
            showAlert(`이미 존재하는 스킬 아이디입니다. 다시 입력해주세요.`);
            // console.log(`error info : ${error.message}`);
          }
          else if(window.opener){
            if(error.message.split('||')[0] === '5'){
              logoutChannel.postMessage({
                type: 'logout',
                message: error.message,
              });
              window.close();
            }
          }else{
            ServerErrorCheck('스킬 추가 요청', error.message);  
          }
        }
      });
    } else {
      updateSkill(skillData, {
        onSuccess: () => {
          fetchSkillList({ tenant_id_array: tenants.map(tenant => tenant.tenant_id) });
        },
        onError: (error) => {
          if(window.opener){
            if(error.message.split('||')[0] === '5'){
              logoutChannel.postMessage({
                type: 'logout',
                message: error.message,
              });
              window.close();
            }
          }else{
            if ( error.message.split('||')[0] === '403') {
              // console.log(`스킬 데이터 error info : ${error.message}`);
            } else{
              ServerErrorCheck('스킬 데이터 수정', error.message);  
            }
            
          }
        }
      });
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleDelete = () => {

    if (!selectedSkill || rows.find((row) => row.skillId === selectedSkill?.skillId) === undefined) {
      showAlert('생성되지 않거나 선택되지 않은 스킬아이디는 삭제 할 수 없습니다.');
      return;
    }

    // 체크박스로 선택된 스킬이 있는 경우 다중 삭제 진행
    if (selectedSkillRows.size > 0) {
      // 선택된 스킬 ID 배열 생성
      const selectedSkillIds = Array.from(selectedSkillRows);
      
      // 선택된 스킬 중 사용 중인 스킬이 있는지 확인
      const inUseSkills = selectedSkillIds
        .map(skillId => rows.find(row => row.skillId === skillId))
        .filter(skill => skill && (skill.campaignCount > 0 || skill.agentCount > 0));
      
      if (inUseSkills.length > 0) {
        // 사용 중인 스킬 이름들을 출력
        const inUseSkillNames = inUseSkills.map(skill => skill?.skillName).join(', ');
        showAlert(`다음 스킬은 사용 중이므로 삭제할 수 없습니다: ${inUseSkillNames}`);
        return;
      }

      // 확인 메시지
      const confirmMessage = selectedSkillIds.length === 1
        ? '선택한 스킬을 삭제하시겠습니까?\n\n※주의 : 삭제시 데이터베이스에서 완전 삭제됩니다. \n다시 한번 확인해 주시고 삭제해주세요.'
        : `선택한 ${selectedSkillIds.length}개 스킬을 삭제하시겠습니까?\n\n※주의 : 삭제시 데이터베이스에서 완전 삭제됩니다. \n다시 한번 확인해 주시고 삭제해주세요.`;
      
      showConfirm(confirmMessage, async () => {
        let successCount = 0;
        let failCount = 0;
        
        // 각 스킬에 대해 API 호출
        for (const skillId of selectedSkillIds) {
          try {
            await new Promise<void>((resolve, reject) => {
              deleteSkill({ skill_id: Number(skillId), skill_name: editableFields.skillName}, {
                onSuccess: () => {
                  successCount++;
                  resolve();
                },
                onError: (error) => {
                  if (error.message.split('||')[0] === '5') {
                    setAlertState({
                      ...errorMessage,
                      isOpen: true,
                      message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
                      onConfirm: closeAlert,
                      onCancel: () => {}
                    });
                    logoutFunction();
                    setTimeout(() => {
                      router.push('/login');
                    }, 1000);
                  } else {
                      failCount++;
                      showAlert(`스킬 ID ${skillId} 삭제 실패: ${error}`);
                      reject(error);
                  }
                }
              });
            });
          } catch (error) {
            showAlert(`스킬 ID ${skillId} 삭제 중 오류:  ${error}`);
          }
        }
        
        // 작업 완료 후 메시지 표시
        if (failCount === 0) {
          showAlert(`${successCount}개 스킬이 성공적으로 삭제되었습니다.`);
        } else {
          showAlert(`${successCount}개 삭제 성공, ${failCount}개 삭제 실패하였습니다.`);
        }
        
        // 스킬 리스트 새로고침
        fetchSkillList({ tenant_id_array: tenants.map(tenant => tenant.tenant_id) });
        
        // 체크박스 선택 초기화
        setSelectedSkillRows(new Set());
        
        // 선택된 스킬이 삭제되었을 경우 상세 정보도 초기화
        if (selectedSkill && selectedSkillIds.includes(selectedSkill.skillId)) {
          setSelectedSkill(null);
          setEditableFields({
            tenantId: tenant_id,
            skillName: '',
            description: '',
            skillId: ''
          });
          setFilteredCampaigns([]);
          setFilteredAgents([]);
          setSelectedCampaignRows(new Set());
          setSelectedAgentRows(new Set());
        }
      });
    } 
    // 체크박스 선택이 없고 단일 로우 선택일 경우 기존 삭제 로직 사용
    else if (selectedSkill) {
      if (selectedSkill.campaignCount > 0 || selectedSkill.agentCount > 0) {
        showAlert('사용 중인 스킬은 삭제할 수 없습니다.');
        return;
      }
    
      showConfirm('선택한 스킬을 삭제하시겠습니까?\n\n※주의 : 삭제시 데이터베이스에서 완전 삭제됩니다. \n다시 한번 확인해 주시고 삭제해주세요.', () => {
        deleteSkill({ skill_id: Number(selectedSkill.skillId), skill_name: editableFields.skillName}, {
          onSuccess: () => {
            // 스킬 리스트 새로고침
            fetchSkillList({ tenant_id_array: tenants.map(tenant => tenant.tenant_id) });
            
            // 상세 정보 초기화
            setSelectedSkill(null);
            setEditableFields({
              tenantId: tenant_id,
              skillName: '',
              description: '',
              skillId: ''
            });
            
            // 관련 데이터 초기화
            setFilteredCampaigns([]);
            setFilteredAgents([]);
            setSelectedCampaignRows(new Set());
            setSelectedAgentRows(new Set());
            
            showAlert('스킬이 성공적으로 삭제되었습니다.');
          },
          onError: (error) => {
            if (error.message.split('||')[0] === '5') {
              setAlertState({
                ...errorMessage,
                isOpen: true,
                message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
                onConfirm: closeAlert,
                onCancel: () => {}
              });
              logoutFunction();
              setTimeout(() => {
                router.push('/login');
              }, 1000);
            } else {
                showAlert(`삭제 실패: ${error.message}`);
            }
          }
        });
      });
    }
    else {
      showAlert('삭제할 스킬을 선택해주세요.');
    }
  };

  const handleInputChange = (field: 'skillName' | 'description' | 'skillId', value: string) => {
    setEditableFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTenantChange = (value: string) => {
    const tenantId = parseInt(value);
    setEditableFields(prev => ({
      ...prev,
      tenantId
    }));
  };

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

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  // API 상태 관리
  const [campaignData, setCampaignData] = useState<any>(null);
  const [agentData, setAgentData] = useState<any>(null);

  

  // API Hooks
  const { mutate: fetchSkillList, data: skillData } = useApiForSkillList({

    onSuccess: (data) => {      
      const skills = data.result_data.map((skill: SkillListDataResponse) => ({
        tenant_id: skill.tenant_id,
        skill_id: skill.skill_id,
        skill_name: skill.skill_name,
        skill_description: skill.skill_description
      }));
      setSkills(skills);

    },
    onError: (error) => {
      if (error.message.split('||')[0] === '5') {
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
          onConfirm: closeAlert,
          onCancel: () => {}
        });
        logoutFunction();
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      } else {
        showAlert(`스킬 리스트 조회 실패: ${error.message}`);
      }
    }
  });

  const { mutate: fetchSkillCampaignList } = useApiForSkillCampaignList({
    onSuccess: (data) => {
      setCampaignData(data);
    },
    onError: (error) => {
      if (error.message.split('||')[0] === '5') {
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
          onConfirm: closeAlert,
          onCancel: () => {}
        });
        logoutFunction();
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      }
    }
  });

  const { mutate: fetchSkillAgentList } = useApiForSkillAgentList({
    onSuccess: (data) => {
      // console.log("data : ", data);
      setAgentData(data.result_data);
    },
    onError: (error) => {
      if (error.message.split('||')[0] === '5') {
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
          onConfirm: closeAlert,
          onCancel: () => {}
        });
        logoutFunction();
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      }
    }
  });

  const { mutate: fetchCampaignList } = useApiForCampaignList({
    onSuccess: (data) => {
      const campaigns = data.result_data.map((campaign: any) => ({
        skillId: '',
        campaignId: String(campaign.campaign_id),
        campaignName: campaign.campaign_name,
        mode: getDialModeText(campaign.dial_mode)
      }));
      setAllCampaigns(campaigns);
    },
    onError: (error) => {
      if (error.message.split('||')[0] === '5') {
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
          onConfirm: closeAlert,
          onCancel: () => {}
        });
        logoutFunction();
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      }
    }
  });

  const { mutate: fetchCounselorAssignList } = useApiForCounselorAssignList({
    onSuccess: (data: CounselorAssignListResponse) => {
      if (data.skillAssignedCounselorList) {
        const mappedAgents: AgentRow[] = data.skillAssignedCounselorList.map(counselor => ({
          skillId: selectedSkill?.skillId || '',
          teamId: counselor.affiliationTeamId,
          teamName: counselor.affiliationTeamName,
          loginId: counselor.counselorId,
          agentId: counselor.counselorEmplNum,
          agentName: counselor.counselorname,
          consultMode: getBlendKindText(counselor.blendKind)
        }));
        // 소속 상담사목록 팀아이디 기준 오름차순 정렬
        setFilteredAgents(
          mappedAgents.sort((a, b) => {
            const teamDiff = Number(a.teamId) - Number(b.teamId);
            if (teamDiff !== 0) return teamDiff;
            return a.agentId.localeCompare(b.agentId); // 문자열 비교
          })
        );
        // BQSQ-122 1차정렬 팀아이디, 2차정렬 상담사아이디 오름차순 정렬
        // setFilteredAgents(mappedAgents.sort((a,b)=> Number(a.teamId) - Number(b.teamId)));
      }
    },
    onError: (error) => {
      if (error.message.split('||')[0] === '5') {
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
          onConfirm: closeAlert,
          onCancel: () => {}
        });
        logoutFunction();
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      }
    }
  });

  const { mutate: createSkill } = useApiForCreateSkill({
    onSuccess: (data, variables) => {

      if(data.result_code !== 0) {
        if(data.result_code === -1) {
          showAlert(`스킬 아이디가 중복되었습니다. 다른 스킬 아이디를 입력해주세요.`);
          return;
        }
        else  {
          showAlert(`저장 실패: ${data.result_msg} , ${data.result_code}`);
          return;
        }
      }

      // 스킬 리스트 새로고침
      fetchSkillList({ tenant_id_array: tenants.map((tenant) => tenant.tenant_id) });

      // 새로 생성된 스킬 데이터
      const newSkill = {
        center: getSelectedTenantCenterName()|| '',
        tenant: tenants.find((tenant) => tenant.tenant_id === variables.tenant_id)?.tenant_name || '',
        tenantId: variables.tenant_id,
        skillId: String(variables.skill_id),
        skillName: variables.skill_name,
        description: variables.skill_description,
        campaignCount: 0,
        agentCount: 0,
      };

      // rows에 새로 생성된 스킬 추가
      setRows((prevRows) => [...prevRows, newSkill]);

      // 새로 생성된 스킬 ID로 handleSkillClick 호출
      handleSkillClick({ row : newSkill });

      showAlert('스킬이 성공적으로 추가되었습니다.');

    },
    onError: (error) => {
      if (error.message.split('||')[0] === '5') {
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
          onConfirm: closeAlert,
          onCancel: () => {}
        });
        logoutFunction();
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      } else if(error.message.split('||')[0] === '403') {
        showAlert(`이미 존재하는 스킬아이디 입니다.`);
      }
      else{
        showAlert(`스킬 추가 실패: ${error.message}`);
      }
    }
  });

  const { mutate: updateSkill } = useApiForUpdateSkill({
    onSuccess: () => {
      showAlert('스킬이 성공적으로 수정되었습니다.');
    },
    onError: (error) => {
      if (error.message.split('||')[0] === '403'){
        showAlert(`올바른 스킬 데이터가 아닙니다. 다시 확인해주세요.`);
        return;
      } else{
        ServerErrorCheck('스킬 수정 요청', error.message);
      }
      
    }
  });

  const { mutate: deleteSkill } = useApiForDeleteSkill({
    onSuccess: () => {
      // showAlert('스킬이 성공적으로 삭제되었습니다.');
    },
    onError: (error) => {
      ServerErrorCheck('스킬 삭제 요청', error.message);
    }
  })

  const { mutate: deleteAgentSkill } = useApiForDeleteAgentSkill({
    onSuccess: () => {
      // API 성공 알림만 표시
      showAlert('상담사 스킬이 성공적으로 해제되었습니다.');
    },
    onError: (error) => {
      ServerErrorCheck('상담사 스킬 해제 요청', error.message);
    }
  });

  // 캠페인스킬 조회
  const { mutate: campaignSkillList } = useApiForCampaignSkill({
    onError: (error) => {
      ServerErrorCheck('캠페인 스킬 조회 요청', error.message);
    }
  })

  const { mutate: campaignSkillUpdate } = useApiForCampaignSkillUpdate({
  onSuccess: () => {
    showAlert('캠페인 스킬 할당이 성공적으로 완료되었습니다.');
  },
  onError: (error) => {
    ServerErrorCheck('캠페인 스킬 할당 요청', error.message);
  }
  });

  // 테넌트 선택시 관련 센터 정보 가져오기
  const getSelectedTenantCenterName = () => {
    // if (!counselorData?.organizationList || !selectedSkill) return '';

    // // 선택된 테넌트 ID에 해당하는 센터 이름 찾기
    // for (const org of counselorData.organizationList) {
    //   const tenant = org.tenantInfo.find(t => t.tenantId === String(editableFields.tenantId));
    //   if (tenant || editableFields.tenantId === 0) {
    //     return org.centerName;
    //   }
    // }
    if(centerId !== "" && centerName !== ""){
      return centerName;
    }
    return '';
  };

  const isFieldDisabled = () => {
    // 선택된 스킬이 없고 신규 모드도 아니면 비활성화
    return !selectedSkill && !isNewMode;
  };

  useEffect(() => {
    if (campaignData && selectedSkill) {
      
      // 캠페인 데이터 구조 탐색
      let campaignIds: any[] = [];
      
      if (campaignData.result_data && Array.isArray(campaignData.result_data)) {
        const skillCampaignEntry = campaignData.result_data.find(
          (entry: any) => String(entry.skill_id) === selectedSkill.skillId
        );
        
        if (skillCampaignEntry && Array.isArray(skillCampaignEntry.campaign_id)) {
          campaignIds = skillCampaignEntry.campaign_id;
        }
      }
      
      // 문자열과 숫자 비교를 모두 허용하기 위한 필터링
      const relatedCampaigns = allCampaigns.filter(campaign => {
        const campaignIdNum = Number(campaign.campaignId);
        return campaignIds.some(id => id === campaign.campaignId || id === campaignIdNum);
      });
      
      setFilteredCampaigns(relatedCampaigns);
    }
  }, [campaignData, selectedSkill, allCampaigns]);

  // 스킬 목록이 업데이트 될 때마다 현재 선택된 스킬의 상세 정보도 갱신하는 useEffect 추가
  useEffect(() => {
    if (selectedSkill && rows.length > 0) {
      const updatedSkill = rows.find(row => row.skillId === selectedSkill.skillId);
      if (updatedSkill) {
        // 필요한 정보가 변경된 경우만 업데이트 (불필요한 리렌더링 방지)
        if (updatedSkill.center !== selectedSkill.center || 
            updatedSkill.tenant !== selectedSkill.tenant ||
            updatedSkill.skillName !== selectedSkill.skillName ||
            updatedSkill.description !== selectedSkill.description ||
            updatedSkill.skillId !== selectedSkill.skillId) {
          setSelectedSkill(updatedSkill);
          setEditableFields({
            tenantId: updatedSkill.tenantId,
            skillName: updatedSkill.skillName,
            description: updatedSkill.description,
            skillId: updatedSkill.skillId
          });
        }
      }
    }
  }, [rows, selectedSkill]);



  useEffect(() => {
    // fetchCounselorList({ tenantId: tenant_id, roleId: role_id });
    fetchSkillList({ tenant_id_array: tenants.map(tenant => tenant.tenant_id) });
    fetchSkillCampaignList();
    fetchSkillAgentList();
    fetchCampaignList();
    campaignSkillList({
      session_key: '',
      tenant_id: tenant_id
    });
  }, [tenant_id, role_id, tenants, fetchSkillList, fetchSkillCampaignList, fetchSkillAgentList, fetchCampaignList, campaignSkillList]);

  useEffect(() => {
    if (
      skillData?.result_data
    ) {

      const tenantMap: { [tenantId: string]: { centerName: string; tenantName: string } } = {};
      
      skillData.result_data.forEach((skill: SkillListDataResponse) => {
        const tenantId = String(skill.tenant_id);
        const tenant = tenants.find((tenant) => tenant.tenant_id === Number(tenantId));
        tenantMap[tenantId] = {
          centerName: getSelectedTenantCenterName() || '',
          tenantName: tenant ? tenant.tenant_name : ''
        };
      });

      const campaignResultData = (campaignData?.result_data) || [];
      const agentResultData = (agentData) || [];
      // console.log('agentResultData : ', agentResultData);
      
      const skillRows: SkillRow[] = skillData.result_data.map(skill => {
        const tenantInfo = tenantMap[String(skill.tenant_id)] || { centerName: '', tenantName: '' };
        const campaignEntry = campaignResultData.find((item: any) => String(item.skill_id) === String(skill.skill_id));
        const agentEntry = agentResultData.find((item: any) => String(item.skill_id) === String(skill.skill_id));
        
        // console.log('agentEntry : ', agentEntry);
        return {
          center: tenantInfo.centerName,
          tenant: tenantInfo.tenantName,
          tenantId: skill.tenant_id,
          skillId: String(skill.skill_id),
          skillName: skill.skill_name,
          description: skill.skill_description,
          campaignCount: campaignEntry ? campaignEntry.campaign_id.length : 0,
          agentCount: agentEntry ? agentEntry.agent_id.length : 0
        };
      });
      setRows(skillRows);
    }
  }, [skillData, campaignData, agentData]);

  // 키보드 이벤트 핸들러 추가
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (alertState.isOpen) {
        // Enter 키: 확인 버튼 클릭
        if (event.key === 'Enter') {
          event.preventDefault();
          alertState.onConfirm();
          return;
        }
        
        // Esc 키: 취소 버튼 클릭 (type이 '1'인 경우에만)
        if (event.key === 'Escape' && alertState.type === '1') {
          event.preventDefault();
          alertState.onCancel();
          return;
        }
        
        // 경고창이 열려 있을 때는 다른 단축키를 처리하지 않음
        return;
      }
      
      // Ctrl + S: 저장
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
      
      // Ctrl + D 또는 Delete: 삭제
      if ((event.ctrlKey && event.key === 'd') || event.key === 'Delete') {
        event.preventDefault();
        handleDelete();
      }
      
      // 아래 화살표: 신규
      if (event.key === 'ArrowDown' && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        // 입력 필드에서는 아래 화살표가 정상 작동하도록 예외 처리
        if (
          document.activeElement?.tagName !== 'INPUT' && 
          document.activeElement?.tagName !== 'SELECT' &&
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          // 이벤트의 기본 동작과 전파를 모두 차단
          event.preventDefault();
          event.stopPropagation();
          handleNew();
        }
      }
    };

    // 캡처 단계에서 이벤트 리스너 등록 (이벤트 버블링보다 먼저 실행됨)
    window.addEventListener('keydown', handleKeyDown, true);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [alertState, handleDelete, handleNew, handleSave]);

  return (
    <div className="flex overflow-x-auto">
      <div className="flex gap-8">
        <div className="w-[800px] flex flex-col gap-3">
          {/* 스킬 목록 그리드 */}
          <div>
            <TitleWrap title="스킬 목록" totalCount={rows.length} />
            <div className="grid-custom-wrap h-[230px]">
              <DataGrid
                columns={skillColumns}
                rows={rows}
                className="grid-custom"
                onCellClick={(props) => {
                  // SelectColumn을 클릭한 경우는 제외하고 로우 선택 처리
                  if (props.column.key !== SelectColumn.key) {
                    // 현재 선택된 스킬과 클릭한 스킬이 동일한지 확인
                    if (selectedSkill?.skillId === props.row.skillId) {
                      // 동일한 셀을 클릭한 경우 아무 작업도 하지 않음
                      return;
                    }
                    // 다른 셀을 클릭한 경우 데이터 변경
                    handleSkillClick(props);
                  }
                  
                }}
                rowKeyGetter={(row) => row.skillId}
                // selectedRows={selectedSkill ? new Set<string>([selectedSkill.skillId]) : new Set<string>()}
                selectedRows={selectedSkillRows}
                onSelectedRowsChange={handleSkillSelectionChange}
                rowHeight={30}
                headerRowHeight={30}
                rowClass={getRowClass}
                enableVirtualization={false}
              />
            </div>
          </div>
          
          {/* 소속 캠페인 목록 */}
          <div>
            <TitleWrap 
              title="소속 캠페인 목록" 
              totalCount={filteredCampaigns.length}
              buttons={[
                { 
                  label: "선택 캠페인 스킬할당 해제",
                  onClick: handleSkillUnassign
                },
              ]}
            />
            <div className="grid-custom-wrap h-[200px]">
              <DataGrid
                columns={campaignColumns}
                rows={filteredCampaigns}
                className="grid-custom"
                rowKeyGetter={(row) => row.campaignId}
                selectedRows={selectedCampaignRows}
                onSelectedRowsChange={handleCampaignSelectionChange}
                rowHeight={30}
                headerRowHeight={30}
                enableVirtualization={false}
              />
            </div>
          </div>

          {/* 소속 상담사 목록 */}
          <div>
            <TitleWrap 
              title="소속 상담사 목록" 
              totalCount={filteredAgents.length}
              buttons={[
                { 
                  label: "선택 상담사 스킬할당 해제",
                  onClick: handleAgentSkillUnassign
                },
              ]}
            />
            <div className="grid-custom-wrap h-[200px]">
              <DataGrid
                columns={agentColumns}
                rows={filteredAgents}
                className="grid-custom"
                rowKeyGetter={(row) => row.agentId}
                selectedRows={selectedAgentRows}
                onSelectedRowsChange={handleAgentSelectionChange}
                rowHeight={30}
                headerRowHeight={30}
                enableVirtualization={false}
              />
            </div>
          </div>
        </div>

        {/* 오른쪽 상세 정보 */}
        <div className="w-[513px]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label className="w-[8rem] min-w-[8rem]">센터</Label>
              <CustomInput 
                value={isNewMode ? getSelectedTenantCenterName() : selectedSkill?.center || ''}
                className="w-full"
                disabled
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="w-[8rem] min-w-[8rem]">테넌트</Label>
              {isNewMode ? (
                <Select 
                  value={editableFields.tenantId !== null ? String(editableFields.tenantId) : ''}
                  onValueChange={handleTenantChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.tenant_id} value={String(tenant.tenant_id)}>
                        {tenant.tenant_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <CustomInput 
                  value={selectedSkill?.tenant || ''}
                  className="w-full"
                  disabled
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Label className="w-[8rem] min-w-[8rem]">스킬 아이디</Label>
              <CustomInput
                type="number"
                value={editableFields.skillId || ''}
                onChange={e => {
                  const raw = e.target.value;

                  // 빈 값이면 그대로 반영 (백스페이스 등 허용)
                  if (raw === '') {
                    handleInputChange('skillId', '');
                    return;
                  }

                  // 숫자인지 확인 (소수점/문자 방지)
                  const num = Number(raw);
                  if (!Number.isNaN(num) && Number.isInteger(num) && num >= 0) {
                    handleInputChange('skillId', String(num));
                  }
              }}
                
              className="w-full"
              disabled={!isNewMode}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="w-[8rem] min-w-[8rem]">스킬 이름</Label>
              <CustomInput 
                value={editableFields.skillName}
                onChange={(e) => handleInputChange('skillName', e.target.value)}
                className="w-full"
                disabled={isFieldDisabled()} // 비활성화 조건 추가
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="w-[8rem] min-w-[8rem]">설명</Label>
              <CustomInput 
                value={editableFields.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full"
                disabled={isFieldDisabled()} // 비활성화 조건 추가
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <CommonButton onClick={handleNew}>신규</CommonButton>
            <CommonButton onClick={handleSave}>저장</CommonButton>
            <CommonButton onClick={handleDelete}>삭제</CommonButton>
          </div>
          <div className="mt-[20px] text-sm">
            <ul className='space-y-1 notice-li'>
              <li>• 스킬을 추가, 수정, 삭제할 수 있습니다.</li>
              <li>• 사용 중인 스킬은 추가 및 삭제할 수 없습니다.</li>
              <li>
                • 기능설명<br/>
                스킬 추가 = 키보드 ↓<br/>
                스킬 삭제 = 키보드 Delete<br/>
                체크박스를 선택하여 다중 선택 가능(다중선택은 삭제만 가능)
                {/* 다중 선택 = Shift 또는 Ctrl 키를 이용하여 다중 선택 가능 */}
              </li>
              <li>• 단축키<br/>저장하기(Ctrl+S)<br/>삭제하기(Ctrl+D or Del)</li>
            </ul>
          </div>
        </div>
      </div>
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

export default SkillEdit;