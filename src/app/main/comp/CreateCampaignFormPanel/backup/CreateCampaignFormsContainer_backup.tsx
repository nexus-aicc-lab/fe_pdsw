// // C:\nproject\fe_pdsw\src\app\main\comp\CreateCampaignFormPanel\backup\CreateCampaignFormsContainer_backup.tsx

// "use client";

// import { useMainStore, useCampainManagerStore, useTabStore } from '@/store';
// import Image from 'next/image'
// import TitleWrap from "@/components/shared/TitleWrap";
// import { Label } from "@/components/ui/label";
// import { CustomInput } from "@/components/shared/CustomInput";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
// import CampaignTab from '../CampaignManager/CampaignTab';
// import { MainDataResponse } from '@/features/auth/types/mainIndex';
// import {
//   CampaignSkillUpdateRequest
//   , CampaignInfoUpdateRequest
//   , CampaignScheDuleListDataResponse
//   , CallingNumberListDataResponse
//   , CampaignDialSpeedUpdateRequest
// } from '@/features/campaignManager/types/campaignManagerIndex';
// import { useEffect, useState } from 'react';
// import SkillListPopup from '@/components/shared/layout/SkillListPopup';
// import { useApiForCampaignSkillUpdate } from '@/features/campaignManager/hooks/useApiForCampaignSkillUpdate';
// import { useApiForCampaignManagerInsert } from '@/features/campaignManager/hooks/useApiForCampaignManagerInsert';
// import { useApiForCampaignScheduleInsert } from '@/features/campaignManager/hooks/useApiForCampaignScheduleInsert';
// import { useApiForDialSpeedUpdate } from '@/features/campaignManager/hooks/useApiForDialSpeedUpdate';
// import { useApiForMain } from '@/features/auth/hooks/useApiForMain';
// import { useApiForCampaignSkill } from '@/features/campaignManager/hooks/useApiForCampaignSkill';
// import { useApiForCallingNumber } from '@/features/campaignManager/hooks/useApiForCallingNumber';
// import { useApiForSchedules } from '@/features/campaignManager/hooks/useApiForSchedules';
// import CustomAlert, { CustomAlertRequest } from '@/components/shared/layout/CustomAlert';
// import CallingNumberPopup from '@/components/shared/layout/CallingNumberPopup';
// import Cookies from 'js-cookie';
// import { useRouter } from 'next/navigation';
// import { toast } from 'react-toastify';
// import ISelectorForTeanantForCreateNewCampaign from './comp/ISelectorForTeanantForCreateNewCampaign';
// import CampaignBasicInfoForm from './comp/CampaignBasicInfoForm';

// export interface TabItem {
//   id: number;
//   uniqueKey: string;
//   title: string;
//   icon: string;
//   href: string;
//   content: React.ReactNode;
//   campaignId?: string;
// }

// const dialModeList = [
//   { dial_id: 1, dial_name: 'Power' },
//   { dial_id: 2, dial_name: 'Progressive' },
//   { dial_id: 3, dial_name: 'Predictive' },
//   { dial_id: 4, dial_name: 'System Preview' },
// ];

// const errorMessage: CustomAlertRequest = {
//   isOpen: false,
//   message: '',
//   title: '캠페인',
//   type: '1',
//   onClose: () => { },
//   onCancel: () => { },
// };

// const CampaignSkillInfo: CampaignSkillUpdateRequest = {
//   campaign_id: 0,
//   skill_id: [],
// }

// const CallingNumberInfo: CallingNumberListDataResponse = {
//   campaign_id: 0,
//   calling_number: ''
// }

// const CampaignDialSpeedInfo: CampaignDialSpeedUpdateRequest = {
//   campaign_id: 0,
//   tenant_id: 0,
//   dial_speed: 0
// }

// const CampaignManagerInfo: CampaignInfoUpdateRequest = {
//   campaign_id: 0,
//   campaign_name: '',
//   campaign_desc: '',
//   site_code: 0,
//   service_code: 0,
//   start_flag: 0,
//   end_flag: 0,
//   dial_mode: 1,
//   callback_kind: 2,
//   delete_flag: 0,
//   list_count: 0,
//   list_redial_query: '',
//   next_campaign: 0,
//   token_id: 0,
//   phone_order: '',
//   phone_dial_try1: 0,
//   phone_dial_try2: 0,
//   phone_dial_try3: 0,
//   phone_dial_try4: 0,
//   phone_dial_try5: 0,
//   dial_try_interval: 20,
//   trunk_access_code: '',
//   DDD_code: '',
//   power_divert_queue: '0',
//   max_ring: 0,
//   detect_mode: 0,
//   auto_dial_interval: 30,
//   creation_user: '',
//   creation_time: '',
//   creation_ip: '',
//   update_user: '',
//   update_time: '',
//   update_ip: '',
//   dial_phone_id: 0,
//   tenant_id: -1,
//   alarm_answer_count: 0,
//   dial_speed: 0,
//   parent_campaign: 0,
//   overdial_abandon_time: 2,
//   list_alarm_count: 100,
//   supervisor_phone: '',
//   reuse_count: 0,
//   use_counsel_result: 0,
//   use_list_alarm: 0,
//   redial_strategy1: "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
//   redial_strategy2: "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
//   redial_strategy3: "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
//   redial_strategy4: "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
//   redial_strategy5: "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
//   dial_mode_option: 0,
//   user_option: '',
//   customer_char_id: 1,
//   counsel_script_id: 1,
//   announcement_id: 1,
//   campaign_level: 0,
//   outbound_sequence: '',
// }

// export const CampaignInfo: MainDataResponse = {
//   campaign_id: 0,
//   campaign_name: '',
//   campaign_desc: '',
//   site_code: 0,
//   service_code: 0,
//   start_flag: 0,
//   end_flag: 0,
//   dial_mode: 1,
//   callback_kind: 0,
//   delete_flag: 0,
//   list_count: 0,
//   list_redial_query: '',
//   next_campaign: 0,
//   token_id: 0,
//   phone_order: '',
//   phone_dial_try: [0, 0, 0, 0, 0],
//   dial_try_interval: 20,
//   trunk_access_code: '',
//   DDD_code: '',
//   power_divert_queue: 0,
//   max_ring: 0,
//   detect_mode: 0,
//   auto_dial_interval: 30,
//   creation_user: '',
//   creation_time: '',
//   creation_ip: '',
//   update_user: '',
//   update_time: '',
//   update_ip: '',
//   dial_phone_id: 0,
//   tenant_id: -1,
//   alarm_answer_count: 0,
//   dial_speed: 0,
//   parent_campaign: 0,
//   overdial_abandon_time: 2,
//   list_alarm_count: 100,
//   supervisor_phone: '',
//   reuse_count: 0,
//   use_counsel_result: 0,
//   use_list_alarm: 0,
//   redial_strategy: [
//     "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
//     "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
//     "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
//     "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
//     "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0"
//   ],
//   dial_mode_option: 0,
//   user_option: '',
//   campaign_status: 0
// }

// export interface OperationTimeParam {
//   changeYn: boolean;
//   campaignInfoChangeYn: boolean;
//   campaignScheduleChangeYn: boolean;
//   onSave: boolean;
//   onClosed: boolean;
//   campaign_id: number;
//   start_date: string;
//   end_date: string;
//   start_time: string[];
//   end_time: string[];
//   start_flag: string;
// }

// export interface OutgoingOrderTabParam {
//   changeYn: boolean;
//   campaignInfoChangeYn: boolean;
//   onSave: boolean;
//   onClosed: boolean;
//   dial_phone_id: number;
//   phone_order: string;
//   phone_dial_try: number[];
// }

// export interface OutgoingStrategyTabParam {
//   changeYn: boolean;
//   campaignInfoChangeYn: boolean;
//   onSave: boolean;
//   onClosed: boolean;
//   onInit: boolean;
//   redial_strategy: string[];
// }

// export interface OutgoingMethodTabParam {
//   changeYn: boolean;
//   campaignInfoChangeYn: boolean;
//   onSave: boolean;
//   onClosed: boolean;
//   trunk_access_code: string;      //Trunk Access Code
//   dial_try_interval: number;      //재시도 간격(초)
//   alarm_answer_count: number;     //콜 목표량
//   overdial_abandon_time: number;  //포기호 처리시간(초)
//   detect_mode: number;            //기계음 처리 - 자동응답기 처리 1 : 컬러링 판별 후 사람만 연결, 2 : 컬러링 판별 후 사람/기계음 연결, 3 : 기계음/사람 무조건 연결
//   auto_dial_interval: number;     //자동 다이얼 시
//   power_divert_queue: number;     //연결 IVR NO 및 다이얼 모드
//   next_campaign: number;          //연결 캠페인
//   DDD_code: string;               //DDD Number - 지역 번호
//   callback_kind: number;          //연결구분 - 콜백구분 0 : 일반 캠페인(Default), 1 : 무한 콜백, 2 : 일반 콜백
//   max_ring: number;               //최대 링 횟수
//   token_id: number;               //토큰 ID
//   use_counsel_result: number;     //상담결과 등록 여부 - 0 : 미사용, 1 : 사용
//   dial_mode_option: number;       //다이얼 모드 옵션 - 발신 모드별 옵션 설정(system preview 에서만 사용)
//   user_option: string;            //제한 호수 비율
// }

// export interface AdditionalInfoTabParam {
//   changeYn: boolean;
//   campaignInfoChangeYn: boolean;
//   onSave: boolean;
//   onClosed: boolean;
// }

// const today = new Date();
// const CampaignScheduleInfo: CampaignScheDuleListDataResponse = {
//   campaign_id: 0,
//   tenant_id: 0,
//   start_date: today.getFullYear() + ('0' + (today.getMonth() + 1)).slice(-2) + ('0' + today.getDate()).slice(-2),
//   end_date: today.getFullYear() + ('0' + (today.getMonth() + 1)).slice(-2) + ('0' + today.getDate()).slice(-2),
//   start_time: [],
//   end_time: []
// }

// export interface CallPacingTabParam {
//   changeYn: boolean;
//   campaignDialSpeedChangeYn: boolean;
//   onSave: boolean;
//   onClosed: boolean;
//   dial_mode: number;
//   progressive_dial_speed: number; //PDS 발신 속도(1~100)
//   predictive_dial_speed: number;  //PDS 발신 속도(1~100)
// }

// const CampaignCallPacingTabInfo: CallPacingTabParam = {
//   changeYn: false,
//   campaignDialSpeedChangeYn: false,
//   onSave: false,
//   onClosed: false,
//   dial_mode: 0,
//   progressive_dial_speed: 0,
//   predictive_dial_speed: 0,
// }

// export interface CallbackTabParam {
//   changeYn: boolean;
//   campaignInfoChangeYn: boolean;
//   onSave: boolean;
//   onClosed: boolean;
//   callback_kind: number;
//   service_code: number;
// }

// export interface NotificationTabParam {
//   changeYn: boolean;
//   campaignInfoChangeYn: boolean;
//   onSave: boolean;
//   onClosed: boolean;
//   use_list_alarm: number;
//   list_alarm_count: number;
//   supervisor_phone: string;
// }

// type Props = {
//   tenantId?: string;
// }

// const CreateCampaignFormsContainer: React.FC<Props> = ({ tenantId }: Props) => {
//   const [tempCampaignManagerInfo, setTempCampaignManagerInfo] = useState<CampaignInfoUpdateRequest>(CampaignManagerInfo);
//   const [tempCampaignInfo, setTempCampaignsInfo] = useState<MainDataResponse>(CampaignInfo);
//   const [tempCampaignSkills, setTempCampaignSkills] = useState<CampaignSkillUpdateRequest>(CampaignSkillInfo);
//   const [tempCallingNumberInfo, setTempCallingNumberInfo] = useState<CallingNumberListDataResponse>(CallingNumberInfo);
//   const [tempCampaignSchedule, setTempCampaignSchedule] = useState<CampaignScheDuleListDataResponse>(CampaignScheduleInfo);
//   const [tempCampaignDialSpeedInfo, setTempCampaignDialSpeedInfo] = useState<CampaignDialSpeedUpdateRequest>(CampaignDialSpeedInfo);
//   const [tempCampaignDialSpeedInfoParam, setTempCampaignDialSpeedInfoParam] = useState<CallPacingTabParam>(CampaignCallPacingTabInfo);
//   const [changeYn, setChangeYn] = useState<boolean>(false); // 변경여부
//   const [campaignInfoChangeYn, setCampaignInfoChangeYn] = useState<boolean>(false); // 캠페인정보 변경여부
//   const [campaignSkillChangeYn, setCampaignSkillChangeYn] = useState<boolean>(false); // 캠페인스킬 변경여부
//   const [callingNumberChangeYn, setCallingNumberChangeYn] = useState<boolean>(false); // 캠페인 발신번호 변경여부
//   const [campaignScheduleChangeYn, setCampaignScheduleChangeYn] = useState<boolean>(false); // 캠페인 스케줄 변경여부
//   const [campaignDialSpeedChangeYn, setCampaignDialSpeedChangeYn] = useState<boolean>(false); // 캠페인 발신속도 변경여부
//   const [campaignSaveYn, setCampaignSaveYn] = useState<boolean>(false); // 캠페인 저장여부
//   const { tenants
//     , setCampaigns
//     , selectedCampaign
//     , setSelectedCampaign
//   } = useMainStore();
//   const { removeTab, activeTabId, activeTabKey, addTab, openedTabs, setActiveTab, setCampaignIdForUpdateFromSideMenu, simulateHeaderMenuClick } = useTabStore();
//   const { callingNumbers, campaignSkills, schedules, setCampaignSkills, setSchedules, setCallingNumbers } = useCampainManagerStore();
//   const [inputSkills, setInputSkills] = useState('');
//   const [inputCallingNumber, setInputCallingNumber] = useState('');
//   const [skillPopupState, setSkillPopupState] = useState({
//     isOpen: false,
//     param: [],
//     tenantId: 0,
//     type: '1',
//   });
//   const [alertState, setAlertState] = useState<CustomAlertRequest>(errorMessage);
//   const [callingNumberPopupState, setCallingNumberPopupState] = useState({
//     isOpen: false,
//     param: [],
//     tenantId: 0,
//     type: '1',
//   });
//   const router = useRouter();
//   const [campaignNewId, setCampaignNewId] = useState<number>(0);

//   //캠페인 정보 최초 세팅 
//   useEffect(() => {
//     if (selectedCampaign !== null) {
//       setChangeYn(false);
//       setCampaignInfoChangeYn(false);
//     }
//   }, [selectedCampaign, campaignSkills, callingNumbers, schedules]);

//   //input data change
//   const handleInputData = (value: any, col: string) => {
//     setChangeYn(true);
//     setCampaignInfoChangeYn(true);
//     if (col === 'campaign_id' && value !== '') {
//       setTempCampaignsInfo({
//         ...tempCampaignInfo,
//         campaign_id: Number(value)
//       });
//       setTempCampaignManagerInfo({
//         ...tempCampaignManagerInfo,
//         campaign_id: Number(value)
//       });
//     }
//     if (col === 'campaign_name') {
//       setTempCampaignsInfo({
//         ...tempCampaignInfo,
//         campaign_name: value
//       });
//       setTempCampaignManagerInfo({
//         ...tempCampaignManagerInfo,
//         campaign_name: value
//       });
//     }
//     if (col === 'campaign_desc') {
//       setTempCampaignsInfo({
//         ...tempCampaignInfo,
//         campaign_desc: value
//       });
//       setTempCampaignManagerInfo({
//         ...tempCampaignManagerInfo,
//         campaign_desc: value
//       });
//     }
//   }

//   //select data change
//   const handleSelectChange = (value: string, type: 'tenant' | 'dialMode') => {
//     setChangeYn(true);
//     setCampaignInfoChangeYn(true);
//     if (type === 'tenant' && value !== '') {
//       setTempCampaignsInfo({
//         ...tempCampaignInfo,
//         tenant_id: Number(value)
//       });
//       setTempCampaignManagerInfo({
//         ...tempCampaignManagerInfo,
//         tenant_id: Number(value)
//       });
//     }
//     if (type === 'dialMode' && value !== '') {
//       console.log('dialMode');
//       setTempCampaignsInfo({
//         ...tempCampaignInfo,
//         dial_mode: Number(value)
//       });
//       setTempCampaignManagerInfo({
//         ...tempCampaignManagerInfo,
//         dial_mode: Number(value)
//       });
//       setTempCampaignDialSpeedInfoParam({
//         ...tempCampaignDialSpeedInfoParam,
//         dial_mode: Number(value)
//       });
//     }
//   }

//   //스킬 선택 팝업 버튼이벤트
//   const handleOpenSkillPopup = () => {

//     console.log(tempCampaignInfo.tenant_id);
//     if (tempCampaignInfo.tenant_id < 0 && tenantId === undefined) {
//       setAlertState({
//         ...errorMessage,
//         isOpen: true,
//         message: '테넌트를 선택해 주세요.',
//         type: '2',
//         onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
//       });
//     } else {
//       setSkillPopupState({
//         ...skillPopupState,
//         isOpen: true,
//       });
//     }
//   }

//   //스킬 선택 팝업
//   const handleSelectSkills = (param: string) => {
//     if (tempCampaignSkills.skill_id.join(',') !== param) {
//       setChangeYn(true);
//       setCampaignSkillChangeYn(true);
//       setInputSkills(param);
//       setTempCampaignSkills({
//         ...tempCampaignSkills
//         , campaign_id: tempCampaignInfo.campaign_id
//         , skill_id: param.split(',').map((data) => Number(data))
//       });
//     }
//     setSkillPopupState((prev) => ({ ...prev, isOpen: false }))
//   }

//   //발신번호 팝업
//   const handleCallingNumlber = (param: string) => {
//     if (inputCallingNumber !== param) {
//       setChangeYn(true);
//       setCallingNumberChangeYn(true);
//       setInputCallingNumber(param);
//       setTempCallingNumberInfo({
//         ...tempCallingNumberInfo
//         , campaign_id: tempCampaignInfo.campaign_id
//         , calling_number: param
//       });
//     }
//     setCallingNumberPopupState((prev) => ({ ...prev, isOpen: false }))
//   }

//   //캠페인 동작시간 탭 변경
//   const handleCampaignScheduleChange = (value: OperationTimeParam) => {
//     if (value.campaignInfoChangeYn) {
//       setChangeYn(true);
//       setCampaignInfoChangeYn(true);
//       setTempCampaignManagerInfo({
//         ...tempCampaignManagerInfo
//         , start_flag: Number(value.start_flag)
//       });
//       setTempCampaignsInfo({
//         ...tempCampaignInfo
//         , start_flag: Number(value.start_flag)
//       });
//     }
//     if (value.campaignScheduleChangeYn) {
//       setChangeYn(true);
//       setCampaignScheduleChangeYn(true);
//       setTempCampaignSchedule({
//         ...tempCampaignSchedule
//         , campaign_id: value.campaign_id
//         , start_date: value.start_date
//         , end_date: value.end_date
//         , start_time: value.start_time
//         , end_time: value.end_time
//       });
//     }
//     if (value.onSave) {
//       setCampaignSaveYn(false);
//       handleCampaignSave();
//     }
//     if (value.onClosed) {
//       handleCampaignClosed();
//     }
//   }

//   //캠페인 발신 순서 탭 변경
//   const handleCampaignOutgoingOrderChange = (value: OutgoingOrderTabParam) => {
//     if (value.campaignInfoChangeYn) {
//       setChangeYn(true);
//       setCampaignInfoChangeYn(true);
//       setTempCampaignsInfo({
//         ...tempCampaignInfo
//         , dial_phone_id: Number(value.dial_phone_id)
//         , phone_dial_try: value.phone_dial_try
//         , phone_order: value.phone_order
//       });
//       setTempCampaignManagerInfo({
//         ...tempCampaignManagerInfo
//         , dial_phone_id: Number(value.dial_phone_id)
//         , phone_dial_try1: value.phone_dial_try[0]
//         , phone_dial_try2: value.phone_dial_try[1]
//         , phone_dial_try3: value.phone_dial_try[2]
//         , phone_dial_try4: value.phone_dial_try[3]
//         , phone_dial_try5: value.phone_dial_try[4]
//         , phone_order: value.phone_order
//       });
//     }
//     if (value.onSave) {
//       setCampaignSaveYn(false);
//       handleCampaignSave();
//     }
//     if (value.onClosed) {
//       handleCampaignClosed();
//     }
//   }

//   //캠페인 발신전략 탭 변경
//   const handleOutgoingStrategyTabChange = (value: OutgoingStrategyTabParam) => {
//     if (value.campaignInfoChangeYn) {
//       setChangeYn(true);
//       setCampaignInfoChangeYn(true);
//       setTempCampaignsInfo({
//         ...tempCampaignInfo
//         , redial_strategy: value.redial_strategy
//       });
//       setTempCampaignManagerInfo({
//         ...tempCampaignManagerInfo
//         , redial_strategy1: value.redial_strategy[0]
//         , redial_strategy2: value.redial_strategy[1]
//         , redial_strategy3: value.redial_strategy[2]
//         , redial_strategy4: value.redial_strategy[3]
//         , redial_strategy5: value.redial_strategy[4]
//       });
//     }
//     //초기화버튼 클릭시
//     if (value.onInit) {
//       setTempCampaignsInfo({
//         ...tempCampaignInfo
//         , redial_strategy: CampaignInfo.redial_strategy
//       });
//       setTempCampaignManagerInfo({
//         ...tempCampaignManagerInfo
//         , redial_strategy1: CampaignManagerInfo.redial_strategy1
//         , redial_strategy2: CampaignManagerInfo.redial_strategy2
//         , redial_strategy3: CampaignManagerInfo.redial_strategy3
//         , redial_strategy4: CampaignManagerInfo.redial_strategy4
//         , redial_strategy5: CampaignManagerInfo.redial_strategy5
//       });
//     }
//     if (value.onSave) {
//       setCampaignSaveYn(false);
//       handleCampaignSave();
//     }
//     if (value.onClosed) {
//       handleCampaignClosed();
//     }
//   }

//   //캠페인 발신방법 탭 변경
//   const handleOutgoingMethodTabChange = (value: OutgoingMethodTabParam) => {
//     if (value.campaignInfoChangeYn) {
//       setChangeYn(true);
//       setCampaignInfoChangeYn(true);
//       setTempCampaignsInfo({
//         ...tempCampaignInfo
//         , trunk_access_code: value.trunk_access_code
//         , dial_try_interval: value.dial_try_interval
//         , alarm_answer_count: value.alarm_answer_count
//         , overdial_abandon_time: value.overdial_abandon_time
//         , detect_mode: value.detect_mode
//         , auto_dial_interval: value.auto_dial_interval
//         , power_divert_queue: value.power_divert_queue
//         , next_campaign: value.next_campaign
//         , DDD_code: value.DDD_code
//         , callback_kind: value.callback_kind
//         , max_ring: value.max_ring
//         , token_id: value.token_id
//         , use_counsel_result: value.use_counsel_result
//         , dial_mode_option: value.dial_mode_option
//         , user_option: value.user_option
//       });
//       setTempCampaignManagerInfo({
//         ...tempCampaignManagerInfo
//         , trunk_access_code: value.trunk_access_code
//         , dial_try_interval: value.dial_try_interval
//         , alarm_answer_count: value.alarm_answer_count
//         , overdial_abandon_time: value.overdial_abandon_time
//         , detect_mode: value.detect_mode
//         , auto_dial_interval: value.auto_dial_interval
//         , power_divert_queue: value.power_divert_queue + ''
//         , next_campaign: value.next_campaign
//         , DDD_code: value.DDD_code
//         , callback_kind: value.callback_kind
//         , max_ring: value.max_ring
//         , token_id: value.token_id
//         , use_counsel_result: value.use_counsel_result
//         , dial_mode_option: value.dial_mode_option
//         , user_option: value.user_option
//       });
//     }
//     if (value.onSave) {
//       setCampaignSaveYn(false);
//       handleCampaignSave();
//     }
//     if (value.onClosed) {
//       handleCampaignClosed();
//     }
//   }

//   //캠페인 콜페이싱 탭 변경
//   const handleCallPacingTabChange = (value: CallPacingTabParam) => {
//     if (value.campaignDialSpeedChangeYn) {
//       setChangeYn(true);
//       setCampaignDialSpeedChangeYn(value.campaignDialSpeedChangeYn);
//       setTempCampaignDialSpeedInfoParam({
//         ...tempCampaignDialSpeedInfoParam
//         , predictive_dial_speed: value.predictive_dial_speed
//         , progressive_dial_speed: value.progressive_dial_speed
//       });
//       setTempCampaignDialSpeedInfo({
//         ...tempCampaignDialSpeedInfo
//         , dial_speed: value.dial_mode === 2 ? Math.floor(value.progressive_dial_speed) : value.predictive_dial_speed
//       });
//     }
//     if (value.onSave) {
//       setCampaignSaveYn(false);
//       handleCampaignSave();
//     }
//     if (value.onClosed) {
//       handleCampaignClosed();
//     }
//   }

//   //캠페인 콜백 탭 변경
//   const handleCampaignCallbackTabChange = (value: OutgoingOrderTabParam) => {
//     if (value.campaignInfoChangeYn) {
//       setChangeYn(true);
//       setCampaignInfoChangeYn(true);
//       setTempCampaignsInfo({
//         ...tempCampaignInfo
//         , dial_phone_id: Number(value.dial_phone_id)
//         , phone_dial_try: value.phone_dial_try
//         , phone_order: value.phone_order
//       });
//       setTempCampaignManagerInfo({
//         ...tempCampaignManagerInfo
//         , dial_phone_id: Number(value.dial_phone_id)
//         , phone_dial_try1: value.phone_dial_try[0]
//         , phone_dial_try2: value.phone_dial_try[1]
//         , phone_dial_try3: value.phone_dial_try[2]
//         , phone_dial_try4: value.phone_dial_try[3]
//         , phone_dial_try5: value.phone_dial_try[4]
//         , phone_order: value.phone_order
//       });
//     }
//     if (value.onSave) {
//       setCampaignSaveYn(false);
//       handleCampaignSave();
//     }
//     if (value.onClosed) {
//       handleCampaignClosed();
//     }
//   }

//   //캠페인 콜백 탭 변경
//   const handleCallbackTabChange = (value: CallbackTabParam) => {
//     if (value.campaignInfoChangeYn) {
//       setChangeYn(true);
//       setCampaignInfoChangeYn(true);
//       setTempCampaignsInfo({
//         ...tempCampaignInfo
//         , callback_kind: Number(value.callback_kind)
//         , service_code: value.service_code
//       });
//       setTempCampaignManagerInfo({
//         ...tempCampaignManagerInfo
//         , callback_kind: Number(value.callback_kind)
//         , service_code: value.service_code
//       });
//     }
//     if (value.onSave) {
//       // setCampaignSaveYn(false);
//       handleCampaignSave();
//     }
//     if (value.onClosed) {
//       handleCampaignClosed();
//     }
//   }

//   //캠페인 알림 탭 변경
//   const handleNotificationTabChange = (value: NotificationTabParam) => {
//     if (value.campaignInfoChangeYn) {
//       setChangeYn(true);
//       setCampaignInfoChangeYn(value.campaignInfoChangeYn);
//       setTempCampaignsInfo({
//         ...tempCampaignInfo
//         , list_alarm_count: Number(value.list_alarm_count)
//         , supervisor_phone: value.supervisor_phone
//         , use_list_alarm: value.use_list_alarm
//       });
//       setTempCampaignManagerInfo({
//         ...tempCampaignManagerInfo
//         , list_alarm_count: Number(value.list_alarm_count)
//         , supervisor_phone: value.supervisor_phone
//         , use_list_alarm: value.use_list_alarm
//       });
//     }
//     if (value.onSave) {
//       // setCampaignSaveYn(false);
//       handleCampaignSave();
//     }
//     if (value.onClosed) {
//       handleCampaignClosed();
//     }
//   }

//   //캠페인 기타정보 탭 변경
//   const handleAdditionalInfoTabChange = (value: AdditionalInfoTabParam) => {
//     if (value.onSave) {
//       // setCampaignSaveYn(false);
//       handleCampaignSave();
//     }
//     if (value.onClosed) {
//       handleCampaignClosed();
//     }
//   }

//   //캠페인 취소
//   const handleCampaignClosed = () => {
//     setAlertState({
//       ...errorMessage,
//       isOpen: true,
//       message: '캠페인 편집창을 종료하시겠습니까?',
//       onClose: handleCampaignClosedExecute,
//       onCancel: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
//     });
//   }

//   //캠페인 취소 실행.
//   const handleCampaignClosedExecute = () => {
//     setAlertState((prev) => ({ ...prev, isOpen: false }));
//     // removeTab(Number(activeTabId),activeTabKey+'');
//     const existingTabs = openedTabs.filter(tab => tab.id === 13);
//     existingTabs.forEach(tab => {
//       removeTab(tab.id, tab.uniqueKey);
//     });
//   }

//   //캠페인 저장
//   // tofix 0405 
//   // 동작 시간 설정 안했을시 
//   const handleCampaignSave = () => {
//     console.log(tempCampaignManagerInfo);
//     console.log('power_divert_queue :: ' + tempCampaignManagerInfo.power_divert_queue);
//     console.log('tenant_id :: ' + tenantId);

//     let saveErrorCheck = false;

//     if (!saveErrorCheck && tempCampaignManagerInfo.tenant_id < 0 && tenantId === "") {
//       saveErrorCheck = true;
//       setAlertState({
//         ...errorMessage,
//         isOpen: true,
//         message: "테넌트를 선택해 주세요.",
//         type: '2',
//         onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
//       });
//     }

//     if (!saveErrorCheck && tempCampaignSchedule.start_time.length === 0) {
//       saveErrorCheck = true;
//       setAlertState({
//         ...errorMessage,
//         isOpen: true,
//         message: "시작시간 또는 종료시간을 지정해 주세요.",
//         type: '2',
//         onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
//       });
//     }

//     //2018.11.27 Gideon #23127 캠페인 수정창 연결 IVR 입력 예외 처리
//     if (!saveErrorCheck && tempCampaignManagerInfo.power_divert_queue === '0' || tempCampaignManagerInfo.power_divert_queue === '') {
//       saveErrorCheck = true;
//       setAlertState({
//         ...errorMessage,
//         isOpen: true,
//         message: "'발신 방법' 탭의 '연결 IVR NO' 값을 입력해 주시기 바랍니다.",
//         type: '2',
//         onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
//       });
//     }

//     if (!saveErrorCheck && tempCampaignManagerInfo.campaign_name === '') {
//       saveErrorCheck = true;
//       setAlertState({
//         ...errorMessage,
//         isOpen: true,
//         message: "캠페인명을 입력해 주세요.",
//         type: '2',
//         onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
//       });
//     }

//     if (!saveErrorCheck) {
//       handleCampaignSaveExecute();
//     }
//   }

//   //캠페인 저장 실행.
//   const handleCampaignSaveExecute = () => {
//     console.log("tempCampaignManagerInfo at save !!!!!!!!!!!!!", tempCampaignManagerInfo);
//     fetchCampaignManagerInsert(tempCampaignManagerInfo);
//     setAlertState((prev) => ({ ...prev, isOpen: false }));
//   }

//   //변경여부 체크
//   useEffect(() => {
//     if (changeYn && !campaignInfoChangeYn && !campaignSkillChangeYn && !callingNumberChangeYn && !campaignDialSpeedChangeYn) {
//       fetchMain({
//         session_key: '',
//         tenant_id: 0,
//       });
//     }
//   }, [campaignInfoChangeYn, campaignSkillChangeYn, callingNumberChangeYn, campaignDialSpeedChangeYn]);

//   //캠페인 정보 조회 api 호출
//   const { mutate: fetchMain } = useApiForMain({
//     onSuccess: (data) => {
//       setCampaigns(data.result_data);
//       setSelectedCampaign(data.result_data.filter((campaign) => campaign.campaign_id === selectedCampaign?.campaign_id)[0]);
//       setTempCampaignsInfo(data.result_data.filter((campaign) => campaign.campaign_id === selectedCampaign?.campaign_id)[0]);
//       setChangeYn(false);
//       removeTab(Number(activeTabId), activeTabKey + '');
//     }
//   });

//   //캠페인 정보 수정 api 호출
//   const { mutate: fetchCampaignManagerInsert } = useApiForCampaignManagerInsert({
//     onSuccess: (data) => {
//       console.log("캠페인 정보 입력 api 결과 : ", data);
//       toast.success('캠페인 정보가 저장되었습니다.', { autoClose: 2000 });

//       // tofix 0405 수정:
//       // 1. 현재 캠페인 탭 닫기
//       removeTab(Number(activeTabId), activeTabKey + '');

//       const newCampaignId = data.result_data.campaign_id;

//       simulateHeaderMenuClick(2);
//       setCampaignIdForUpdateFromSideMenu(newCampaignId.toString());

//       // 추가로 캠페인 스케줄 등록 로직이 필요하면 아래 주석 해제
//       const _tempCampaignSchedule = {
//         ...tempCampaignSchedule,
//         campaign_id: newCampaignId
//       }
//       fetchCampaignScheduleInsert(_tempCampaignSchedule);
//     },
//     onError: (data) => {
//       if (data.message.split('||')[0] === '5') {
//         setAlertState({
//           ...errorMessage,
//           isOpen: true,
//           message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
//           type: '2',
//           onClose: () => goLogin(),
//         });
//       }
//     }
//   });


//   const goLogin = () => {
//     Cookies.remove('session_key');
//     router.push('/login');
//   }

//   //캠페인 스킬 조회 api 호출
//   const { mutate: fetchCampaignSkills } = useApiForCampaignSkill({
//     onSuccess: (data) => {
//       setCampaignSkills(data.result_data);
//       setCampaignSkillChangeYn(false);
//     }
//   });

//   //캠페인 스킬 수정 api 호출
//   const { mutate: fetchCampaignSkillUpdate } = useApiForCampaignSkillUpdate({
//     onSuccess: (data) => {
//       fetchCampaignSkills({
//         session_key: '',
//         tenant_id: 0,
//       });
//     }
//   });

//   // 캠페인 스케줄 조회
//   const { mutate: fetchSchedules } = useApiForSchedules({
//     onSuccess: (data) => {
//       setSchedules(data.result_data);
//       setCampaignScheduleChangeYn(false);
//       if (changeYn) {
//         if (campaignSkillChangeYn) {
//           const _tempCampaignSkills = {
//             ...tempCampaignSkills,
//             campaign_id: campaignNewId
//           }
//           //캠페인 스킬 수정 api 호출
//           fetchCampaignSkillUpdate(_tempCampaignSkills);
//         }
//         if (campaignDialSpeedChangeYn) {
//           const _tempCampaignDialSpeedInfo = {
//             ...tempCampaignDialSpeedInfo,
//             campaign_id: campaignNewId
//           }
//           //캠페인 발신 속도 수정 api 호출
//           fetchDialSpeedUpdate(_tempCampaignDialSpeedInfo);
//         }
//       }
//     }
//   });

//   //캠페인 스케줄 등록 api 호출
//   const { mutate: fetchCampaignScheduleInsert } = useApiForCampaignScheduleInsert({
//     onSuccess: (data) => {
//       // const tempTenantIdArray = tenants.map((tenant) => tenant.tenant_id);
//       // fetchSchedules({
//       //   tenant_id_array: tempTenantIdArray
//       // });
//     }
//     , onError: (data) => {
//       const tempTenantIdArray = tenants.map((tenant) => tenant.tenant_id);
//       fetchSchedules({
//         tenant_id_array: tempTenantIdArray
//       });
//     }
//   });

//   //캠페인 발신 속도 수정 api 호출
//   const { mutate: fetchDialSpeedUpdate } = useApiForDialSpeedUpdate({
//     onSuccess: (data) => {
//       setCampaignDialSpeedChangeYn(false);
//     }
//   });

//   // 전화번호 조회
//   const { mutate: fetchCallingNumbers } = useApiForCallingNumber({
//     onSuccess: (data) => {
//       setCallingNumbers(data.result_data || []);
//       setCallingNumberChangeYn(false);
//     }
//   });

//   return (
//     <div className='flex flex-col gap-5 w-full overflow-auto'>
//       <div>

//         <TitleWrap
//           className='border-b border-gray-300 pb-1'
//           title="캠페인정보"
//           buttons={[
//             { label: "캠페인 생성", onClick: () => handleCampaignSave() },
//             { label: "생성 취소", onClick: () => handleCampaignClosed() },
//           ]}
//         />

//         <CampaignBasicInfoForm
//           tenantId={tenantId}
//           tempCampaignInfo={tempCampaignInfo}
//           inputSkills={inputSkills}
//           inputCallingNumber={inputCallingNumber}
//           onInputChange={handleInputData}
//           onSelectChange={handleSelectChange}
//           onUpdateSkill={(param) => handleSelectSkills(param)}
//         />
//       </div>

//       <div>
//         <CampaignTab
//           campaignSchedule={tempCampaignSchedule}
//           callCampaignMenu={'NewCampaignManager'}
//           campaignInfo={tempCampaignInfo}
//           campaignDialSpeedInfo={tempCampaignDialSpeedInfoParam}
//           onCampaignOutgoingOrderChange={(value) => handleCampaignOutgoingOrderChange(value)}
//           onCampaignScheduleChange={(value) => handleCampaignScheduleChange(value)}
//           onCampaignOutgoingStrategyChange={(value) => handleOutgoingStrategyTabChange(value)}
//           onCampaignOutgoingMethodChange={(value) => handleOutgoingMethodTabChange(value)}
//           onHandleCallPacingTabChange={(value) => handleCallPacingTabChange(value)}
//           onHandleAdditionalInfoTabChange={(value) => handleAdditionalInfoTabChange(value)}
//           onHandleCallbackTabChange={(value) => handleCallbackTabChange(value)}
//           onHandleNotificationTabChange={(value) => handleNotificationTabChange(value)}
//         />
//       </div>

//       <CustomAlert
//         message={alertState.message}
//         title={alertState.title}
//         type={alertState.type}
//         isOpen={alertState.isOpen}
//         onClose={() => alertState.onClose()}
//         onCancel={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
//       />

//       <CallingNumberPopup
//         param={inputCallingNumber}
//         type={callingNumberPopupState.type}
//         isOpen={callingNumberPopupState.isOpen}
//         onConfirm={(param) => handleCallingNumlber(param)}
//         onCancel={() => setCallingNumberPopupState((prev) => ({ ...prev, isOpen: false }))}
//       />
//     </div>
//   );

// }
// export default CreateCampaignFormsContainer;

import React from 'react'

// interface Props {
  
// }

const CreateCampaignFormsContainer_backup = (props: any) => {
  return (
    <div>
      
    </div>
  )
}

export default CreateCampaignFormsContainer_backup
