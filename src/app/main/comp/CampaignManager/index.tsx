// src/app/main/comp/CampaignManager/index.tsx
"use client";

import React, { useState, useEffect } from 'react'
import CampaignManagerHeader, { CampaignHeaderSearch } from './CampaignManagerHeader';
import CampaignManagerDetail from './CampaignManagerDetail';
import CampaignManagerList from './CampaignManagerList';
import { useApiForSchedules } from '@/features/campaignManager/hooks/useApiForSchedules';
import { useApiForCallingNumber } from '@/features/campaignManager/hooks/useApiForCallingNumber';
import { useApiForCampaignSkill } from '@/features/campaignManager/hooks/useApiForCampaignSkill';
import { useApiForPhoneDescription } from '@/features/campaignManager/hooks/useApiForPhoneDescription';
import { useMainStore, useCampainManagerStore, useTabStore, useAuthStore } from '@/store';
import CustomAlert from '@/components/shared/layout/CustomAlert';
import { useApiForChannelGroupList } from "@/features/preferences/hooks/useApiForChannelGroup";
import ServerErrorCheck from "@/components/providers/ServerErrorCheck";

const errorMessage = {
  isOpen: false,
  message: '',
  title: '로그인',
  type: '0',
  onClose: () => { },
  onCancel: () => { },
};

type Props = {
  campaignId?: string;
  isOpen?: boolean;
  onCampaignPopupClose?: () => void;
};

const CampaignManager = ({ campaignId, isOpen, onCampaignPopupClose }: Props) => {
  const { tenants, campaigns, selectedCampaign, setSelectedCampaign, setCampaigns } = useMainStore();
  const { campaignIdForUpdateFromSideMenu, setCampaignIdForUpdateFromSideMenu } = useTabStore();
  const { session_key, tenant_id } = useAuthStore();
  const [masterCampaignId, setMasterCampaignId] = useState<string>('');
  const [alertState, setAlertState] = useState(errorMessage);
  const [headerInit, setHeaderInit] = useState<boolean>(false);

  const { setSchedules, setSkills, setCallingNumbers, setCampaignSkills, setPhoneDescriptions, setChannelGroupList
    , campaignManagerHeaderTenantId, setCampaignManagerHeaderTenantId
    , campaignManagerHeaderCampaignName, setCampaignManagerHeaderCampaignName
    , campaignManagerHeaderDailMode, setCampaignManagerHeaderDailMode
    , campaignManagerHeaderSkill, setCampaignManagerHeaderSkill
    , campaignManagerHeaderCallNumber, setCampaignManagerHeaderCallNumber
    , campaignManagerCampaignId , setCampaignManagerCampaignId
   } = useCampainManagerStore();

  const [campaignHeaderSearchParam, setCampaignHeaderSearchParam] = useState<CampaignHeaderSearch>();
  const handleCampaignHeaderSearch = (param: CampaignHeaderSearch) => {
    // setCampaignHeaderSearchParam(param);
    setCampaignManagerHeaderTenantId(param.tenantId+'');
    setCampaignManagerHeaderCampaignName(param.campaignName);
    setCampaignManagerHeaderDailMode(param.dailMode+'');
    setCampaignManagerHeaderSkill(param.skill+'');
    setCampaignManagerHeaderCallNumber(param.callNumber);
  };

  // 스케줄 조회
  const { mutate: fetchSchedules } = useApiForSchedules({
    onSuccess: (data) => {
      setSchedules(data.result_data);
      // const tempTenantIdArray = tenants.map((tenant) => tenant.tenant_id);
      // fetchSkills({ tenant_id_array: tempTenantIdArray });
      // fetchCallingNumbers({ session_key: session_key, tenant_id: 0 });
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 스케줄 정보 조회', error.message);
    }
  });

  // 스킬 조회
  // const { mutate: fetchSkills } = useApiForSkills({
  //   onSuccess: (data) => {
  //     setSkills(data.result_data || []);
  //     fetchCallingNumbers({ session_key: session_key, tenant_id: 0 });
  //   },
  //   retry: 0,
  // });
  // 캠페인 발신번호 조회
  const { mutate: fetchCallingNumbers } = useApiForCallingNumber({
    onSuccess: (data) => {
      setCallingNumbers(data.result_data || []);
      // fetchCampaignSkills({ session_key: session_key, tenant_id: 0 });
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 발신번호 조회', error.message);
    }
  });
  // 캠페인스킬 조회
  const { mutate: fetchCampaignSkills } = useApiForCampaignSkill({
    onSuccess: (data) => {
      setCampaignSkills(data.result_data || []);
      // fetchPhoneDescriptions({ session_key: session_key, tenant_id: 0 });
    },
    onError: (error) => {
      ServerErrorCheck('캠페인스킬 조회', error.message);
    }
  });
  // 전화번호설명 템플릿 조회
  const { mutate: fetchPhoneDescriptions } = useApiForPhoneDescription({
    onSuccess: (data) => {
      setPhoneDescriptions(data.result_data || []);
      fetchChannelGroupList();
    },
    onError: (error) => {
      ServerErrorCheck('전화번호설명 템플릿 조회', error.message);
    }
  });
  // 채널 그룹리스트 조회
  const { mutate: fetchChannelGroupList } = useApiForChannelGroupList({
    onSuccess: (data) => {
        setChannelGroupList(data.result_data);
    },
    onError: (error) => {
      ServerErrorCheck('채널 그룹리스트 조회', error.message);
    }
  });


  //초기화실행.
  useEffect(() => {
    if (tenants && campaigns && tenants.length > 0 && campaigns.length > 0 ) {
      const tempTenantIdArray = tenants.map((tenant) => tenant.tenant_id);
      fetchSchedules({ tenant_id_array: tempTenantIdArray });        
      fetchCallingNumbers({ session_key: session_key, tenant_id: 0 });    
      fetchCampaignSkills({ session_key: session_key, tenant_id: 0 });
      fetchPhoneDescriptions({ session_key: session_key, tenant_id: 0 });
    }
  }, [tenants, campaigns]);

  useEffect(() => {
    // 최초 실행시 캠페인 리스트에서 첫번째 캠페인 선택
    if(campaignId === undefined ){
      if(campaigns.length > 0){
        setCampaignIdForUpdateFromSideMenu(campaigns[0].campaign_id+'');
        // const tempTenantIdArray = tenants.map((tenant) => tenant.tenant_id);
        // fetchSchedules({ tenant_id_array: tempTenantIdArray });  
        // fetchCallingNumbers({ session_key: session_key, tenant_id: 0 });   
        // fetchCampaignSkills({ session_key: session_key, tenant_id: 0 });  
      }else{
        // 새로고침시 campaigns가 비어있는 경우
        setCampaignIdForUpdateFromSideMenu(0+'');
      }
    }
  },[]);


  useEffect(() => {
    if ( selectedCampaign != null) {
      setSelectedCampaign(selectedCampaign);
    }
  }, [selectedCampaign]);

  useEffect(() => {
    if (typeof campaignId === 'undefined') {
      setMasterCampaignId(campaignIdForUpdateFromSideMenu || '');
    } else {
      setMasterCampaignId(campaignId);
    }
    if( campaignManagerCampaignId === '' ){
      setCampaignManagerHeaderTenantId('all');
      setCampaignManagerHeaderCampaignName('');
      setCampaignManagerHeaderDailMode('all');
      setCampaignManagerHeaderSkill('all');
      setCampaignManagerHeaderCallNumber('');
    }
  }, [campaignIdForUpdateFromSideMenu, campaignId, campaignManagerCampaignId]);

  const handleRowClick = (campaignId: string) => {
    setMasterCampaignId(campaignId);
  };

  const handleHeaderInit = () => {
    setHeaderInit(false);
  };
  
  const handleListInit = () => {
    setCampaignManagerHeaderTenantId('all');
    setCampaignManagerHeaderCampaignName('');
    setCampaignManagerHeaderDailMode('all');
    setCampaignManagerHeaderSkill('all');
    setCampaignManagerHeaderCallNumber('');
  };  

  //초기화.
  const handleDetailInit = (campaign_id:number) => {
    // console.log('######## campaign_id:: '+campaign_id);
    if( campaign_id === 0){
      setHeaderInit(true);
      const tempCampaigns = campaigns.filter(data => data.campaign_id != Number(masterCampaignId));
      setMasterCampaignId(campaigns[0].campaign_id+'');
      setCampaigns(tempCampaigns);
      // setCampaignManagerHeaderTenantId('all');
      // setCampaignManagerHeaderCampaignName('');
      // setCampaignManagerHeaderDailMode('all');
      // setCampaignManagerHeaderSkill('all');
      // setCampaignManagerHeaderCallNumber('');
    }else{
      setCampaignIdForUpdateFromSideMenu(campaign_id+'');
    
      // }else{
    //   setMasterCampaignId(campaign_id+'');
    //   fetchMain({
    //     session_key: session_key,
    //     tenant_id: tenant_id,
    //   });  
    } 
  };

  useEffect(() => {
    if ( campaignManagerHeaderTenantId != ''
       || campaignManagerHeaderCampaignName != ''
       || campaignManagerHeaderDailMode != ''
       || campaignManagerHeaderSkill != ''
       || campaignManagerHeaderCallNumber != ''
      ) {
        setCampaignHeaderSearchParam({          
          tenantId: campaignManagerHeaderTenantId != ''? Number(campaignManagerHeaderTenantId):-1,
          campaignName: campaignManagerHeaderCampaignName,
          dailMode: campaignManagerHeaderDailMode != ''? Number(campaignManagerHeaderDailMode):-1,
          skill: campaignManagerHeaderSkill != ''? Number(campaignManagerHeaderSkill):-1,
          callNumber: campaignManagerHeaderCallNumber
        });
    }else{
      setCampaignHeaderSearchParam(undefined);
    }
  }, [campaignManagerHeaderTenantId,campaignManagerHeaderCampaignName,campaignManagerHeaderDailMode,campaignManagerHeaderSkill,campaignManagerHeaderCallNumber]);

  // 캠페인 정보 조회 API 호출
  // const { mutate: fetchMain } = useApiForMain({
  //   onSuccess: (data) => {
  //     setCampaigns(data.result_data);
  //   }
  // });
  
  return (
    <div className='compaign-wrap stable-scrollbar' style={{
      overflowY: 'scroll',
      scrollbarGutter: 'stable',
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      contain: 'content',
    }}>
      <div className='flex flex-col gap-[15px] limit-width'>
        <CampaignManagerHeader init={headerInit} setInit={handleHeaderInit} onSearch={handleCampaignHeaderSearch} />
        <div className="flex gap-[30px]">
          <CampaignManagerList
            campaignId={campaignIdForUpdateFromSideMenu || masterCampaignId}
            onRowClick={handleRowClick}
            onHeaderInit={handleListInit}
            campaignHeaderSearchParam={campaignHeaderSearchParam}
          />
          <CampaignManagerDetail
            campaignId={campaignIdForUpdateFromSideMenu || masterCampaignId}
            isOpen={isOpen}
            onCampaignPopupClose={onCampaignPopupClose}
            setInit={handleDetailInit}
          />
        </div>
      </div>
      <CustomAlert
        message={alertState.message}
        title={alertState.title}
        type={alertState.type}
        isOpen={alertState.isOpen}
        onClose={alertState.onClose}
        onCancel={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default CampaignManager;
