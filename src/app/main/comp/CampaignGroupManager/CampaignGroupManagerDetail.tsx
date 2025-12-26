"use client";
// components/CampaignManager/CampaignManagerDetail.tsx
import { useMainStore, useCampainManagerStore, useTabStore, useAuthStore } from '@/store';
import Image from 'next/image'
import TitleWrap from "@/components/shared/TitleWrap";
import { Label } from "@/components/ui/label";
import { CustomInput } from "@/components/shared/CustomInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import { CommonButton } from "@/components/shared/CommonButton";
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import {
  CampaignSkillUpdateRequest
  , CampaignInfoUpdateRequest
  , CampaignScheDuleListDataResponse
  , CallingNumberListDataResponse
  , CampaignDialSpeedUpdateRequest
} from '@/features/campaignManager/types/campaignManagerIndex';
import { useEffect, useState } from 'react';
import SkillListPopup from '@/components/shared/layout/SkillListPopup';
import { useApiForCampaignSkillUpdate } from '@/features/campaignManager/hooks/useApiForCampaignSkillUpdate';
import { useApiForCampaignManagerUpdate } from '@/features/campaignManager/hooks/useApiForCampaignManagerUpdate';
import { useApiForCampaignScheduleUpdate } from '@/features/campaignManager/hooks/useApiForCampaignScheduleUpdate';
import { useApiForCallingNumberUpdate } from '@/features/campaignManager/hooks/useApiForCallingNumberUpdate';
import { useApiForCallingNumberInsert } from '@/features/campaignManager/hooks/useApiForCallingNumberInsert';
import { useApiForCallingNumberDelete } from '@/features/campaignManager/hooks/useApiForCallingNumberDelete';
import { useApiForDialSpeedUpdate } from '@/features/campaignManager/hooks/useApiForDialSpeedUpdate';
import { useApiForCampaignSkill } from '@/features/campaignManager/hooks/useApiForCampaignSkill';
import { useApiForCallingNumber } from '@/features/campaignManager/hooks/useApiForCallingNumber';
import { useApiForSchedules } from '@/features/campaignManager/hooks/useApiForSchedules';
import CustomAlert, { CustomAlertRequest } from '@/components/shared/layout/CustomAlert';
import CallingNumberPopup from '@/components/shared/layout/CallingNumberPopup';
import CampaignTab from '@/app/main/comp/CampaignManager/CampaignTab';
import { DataProps } from './CampaignGroupManagerList';
import CampaignAddPopup from '@/features/campaignManager/components/popups/CampaignAddPopup';
import { useRouter } from 'next/navigation';
import { CampaignInfo } from '../CreateCampaignFormPanel/variables/variablesForCreateCampaignForm';
import ServerErrorCheck from "@/components/providers/ServerErrorCheck";
import SkillInput from '@/components/common/skillInput';

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

const CampaignManagerInfo: CampaignInfoUpdateRequest = {
  campaign_id: 0,
  campaign_name: '',
  campaign_desc: '',
  site_code: 0,
  service_code: 0,
  start_flag: 0,
  end_flag: 0,
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
  redial_strategy1: '',
  redial_strategy2: '',
  redial_strategy3: '',
  redial_strategy4: '',
  redial_strategy5: '',
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

export interface GroupDeleteParam {
  tenant_id: number;
  group_id: number;
}

type Props = {
  groupInfo: DataProps;
  campaignId: number;
  onInit: () => void;
  onGroupDelete: (param: GroupDeleteParam) => void;
  selectCampaignGroupList: MainDataResponse[];
  onAddGroupDialogOpen: () => void;
}

export default function CampaignGroupManagerDetail({ groupInfo, campaignId, onInit, onGroupDelete, selectCampaignGroupList,onAddGroupDialogOpen }: Props) {
  const [tempCampaignManagerInfo, setTempCampaignManagerInfo] = useState<CampaignInfoUpdateRequest>(CampaignManagerInfo);
  const [tempCampaignInfo, setTempCampaignsInfo] = useState<MainDataResponse>(CampaignInfo);
  const [tempCampaignSkills, setTempCampaignSkills] = useState<CampaignSkillUpdateRequest>(CampaignSkillInfo);
  const [tempCallingNumberInfo, setTempCallingNumberInfo] = useState<CallingNumberListDataResponse>(CallingNumberInfo);
  const [tempCampaignSchedule, setTempCampaignSchedule] = useState<CampaignScheDuleListDataResponse>(CampaignScheduleInfo);
  const [tempCampaignDialSpeedInfo, setTempCampaignDialSpeedInfo] = useState<CampaignDialSpeedUpdateRequest>(CampaignDialSpeedInfo);
  const [tempCampaignDialSpeedInfoParam, setTempCampaignDialSpeedInfoParam] = useState<CallPacingTabParam>(CampaignCallPacingTabInfo);
  const [changeYn, setChangeYn] = useState<boolean>(false); // 변경여부
  const [campaignInfoChangeYn, setCampaignInfoChangeYn] = useState<boolean>(false); // 캠페인정보 변경여부
  const [campaignSkillChangeYn, setCampaignSkillChangeYn] = useState<boolean>(false); // 캠페인스킬 변경여부
  const [callingNumberChangeYn, setCallingNumberChangeYn] = useState<boolean>(false); // 캠페인 발신번호 변경여부
  const [campaignScheduleChangeYn, setCampaignScheduleChangeYn] = useState<boolean>(false); // 캠페인 스케줄 변경여부
  const [campaignDialSpeedChangeYn, setCampaignDialSpeedChangeYn] = useState<boolean>(false); // 캠페인 발신속도 변경여부
  const [campaignSaveYn, setCampaignSaveYn] = useState<boolean>(false); // 캠페인 저장여부
  const { tenants, campaigns
    , setCampaigns
    , selectedCampaign
    , setSelectedCampaign
  } = useMainStore();
    const { menu_role_id } = useAuthStore();
  const { removeTab, activeTabId, activeTabKey, addTab, openedTabs, setActiveTab
    , campaignIdForUpdateFromSideMenu, setCampaignIdForUpdateFromSideMenu } = useTabStore();
  const { callingNumbers, campaignSkills, schedules, setCampaignSkills, setSchedules, setCallingNumbers } = useCampainManagerStore();
  const [inputSkills, setInputSkills] = useState('');
  const [inputCallingNumber, setInputCallingNumber] = useState('');
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
  const [resultMessage, setResultMessage] = useState('');

  //캠페인 정보 최초 세팅 
  useEffect(() => {
    if (typeof selectedCampaign !== 'undefined' && selectedCampaign !== null && campaignId > 0) {
      // setChangeYn(true);
      setCampaignInfoChangeYn(false);
      setTempCampaignsInfo({
        ...tempCampaignInfo,
        campaign_id: selectedCampaign.campaign_id,
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
      setTempCampaignSkills({
        ...tempCampaignSkills
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
        , campaign_id: selectedCampaign.campaign_id
        , tenant_id: selectedCampaign.tenant_id
        , dial_speed: selectedCampaign.dial_speed
      });
      setTempCampaignDialSpeedInfoParam({
        ...tempCampaignDialSpeedInfoParam
        , dial_mode: selectedCampaign.dial_mode
        , predictive_dial_speed: selectedCampaign.dial_mode === 2 ? 0 : selectedCampaign.dial_speed
        , progressive_dial_speed: selectedCampaign.dial_mode === 3 ? 0 : selectedCampaign.dial_speed
      })
      setTempCampaignManagerInfo({
        ...CampaignManagerInfo,
        campaign_id: selectedCampaign.campaign_id,
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
      if (schedules.length > 0) {
        const tempCampaignSchedule = schedules.filter((schedule) => schedule.campaign_id === selectedCampaign?.campaign_id)[0];
        setTempCampaignSchedule({
          ...tempCampaignSchedule,
          campaign_id: selectedCampaign.campaign_id,
          tenant_id: selectedCampaign.tenant_id,
          start_date: schedules.filter((schedule) => schedule.campaign_id === selectedCampaign.campaign_id)[0].start_date,
          end_date: schedules.filter((schedule) => schedule.campaign_id === selectedCampaign.campaign_id)[0].end_date,
          start_time: schedules.filter((schedule) => schedule.campaign_id === selectedCampaign.campaign_id)[0].start_time,
          end_time: schedules.filter((schedule) => schedule.campaign_id === selectedCampaign.campaign_id)[0].end_time
        });
      }
    }
  }, [selectedCampaign, campaignSkills, callingNumbers, schedules, campaignId]);

  useEffect(() => {
    if (campaignId > 0 && campaigns.length > 0) {
      setSelectedCampaign(campaigns.filter((campaign) => campaign.campaign_id === campaignId)[0]);
    } else {
      setSelectedCampaign(null);
      setTempCampaignsInfo({ ...CampaignInfo });
      setInputSkills('');
      setInputCallingNumber('');
      setTempCampaignSchedule({ ...CampaignScheduleInfo });
    }
  }, [campaignId,campaigns]);

  //input data change
  const handleInputData = (value: any, col: string) => {
    // setChangeYn(true);
    setCampaignInfoChangeYn(true);
    if (col === 'campaign_id' && value !== '') {
      setTempCampaignsInfo({
        ...tempCampaignInfo,
        campaign_id: Number(value)
      });
      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo,
        campaign_id: Number(value)
      });
    }
    if (col === 'campaign_name') {
      setTempCampaignsInfo({
        ...tempCampaignInfo,
        campaign_name: value
      });
      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo,
        campaign_name: value
      });
    }
    if (col === 'campaign_desc') {
      setTempCampaignsInfo({
        ...tempCampaignInfo,
        campaign_desc: value
      });
      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo,
        campaign_desc: value
      });
    }
  }

  //select data change
  const handleSelectChange = (value: string, type: 'tenant' | 'dialMode') => {
    // setChangeYn(true);
    setCampaignInfoChangeYn(true);
    if (type === 'tenant' && value !== '') {
      setTempCampaignsInfo({
        ...tempCampaignInfo,
        tenant_id: Number(value)
      });
      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo,
        tenant_id: Number(value)
      });
    }
    if (type === 'dialMode' && value !== '') {
      setTempCampaignsInfo({
        ...tempCampaignInfo,
        dial_mode: Number(value)
      });
      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo,
        dial_mode: Number(value)
      });
      setTempCampaignDialSpeedInfoParam({
        ...tempCampaignDialSpeedInfoParam,
        dial_mode: Number(value)
      });
    }
  }

  //스킬 선택 팝업
  const handleSelectSkills = (param: string) => {
    if (tempCampaignSkills.skill_id.join(',') !== param) {
      // setChangeYn(true);
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

  //발신번호 팝업
  const handleCallingNumlber = (param: string) => {
    if (inputCallingNumber !== param) {
      // setChangeYn(true);
      // setCallingNumberChangeYn(true); // 발신번호 변경여부 20230312 주석처리
      setInputCallingNumber(param);
      setTempCallingNumberInfo({
        ...tempCallingNumberInfo
        , campaign_id: tempCampaignInfo.campaign_id
        , calling_number: param
      });
    }
    setCallingNumberPopupState((prev) => ({ ...prev, isOpen: false }))
  }

  //캠페인 동작시간 탭 변경
  const handleCampaignScheduleChange = (value: OperationTimeParam) => {
    if (campaignId > 0) { //캠페인이 존재할때만 처리
      if (value.campaignInfoChangeYn) {
        // setChangeYn(true);
        setCampaignInfoChangeYn(true);
        setTempCampaignManagerInfo({
          ...tempCampaignManagerInfo
          , start_flag: Number(value.start_flag)
        });
        setTempCampaignsInfo({
          ...tempCampaignInfo
          , start_flag: Number(value.start_flag)
        });
      }
      if (value.campaignScheduleChangeYn) {
        // setChangeYn(true);
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
  }

  //캠페인 발신 순서 탭 변경
  const handleCampaignOutgoingOrderChange = (value: OutgoingOrderTabParam) => {
    if (value.campaignInfoChangeYn) {
      // setChangeYn(true);
      setCampaignInfoChangeYn(true);
      setTempCampaignsInfo({
        ...tempCampaignInfo
        , dial_phone_id: Number(value.dial_phone_id)
        , phone_dial_try: value.phone_dial_try
        , phone_order: value.phone_order
      });
      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo
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
      // setChangeYn(true);
      setCampaignInfoChangeYn(true);
      setTempCampaignsInfo({
        ...tempCampaignInfo
        , redial_strategy: value.redial_strategy
      });
      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo
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
      // setChangeYn(true);
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
      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo
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

  //캠페인 콜페이싱 탭 변경
  const handleCallPacingTabChange = (value: CallPacingTabParam) => {
    if (value.campaignDialSpeedChangeYn) {
      // setChangeYn(true);
      setCampaignDialSpeedChangeYn(value.campaignDialSpeedChangeYn);
      setTempCampaignDialSpeedInfoParam({
        ...tempCampaignDialSpeedInfoParam
        , predictive_dial_speed: value.predictive_dial_speed
        , progressive_dial_speed: value.progressive_dial_speed
      });
      setTempCampaignsInfo({
        ...tempCampaignInfo
        , dial_speed: value.dial_mode === 2 ? Math.floor(value.progressive_dial_speed) : value.predictive_dial_speed
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
      // setChangeYn(true);
      setCampaignInfoChangeYn(true);
      setTempCampaignsInfo({
        ...tempCampaignInfo
        , callback_kind: Number(value.callback_kind)
        , service_code: value.service_code
      });
      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo
        , callback_kind: Number(value.callback_kind)
        , service_code: value.service_code
      });
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
      // setChangeYn(true);
      setCampaignInfoChangeYn(value.campaignInfoChangeYn);
      setTempCampaignsInfo({
        ...tempCampaignInfo
        , list_alarm_count: Number(value.list_alarm_count)
        , supervisor_phone: value.supervisor_phone
        , use_list_alarm: value.use_list_alarm
      });
      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo
        , list_alarm_count: Number(value.list_alarm_count)
        , supervisor_phone: value.supervisor_phone
        , use_list_alarm: value.use_list_alarm
      });
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
    removeTab(Number(activeTabId), activeTabKey + '');
  }

  //캠페인 저장
  const handleCampaignSave = () => {
    // console.log(tempCampaignManagerInfo);
    // console.log('power_divert_queue :: ' + tempCampaignManagerInfo.power_divert_queue);
    let saveErrorCheck = false;
    if (!saveErrorCheck && tempCampaignManagerInfo.tenant_id < 0) {
      saveErrorCheck = true;
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: "테넌트를 선택해 주세요.",
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }
    
    if (!saveErrorCheck && tempCampaignManagerInfo.dial_mode === 1 && (tempCampaignManagerInfo.power_divert_queue === '0' || tempCampaignManagerInfo.power_divert_queue === '')) {
      saveErrorCheck = true;
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: "'발신 방법' 탭의 '연결 IVR NO' 값을 입력해 주시기 바랍니다.",
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }
    // }
    // if (!saveErrorCheck && tempCampaignManagerInfo.campaign_name === '') {
    //   saveErrorCheck = true;
    //   setAlertState({
    //     ...errorMessage,
    //     isOpen: true,
    //     message: "캠페인명을 입력해 주세요.",
    //     type: '2',
    //     onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
    //   });
    // }
    if (!saveErrorCheck && tempCampaignSchedule.start_time.length === 0) {
      saveErrorCheck = true;
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: "시작시간 또는 종료시간을 지정해 주세요.",
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }
    if (!saveErrorCheck && selectCampaignGroupList.length === 0) {
      saveErrorCheck = true;
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: "캠페인 그룹 소속 캠페인 검색목록에서 일괄저장할 캠페인을 선택해 주세요.",
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }
    if (!saveErrorCheck) {
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: '변경된 캠페인은 복구가 불가능 합니다.'
          + '\n 캠페인을 수정하시겠습니까?',
        onClose: handleCampaignSaveExecute,
        onCancel: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }
  }

  //캠페인 저장 실행.
  const handleCampaignSaveExecute = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
    if (typeof selectCampaignGroupList !== 'undefined' && selectCampaignGroupList.length > 0) {
      setCampaignInfoChangeYn(true);
      for (let i = 0; i < selectCampaignGroupList.length; i++) {
        // if (changeYn) {
          // if (campaignInfoChangeYn) {
            fetchCampaignManagerUpdate({
              ...tempCampaignManagerInfo
              , campaign_id: selectCampaignGroupList[i].campaign_id
              , campaign_name: selectCampaignGroupList[i].campaign_name
              , campaign_desc: selectCampaignGroupList[i].campaign_desc
              , start_flag: 2
            });
          // }
          // if (campaignSkillChangeYn) {
            //캠페인 스킬 수정 api 호출
            fetchCampaignSkillUpdate({
              ...tempCampaignSkills
              , campaign_id: selectCampaignGroupList[i].campaign_id
              , skill_id: inputSkills.split(',').map(Number)
            });
          // }
          // if (campaignScheduleChangeYn) {
            //캠페인 스케줄 수정 api 호출
            fetchCampaignScheduleUpdate({
              ...tempCampaignSchedule
              , campaign_id: selectCampaignGroupList[i].campaign_id
            });
          // }
          if (callingNumberChangeYn) {
            const tempCallNumber = callingNumbers.filter((callingNumber) => callingNumber.campaign_id === tempCampaignInfo.campaign_id)
              .map((data) => data.calling_number)
              .join(',');
            //캠페인 발신번호 추가,수정,삭제 api 호출
            if (tempCallingNumberInfo.calling_number !== '' && tempCallNumber === '') {
              fetchCallingNumberInsert(tempCallingNumberInfo);
            } else if (tempCallingNumberInfo.calling_number === '' && tempCallNumber !== '') {
              fetchCallingNumberDelete(tempCallingNumberInfo);
            } else {
              fetchCallingNumberUpdate(tempCallingNumberInfo);
            }
          }
          if (campaignDialSpeedChangeYn) {
            //캠페인 발신 속도 수정 api 호출
            fetchDialSpeedUpdate({
              ...tempCampaignDialSpeedInfo
              , campaign_id: selectCampaignGroupList[i].campaign_id
            });
          }
        // }
        if (i === selectCampaignGroupList.length - 1) {
          setChangeYn(true);
          setCampaignInfoChangeYn(false);
          setCampaignSkillChangeYn(false);
          setCallingNumberChangeYn(false);
          setCampaignDialSpeedChangeYn(false);
          setResultMessage('작업이 완료되었습니다.');
        }
      }
    }
  }
  //캠페인 삭제 실행.
  const handleCampaignDeleteExecute = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
    onGroupDelete({tenant_id: groupInfo.tenantId,group_id: groupInfo.campaignGroupId })
  };

  //변경여부 체크
  useEffect(() => {
    if (changeYn && !campaignInfoChangeYn && !campaignSkillChangeYn && !callingNumberChangeYn && !campaignDialSpeedChangeYn && resultMessage !== '') {
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: resultMessage,
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
      });
      setResultMessage('');
    }
  }, [campaignInfoChangeYn, campaignSkillChangeYn, callingNumberChangeYn, campaignDialSpeedChangeYn]);

  //캠페인 정보 수정 api 호출
  const { mutate: fetchCampaignManagerUpdate } = useApiForCampaignManagerUpdate({
    onSuccess: (data) => {
      setCampaignInfoChangeYn(false);
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 정보 수정', error.message);
    }
  });


  //캠페인 스킬 조회 api 호출
  const { mutate: fetchCampaignSkills } = useApiForCampaignSkill({
    onSuccess: (data) => {
      setCampaignSkills(data.result_data);
      setCampaignSkillChangeYn(false);
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 스킬 조회', error.message);
    }
  });

  //캠페인 스킬 수정 api 호출
  const { mutate: fetchCampaignSkillUpdate } = useApiForCampaignSkillUpdate({
    onSuccess: (data) => {
      fetchCampaignSkills({
        session_key: '',
        tenant_id: 0,
      });
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 스킬 수정', error.message);
    }
  });

  // 캠페인 스케줄 조회
  const { mutate: fetchSchedules } = useApiForSchedules({
    onSuccess: (data) => {
      setSchedules(data.result_data);
      setCampaignScheduleChangeYn(false);
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 스케줄 조회', error.message);
    }
  });

  //캠페인 스케줄 수정 api 호출
  const { mutate: fetchCampaignScheduleUpdate } = useApiForCampaignScheduleUpdate({
    onSuccess: (data) => {
      const tempTenantIdArray = tenants.map((tenant) => tenant.tenant_id);
      fetchSchedules({
        tenant_id_array: tempTenantIdArray
      });
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 스케줄 수정', error.message);
    }
  });

  //캠페인 발신번호 삭제 api 호출
  const { mutate: fetchCallingNumberDelete } = useApiForCallingNumberDelete({
    onSuccess: (data) => {
      fetchCallingNumbers({
        session_key: '',
        tenant_id: 0,
      });
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 발신번호 삭제', error.message);
    }
  });

  //캠페인 발신번호 추가 api 호출
  const { mutate: fetchCallingNumberInsert } = useApiForCallingNumberInsert({
    onSuccess: (data) => {
      fetchCallingNumbers({
        session_key: '',
        tenant_id: 0,
      });
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 발신번호 추가', error.message);
    }
  });

  //캠페인 발신번호 수정 api 호출
  const { mutate: fetchCallingNumberUpdate } = useApiForCallingNumberUpdate({
    onSuccess: (data) => {
      fetchCallingNumbers({
        session_key: '',
        tenant_id: 0,
      });
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 발신번호 수정', error.message);
    }
  });

  //캠페인 발신 속도 수정 api 호출
  const { mutate: fetchDialSpeedUpdate } = useApiForDialSpeedUpdate({
    onSuccess: (data) => {
      setCampaignDialSpeedChangeYn(false);
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 발신 속도 수정', error.message);
    }
  });

  // 전화번호 조회
  const { mutate: fetchCallingNumbers } = useApiForCallingNumber({
    onSuccess: (data) => {
      setCallingNumbers(data.result_data||[]);
      setCallingNumberChangeYn(false);
    },
    onError: (error) => {
      ServerErrorCheck('전화번호 조회', error.message);
    }
  
  });

  //재발신 버튼 이벤트
  const handleRebroadcast = () => {
    if (campaignId > 0) {
      // setCampaignIdForUpdateFromSideMenu(campaignId + '');
      // if (openedTabs.some(tab => tab.id === 24)) {
      //   setActiveTab(24, openedTabs.filter((data) => data.id === 24)[0].uniqueKey);
      // } else if (!openedTabs.some(tab => tab.id === 24)) {
      //   addTab({
      //     id: 24,
      //     campaignId: groupInfo.campaignGroupId+'',
      //     campaignName: groupInfo.campaignGroupName,
      //     uniqueKey: '24',
      //     title: '재발신 설정',
      //     icon: '',
      //     href: '',
      //     content: null,
      //   });
      // }
      // 해당 아이템의 이전 탭들을 모두 찾아서 제거
      const existingTabs = openedTabs.filter(tab => tab.id === 24);
      existingTabs.forEach(tab => {
        removeTab(tab.id, tab.uniqueKey);
      });
      const newTabKey = `24-${Date.now()}`;      
      addTab({
        id: 24,
        campaignId: groupInfo.campaignGroupId+'',
        campaignName: groupInfo.campaignGroupName,
        uniqueKey: newTabKey,
        title: '재발신 설정',
        icon: '',
        href: '',
        content: null,
      });
      setTimeout(function() {
        setActiveTab(24, newTabKey);
      }, 50);
    } else {
      setCampaignIdForUpdateFromSideMenu('');
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: "재발신할 캠페인을 선택해 주세요.",
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }
  };

  // 소속캠페인 추가 다이얼로그 열기
  const handleCloseCampaignDialog = () => {
    onInit();
    setIsCampaignAddPopupOpen(false);
  }

  // 팝업 상태
  const [isCampaignAddPopupOpen, setIsCampaignAddPopupOpen] = useState(false);

  // 다이얼로그 닫기
  const handleCloseGroupAddCampaignOpen = () => {
    setIsCampaignAddPopupOpen(true);
  };

  return (
    <div className='flex flex-col gap-5 w-[60%] overflow-auto'>
      <div>
        <TitleWrap
          className='border-b border-gray-300 pb-1'
          title="상세내역"
          buttons={[
            { label: "새 캠페인 그룹", onClick: () => onAddGroupDialogOpen() },
            { label: "소속 캠페인 추가/삭제", onClick: () => handleCloseGroupAddCampaignOpen() },
            { label: "일괄 저장", onClick: () => handleCampaignSave(), },
            {
              label: "캠페인 그룹 삭제", onClick: () => {
                setAlertState({
                  ...errorMessage,
                  isOpen: true,
                  message: '정말로 캠페인 그룹 '+groupInfo.campaignGroupName+'을(를) 삭제하시겠습니까?'
                    + '\n 이 작업은 되돌릴 수 없습니다.',
                  onClose: handleCampaignDeleteExecute,
                  onCancel: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
                });
              }
            },
            { label: "재발신", onClick: () => handleRebroadcast(), variant: "customblue", disabled: campaignId > 0 ? false : true },
          ]}
        />
        <div className="grid grid-cols-3 gap-x-[26px] gap-y-2">
          <div className='flex items-center gap-2'>
            <Label className="w-[90px] min-w-[90px]">그룹 아이디</Label>
            <CustomInput
              type="number"
              value={groupInfo.campaignGroupId === 0 ? '' : groupInfo.campaignGroupId + ''}
              onChange={(e) => handleInputData(e.target.value, 'campaign_id')}
              className=""
              disabled={true}
            />
          </div>

          <div className='flex items-center gap-2'>
            <Label className="w-[74px] min-w-[74px]">테넌트</Label>
            <Select
              onValueChange={(value) => handleSelectChange(value, 'tenant')}
              value={groupInfo.tenantId + '' || ''}
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
            <Label className="w-[74px] min-w-[74px]">그룹 이름</Label>
            <CustomInput
              value={groupInfo.campaignGroupName || ''}
              onChange={(e) => handleInputData(e.target.value, 'campaign_name')}
              className=""
              disabled={true}
            />
          </div>

          <div className='flex items-center gap-2'>
            <Label className="w-[90px] min-w-[90px]">다이얼 모드</Label>
            <Select
              onValueChange={(value) => handleSelectChange(value, 'dialMode')}
              value={tempCampaignInfo.dial_mode + '' || ''}
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
          <SkillInput value={inputSkills} campaignId={campaignId} onOpenPopup={() => setSkillPopupState({ ...skillPopupState, isOpen: true })} />
          
          {selectedCampaign !== null ?
            <div className='flex items-center gap-2'>
              <Label className="w-[74px] min-w-[74px]">발신번호</Label>
              <CustomInput value={inputCallingNumber} className="w-full"
                disabled={selectedCampaign !== null} readOnly
              />
            {menu_role_id === 1?
              <CommonButton variant="outline" className='h-[24px]' onClick={() =>
                setCallingNumberPopupState({
                  ...callingNumberPopupState,
                  isOpen: true,
                })
              }>발신번호 변경</CommonButton>
              :
              null
            }
            </div>
            : ''}
          <div className="flex items-center gap-2 col-span-3">
            <Label className="w-[90px] min-w-[90px]">설명</Label>
            <CustomInput value={selectedCampaign !== null ? '[정보표시기준 : ' + selectedCampaign?.campaign_id + '번 캠페인]' || '' : ''} className="w-full"
              onChange={(e) => handleInputData(e.target.value, 'campaign_desc')}
              disabled={true}
            />
          </div>
        </div>
      </div>
      <div>
        <CampaignTab campaignSchedule={tempCampaignSchedule}
          callCampaignMenu={'CampaignGroupManager'}
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
      <SkillListPopup
        param={tempCampaignSkills.skill_id || []}
        tenantId={tempCampaignInfo.tenant_id}
        type={skillPopupState.type}
        isOpen={skillPopupState.isOpen}
        onConfirm={(param) => handleSelectSkills(param)}
        onCancel={() => setSkillPopupState((prev) => ({ ...prev, isOpen: false }))}
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
      <CallingNumberPopup
        param={inputCallingNumber}
        type={callingNumberPopupState.type}
        isOpen={callingNumberPopupState.isOpen}
        onConfirm={(param) => handleCallingNumlber(param)}
        onCancel={() => setCallingNumberPopupState((prev) => ({ ...prev, isOpen: false }))}
      />
      <CampaignAddPopup
        isOpen={isCampaignAddPopupOpen}
        groupId={groupInfo.campaignGroupId}
        groupName={groupInfo.campaignGroupName}
        tenantId={groupInfo.tenantId}
        onClose={handleCloseCampaignDialog}
      />
    </div>
  );
}