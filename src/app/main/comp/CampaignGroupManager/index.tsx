// C:\Users\terec\fe_pdsw\src\app\main\comp\CampaignManager\index.tsx
import React, { useState, useEffect } from 'react'
import CampaignGroupManagerHeader, { CampaignGroupHeaderSearch } from './CampaignGroupManagerHeader';
import CampaignGroupManagerDetail,{GroupDeleteParam} from './CampaignGroupManagerDetail';
import CampaignGroupManagerList, { DataProps, downDataProps } from './CampaignGroupManagerList';
import { useApiForSchedules } from '@/features/campaignManager/hooks/useApiForSchedules';
import { useApiForSkills } from '@/features/campaignManager/hooks/useApiForSkills';
import { useApiForCallingNumber } from '@/features/campaignManager/hooks/useApiForCallingNumber';
import { useApiForCampaignSkill } from '@/features/campaignManager/hooks/useApiForCampaignSkill';
import { useApiForPhoneDescription } from '@/features/campaignManager/hooks/useApiForPhoneDescription';
import { useApiForCampaignGroupSearch } from '@/features/campaignGroupManager/hooks/useApiForCampaignGroupSearch';
import { useApiForCampaignGroupCampaignList } from '@/features/campaignGroupManager/hooks/useApiForCampaignGroupCampaignList';
import { useApiForCampaignGroupCampaignListDelete } from '@/features/campaignGroupManager/hooks/useApiForCampaignGroupCampaignListDelete';
import { useApiForCampaignGroupDelete } from '@/features/campaignGroupManager/hooks/useApiForCampaignGroupDelete';
import { useMainStore, useCampainManagerStore, useTabStore, useAuthStore } from '@/store';
import { CampaignGroupGampaignListItem } from '@/features/campaignManager/types/typeForCampaignGroupForSideBar';
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import CustomAlert, { CustomAlertRequest } from '@/components/shared/layout/CustomAlert';
import AddCampaignGroupDialog from "./AddCampaignGroupDialog";
import { useSideMenuCampaignGroupTabStore } from "@/store/storeForSideMenuCampaignGroupTab";
import logoutFunction from '@/components/common/logoutFunction';
import ServerErrorCheck from '@/components/providers/ServerErrorCheck';

const errorMessage = {
  isOpen: false,
  message: '',
  title: '로그인',
  type: '0',
  onClose: () => { },
  onCancel: () => { },
};

const _addGroupParam = {
  isOpen: false,
  tenantId: 0,
  tenantName: '',
  campaignGroupList:[] as DataProps[],
  onAddGroup: (groupName: string, groupCode: string) => { },
  onClose: () => {},
};

const initData: DataProps = { no: 0, tenantId: 0, tenantName: '', campaignGroupId: 0, campaignGroupName: '' };
type Props = {
  groupId?: string;
  groupName?: string;
}

const CampaignGroupManager = ({ groupId, groupName }: Props) => {

  const { tenants,campaigns } = useMainStore();
  const { id: user_id, tenant_id, session_key } = useAuthStore();
  const { campaignIdForUpdateFromSideMenu } = useTabStore();
  const [_campaignGroupList, _setCampasignGroupList] = useState<DataProps[]>([]);
  const [tempCampaignListData, setTempCampaignListData] = useState<downDataProps[]>([]);
  const [groupInfo, setGroupInfo] = useState<DataProps>(initData);
  const [_groupId, _setGroupId] = useState<number>(groupId ? parseInt(groupId) : -1);
  const [campaignId, setCampaignId] = useState<number>(0);
  const [campaignGroupCampaignListData, setCampaignGroupCampaignListData] = useState<CampaignGroupGampaignListItem[]>([]);
  const [selectCampaignGroupList, setSelectCampaignGroupList] = useState<MainDataResponse[]>([]);
  const [alertState, setAlertState] = useState(errorMessage);
  const router = useRouter();
  // const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [ addGroupParam, setAddGroupParam ] = useState(_addGroupParam);
  const { refetchTreeDataForCampaignGroupTab } = useSideMenuCampaignGroupTabStore();

  const { setSchedules, setSkills, setCallingNumbers, setCampaignSkills, setPhoneDescriptions
    , campaignGroupManagerInit, setCampaignGroupManagerInit } = useCampainManagerStore();

  const [campaignGroupHeaderSearchParam, setCampaignGroupHeaderSearchParam] = useState<CampaignGroupHeaderSearch>();
  const handleCampaignHeaderSearch = (param: CampaignGroupHeaderSearch) => {
    setCampaignGroupHeaderSearchParam(param);
  };

  const handleGroupSelect = (id: string) => {
    if( id != ''){
      _setGroupId(parseInt(id));
      setGroupInfo(_campaignGroupList.find((item) => item.campaignGroupId === parseInt(id)) || initData);
      setCampaignId(campaignGroupCampaignListData.find((item) => item.group_id === parseInt(id))?.campaign_id || 0);
    }else{
      _setGroupId(-1);
      setGroupInfo(initData);
      setCampaignId(0);
      setTempCampaignListData([]);
    }
  };

  const handleCampaignSelect = (id: string) => {
    setCampaignId(parseInt(id));
  };

  //캠페인 그룹 삭제
  const handleGroupDelete = (param: GroupDeleteParam) => {
    fetchCampaignGroupCampaignListDelete({tenant_id: param.tenant_id, group_id: param.group_id, campaign_id: []});
    fetchCampaignGroupDelete(param.group_id);
  };

  // 다이얼로그 닫기
  const handleCloseAddGroupDialog = () => {
    setAddGroupParam((prev) => ({ ...prev, isOpen: false }))
  };
  const handleAddGroup = (groupName: string, groupCode: string) => {
    handleInit();
    setAddGroupParam((prev) => ({ ...prev, isOpen: false }))
  };

  const handleInit = () => {
    setCampaignGroupManagerInit(true);
    refetchTreeDataForCampaignGroupTab();
  };

  const handleSelectCampaignList = (data: Set<number>) => {
    const tempData:MainDataResponse[] = [];
    data.forEach((item) => {
      const matchedCampaign = campaigns.find((campaign) => campaign.campaign_id === item);
      if (matchedCampaign) {
        tempData.push(matchedCampaign);
      }
    });
    setSelectCampaignGroupList(tempData);
  };

  // 스케줄 조회
  const { mutate: fetchSchedules } = useApiForSchedules({
    onSuccess: (data) => {
      setSchedules(data.result_data);
      const tempTenantIdArray = tenants.map((tenant) => tenant.tenant_id);
      fetchSkills({
        tenant_id_array: tempTenantIdArray
      });
    },
    onError: (error) => {
      ServerErrorCheck('스케줄 조회', error.message);
    }
  });
  // 스킬 조회
  const { mutate: fetchSkills } = useApiForSkills({
    onSuccess: (data) => {
      setSkills(data.result_data);
      fetchCallingNumbers({
        session_key: session_key,
        tenant_id: tenant_id,
      });
    },
    onError: (error) => {
      ServerErrorCheck('스킬 조회', error.message);
    }
  });
  // 전화번호 조회
  const { mutate: fetchCallingNumbers } = useApiForCallingNumber({
    onSuccess: (data) => {
      setCallingNumbers(data.result_data||[]);
      // fetchCampaignSkills({
      //   session_key: session_key,
      //   tenant_id: tenant_id,
      // });
      fetchPhoneDescriptions({
        session_key: session_key,
        tenant_id: tenant_id,
      });
    },
    onError: (error) => {
      ServerErrorCheck('전화번호 조회', error.message);
    } 
  });
  // 캠페인스킬 조회
  // const { mutate: fetchCampaignSkills } = useApiForCampaignSkill({
  //   onSuccess: (data) => {
  //     setCampaignSkills(data.result_data);
  //     fetchPhoneDescriptions({
  //       session_key: session_key,
  //       tenant_id: tenant_id,
  //     });
  //   },
  //   onError: (error) => {
  //     ServerErrorCheck('캠페인스킬 조회', error.message);
  //   }
  // });
  // 전화번호설명 템플릿 조회
  const { mutate: fetchPhoneDescriptions } = useApiForPhoneDescription({
    onSuccess: (data) => {
      setPhoneDescriptions(data.result_data||[]);
      handleInit();
    },
    onError: (error) => {
      ServerErrorCheck('전화번호설명 템플릿 조회', error.message);
    }
  });
  
  // 캠페인 그룹 조회
  const { mutate: fetchCampaignGroupSearch } = useApiForCampaignGroupSearch({
    onSuccess: (data) => {      
      const tempRows: DataProps[] = [];
      if( data.result_data.length > 0 ){
        for (let i = 0; i < tenants.length; i++) {
          for (let j = 0; j < data.result_data.length; j++) {
            // if (tenants[i].tenant_id === data.result_data[j].tenant_id && parseInt(groupId || '-1') < 0) {
            if (tenants[i].tenant_id === data.result_data[j].tenant_id ) {
              tempRows.push({
                no: tempRows.length + 1,
                tenantId: tenants[i].tenant_id,
                tenantName: tenants[i].tenant_name,
                campaignGroupId: data.result_data[j].group_id,
                campaignGroupName: data.result_data[j].group_name,
              });
              // if (j === 0) {
              //   _setGroupId(data.result_data[j].group_id);
              //   setGroupInfo(tempRows[0]);
              // }
            // }else if( tenants[i].tenant_id === data.result_data[j].tenant_id && _groupId > -1 && _groupId === data.result_data[j].group_id ){
            //   const tempRowData = {
            //     no: tempRows.length + 1,
            //     tenantId: tenants[i].tenant_id,
            //     tenantName: tenants[i].tenant_name,
            //     campaignGroupId: data.result_data[j].group_id,
            //     campaignGroupName: data.result_data[j].group_name,
            //   };
            //   tempRows.push(tempRowData);
            //   _setGroupId(tempRowData.campaignGroupId);
            //   setGroupInfo(tempRowData);
            }
          }
        }
      }
      _setCampasignGroupList(tempRows);
      if (tempRows.length == 0) {
        _setGroupId(-1);
        setGroupInfo(initData);
      }
      fetchCampaignGroupCampaignList(null);
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 그룹 조회', error.message);
    }
  });

  const goLogin = () => {
    logoutFunction();
    router.push('/login');
  };

  // 캠페인 그룹 소속 캠페인 데이터 로드 시 
  const { mutate: fetchCampaignGroupCampaignList } = useApiForCampaignGroupCampaignList({
    onSuccess: (data) => {      
      setCampaignGroupCampaignListData(data.result_data || []);
    }
  });
  // 캠페인 그룹 삭제
  const { mutate: fetchCampaignGroupDelete } = useApiForCampaignGroupDelete({
    onSuccess: (data) => {
      handleInit();
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 그룹 삭제', error.message);
    }
  });
  // 캠페인 그룹 소속 캠페인 삭제
  const { mutate: fetchCampaignGroupCampaignListDelete } = useApiForCampaignGroupCampaignListDelete({
    onSuccess: (data) => {
      
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 그룹 소속 캠페인 삭제', error.message);
    }
  });
  

  // 캠페인 그룹 소속 캠페인 데이터 로드 시 
  useEffect(() => {
    if (_campaignGroupList && _campaignGroupList.length > 0 && _groupId > 0) {
      const tempCampaignListRows: downDataProps[] = [];
      if (campaignGroupCampaignListData && campaignGroupCampaignListData.length > 0 ) {
        for (let i = 0; i < _campaignGroupList.length; i++) {
          for (let j = 0; j < campaignGroupCampaignListData.length; j++) {
            if (_groupId === _campaignGroupList[i].campaignGroupId && _groupId === campaignGroupCampaignListData[j].group_id) {
              tempCampaignListRows.push({
                no: tempCampaignListRows.length + 1,
                campaignGroupId: _campaignGroupList[i].campaignGroupId,
                campaignGroupName: _campaignGroupList[i].campaignGroupName,
                campaignId: campaignGroupCampaignListData[j].campaign_id,
                campaignName: campaignGroupCampaignListData[j].campaign_name,
              });
              if (j === 0) {
                setCampaignId(campaignGroupCampaignListData[j].campaign_id);
              }
            }
          }
        }
      }
      setTempCampaignListData(tempCampaignListRows);
      if (tempCampaignListRows.length == 0) {
        setCampaignId(0);
      }else {
        const firstCampaign = tempCampaignListData[0];
        if (firstCampaign) {
          setCampaignId(firstCampaign.campaignId);
        }
      }
    }
  }, [_groupId, _campaignGroupList, campaignGroupCampaignListData]);
  
  useEffect(() => {
    if (campaignGroupManagerInit) {
      setCampaignGroupManagerInit(false);
      fetchCampaignGroupSearch(null);
    }
  }, [campaignGroupManagerInit]);

  useEffect(() => {
    if (campaigns) {
      handleInit();
    }
  }, [campaigns]);

  useEffect(() => {
    if (groupId) {
      _setGroupId(parseInt(groupId));
      fetchCampaignGroupSearch(null);
    }
  }, [groupId]);

  useEffect(() => {
    if (tenants) {
      const tempTenantIdArray = tenants.map((tenant) => tenant.tenant_id);
      fetchSchedules({
        tenant_id_array: tempTenantIdArray
      });
    }
  }, [tenants]);

  return (
    <div>
      <div className='flex flex-col gap-[15px] limit-width'>
        <CampaignGroupManagerHeader groupId={parseInt(groupId || '-1')} onSearch={handleCampaignHeaderSearch} />
        <div className="flex gap-[30px]">
          <CampaignGroupManagerList
            campaignId={campaignIdForUpdateFromSideMenu || ''}
            campaignGroupHeaderSearchParam={campaignGroupHeaderSearchParam}
            campaignGroupList={_campaignGroupList}
            groupCampaignListData={tempCampaignListData}
            selectedGroupId={_groupId+''}
            onGroupSelect={handleGroupSelect}
            onCampaignSelect={handleCampaignSelect}
            onSelectCampaignList={handleSelectCampaignList}
          />

          <CampaignGroupManagerDetail groupInfo={groupInfo} campaignId={campaignId} onInit={handleInit} onGroupDelete={handleGroupDelete}
            selectCampaignGroupList={selectCampaignGroupList} onAddGroupDialogOpen={() => setAddGroupParam({
              ...addGroupParam,
              isOpen: true,
              onClose: handleCloseAddGroupDialog,
              tenantId: groupInfo.tenantId,
              tenantName: groupInfo.tenantName,
              campaignGroupList: _campaignGroupList,
              onAddGroup: handleAddGroup
            })}
          />
        </div>
      </div>
      <AddCampaignGroupDialog
        isOpen={addGroupParam.isOpen}
        onClose={handleCloseAddGroupDialog}
        tenantId={tenant_id}
        tenantName={''}
        campaignGroupList={_campaignGroupList}
        onAddGroup={handleAddGroup}
      />
      <CustomAlert
        message={alertState.message}
        title={alertState.title}
        type={alertState.type}
        isOpen={alertState.isOpen}
        onClose={() => {
          alertState.onClose()
        }}
        onCancel={() => setAlertState((prev) => ({ ...prev, isOpen: false }))} />
    </div>
  )
}

export default CampaignGroupManager