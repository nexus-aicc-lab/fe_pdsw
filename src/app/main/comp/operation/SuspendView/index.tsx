import React, { useState, useMemo, useEffect, useCallback } from 'react';
import DataGrid from "react-data-grid";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import { Label } from "@/components/ui/label";
import { useApiForDeleteSuspendedCampaign, useApiForDeleteSuspendedSkill, useApiForSuspendedCampaignList, useApiForSuspendedSkillList } from '@/features/preferences/hooks/useApiForSuspendView';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import CustomAlert from '@/components/shared/layout/CustomAlert';
import { useApiForSkillList } from '@/features/preferences/hooks/useApiForSkill';
import { useMainStore } from '@/store';
import ServerErrorCheck from '@/components/providers/ServerErrorCheck';

type ViewMode = 'campaign' | 'skill';

interface BaseRow {
  id: string;
  release_time: string;
}

interface CampaignRow extends BaseRow {
  type: 'campaign';
  campaign_id: string;
  campaign_name: string;
}

interface SkillRow extends BaseRow {
  type: 'skill';
  skill_id: string;
  skill_name: string;
}

type GridRow = CampaignRow | SkillRow;

const errorMessage = {
  isOpen: false,
  message: '',
  title: '로그인',
  type: '2',
};

const SuspendView = () => {
  const router = useRouter();
  const { tenants, campaigns } = useMainStore();
  const [viewMode, setViewMode] = useState<ViewMode>('campaign');
  const [suspendedCampaigns, setSuspendedCampaigns] = useState<any[]>([]);
  const [suspendedSkills, setSuspendedSkills] = useState<any[]>([]);
  const [skillMasterList, setSkillMasterList] = useState<any[]>([]);
  const [isSkillDataLoaded, setIsSkillDataLoaded] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

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

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  // 서스펜드 캠페인 조회
  const { mutate: fetchSuspendedCampaignList } = useApiForSuspendedCampaignList({
    onSuccess: (data) => {
      setSuspendedCampaigns(data.result_data || []);
      setSelectedRows(new Set());
    },
    onError: (error) => {      
      ServerErrorCheck('서스펜드 캠페인 조회', error.message);
    }
  });

  // 서스펜드 캠페인 삭제
  const { mutate: deleteSuspendedCampaign } = useApiForDeleteSuspendedCampaign({
    onSuccess: (data) => {
      showAlert('삭제가 완료되었습니다.');
      fetchSuspendedCampaignList();
    },
    onError: (error) => {      
      ServerErrorCheck('서스펜드 캠페인 삭제', error.message);
    }
  });

  // 서스펜드 스킬 조회
  const { mutate: fetchSuspendedSkillList } = useApiForSuspendedSkillList({
    onSuccess: (data) => {
      setSuspendedSkills(data.result_data || []);
      setSelectedRows(new Set());
    },
    onError: (error) => {      
      ServerErrorCheck('서스펜드 스킬 조회', error.message);
    }
  });

  // 서스펜드 스킬 삭제
  const { mutate: deleteSuspendedSkill } = useApiForDeleteSuspendedSkill({
    onSuccess: (data) => {
      showAlert('삭제가 완료되었습니다.');
      fetchSuspendedSkillList();
    },
    onError: (error) => {      
      ServerErrorCheck('서스펜드 스킬 삭제', error.message);
    }
  });

  // 스킬 마스터 리스트 조회
  const { mutate: fetchSkillList } = useApiForSkillList({
    onSuccess: (data) => {
      setSkillMasterList(data.result_data || []);
      setIsSkillDataLoaded(true);
    },
    onError: (error) => {
      ServerErrorCheck('스킬 마스터 리스트 조회', error.message);
    }
  });
  

  // 초기 렌더링 시 캠페인 모드에 필요한 API만 호출
  useEffect(() => {
    fetchSuspendedCampaignList();
  }, []);

  // viewMode가 변경될 때 필요한 API 호출
  useEffect(() => {
    if (viewMode === 'campaign') {
      fetchSuspendedCampaignList();
    } else if (viewMode === 'skill') {
      fetchSuspendedSkillList();
      
      if (!isSkillDataLoaded) {
        fetchSkillList({ tenant_id_array: tenants.map(tenant => tenant.tenant_id) ? [] : undefined });
      }
    }
  }, [viewMode]);

  // DELETE 키 이벤트 핸들러
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Delete' && selectedRows.size > 0) {
      event.preventDefault();
      handleDeleteSelected();
    }
  }, [selectedRows, viewMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleViewModeChange = (value: string) => {
    setViewMode(value as ViewMode);
    setSelectedRows(new Set());
  };

  const handleDeleteSelected = () => {
    if (selectedRows.size === 0) return;
    
    if (viewMode === 'campaign') {
      const selectedCampaignIds = Array.from(selectedRows).map(id => {
        // 캠페인 ID 추출
        const row = rows.find(r => r.id === id);
        return row?.type === 'campaign' ? parseInt(row.campaign_id) : null;
      }).filter(id => id !== null) as number[];
      
      if (selectedCampaignIds.length === 0) return;
      
      showConfirm(`선택한 ${selectedCampaignIds.length}개의 캠페인을 삭제하시겠습니까?`, () => {
        selectedCampaignIds.forEach(id => {
          deleteSuspendedCampaign(id);
        });
      });
    } else if (viewMode === 'skill') {
      const selectedSkillIds = Array.from(selectedRows).map(id => {
        // 스킬 ID 추출
        const row = rows.find(r => r.id === id);
        return row?.type === 'skill' ? parseInt(row.skill_id) : null;
      }).filter(id => id !== null) as number[];
      
      if (selectedSkillIds.length === 0) return;
      
      showConfirm(`선택한 ${selectedSkillIds.length}개의 스킬을 삭제하시겠습니까?`, () => {
        selectedSkillIds.forEach(id => {
          deleteSuspendedSkill(id);
        });
      });
    }
  };

  const columns = useMemo(() => {
    return viewMode === 'campaign'
      ? [
          { key: 'campaign_id', name: '캠페인 아이디' },
          { key: 'campaign_name', name: '캠페인 이름' },
          { key: 'release_time', name: '해제시간' }
        ]
      : [
          { key: 'skill_id', name: '스킬 아이디' },
          { key: 'skill_name', name: '스킬 이름' },
          { key: 'release_time', name: '해제시간' }
        ];
  }, [viewMode]);

  const rows = useMemo<GridRow[]>(() => {
    if (viewMode === 'campaign') {
      return suspendedCampaigns.map(item => {
        const campaignInfo = campaigns.find(
          campaign => campaign.campaign_id === Number(item.campaign_id)
        );
        
        return {
          type: 'campaign',
          id: `campaign-${item.campaign_id}`,
          campaign_id: String(item.campaign_id),
          campaign_name: campaignInfo ? campaignInfo.campaign_name : '',
          release_time: item.suspend_time
        };
      });
    } else {
      return suspendedSkills.map(item => {
        const skillInfo = skillMasterList.find(
          skill => skill.skill_id === Number(item.skill_id)
        );
        
        return {
          type: 'skill',
          id: `skill-${item.skill_id}`,
          skill_id: String(item.skill_id),
          skill_name: skillInfo ? skillInfo.skill_name : '',
          release_time: item.suspend_time
        };
      });
    }
  }, [viewMode, suspendedCampaigns, suspendedSkills, campaigns, skillMasterList]);

  const rowKeyGetter = (row: GridRow) => row.id;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Label className="w-[8.5rem] min-w-[8.5rem]">Suspend View Mode</Label>
        <Select 
          value={viewMode} 
          onValueChange={handleViewModeChange}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="View Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="campaign">캠페인</SelectItem>
            <SelectItem value="skill">스킬</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-[580px]">
        <div className="grid-custom-wrap h-[230px]">
          <DataGrid
            columns={columns}
            rows={rows}
            className="grid-custom"
            rowHeight={30}
            headerRowHeight={30}
            rowKeyGetter={rowKeyGetter}
            selectedRows={selectedRows}
            onSelectedRowsChange={setSelectedRows}
            onRowsChange={() => {}}
          />
        </div>
        {selectedRows.size > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {selectedRows.size}개의 {viewMode === 'campaign' ? '캠페인' : '스킬'}이 선택됨. 삭제하려면 DELETE 키를 누르세요.
          </div>
        )}
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

export default SuspendView;