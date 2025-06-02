"use client";
// src\widgets\sidebar\pannels\CampaignCloneDetail.tsx
import { useMainStore, useCampainManagerStore, useTabStore, useAuthStore } from '@/store';
import Image from 'next/image'
import TitleWrap from "@/components/shared/TitleWrap";
import { Label } from "@/components/ui/label";
import { CustomInput } from "@/components/shared/CustomInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import CampaignTab from '@/app/main/comp/CampaignManager/CampaignTab';
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import {
  CampaignSkillUpdateRequest
  , CampaignScheDuleListDataResponse
  , CallingNumberListDataResponse
  , CampaignDialSpeedUpdateRequest
  , CampaignInfoDeleteRequest
  , MaxcallExtDeleteRequest
} from '@/features/campaignManager/types/campaignManagerIndex';
import { useEffect, useState } from 'react';
import SkillListPopup from '@/components/shared/layout/SkillListPopup';
import { useApiForCampaignSkillUpdate } from '@/features/campaignManager/hooks/useApiForCampaignSkillUpdate';
import { useApiForMain } from '@/features/auth/hooks/useApiForMain';
import CustomAlert, { CustomAlertRequest } from '@/components/shared/layout/CustomAlert';
import CallingNumberPopup from '@/components/shared/layout/CallingNumberPopup';
import { useApiForCampaignManagerInsert, CampaignInfoInsertRequest } from '@/features/campaignManager/hooks/useApiForCampaignManagerInsert';
import { useApiForCampaignScheduleInsert } from '@/features/campaignManager/hooks/useApiForCampaignScheduleInsert';
import { useApiForCallingNumberInsert } from '@/features/campaignManager/hooks/useApiForCallingNumberInsert';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { CommonButton } from "@/components/shared/CommonButton";
import { CampaignInfo } from '@/app/main/comp/CreateCampaignFormPanel/variables/variablesForCreateCampaignForm';
import { useEnvironmentStore } from "@/store/environmentStore";
import logoutFunction from '@/components/common/logoutFunction';

export interface TabItem {
  id: number;
  uniqueKey: string;
  title: string;
  icon: string;
  href: string;
  content: React.ReactNode;
  campaignId?: string;
}

const dialModeList = [
  { dial_id: 1, dial_name: 'Power' },
  { dial_id: 2, dial_name: 'Progressive' },
  { dial_id: 3, dial_name: 'Predictive' },
  { dial_id: 4, dial_name: 'System Preview' },
];

const errorMessage: CustomAlertRequest = {
  isOpen: false,
  message: '',
  title: '캠페인',
  type: '1',
  onClose: () => { },
  onCancel: () => { },
};

const CampaignSkillInfo: CampaignSkillUpdateRequest = {
  campaign_id: 0,
  skill_id: [],
}

const CallingNumberInfo: CallingNumberListDataResponse = {
  campaign_id: 0,
  calling_number: ''
}

const CampaignDialSpeedInfo: CampaignDialSpeedUpdateRequest = {
  campaign_id: 0,
  tenant_id: 0,
  dial_speed: 0
}

const CampaignManagerInfo: CampaignInfoInsertRequest = {
  campaign_id: 0,
  campaign_name: '',
  campaign_desc: '',
  site_code: 0,
  service_code: 0,
  start_flag: 2,
  end_flag: 1,
  dial_mode: 0,
  callback_kind: 0,
  delete_flag: 0,
  list_count: 0,
  list_redial_query: '',
  next_campaign: 0,
  token_id: 0,
  phone_order: '',
  phone_dial_try1: 0,
  phone_dial_try2: 0,
  phone_dial_try3: 0,
  phone_dial_try4: 0,
  phone_dial_try5: 0,
  dial_try_interval: 0,
  trunk_access_code: '',
  DDD_code: '',
  power_divert_queue: '',
  max_ring: 0,
  detect_mode: 0,
  auto_dial_interval: 0,
  creation_user: '',
  creation_time: '',
  creation_ip: '',
  update_user: '',
  update_time: '',
  update_ip: '',
  dial_phone_id: 0,
  tenant_id: 0,
  alarm_answer_count: 0,
  dial_speed: 0,
  parent_campaign: 0,
  overdial_abandon_time: 0,
  list_alarm_count: 0,
  supervisor_phone: '',
  reuse_count: 0,
  use_counsel_result: 0,
  use_list_alarm: 0,
  redial_strategy1: "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
  redial_strategy2: "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
  redial_strategy3: "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
  redial_strategy4: "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
  redial_strategy5: "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
  dial_mode_option: 0,
  user_option: '',
  customer_char_id: 1,
  counsel_script_id: 1,
  announcement_id: 1,
  campaign_level: 0,
  outbound_sequence: '',
  channel_group_id: 0,
}

export interface OperationTimeParam {
  changeYn: boolean;
  campaignInfoChangeYn: boolean;
  campaignScheduleChangeYn: boolean;
  onSave: boolean;
  onClosed: boolean;
  campaign_id: number;
  start_date: string;
  end_date: string;
  start_time: string[];
  end_time: string[];
  start_flag: string;
}

export interface OutgoingOrderTabParam {
  changeYn: boolean;
  campaignInfoChangeYn: boolean;
  onSave: boolean;
  onClosed: boolean;
  dial_phone_id: number;
  phone_order: string;
  phone_dial_try: number[];
}

export interface OutgoingStrategyTabParam {
  changeYn: boolean;
  campaignInfoChangeYn: boolean;
  onSave: boolean;
  onClosed: boolean;
  onInit: boolean;
  redial_strategy: string[];
}

export interface OutgoingMethodTabParam {
  changeYn: boolean;
  campaignInfoChangeYn: boolean;
  onSave: boolean;
  onClosed: boolean;
  trunk_access_code: string;      //Trunk Access Code
  dial_try_interval: number;      //재시도 간격(초)
  alarm_answer_count: number;     //콜 목표량
  overdial_abandon_time: number;  //포기호 처리시간(초)
  detect_mode: number;            //기계음 처리 - 자동응답기 처리 1 : 컬러링 판별 후 사람만 연결, 2 : 컬러링 판별 후 사람/기계음 연결, 3 : 기계음/사람 무조건 연결
  auto_dial_interval: number;     //자동 다이얼 시
  power_divert_queue: number;     //연결 IVR NO 및 다이얼 모드
  next_campaign: number;          //연결 캠페인
  DDD_code: string;               //DDD Number - 지역 번호
  callback_kind: number;          //연결구분 - 콜백구분 0 : 일반 캠페인(Default), 1 : 무한 콜백, 2 : 일반 콜백
  max_ring: number;               //최대 링 횟수
  token_id: number;               //토큰 ID
  use_counsel_result: number;     //상담결과 등록 여부 - 0 : 미사용, 1 : 사용
  dial_mode_option: number;       //다이얼 모드 옵션 - 발신 모드별 옵션 설정(system preview 에서만 사용)
  user_option: string;            //제한 호수 비율
  channel_group_id: number;
}

export interface AdditionalInfoTabParam {
  changeYn: boolean;
  campaignInfoChangeYn: boolean;
  onSave: boolean;
  onClosed: boolean;
}

const today = new Date();
const CampaignScheduleInfo: CampaignScheDuleListDataResponse = {
  campaign_id: 0,
  tenant_id: 0,
  start_date: today.getFullYear() + ('0' + (today.getMonth() + 1)).slice(-2) + ('0' + today.getDate()).slice(-2),
  end_date: today.getFullYear() + ('0' + (today.getMonth() + 1)).slice(-2) + ('0' + today.getDate()).slice(-2),
  start_time: [],
  end_time: []
}

const campaignInfoDelete: CampaignInfoDeleteRequest = {
  campaign_id: 0,
  tenant_id: 0,
  delete_dial_list: 1
};

const agientListDelte: MaxcallExtDeleteRequest = {
  campaign_id: 0,
  agent_id_list: []
}

export interface CallPacingTabParam {
  changeYn: boolean;
  campaignDialSpeedChangeYn: boolean;
  onSave: boolean;
  onClosed: boolean;
  dial_mode: number;
  progressive_dial_speed: number; //PDS 발신 속도(1~100)
  predictive_dial_speed: number;  //PDS 발신 속도(1~100)
}

const CampaignCallPacingTabInfo: CallPacingTabParam = {
  changeYn: false,
  campaignDialSpeedChangeYn: false,
  onSave: false,
  onClosed: false,
  dial_mode: 0,
  progressive_dial_speed: 0,
  predictive_dial_speed: 0,
}

export interface CallbackTabParam {
  changeYn: boolean;
  campaignInfoChangeYn: boolean;
  onSave: boolean;
  onClosed: boolean;
  callback_kind: number;
  service_code: number;
}

export interface NotificationTabParam {
  changeYn: boolean;
  campaignInfoChangeYn: boolean;
  onSave: boolean;
  onClosed: boolean;
  use_list_alarm: number;
  list_alarm_count: number;
  supervisor_phone: string;
}

export default function CampaignDetail() {
  // const [tempCampaignManagerInfo, setTempCampaignManagerInfo] = useState<CampaignInfoInsertRequest>(CampaignManagerInfo);
  // const [tempCampaignInfo, setTempCampaignsInfo] = useState<MainDataResponse>(CampaignInfo);
  // const [tempCampaignSkills, setTempCampaignSkills] = useState<CampaignSkillUpdateRequest>(CampaignSkillInfo);
  const [tempCallingNumberInfo, setTempCallingNumberInfo] = useState<CallingNumberListDataResponse>(CallingNumberInfo);
  const [tempCampaignSchedule, setTempCampaignSchedule] = useState<CampaignScheDuleListDataResponse>(CampaignScheduleInfo);
  const [tempCampaignDialSpeedInfo, setTempCampaignDialSpeedInfo] = useState<CampaignDialSpeedUpdateRequest>(CampaignDialSpeedInfo);
  const [tempCampaignDialSpeedInfoParam, setTempCampaignDialSpeedInfoParam] = useState<CallPacingTabParam>(CampaignCallPacingTabInfo);
  const [changeYn, setChangeYn] = useState<boolean>(false); // 변경여부
  const [campaignInfoChangeYn, setCampaignInfoChangeYn] = useState<boolean>(true); // 캠페인정보 변경여부
  const [campaignSkillChangeYn, setCampaignSkillChangeYn] = useState<boolean>(false); // 캠페인스킬 변경여부
  const [callingNumberChangeYn, setCallingNumberChangeYn] = useState<boolean>(false); // 캠페인 발신번호 변경여부
  const [campaignDialSpeedChangeYn, setCampaignDialSpeedChangeYn] = useState<boolean>(false); // 캠페인 발신속도 변경여부
  const [tempCampaignId, setTempCampaignId] = useState<number>(0);
  const { tenants
    , setCampaigns
    , campaigns
  } = useMainStore();
  const { removeTab, activeTabId, activeTabKey, campaignIdForCopyCampaign } = useTabStore();
  const { callingNumbers, campaignSkills, schedules
    , copyCampaignManagerInfo, setCopyCampaignManagerInfo
    , copyCampaignInfo, setCopyCampaignInfo
    , copyTenantId, setCopyTenantId
    , copyCampaignSchedule, setCopyCampaignSchedule
    , copyCampaignSkills, setCopyCampaignSkills } = useCampainManagerStore();
  const [inputSkills, setInputSkills] = useState('');
  const [inputCallingNumber, setInputCallingNumber] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<MainDataResponse>(CampaignInfo);
  const [skillPopupState, setSkillPopupState] = useState({
    isOpen: false,
    param: [],
    tenantId: 0,
    type: '1',
  });
  const [alertState, setAlertState] = useState<CustomAlertRequest>(errorMessage);
  const [callingNumberPopupState, setCallingNumberPopupState] = useState({
    isOpen: false,
    param: [],
    tenantId: 0,
    type: '1',
  });
  const router = useRouter();
  const { id, menu_role_id } = useAuthStore();
  const { environmentData } = useEnvironmentStore();
  const [ officeStartTime , setOfficeStartTime ] = useState<string>('0000');
  const [ officeEndTime, setOfficeEndTime ] = useState<string>('0000');
  const [ inputCampaignId, setInputCampaignId ] = useState<string>('');

  //캠페인 정보 최초 세팅 
  useEffect(() => {
    if (selectedCampaign && selectedCampaign !== null && typeof copyCampaignInfo.campaign_name !== 'undefined' && copyCampaignInfo.campaign_name === '') {
      setCopyCampaignInfo({
        ...copyCampaignInfo,
        campaign_id: 0,
        campaign_name: selectedCampaign.campaign_name,
        campaign_desc: selectedCampaign.campaign_desc,
        site_code: selectedCampaign.site_code,
        service_code: selectedCampaign.service_code,
        start_flag: selectedCampaign.start_flag,
        end_flag: selectedCampaign.end_flag,
        dial_mode: selectedCampaign.dial_mode,
        callback_kind: selectedCampaign.callback_kind,
        delete_flag: selectedCampaign.delete_flag,
        list_count: selectedCampaign.list_count,
        list_redial_query: selectedCampaign.list_redial_query,
        next_campaign: selectedCampaign.next_campaign,
        token_id: selectedCampaign.token_id,
        phone_order: selectedCampaign.phone_order,
        phone_dial_try: selectedCampaign.phone_dial_try,
        dial_try_interval: selectedCampaign.dial_try_interval,
        trunk_access_code: selectedCampaign.trunk_access_code,
        DDD_code: selectedCampaign.DDD_code,
        power_divert_queue: selectedCampaign.power_divert_queue,
        max_ring: selectedCampaign.max_ring,
        detect_mode: selectedCampaign.detect_mode,
        auto_dial_interval: selectedCampaign.auto_dial_interval,
        creation_user: selectedCampaign.creation_user,
        creation_time: selectedCampaign.creation_time,
        creation_ip: selectedCampaign.creation_ip,
        update_user: selectedCampaign.update_user,
        update_time: selectedCampaign.update_time,
        update_ip: selectedCampaign.update_ip,
        dial_phone_id: selectedCampaign.dial_phone_id,
        tenant_id: selectedCampaign.tenant_id,
        alarm_answer_count: selectedCampaign.alarm_answer_count,
        dial_speed: selectedCampaign.dial_speed,
        parent_campaign: selectedCampaign.parent_campaign,
        overdial_abandon_time: selectedCampaign.overdial_abandon_time,
        list_alarm_count: selectedCampaign.list_alarm_count,
        supervisor_phone: selectedCampaign.supervisor_phone,
        reuse_count: selectedCampaign.reuse_count,
        use_counsel_result: selectedCampaign.use_counsel_result,
        use_list_alarm: selectedCampaign.use_list_alarm,
        redial_strategy: selectedCampaign.redial_strategy,
        dial_mode_option: selectedCampaign.dial_mode_option,
        user_option: selectedCampaign.user_option
      });

      const tempSkill = campaignSkills.filter((skill) => skill.campaign_id === selectedCampaign.campaign_id)
        .map((data) => data.skill_id)
        .join(',');
      setInputSkills(tempSkill);
      setCopyCampaignSkills({
        ...copyCampaignSkills
        , skill_id: tempSkill.split(',').map((data) => Number(data))
      });
      const tempCallNumber = callingNumbers.filter((callingNumber) => callingNumber.campaign_id === selectedCampaign.campaign_id)
        .map((data) => data.calling_number)
        .join(',');
      setInputCallingNumber(tempCallNumber);
      setTempCallingNumberInfo({
        ...tempCallingNumberInfo
        , calling_number: tempCallNumber
      });
      setTempCampaignDialSpeedInfo({
        ...tempCampaignDialSpeedInfo
        , campaign_id: 0
        , tenant_id: selectedCampaign.tenant_id
        , dial_speed: selectedCampaign.dial_speed
      });
      setTempCampaignDialSpeedInfoParam({
        ...tempCampaignDialSpeedInfoParam
        , dial_mode: selectedCampaign.dial_mode
        , predictive_dial_speed: selectedCampaign.dial_mode === 2 ? 0 : selectedCampaign.dial_speed
        , progressive_dial_speed: selectedCampaign.dial_mode === 3 ? 0 : selectedCampaign.dial_speed
      })
      setCopyCampaignManagerInfo({
        ...copyCampaignManagerInfo,
        campaign_id: 0,
        campaign_name: selectedCampaign.campaign_name,
        campaign_desc: selectedCampaign.campaign_desc,
        site_code: selectedCampaign.site_code,
        service_code: selectedCampaign.service_code,
        start_flag: selectedCampaign.start_flag,
        end_flag: selectedCampaign.end_flag,
        dial_mode: selectedCampaign.dial_mode,
        callback_kind: selectedCampaign.callback_kind,
        delete_flag: selectedCampaign.delete_flag,
        list_count: selectedCampaign.list_count,
        list_redial_query: selectedCampaign.list_redial_query,
        next_campaign: selectedCampaign.next_campaign,
        token_id: selectedCampaign.token_id,
        phone_order: selectedCampaign.phone_order,
        phone_dial_try1: (selectedCampaign.phone_dial_try !== undefined) ? Number(selectedCampaign.phone_dial_try.slice(0, 1)[0]) : 0,
        phone_dial_try2: (selectedCampaign.phone_dial_try !== undefined) ? Number(selectedCampaign.phone_dial_try.slice(1, 2)[0]) : 0,
        phone_dial_try3: (selectedCampaign.phone_dial_try !== undefined) ? Number(selectedCampaign.phone_dial_try.slice(2, 3)[0]) : 0,
        phone_dial_try4: (selectedCampaign.phone_dial_try !== undefined) ? Number(selectedCampaign.phone_dial_try.slice(3, 4)[0]) : 0,
        phone_dial_try5: (selectedCampaign.phone_dial_try !== undefined) ? Number(selectedCampaign.phone_dial_try.slice(4, 5)[0]) : 0,
        dial_try_interval: selectedCampaign.dial_try_interval,
        trunk_access_code: selectedCampaign.trunk_access_code,
        DDD_code: selectedCampaign.DDD_code,
        power_divert_queue: selectedCampaign.power_divert_queue + '',
        max_ring: selectedCampaign.max_ring,
        detect_mode: selectedCampaign.detect_mode,
        auto_dial_interval: selectedCampaign.auto_dial_interval,
        creation_user: selectedCampaign.creation_user + '',
        creation_time: selectedCampaign.creation_time,
        creation_ip: selectedCampaign.creation_ip,
        update_user: selectedCampaign.update_user + '',
        update_time: selectedCampaign.update_time,
        update_ip: selectedCampaign.update_ip,
        dial_phone_id: selectedCampaign.dial_phone_id,
        tenant_id: selectedCampaign.tenant_id,
        alarm_answer_count: selectedCampaign.alarm_answer_count,
        dial_speed: selectedCampaign.dial_speed,
        parent_campaign: selectedCampaign.parent_campaign,
        overdial_abandon_time: selectedCampaign.overdial_abandon_time,
        list_alarm_count: selectedCampaign.list_alarm_count,
        supervisor_phone: selectedCampaign.supervisor_phone,
        reuse_count: selectedCampaign.reuse_count,
        use_counsel_result: selectedCampaign.use_counsel_result,
        use_list_alarm: selectedCampaign.use_list_alarm,
        redial_strategy1: (selectedCampaign.redial_strategy !== undefined) ? selectedCampaign.redial_strategy.slice(0, 1)[0] + '' : '',
        redial_strategy2: (selectedCampaign.redial_strategy !== undefined) ? selectedCampaign.redial_strategy.slice(1, 2)[0] + '' : '',
        redial_strategy3: (selectedCampaign.redial_strategy !== undefined) ? selectedCampaign.redial_strategy.slice(2, 3)[0] + '' : '',
        redial_strategy4: (selectedCampaign.redial_strategy !== undefined) ? selectedCampaign.redial_strategy.slice(3, 4)[0] + '' : '',
        redial_strategy5: (selectedCampaign.redial_strategy !== undefined) ? selectedCampaign.redial_strategy.slice(4, 5)[0] + '' : '',
        dial_mode_option: selectedCampaign.dial_mode_option,
        user_option: selectedCampaign.user_option,
        customer_char_id: 1,
        counsel_script_id: 1,
        announcement_id: 1,
        campaign_level: 0,
        outbound_sequence: ''
      });
      if (schedules && schedules.length > 0) {
        const tempCampaignSchedule = schedules.filter((schedule) => schedule.campaign_id === selectedCampaign?.campaign_id);
        if (tempCampaignSchedule.length > 0) {
          setTempCampaignSchedule({
            ...tempCampaignSchedule[0],
            campaign_id: 0,
            tenant_id: selectedCampaign.tenant_id,
            start_date: schedules.filter((schedule) => schedule.campaign_id === selectedCampaign.campaign_id)[0].start_date,
            end_date: schedules.filter((schedule) => schedule.campaign_id === selectedCampaign.campaign_id)[0].end_date,
            start_time: schedules.filter((schedule) => schedule.campaign_id === selectedCampaign.campaign_id)[0].start_time,
            end_time: schedules.filter((schedule) => schedule.campaign_id === selectedCampaign.campaign_id)[0].end_time
          });
          setCopyCampaignSchedule({
            ...tempCampaignSchedule[0],
            campaign_id: 0,
            tenant_id: selectedCampaign.tenant_id,
            start_date: schedules.filter((schedule) => schedule.campaign_id === selectedCampaign.campaign_id)[0].start_date,
            end_date: schedules.filter((schedule) => schedule.campaign_id === selectedCampaign.campaign_id)[0].end_date,
            start_time: schedules.filter((schedule) => schedule.campaign_id === selectedCampaign.campaign_id)[0].start_time,
            end_time: schedules.filter((schedule) => schedule.campaign_id === selectedCampaign.campaign_id)[0].end_time
          });
        }
      } else {
        setTempCampaignSchedule({
          ...tempCampaignSchedule,
          campaign_id: 0,
          tenant_id: selectedCampaign.tenant_id
        });
        setCopyCampaignSchedule({
          ...tempCampaignSchedule,
          campaign_id: 0,
          tenant_id: selectedCampaign.tenant_id
        });
      }
    }
  }, [selectedCampaign, campaignSkills, callingNumbers, schedules]);

  //input data change
  const handleInputData = (value: any, col: string) => {
    if (col === 'campaign_id' ) {
      if( value !== '' && value.length <= 10 && Number(value) >= 0 ){
        const numValue = Number(value);
        setInputCampaignId(value);
        setCopyCampaignInfo({
            ...copyCampaignInfo,
            campaign_id: numValue
        });
        setCopyCampaignManagerInfo({
            ...copyCampaignManagerInfo,
            campaign_id: numValue
        });
      }else if( value === '' ){
        setInputCampaignId('');
        setCopyCampaignInfo({
            ...copyCampaignInfo,
            campaign_id: 0
        });
        setCopyCampaignManagerInfo({
            ...copyCampaignManagerInfo,
            campaign_id: 0
        });
      }
    }
    if (col === 'campaign_name') {
      setCopyCampaignInfo({
        ...copyCampaignInfo,
        campaign_name: value
      });
      setCopyCampaignManagerInfo({
        ...copyCampaignManagerInfo,
        campaign_name: value
      });
    }
    if (col === 'campaign_desc') {
      setCopyCampaignInfo({
        ...copyCampaignInfo,
        campaign_desc: value
      });
      setCopyCampaignManagerInfo({
        ...copyCampaignManagerInfo,
        campaign_desc: value
      });
    }
  }

  //select data change
  const handleSelectChange = (value: string, type: 'tenant' | 'dialMode') => {
    if (type === 'tenant' && value !== '') {
      setCopyCampaignInfo({
        ...copyCampaignInfo,
        tenant_id: Number(value)
      });
      setCopyCampaignManagerInfo({
        ...copyCampaignManagerInfo,
        tenant_id: Number(value)
      });
    }
    if (type === 'dialMode' && value !== '') {
      setCopyCampaignInfo({
        ...copyCampaignInfo,
        dial_mode: Number(value),
        dial_speed: 0,
      });
      setCopyCampaignManagerInfo({
        ...copyCampaignManagerInfo,
        dial_mode: Number(value),
        dial_speed: 0,
      });
      setTempCampaignDialSpeedInfoParam({
        ...tempCampaignDialSpeedInfoParam,
        dial_mode: Number(value)
      });
    }
  }

  //스킬 선택 팝업 버튼이벤트
  const handleOpenSkillPopup = () => {
    console.log(copyTenantId);
    if (copyTenantId === ' ') {
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: '테넌트를 선택해 주세요.',
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    } else {
      setSkillPopupState({
        ...skillPopupState
        , isOpen: true
        , tenantId: Number(copyTenantId)
      });
    }
  }

  //스킬 선택 팝업
  const handleSelectSkills = (param: string) => {
    if (copyCampaignSkills.skill_id.join(',') !== param) {
      setCampaignSkillChangeYn(true);
      setInputSkills(param);
      setCopyCampaignSkills({
        ...copyCampaignSkills
        , campaign_id: copyCampaignInfo.campaign_id
        , skill_id: param.split(',').map((data) => Number(data))
      });
    }
    setSkillPopupState((prev) => ({ ...prev, isOpen: false }))
  }

  //발신번호 팝업
  const handleCallingNumlber = (param: string) => {
    if (inputCallingNumber !== param) {
      setCallingNumberChangeYn(true);
      setInputCallingNumber(param);
      setTempCallingNumberInfo({
        ...tempCallingNumberInfo
        , campaign_id: copyCampaignInfo.campaign_id
        , calling_number: param
      });
    }
    setCallingNumberPopupState((prev) => ({ ...prev, isOpen: false }))
  }

  //캠페인 동작시간 탭 변경
  const handleCampaignScheduleChange = (value: OperationTimeParam) => {
    if (value.campaignInfoChangeYn) {
      setCopyCampaignManagerInfo({
        ...copyCampaignManagerInfo
        , start_flag: Number(value.start_flag)
      });
      setCopyCampaignInfo({
        ...copyCampaignInfo
        , start_flag: Number(value.start_flag)
      });
    }
    if (value.campaignScheduleChangeYn) {
      setTempCampaignSchedule({
        ...tempCampaignSchedule
        , campaign_id: value.campaign_id
        , start_date: value.start_date
        , end_date: value.end_date
        , start_time: value.start_time
        , end_time: value.end_time
      });
      setCopyCampaignSchedule({
        ...tempCampaignSchedule
        , campaign_id: value.campaign_id
        , start_date: value.start_date
        , end_date: value.end_date
        , start_time: value.start_time
        , end_time: value.end_time
      });
    }
    if (value.onSave) {
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  }

  //캠페인 발신 순서 탭 변경
  const handleCampaignOutgoingOrderChange = (value: OutgoingOrderTabParam) => {
    if (value.campaignInfoChangeYn) {
      setCopyCampaignInfo({
        ...copyCampaignInfo
        , dial_phone_id: Number(value.dial_phone_id)
        , phone_dial_try: value.phone_dial_try
        , phone_order: value.phone_order
      });
      setCopyCampaignManagerInfo({
        ...copyCampaignManagerInfo
        , dial_phone_id: Number(value.dial_phone_id)
        , phone_dial_try1: value.phone_dial_try[0]
        , phone_dial_try2: value.phone_dial_try[1]
        , phone_dial_try3: value.phone_dial_try[2]
        , phone_dial_try4: value.phone_dial_try[3]
        , phone_dial_try5: value.phone_dial_try[4]
        , phone_order: value.phone_order
      });
    }
    if (value.onSave) {
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  }

  //캠페인 발신전략 탭 변경
  const handleOutgoingStrategyTabChange = (value: OutgoingStrategyTabParam) => {
    if (value.campaignInfoChangeYn) {
      setCopyCampaignInfo({
        ...copyCampaignInfo
        , redial_strategy: value.redial_strategy
      });
      setCopyCampaignManagerInfo({
        ...copyCampaignManagerInfo
        , redial_strategy1: value.redial_strategy[0]
        , redial_strategy2: value.redial_strategy[1]
        , redial_strategy3: value.redial_strategy[2]
        , redial_strategy4: value.redial_strategy[3]
        , redial_strategy5: value.redial_strategy[4]
      });
    }
    //초기화버튼 클릭시
    if (value.onInit) {
      setCopyCampaignInfo({
        ...copyCampaignInfo
        , redial_strategy: CampaignInfo.redial_strategy
      });
      setCopyCampaignManagerInfo({
        ...copyCampaignManagerInfo
        , redial_strategy1: CampaignManagerInfo.redial_strategy1
        , redial_strategy2: CampaignManagerInfo.redial_strategy2
        , redial_strategy3: CampaignManagerInfo.redial_strategy3
        , redial_strategy4: CampaignManagerInfo.redial_strategy4
        , redial_strategy5: CampaignManagerInfo.redial_strategy5
      });
    }
    if (value.onSave) {
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  }

  //캠페인 발신방법 탭 변경
  const handleOutgoingMethodTabChange = (value: OutgoingMethodTabParam) => {
    if (value.campaignInfoChangeYn) {
      setCopyCampaignInfo({
        ...copyCampaignInfo
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
        , channel_group_id: value.channel_group_id
      });
      setCopyCampaignManagerInfo({
        ...copyCampaignManagerInfo
        , trunk_access_code: value.trunk_access_code
        , dial_try_interval: value.dial_try_interval
        , alarm_answer_count: value.alarm_answer_count
        , overdial_abandon_time: value.overdial_abandon_time
        , detect_mode: value.detect_mode
        , auto_dial_interval: value.auto_dial_interval
        , power_divert_queue: value.power_divert_queue + ''
        , next_campaign: value.next_campaign
        , DDD_code: value.DDD_code
        , callback_kind: value.callback_kind
        , max_ring: value.max_ring
        , token_id: value.token_id
        , use_counsel_result: value.use_counsel_result
        , dial_mode_option: value.dial_mode_option
        , user_option: value.user_option
        , channel_group_id: value.channel_group_id
      });
    }
    if (value.onSave) {
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  }

  //캠페인 콜페이싱 탭 변경
  const handleCallPacingTabChange = (value: CallPacingTabParam) => {
    if (value.campaignDialSpeedChangeYn) {
      setTempCampaignDialSpeedInfoParam({
        ...tempCampaignDialSpeedInfoParam
        , predictive_dial_speed: value.predictive_dial_speed
        , progressive_dial_speed: value.progressive_dial_speed
      });
      setTempCampaignDialSpeedInfo({
        ...tempCampaignDialSpeedInfo
        , dial_speed: value.dial_mode === 2 ? Math.floor(value.progressive_dial_speed) : value.predictive_dial_speed
      });
      setCopyCampaignManagerInfo({
        ...copyCampaignManagerInfo,
        dial_speed: copyCampaignManagerInfo.dial_mode === 2 ? Math.floor(value.progressive_dial_speed) : value.predictive_dial_speed
      });
    }
    if (value.onSave) {
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  }

  //캠페인 콜백 탭 변경
  const handleCallbackTabChange = (value: CallbackTabParam) => {
    if (value.campaignInfoChangeYn) {
      setCopyCampaignInfo({
        ...copyCampaignInfo
        , callback_kind: Number(value.callback_kind)
        , service_code: value.service_code
      });
      setCopyCampaignManagerInfo({
        ...copyCampaignManagerInfo
        , callback_kind: Number(value.callback_kind)
        , service_code: value.service_code
      });
    }
    if (value.onSave) {
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  }

  //캠페인 알림 탭 변경
  const handleNotificationTabChange = (value: NotificationTabParam) => {
    if (value.campaignInfoChangeYn) {
      setCopyCampaignInfo({
        ...copyCampaignInfo
        , list_alarm_count: Number(value.list_alarm_count)
        , supervisor_phone: value.supervisor_phone
        , use_list_alarm: value.use_list_alarm
      });
      setCopyCampaignManagerInfo({
        ...copyCampaignManagerInfo
        , list_alarm_count: Number(value.list_alarm_count)
        , supervisor_phone: value.supervisor_phone
        , use_list_alarm: value.use_list_alarm
      });
    }
    if (value.onSave) {
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  }

  //캠페인 기타정보 탭 변경
  const handleAdditionalInfoTabChange = (value: AdditionalInfoTabParam) => {
    if (value.onSave) {
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
    removeTab(Number(activeTabId), activeTabKey + '');
  }

  //캠페인 저장
  const handleCampaignSave = () => {
    let saveErrorCheck = false;
    //2018.11.27 Gideon #23127 캠페인 수정창 연결 IVR 입력 예외 처리
    if( copyCampaignManagerInfo.dial_mode === 1 && (copyCampaignManagerInfo.token_id === 0 || copyCampaignManagerInfo.token_id === 3) ){
      if( copyCampaignManagerInfo.power_divert_queue === '0' || copyCampaignManagerInfo.power_divert_queue === ''){
        saveErrorCheck = true;
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: "'발신 방법' 탭의 '연결 IVR NO' 값을 입력해 주시기 바랍니다.",
          type: '2',
          onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
        });
      }
    }
    if(!saveErrorCheck && copyCampaignManagerInfo.campaign_name === '' ){
      saveErrorCheck = true;
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: "캠페인명을 입력해 주세요.",
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }
    if(!saveErrorCheck && copyCampaignManagerInfo.tenant_id < 0 ){
      saveErrorCheck = true;
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: "테넌트를 선택해 주세요.",
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }
    if( !saveErrorCheck && copyCampaignManagerInfo.campaign_id > 0 ){
      const checkCampaign = campaigns.filter(data => data.campaign_id === copyCampaignManagerInfo.campaign_id);
      if( checkCampaign.length > 0 ){
        saveErrorCheck = true;
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: "중복된 캠페인 아이디가 존재합니다.",
          type: '2',
          onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
        });
      }
    }
    if( !saveErrorCheck && tempCampaignSchedule.start_time.length === 0){
      saveErrorCheck = true;
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: "시작시간 또는 종료시간을 지정해 주세요.",
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }
    if( !saveErrorCheck && environmentData ){
      if( !(officeStartTime === '0000' && officeEndTime === '0000')){
        let timeCheck = false;
        for( let i=0;i< tempCampaignSchedule.start_time.length ;i++ ){
          if( officeStartTime > tempCampaignSchedule.start_time[i] || officeEndTime < tempCampaignSchedule.end_time[i] ){
            timeCheck = true;
          }
        }
        if( timeCheck ){
          saveErrorCheck = true;
          setAlertState({
            ...errorMessage,
            isOpen: true,
            message: "설정된 발신 업무 시간에 맞지 않은 스케줄이 존재 합니다. 동작시간 탭의 시작 시간 또는 종료 시간을 변경해 주세요.",
            type: '2',
            onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
          });
        }
      }
    }
    if( !saveErrorCheck ){      
      handleCampaignSaveExecute();
    }
  }
  //현재시간 양식 구하기.
  const getCurrentFormattedTime = () => {
    const now = new Date();
  
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 0부터 시작하므로 +1
    const day = String(now.getDate()).padStart(2, '0');
  
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  
  //캠페인 저장 실행.
  const handleCampaignSaveExecute = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
    setChangeYn(true);
    const todayTime = getCurrentFormattedTime();
    fetchCampaignManagerInsert({...copyCampaignManagerInfo
      , update_user: id
      , creation_user: id
      , update_ip: Cookies.get('userHost')+''
      , creation_ip: Cookies.get('userHost')+''
      , list_count: 0
      , reuse_count: 1
      , creation_time: todayTime
      , update_time: todayTime
    });
  }

  //캠페인 정보 수정 api 호출
  const { mutate: fetchCampaignManagerInsert } = useApiForCampaignManagerInsert({
    onSuccess: (data) => {
      setTempCampaignId(data.result_data.campaign_id);
      const _tempCampaignSchedule = {...tempCampaignSchedule
        , tenant_id: copyCampaignManagerInfo.tenant_id
        , campaign_id: data.result_data.campaign_id
      }
      //캠페인 스케줄 수정 api 호출
      fetchCampaignScheduleInsert(_tempCampaignSchedule);
    },onError: (data) => {      
      if (data.message.split('||')[0] === '5') {
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
          type: '2',
          onClose: () => goLogin(),
        });
      }else{
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: '캠페인 생성을 실패했습니다.',
          type: '2',
          onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
        });
      }
    }
  });
  const goLogin = () => {
    logoutFunction();
    router.push('/login');
  };

  //캠페인 스케줄 등록 api 호출
  const { mutate: fetchCampaignScheduleInsert } = useApiForCampaignScheduleInsert({
    onSuccess: (data) => {
      if( copyCampaignSkills.skill_id[0] !== 0 ){
        const _tempCampaignSkills = {...copyCampaignSkills,
          campaign_id: tempCampaignId
        }
        fetchCampaignSkillUpdate(_tempCampaignSkills);
      }
      if (tempCallingNumberInfo.calling_number !== '' ) {
        const _tempCallingNumberInfo = {...tempCallingNumberInfo,
          campaign_id: tempCampaignId
        }
        fetchCallingNumberInsert(_tempCallingNumberInfo);
      }
      setCampaignInfoChangeYn(false);
    }
  });

  //캠페인 스킬 수정 api 호출
  const { mutate: fetchCampaignSkillUpdate } = useApiForCampaignSkillUpdate({
    onSuccess: (data) => {
      setCampaignSkillChangeYn(false);
    }
  });

  //캠페인 발신번호 추가 api 호출
  const { mutate: fetchCallingNumberInsert } = useApiForCallingNumberInsert({
    onSuccess: (data) => {
      setCallingNumberChangeYn(false);
    }
  });

  //변경여부 체크
  useEffect(() => {  
    if( changeYn && !campaignInfoChangeYn && !campaignSkillChangeYn && !callingNumberChangeYn && !campaignDialSpeedChangeYn ){  
      fetchMain({
        session_key: '',
        tenant_id: 0,
      });
    }
  }, [campaignInfoChangeYn,campaignSkillChangeYn,callingNumberChangeYn,campaignDialSpeedChangeYn]);

  //캠페인 정보 조회 api 호출
  const { mutate: fetchMain } = useApiForMain({
    onSuccess: (data) => {
      setCampaigns(data.result_data);
      setSelectedCampaign( data.result_data.filter((campaign) => campaign.campaign_id === tempCampaignId)[0] );
      setCopyCampaignInfo(data.result_data.filter((campaign) => campaign.campaign_id === tempCampaignId)[0]);
      // setChangeYn(false);
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: '작업이 완료되었습니다.',
        type: '2',
        onClose: handleClose,
      });
    }
  });
  
  const handleClose = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
    removeTab(Number(activeTabId),activeTabKey+'');
  };

  useEffect(() => {
    if( environmentData ){ 
      setOfficeStartTime( environmentData.sendingWorkStartHours);
      setOfficeEndTime( environmentData.sendingWorkEndHours);
    }
  }, [environmentData]);
  
  useEffect(() => {
    if( campaigns ){
      setSelectedCampaign(campaigns.filter(data => data.campaign_id === Number(campaignIdForCopyCampaign))[0]);
    }
  }, [campaigns, campaignIdForCopyCampaign]);

  useEffect(() => {
    if (copyCampaignSchedule && typeof copyCampaignSchedule.campaign_id !== 'undefined') {
      setTempCampaignSchedule({ ...copyCampaignSchedule });
    } else {
      setCopyCampaignSchedule(CampaignScheduleInfo);
    }
  }, [copyCampaignSchedule]);

  useEffect(() => {
    if (CampaignManagerInfo && typeof copyCampaignManagerInfo.campaign_id !== 'undefined') {
      if (!isNaN(copyCampaignInfo.tenant_id) && copyCampaignInfo.tenant_id > -1) {
        setCopyTenantId(copyCampaignInfo.tenant_id + '');
      }
      if( copyCampaignSkills && copyCampaignSkills.skill_id.length > 0){
        setInputSkills(copyCampaignSkills.skill_id.join(','));
      }
      if( copyCampaignManagerInfo.campaign_id > 0 ){
        setInputCampaignId(copyCampaignManagerInfo.campaign_id+'');
      }
    } else {
      setCopyCampaignManagerInfo(CampaignManagerInfo);
      setCopyCampaignInfo(CampaignInfo);
      setCopyTenantId((tenants.length > 0 ? tenants[0].tenant_id : '') + '' || ' ');
      setCopyCampaignSkills(CampaignSkillInfo);
    }
  }, [copyCampaignManagerInfo]);

  return (
    <div className='flex flex-col gap-5 w-full overflow-auto'>
      <div>
        <TitleWrap
          className='border-b border-gray-300 pb-1'
          title="상세내역"
          buttons={[
            { label: "캠페인 생성", onClick: () => handleCampaignSave(),},
            { label: "생성 취소", onClick: () => handleCampaignClosed() },
          ]}
        />
        <div className="grid grid-cols-3 gap-x-4 gap-y-2">
          <div className='flex items-center gap-2'>
            <Label className="w-[5.6rem] min-w-[5.6rem]">캠페인 아이디</Label>
            <CustomInput 
              type="number" 
              value={ inputCampaignId } 
              onChange={(e) => handleInputData(e.target.value, 'campaign_id')}            
              className="" 
              maxLength={10}
            />
          </div>

          <div className='flex items-center gap-2'>
            <Label className="w-[5.6rem] min-w-[5.6rem]">테넌트</Label>
            <Select
              onValueChange={(value) => handleSelectChange(value, 'tenant')}
              value={copyCampaignInfo.tenant_id + '' || ''}
              disabled={true}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="테넌트를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map(option => (
                  <SelectItem key={option.tenant_id} value={option.tenant_id.toString()}>
                    {option.tenant_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center gap-2'>
            <Label className="w-[5.6rem] min-w-[5.6rem]">캠페인명</Label>
            <CustomInput
              value={copyCampaignInfo.campaign_name || ''}
              onChange={(e) => handleInputData(e.target.value, 'campaign_name')}
              className=""
            />
          </div>

          <div className='flex items-center gap-2'>
            <Label className="w-[5.6rem] min-w-[5.6rem]">다이얼 모드</Label>
            <Select
              onValueChange={(value) => handleSelectChange(value, 'dialMode')}
              value={copyCampaignInfo.dial_mode + '' || ''}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="다이얼 모드를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {dialModeList.map(option => (
                  <SelectItem key={option.dial_id} value={option.dial_id.toString()}>
                    {option.dial_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center gap-2 relative'>
            <Label className="w-[5.6rem] min-w-[5.6rem]">스킬</Label>
            <CustomInput value={inputSkills} className="w-full" readOnly />
            <button
              className="absolute right-2 top-[52%] transform -translate-y-1/2">
              <Image
                src="/skill-popup.svg"
                alt="스킬팝업"
                width={12}
                height={12}
                priority
                onClick={() => handleOpenSkillPopup()}
              />
            </button>
          </div>
          <div className='flex items-center gap-2'>
            <Label className="w-[5.6rem] min-w-[5.6rem]">발신번호</Label>
            <CustomInput value={inputCallingNumber} className="w-full"
              disabled={selectedCampaign !== null} readOnly
            />
            {menu_role_id === 1 ? (
              <CommonButton variant="outline" className="h-[24px]" onClick={() =>
                setCallingNumberPopupState({
                  ...callingNumberPopupState,
                  isOpen: true,
                })
              }>
                발신번호 변경
              </CommonButton>
            ) : null}
          </div>
          <div className="flex items-center gap-2 col-span-3">
            <Label className="w-[5.6rem] min-w-[5.6rem]">설명</Label>
            <CustomInput value={copyCampaignInfo.campaign_desc || ''} className="w-full"
              onChange={(e) => handleInputData(e.target.value, 'campaign_desc')}
            />
          </div>
        </div>
      </div>
      <div>
        <CampaignTab
          campaignSchedule={tempCampaignSchedule}
          callCampaignMenu={'CampaignClone'}
          campaignInfo={copyCampaignInfo}
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
      <SkillListPopup
        param={copyCampaignSkills.skill_id || []}
        tenantId={copyCampaignInfo.tenant_id}
        type={skillPopupState.type}
        isOpen={skillPopupState.isOpen}
        onConfirm={(param) => handleSelectSkills(param)}
        onCancel={() => setSkillPopupState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* 확인,취소  */}
      <CustomAlert
        message={alertState.message}
        title={alertState.title}
        type={alertState.type}
        isOpen={alertState.isOpen}
        onClose={() => {
          alertState.onClose()
        }}
        onCancel={() => setAlertState((prev) => ({ ...prev, isOpen: false }))} />
      <CallingNumberPopup
        param={inputCallingNumber}
        type={callingNumberPopupState.type}
        isOpen={callingNumberPopupState.isOpen}
        onConfirm={(param) => handleCallingNumlber(param)}
        onCancel={() => setCallingNumberPopupState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}