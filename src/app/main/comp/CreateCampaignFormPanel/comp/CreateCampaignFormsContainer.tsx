// src\app\main\comp\CreateCampaignFormPanel\comp\CreateCampaignFormsContainer.tsx
"use client";

import { useMainStore, useCampainManagerStore, useTabStore } from '@/store';
import TitleWrap from "@/components/shared/TitleWrap";
import CampaignTab from '../../CampaignManager/CampaignTab';
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import { useEffect, useState } from 'react';
import { useApiForCampaignManagerInsert } from '@/features/campaignManager/hooks/useApiForCampaignManagerInsert';
import { useApiForCampaignScheduleInsert } from '@/features/campaignManager/hooks/useApiForCampaignScheduleInsert';
import { useApiForMain } from '@/features/auth/hooks/useApiForMain';

import CustomAlert, { CustomAlertRequest } from '@/components/shared/layout/CustomAlert';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import CampaignBasicInfoForm from './CampaignBasicInfoForm';

import { AdditionalInfoTabParam, CallbackTabParam, CallPacingTabParam, CampaignScheduleInfo, IPropsForCreateCampaignForm, NotificationTabParam, OperationTimeParam, OutgoingMethodTabParam, OutgoingOrderTabParam, OutgoingStrategyTabParam } from '../variables/interfacesForCreateCampaign';
import { CampaignCallPacingTabInfo, CampaignDialSpeedInfo, CampaignInfo, CampaignManagerInfo, CampaignSkillInfo, errorMessage } from '../variables/variablesForCreateCampaignForm';
import {
  CampaignSkillUpdateRequest
  , CampaignScheDuleListDataResponse
  , CampaignDialSpeedUpdateRequest
} from '@/features/campaignManager/types/campaignManagerIndex';
import ServerErrorCheck from "@/components/providers/ServerErrorCheck";
import logoutFunction from '@/components/common/logoutFunction';


const CreateCampaignFormsContainer: React.FC<IPropsForCreateCampaignForm> = ({ tenantId }: IPropsForCreateCampaignForm) => {
  // const [tempCampaignManagerInfo, setTempCampaignManagerInfo] = useState<CampaignInfoUpdateRequest>(CampaignManagerInfo);
  const [tempCampaignInfo, setTempCampaignsInfo] = useState<MainDataResponse>(CampaignInfo);
  const [tempCampaignSkills, setTempCampaignSkills] = useState<CampaignSkillUpdateRequest>(CampaignSkillInfo);
  const [tempCampaignSchedule, setTempCampaignSchedule] = useState<CampaignScheDuleListDataResponse>(CampaignScheduleInfo);
  const [tempCampaignDialSpeedInfo, setTempCampaignDialSpeedInfo] = useState<CampaignDialSpeedUpdateRequest>(CampaignDialSpeedInfo);
  const [tempCampaignDialSpeedInfoParam, setTempCampaignDialSpeedInfoParam] = useState<CallPacingTabParam>(CampaignCallPacingTabInfo);
  const [changeYn, setChangeYn] = useState<boolean>(false); // 변경여부
  const [campaignInfoChangeYn, setCampaignInfoChangeYn] = useState<boolean>(false);
  const [campaignSkillChangeYn, setCampaignSkillChangeYn] = useState<boolean>(false);
  const [callingNumberChangeYn, setCallingNumberChangeYn] = useState<boolean>(false);
  const [campaignScheduleChangeYn, setCampaignScheduleChangeYn] = useState<boolean>(false);
  const [campaignDialSpeedChangeYn, setCampaignDialSpeedChangeYn] = useState<boolean>(false);
  const [campaignSaveYn, setCampaignSaveYn] = useState<boolean>(false);
  const { tenants
    , setCampaigns
    , selectedCampaign
    , setSelectedCampaign
  } = useMainStore();
  const { removeTab, activeTabId, activeTabKey, addTab, openedTabs, setActiveTab, setCampaignIdForUpdateFromSideMenu, simulateHeaderMenuClick } = useTabStore();
  const { callingNumbers, campaignSkills, schedules, setCampaignSkills, setSchedules, setCallingNumbers } = useCampainManagerStore();
  const [inputSkills, setInputSkills] = useState('');
  // const [inputCallingNumber, setInputCallingNumber] = useState('');
  const [skillPopupState, setSkillPopupState] = useState({
    isOpen: false,
    param: [],
    tenantId: 0,
    type: '1',
  });
  const [alertState, setAlertState] = useState<CustomAlertRequest>(errorMessage);

  const router = useRouter();

  //캠페인 정보 최초 세팅 
  useEffect(() => {
    if (selectedCampaign !== null) {
      setChangeYn(false);
      setCampaignInfoChangeYn(false);
    }
  }, [selectedCampaign, campaignSkills, callingNumbers, schedules]);

  const handleInputData = (value: any, col: string) => {
    setChangeYn(true);
    setCampaignInfoChangeYn(true);
    if (col === 'campaign_id' && value !== '') {
      // setTempCampaignManagerInfo({
      //   ...tempCampaignManagerInfo,
      //   campaign_id: Number(value)
      // });
      setTempCampaignsInfo({  // Add this to keep both states in sync
        ...tempCampaignInfo,
        campaign_id: Number(value)
      });
    }
    if (col === 'campaign_name') {
      // setTempCampaignManagerInfo({
      //   ...tempCampaignManagerInfo,
      //   campaign_name: value
      // });
      setTempCampaignsInfo({  // Add this to keep both states in sync
        ...tempCampaignInfo,
        campaign_name: value
      });
    }
    if (col === 'campaign_desc') {
      // setTempCampaignManagerInfo({
      //   ...tempCampaignManagerInfo,
      //   campaign_desc: value
      // });
      setTempCampaignsInfo({  // Add this to keep both states in sync
        ...tempCampaignInfo,
        campaign_desc: value
      });
    }
  }

  //select data change
  const handleSelectChange = (value: string, type: 'tenant' | 'dialMode') => {
    setChangeYn(true);
    setCampaignInfoChangeYn(true);
    if (type === 'tenant' && value !== '') {
      setTempCampaignsInfo({
        ...tempCampaignInfo,
        tenant_id: Number(value)
      });
      // setTempCampaignManagerInfo({
      //   ...tempCampaignManagerInfo,
      //   tenant_id: Number(value)
      // });
    }
    if (type === 'dialMode' && value !== '') {
      console.log('dialMode');
      setTempCampaignsInfo({
        ...tempCampaignInfo,
        dial_mode: Number(value)
      });
      // setTempCampaignManagerInfo({
      //   ...tempCampaignManagerInfo,
      //   dial_mode: Number(value)
      // });
      // setTempCampaignDialSpeedInfoParam({
      //   ...tempCampaignDialSpeedInfoParam,
      //   dial_mode: Number(value)
      // });
    }
  }

  //스킬 선택 팝업
  const handleSelectSkills = (param: string) => {
    if (tempCampaignSkills.skill_id.join(',') !== param) {
      setChangeYn(true);
      setCampaignSkillChangeYn(true);
      setInputSkills(param);
      setTempCampaignSkills({
        ...tempCampaignSkills
        , campaign_id: tempCampaignInfo.campaign_id
        , skill_id: param.split(',').map((data) => Number(data))
      });
    }
    setSkillPopupState((prev) => ({ ...prev, isOpen: false }))
  }

  //캠페인 동작시간 탭 변경
  const handleCampaignScheduleChange = (value: OperationTimeParam) => {
    if (value.campaignInfoChangeYn) {
      setChangeYn(true);
      setCampaignInfoChangeYn(true);
      // setTempCampaignManagerInfo({
      //   ...tempCampaignManagerInfo
      //   , start_flag: Number(value.start_flag)
      // });
      setTempCampaignsInfo({
        ...tempCampaignInfo
        , start_flag: Number(value.start_flag)
      });
    }
    if (value.campaignScheduleChangeYn) {
      setChangeYn(true);
      setCampaignScheduleChangeYn(true);
      setTempCampaignSchedule({
        ...tempCampaignSchedule
        , campaign_id: value.campaign_id
        , start_date: value.start_date
        , end_date: value.end_date
        , start_time: value.start_time
        , end_time: value.end_time
      });
    }
    if (value.onSave) {
      setCampaignSaveYn(false);
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  }

  //캠페인 발신 순서 탭 변경
  const handleCampaignOutgoingOrderChange = (value: OutgoingOrderTabParam) => {
    if (value.campaignInfoChangeYn) {
      setChangeYn(true);
      setCampaignInfoChangeYn(true);
      setTempCampaignsInfo({
        ...tempCampaignInfo
        , dial_phone_id: Number(value.dial_phone_id)
        , phone_dial_try: value.phone_dial_try
        , phone_order: value.phone_order
      });
      // setTempCampaignManagerInfo({
      //   ...tempCampaignManagerInfo,
      //   dial_phone_id: Number(value.dial_phone_id)
      //   , phone_dial_try1: value.phone_dial_try[0]
      //   , phone_dial_try2: value.phone_dial_try[1]
      //   , phone_dial_try3: value.phone_dial_try[2]
      //   , phone_dial_try4: value.phone_dial_try[3]
      //   , phone_dial_try5: value.phone_dial_try[4]
      //   , phone_order: value.phone_order
      // });
    }
    if (value.onSave) {
      setCampaignSaveYn(false);
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  }

  //캠페인 발신전략 탭 변경
  const handleOutgoingStrategyTabChange = (value: OutgoingStrategyTabParam) => {
    if (value.campaignInfoChangeYn) {
      setChangeYn(true);
      setCampaignInfoChangeYn(true);
      setTempCampaignsInfo({
        ...tempCampaignInfo
        , redial_strategy: value.redial_strategy
      });

      // setTempCampaignManagerInfo({
      //   ...tempCampaignManagerInfo
      //   , redial_strategy1: value.redial_strategy[0]
      //   , redial_strategy2: value.redial_strategy[1]
      //   , redial_strategy3: value.redial_strategy[2] 
      //   , redial_strategy4: value.redial_strategy[3]
      //   , redial_strategy5: value.redial_strategy[4]
      // });

    }
    //초기화버튼 클릭시
    if (value.onInit) {
      setTempCampaignsInfo({
        ...tempCampaignInfo
        , redial_strategy: value.redial_strategy
        , redial_strategy1: value.redial_strategy[0]
        , redial_strategy2: value.redial_strategy[1]
        , redial_strategy3: value.redial_strategy[2]
        , redial_strategy4: value.redial_strategy[3]
        , redial_strategy5: value.redial_strategy[4]
      });
    }

    if (value.onSave) {
      setCampaignSaveYn(false);
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  }

  //캠페인 발신방법 탭 변경
  const handleOutgoingMethodTabChange = (value: OutgoingMethodTabParam) => {
    if (value.campaignInfoChangeYn) {
      setChangeYn(true);
      setCampaignInfoChangeYn(true);
      setTempCampaignsInfo({
        ...tempCampaignInfo
        , trunk_access_code: value.trunk_access_code
        , dial_try_interval: value.dial_try_interval
        , alarm_answer_count: value.alarm_answer_count
        , overdial_abandon_time: value.overdial_abandon_time
        , detect_mode: value.detect_mode
        , auto_dial_interval: value.auto_dial_interval
        , power_divert_queue: value.power_divert_queue
        , next_campaign: value.next_campaign
        , DDD_code: value.DDD_code
        , callback_kind: value.callback_kind
        , max_ring: value.max_ring
        , token_id: value.token_id
        , use_counsel_result: value.use_counsel_result
        , dial_mode_option: value.dial_mode_option
        , user_option: value.user_option
      });
      // setTempCampaignManagerInfo({
      //   ...tempCampaignManagerInfo
      //   , trunk_access_code: value.trunk_access_code
      //   , dial_try_interval: value.dial_try_interval
      //   , alarm_answer_count: value.alarm_answer_count
      //   , overdial_abandon_time: value.overdial_abandon_time
      //   , detect_mode: value.detect_mode
      //   , auto_dial_interval: value.auto_dial_interval
      //   , power_divert_queue: value.power_divert_queue + ''
      //   , next_campaign: value.next_campaign
      //   , DDD_code: value.DDD_code
      //   , callback_kind: value.callback_kind
      //   , max_ring: value.max_ring
      //   , token_id: value.token_id
      //   , use_counsel_result: value.use_counsel_result
      //   , dial_mode_option: value.dial_mode_option
      //   , user_option: value.user_option
      // });
    }
    if (value.onSave) {
      setCampaignSaveYn(false);
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  }

  //캠페인 콜페이싱 탭 변경
  const handleCallPacingTabChange = (value: CallPacingTabParam) => {
    if (value.campaignDialSpeedChangeYn) {
      setChangeYn(true);
      setCampaignDialSpeedChangeYn(value.campaignDialSpeedChangeYn);
      setTempCampaignDialSpeedInfoParam({
        ...tempCampaignDialSpeedInfoParam
        , predictive_dial_speed: value.predictive_dial_speed
        , progressive_dial_speed: value.progressive_dial_speed
      });
      setTempCampaignDialSpeedInfo({
        ...tempCampaignDialSpeedInfo
        , dial_speed: value.dial_mode === 2 ? Math.floor(value.progressive_dial_speed) : value.predictive_dial_speed
      });
    }
    if (value.onSave) {
      setCampaignSaveYn(false);
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  }


  //캠페인 콜백 탭 변경
  const handleCallbackTabChange = (value: CallbackTabParam) => {
    if (value.campaignInfoChangeYn) {
      setChangeYn(true);
      setCampaignInfoChangeYn(true);
      setTempCampaignsInfo({
        ...tempCampaignInfo
        , callback_kind: Number(value.callback_kind)
        , service_code: value.service_code
      });
      // setTempCampaignManagerInfo({
      //   ...tempCampaignManagerInfo
      //   , callback_kind: Number(value.callback_kind)
      //   , service_code: value.service_code
      // });
    }
    if (value.onSave) {
      // setCampaignSaveYn(false);
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  }

  //캠페인 알림 탭 변경
  const handleNotificationTabChange = (value: NotificationTabParam) => {
    if (value.campaignInfoChangeYn) {
      setChangeYn(true);
      setCampaignInfoChangeYn(value.campaignInfoChangeYn);
      setTempCampaignsInfo({
        ...tempCampaignInfo
        , list_alarm_count: Number(value.list_alarm_count)
        , supervisor_phone: value.supervisor_phone
        , use_list_alarm: value.use_list_alarm
      });
      // setTempCampaignManagerInfo({
      //   ...tempCampaignManagerInfo
      //   , list_alarm_count: Number(value.list_alarm_count)
      //   , supervisor_phone: value.supervisor_phone
      //   , use_list_alarm: value.use_list_alarm
      // });
    }
    if (value.onSave) {
      // setCampaignSaveYn(false);
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  }

  //캠페인 기타정보 탭 변경
  const handleAdditionalInfoTabChange = (value: AdditionalInfoTabParam) => {
    if (value.onSave) {
      // setCampaignSaveYn(false);
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  }

  //캠페인 취소
  const handleCampaignClosed = () => {
    setAlertState({
      ...errorMessage,
      isOpen: true,
      message: '캠페인 편집창을 종료하시겠습니까?',
      onClose: handleCampaignClosedExecute,
      onCancel: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
    });
  }

  //캠페인 취소 실행.
  const handleCampaignClosedExecute = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
    // removeTab(Number(activeTabId),activeTabKey+'');
    const existingTabs = openedTabs.filter(tab => tab.id === 13);
    existingTabs.forEach(tab => {
      removeTab(tab.id, tab.uniqueKey);
    });
  }

  // tofix
  const handleCampaignSave = () => {
    console.log("tempCampaignInfo : ", tempCampaignInfo);
    console.log('power_divert_queue :: ' + tempCampaignInfo.power_divert_queue);
    console.log('tenant_id :: ' + tenantId);

    let saveErrorCheck = false;

    if (!saveErrorCheck && tempCampaignInfo.tenant_id < 0 && tenantId === "") {
      saveErrorCheck = true;
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: "테넌트를 선택해 주세요.",
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }

    if (!saveErrorCheck && tempCampaignSchedule.start_time.length === 0) {
      saveErrorCheck = true;
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: "시작 시간 또는 종료 시간을 지정해 주세요.",
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }

    if (!saveErrorCheck && tempCampaignInfo.power_divert_queue === '0' || tempCampaignInfo.power_divert_queue === '') {
      saveErrorCheck = true;
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: "'발신 방법' 탭의 '연결 IVR 번호' 값을 입력해 주세요.",
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }

    if (!saveErrorCheck && tempCampaignInfo.campaign_name === '') {
      saveErrorCheck = true;
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: "캠페인명을 입력해 주세요.",
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }

    if (!saveErrorCheck) {
      handleCampaignSaveExecute();
    }
  }

  // tofix 0427
  const handleCampaignSaveExecute = () => {
    console.log("tempCampaignInfo at save !!!!!!!!!!!!!", tempCampaignInfo);
    // Convert to MainDataResponse format using only tempCampaignInfo
    // const campaignDataToSend: MainDataResponse = {
    //     ...tempCampaignInfo,
    //     // 필요한 경우에만 tempCampaignManagerInfo의 특정 필드 사용
    //     phone_dial_try: [
    //       tempCampaignInfo.phone_dial_try1 ?? 0,
    //       tempCampaignInfo.phone_dial_try2 ?? 0,
    //       tempCampaignInfo.phone_dial_try3 ?? 0,
    //       tempCampaignInfo.phone_dial_try4 ?? 0,
    //       tempCampaignInfo.phone_dial_try5 ?? 0
    //     ],
    //     redial_strategy: [
    //       tempCampaignInfo.redial_strategy1 ?? '',
    //       tempCampaignInfo.redial_strategy2 ?? '',
    //       tempCampaignInfo.redial_strategy3 ?? '',
    //       tempCampaignInfo.redial_strategy4 ?? '',
    //       tempCampaignInfo.redial_strategy5 ?? ''
    //     ]
    //   };
    // fetchCampaignManagerInsert(campaignDataToSend);
  }

  //변경여부 체크
  useEffect(() => {
    if (changeYn && !campaignInfoChangeYn && !campaignSkillChangeYn && !callingNumberChangeYn && !campaignDialSpeedChangeYn) {
      fetchMain({
        session_key: '',
        tenant_id: 0,
      });
    }
  }, [campaignInfoChangeYn, campaignSkillChangeYn, callingNumberChangeYn, campaignDialSpeedChangeYn]);

  //캠페인 정보 조회 api 호출
  const { mutate: fetchMain } = useApiForMain({
    onSuccess: (data) => {
      setCampaigns(data.result_data);
      setSelectedCampaign(data.result_data.filter((campaign) => campaign.campaign_id === selectedCampaign?.campaign_id)[0]);
      setTempCampaignsInfo(data.result_data.filter((campaign) => campaign.campaign_id === selectedCampaign?.campaign_id)[0]);
      setChangeYn(false);
      removeTab(Number(activeTabId), activeTabKey + '');
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 정보 조회', error.message);
    }
  });

  //캠페인 정보 수정 api 호출
  const { mutate: fetchCampaignManagerInsert } = useApiForCampaignManagerInsert({
    onSuccess: (data) => {
      console.log("캠페인 정보 입력 api 결과 : ", data);
      removeTab(Number(activeTabId), activeTabKey + '');
      const newCampaignId = data.result_data.campaign_id;
      simulateHeaderMenuClick(2);
      setCampaignIdForUpdateFromSideMenu(newCampaignId.toString());

      // 캠페인 스케쥴 저장은 따로 api 를 날려야함 
      const _tempCampaignSchedule = {
        ...tempCampaignSchedule,
        campaign_id: newCampaignId
      }
      fetchCampaignScheduleInsert(_tempCampaignSchedule);
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 정보 입력', error.message);
    }
  });


  const goLogin = () => {
    logoutFunction();
    router.push('/login');
  }


  //캠페인 스케줄 등록 api 호출
  const { mutate: fetchCampaignScheduleInsert } = useApiForCampaignScheduleInsert({
    onSuccess: (data) => {
      toast.success('캠페인 스케줄이 저장되었습니다.', { autoClose: 2000 });

    }
    , onError: (data) => {
      toast.error('캠페인 스케줄 저장에 실패했습니다.', { autoClose: 2000 });
      ServerErrorCheck('캠페인 스케줄 저장', data.message);
    }
  });

  return (
    <div className='flex flex-col gap-5 w-full overflow-auto'>
      <div>
        <TitleWrap
          className='border-b border-gray-300 pb-1'
          title="캠페인 정보"
          buttons={[
            { label: "캠페인 생성", onClick: () => handleCampaignSave() },
            { label: "생성 취소", onClick: () => handleCampaignClosed() },
          ]}
        />

        <CampaignBasicInfoForm
          tenantId={tenantId}
          tempCampaignInfo={tempCampaignInfo}
          inputSkills={inputSkills}
          onInputChange={handleInputData}
          onSelectChange={handleSelectChange}
          onUpdateSkill={(param) => handleSelectSkills(param)}
        />
        
      </div>

      <div>
        <CampaignTab
          campaignSchedule={tempCampaignSchedule}
          callCampaignMenu={'NewCampaignManager'}
          campaignInfo={tempCampaignInfo}
          campaignDialSpeedInfo={tempCampaignDialSpeedInfoParam}
          onCampaignOutgoingOrderChange={(value) => handleCampaignOutgoingOrderChange(value)}
          onCampaignScheduleChange={(value) => handleCampaignScheduleChange(value)}
          onCampaignOutgoingStrategyChange={(value) => handleOutgoingStrategyTabChange(value)}
          onCampaignOutgoingMethodChange={(value) => handleOutgoingMethodTabChange(value)}
          onHandleCallPacingTabChange={(value) => handleCallPacingTabChange(value)}
          onHandleAdditionalInfoTabChange={(value) => handleAdditionalInfoTabChange(value)}
          onHandleCallbackTabChange={(value) => handleCallbackTabChange(value)}
          onHandleNotificationTabChange={(value) => handleNotificationTabChange(value)}
        />
      </div>

      <CustomAlert
        message={alertState.message}
        title={alertState.title}
        type={alertState.type}
        isOpen={alertState.isOpen}
        onClose={() => alertState.onClose()}
        onCancel={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
      />

    </div>
  );

}
export default CreateCampaignFormsContainer