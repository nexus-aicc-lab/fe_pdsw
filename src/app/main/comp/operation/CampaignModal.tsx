import React, { useState, useEffect, useMemo } from 'react';
import { CustomInput } from "@/components/shared/CustomInput";
import { Label } from "@/components/ui/label";
import DataGrid, { CellClickArgs } from 'react-data-grid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import { useCampainManagerStore, useMainStore } from '@/store';
import { SkillListDataResponse } from '@/features/campaignManager/types/campaignManagerIndex';
import CustomAlert from '@/components/shared/layout/CustomAlert';
import TitleWrap from "@/components/shared/TitleWrap";
import { useApiForSkills } from '@/features/campaignManager/hooks/useApiForSkills';
import { useApiForCallingNumber } from '@/features/campaignManager/hooks/useApiForCallingNumber';
import { useApiForCampaignSkill } from '@/features/campaignManager/hooks/useApiForCampaignSkill';
import ServerErrorCheck from '@/components/providers/ServerErrorCheck';

const dialModeList = [
  { dial_id: 1, dial_name: 'Power' },
  { dial_id: 2, dial_name: 'Progressive' },
  { dial_id: 3, dial_name: 'Predictive' },
  { dial_id: 4, dial_name: 'System Preview' },
];

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (campaignId: string, campaignName: string) => void;
}

interface Row {
  campaign_id: number;
  campaign_name: string;
  tenant_name: string;
  skills: string;
  dial_mode: string;
  calling_number: string;
}

export default function CampaignModal({ isOpen, onClose, onSelect }: CampaignModalProps) {
  const { tenants, campaigns } = useMainStore();
  const { campaignSkills, setCampaignSkills, callingNumbers, setCallingNumbers } = useCampainManagerStore();
  const [skills, setSkills] = useState<SkillListDataResponse[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  
  // 검색 필터 상태
  const [tenantId, setTenantId] = useState('all');
  const [campaignName, setCampaignName] = useState('');
  const [dialMode, setDialMode] = useState('all');
  const [skill, setSkill] = useState('all');
  const [callNumber, setCallNumber] = useState('');

  // API 호출 훅들
  const { mutate: fetchCallingNumbers } = useApiForCallingNumber({
    onSuccess: (data) => {
      setCallingNumbers(data.result_data || []);
    },
    onError: (error) => {
      ServerErrorCheck('발신번호 조회', error.message);
    }
  });

  const { mutate: fetchSkills } = useApiForSkills({
    onSuccess: (data) => {
      setSkills(data.result_data);
    },
    onError: (error) => {
      ServerErrorCheck('스킬 조회', error.message);
    }
  });

  const { mutate: fetchCampaignSkills } = useApiForCampaignSkill({
    onSuccess: (data) => {
      setCampaignSkills(data.result_data);
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 스킬 조회', error.message);
    }
  });

  // 초기 데이터 로드
  useEffect(() => {
    if (tenants.length > 0) {
      fetchSkills({
        tenant_id_array: tenants.map(t => t.tenant_id)
      });

      fetchCampaignSkills({
        session_key: '',
        tenant_id: 0,
      });
      
      fetchCallingNumbers({
        session_key: '',
        tenant_id: 0,
      });
    }
  }, [tenants, fetchSkills, fetchCallingNumbers, fetchCampaignSkills]);

  // 테넌트별 스킬 필터링
  const filteredSkills = useMemo(() => {
    if (tenantId === 'all') {
      return skills;
    }
    return skills.filter(skill => skill.tenant_id === Number(tenantId));
  }, [skills, tenantId]);

  // 테넌트 변경 시 스킬 초기화
  useEffect(() => {
    setSkill('all');
  }, [tenantId]);

  // 캠페인 데이터를 Row 형태로 변환하는 함수
  const transformCampaignToRow = useMemo(() => {
    return (campaign: any): Row => {
      const tenant = tenants.find(t => t.tenant_id === campaign.tenant_id);
      
      // 캠페인에 해당하는 스킬 ID 배열 찾기
      const campaignSkill = campaignSkills.find(c => c.campaign_id === campaign.campaign_id);
      
      // 스킬 ID에 해당하는 스킬 이름 찾기
      const skillNames = skills
        .filter(skill => campaignSkill?.skill_id?.includes(skill.skill_id))
        .map(skill => skill.skill_name)
        .join(', ');

      const dialModeName = dialModeList
        .find(d => d.dial_id === campaign.dial_mode)?.dial_name || '';

      const campaignCallingNumber = callingNumbers
        .find(c => c.campaign_id === campaign.campaign_id);

      return {
        campaign_id: campaign.campaign_id,
        campaign_name: campaign.campaign_name,
        tenant_name: tenant?.tenant_name || '',
        skills: skillNames,
        dial_mode: dialModeName,
        calling_number: campaignCallingNumber?.calling_number || '',
      };
    };
  }, [tenants, campaignSkills, skills, callingNumbers]);

  // 필터링된 캠페인 목록
  const filteredRows = useMemo(() => {
    let filtered = campaigns;

    // 테넌트 필터
    if (tenantId !== 'all') {
      filtered = filtered.filter(campaign => campaign.tenant_id === Number(tenantId));
    }

    // 캠페인 이름 필터
    if (campaignName) {
      filtered = filtered.filter(campaign => 
        campaign.campaign_name.toLowerCase().includes(campaignName.toLowerCase())
      );
    }

    // 다이얼 모드 필터
    if (dialMode !== 'all') {
      filtered = filtered.filter(campaign => campaign.dial_mode === Number(dialMode));
    }

    // 스킬 필터
    if (skill !== 'all') {
      filtered = filtered.filter(campaign => {
        const campaignSkill = campaignSkills.find(c => c.campaign_id === campaign.campaign_id);
        return campaignSkill?.skill_id?.includes(Number(skill));
      });
    }

    // 발신번호 필터
    if (callNumber) {
      filtered = filtered.filter(campaign => {
        const campaignCallingNumber = callingNumbers
          .find(c => c.campaign_id === campaign.campaign_id)?.calling_number;
        return campaignCallingNumber?.toLowerCase().includes(callNumber.toLowerCase());
      });
    }

    return filtered.map(transformCampaignToRow);
  }, [campaigns, tenantId, campaignName, dialMode, skill, callNumber, transformCampaignToRow, campaignSkills, callingNumbers]);

  const columns = useMemo(() => [
    { 
      key: 'campaign_id', 
      name: '캠페인 아이디',
      width: 150,
    },
    { 
      key: 'campaign_name', 
      name: '캠페인 이름',
      width: 244,
    },
    { 
      key: 'tenant_name', 
      name: '테넌트',
      width: 150,
    },
    { 
      key: 'skills', 
      name: '스킬',
      width: 200,
    },
    { 
      key: 'dial_mode', 
      name: '다이얼 모드',
      width: 150,
    },
    { 
      key: 'calling_number', 
      name: '발신번호',
      width: 150,
    }
  ], []);

  const handleCellClick = ({ row }: CellClickArgs<Row>) => {
    const campaign = campaigns.find(c => c.campaign_id === row.campaign_id);
    if (campaign) {
      setSelectedCampaign(campaign);
    }
  };

  const handleConfirm = () => {
    if (selectedCampaign) {
      onSelect(
        selectedCampaign.campaign_id.toString(),
        selectedCampaign.campaign_name
      );
    }
    onClose();
  };

  const handleClose = () => {
    setSelectedCampaign(null);
    onSelect('', '');
    onClose();
  };

  // 검색 필터 초기화
  const resetFilters = () => {
    setTenantId('all');
    setCampaignName('');
    setDialMode('all');
    setSkill('all');
    setCallNumber('');
  };

  const modalContent = (
    <div className="w-full bg-white">
      {/* Search Section */}
      <TitleWrap
        title="조회조건"
        buttons={[
          { 
            label: "초기화", 
            onClick: resetFilters,
            variant: "outline"
          },
          // { 
          //   label: "적용", 
          //   onClick: () => {}, // useMemo로 자동 적용되므로 빈 함수
          // },
        ]}
      />
      
      {/* Search Fields */}
      <div className="search-wrap flex flex-col gap-2 p-4 bg-gray-50 rounded-lg">
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Label className="w-20 min-w-20 text-sm font-medium">테넌트</Label>
            <div className='w-[140px]'>
              <Select value={tenantId} onValueChange={setTenantId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="테넌트" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {tenants.map(option => (
                    <SelectItem key={option.tenant_id} value={option.tenant_id.toString()}>
                      {option.tenant_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-2 min-w-0">
            <Label className="w-20 min-w-20 text-sm font-medium">캠페인이름</Label>
            <CustomInput 
              type="text" 
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-[140px]"
              placeholder="캠페인 이름"
            />
          </div>
          
          <div className="flex items-center gap-2 min-w-0">
            <Label className="w-20 min-w-20 text-sm font-medium">다이얼모드</Label>
            <div className='w-[140px]'>
              <Select value={dialMode} onValueChange={setDialMode}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="다이얼모드" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {dialModeList.map(option => (
                    <SelectItem key={option.dial_id} value={option.dial_id.toString()}>
                      {option.dial_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Label className="w-20 min-w-20 text-sm font-medium">스킬</Label>
            <div className='w-[140px]'>
              <Select value={skill} onValueChange={setSkill}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="스킬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {filteredSkills.map(option => (
                    <SelectItem key={option.skill_id} value={option.skill_id.toString()}>
                      {option.skill_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-2 min-w-0">
            <Label className="w-20 min-w-20 text-sm font-medium">발신번호</Label>
            <CustomInput 
              type="text" 
              value={callNumber}
              onChange={(e) => setCallNumber(e.target.value)}
              className="w-[140px]"
              placeholder="발신번호 입력"
            />
          </div>
        </div>
      </div>

      <TitleWrap 
        title="캠페인 검색목록" 
        totalCount={filteredRows.length} 
        className='mt-4'
      />

      {/* Grid */}
      <div className="grid-custom-wrap h-[400px] mt-2 border rounded-lg overflow-hidden bg-white">
        <DataGrid
          columns={columns}
          rows={filteredRows}
          className="grid-custom"
          rowKeyGetter={(row) => row.campaign_id}
          onCellClick={handleCellClick}
          selectedRows={selectedCampaign ? new Set<number>([selectedCampaign.campaign_id]) : new Set<number>()}
          rowClass={(row) => 
            selectedCampaign?.campaign_id === row.campaign_id ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-gray-50'
          }
          rowHeight={32}
          headerRowHeight={40}
        />
      </div>
      
      {filteredRows.length === 0 && (
        <div className="flex items-center justify-center h-32 text-gray-500">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );

  return (
    <CustomAlert
      isOpen={isOpen}
      title="캠페인 조회"
      message={modalContent}
      type="1"
      onClose={handleConfirm}
      onCancel={handleClose}
      width="max-w-6xl" 
    />
  );
}