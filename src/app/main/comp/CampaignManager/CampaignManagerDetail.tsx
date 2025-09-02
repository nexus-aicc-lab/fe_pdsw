// src\app\main\comp\CampaignManager\CampaignManagerDetail.tsx
"use client";
import { useMainStore, useCampainManagerStore, useTabStore, useAuthStore } from '@/store';
import Image from 'next/image';
import TitleWrap from "@/components/shared/TitleWrap";
import { Label } from "@/components/ui/label";
import { CustomInput } from "@/components/shared/CustomInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import { CommonButton } from "@/components/shared/CommonButton";
import CampaignTab from './CampaignTab';
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import {
  CampaignSkillUpdateRequest,
  CampaignInfoUpdateRequest,
  CampaignScheDuleListDataResponse,
  CallingNumberListDataResponse,
  CampaignDialSpeedUpdateRequest,
  CampaignInfoDeleteRequest,
  MaxcallExtDeleteRequest
} from '@/features/campaignManager/types/campaignManagerIndex';
import { useEffect, useState } from 'react';
import SkillListPopup from '@/components/shared/layout/SkillListPopup';
import { useApiForCampaignSkillUpdate } from '@/features/campaignManager/hooks/useApiForCampaignSkillUpdate';
import { useApiForCampaignManagerUpdate } from '@/features/campaignManager/hooks/useApiForCampaignManagerUpdate';
import { useApiForCampaignScheduleUpdate } from '@/features/campaignManager/hooks/useApiForCampaignScheduleUpdate';
import { useApiForCampaignScheduleInsert } from '@/features/campaignManager/hooks/useApiForCampaignScheduleInsert';
import { useApiForCallingNumberUpdate } from '@/features/campaignManager/hooks/useApiForCallingNumberUpdate';
import { useApiForCampaignStatusUpdate } from '@/features/campaignManager/hooks/useApiForCampaignStatusUpdate';
import { useApiForCallingNumberInsert } from '@/features/campaignManager/hooks/useApiForCallingNumberInsert';
import { useApiForCallingNumberDelete } from '@/features/campaignManager/hooks/useApiForCallingNumberDelete';
import { useApiForDialSpeedUpdate } from '@/features/campaignManager/hooks/useApiForDialSpeedUpdate';
import { useApiForMain } from '@/features/auth/hooks/useApiForMain';
import { useApiForCallingNumber } from '@/features/campaignManager/hooks/useApiForCallingNumber';
import CustomAlert, { CustomAlertRequest } from '@/components/shared/layout/CustomAlert';
import CallingNumberPopup from '@/components/shared/layout/CallingNumberPopup';
import { useApiForCallingListDelete } from '@/features/listManager/hooks/useApiForCallingListDelete';
import { CheckCampaignSaveReturnCode, CampaignManagerInfo } from '@/components/common/common';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { campaignChannel } from '@/lib/broadcastChannel';
import { useEnvironmentStore } from "@/store/environmentStore";
import { CampaignInfoInsertRequest } from '@/features/campaignManager/hooks/useApiForCampaignManagerInsert';
import { useDeleteCampaignHelper } from '@/features/campaignManager/utils/deleteCampaignHelper';
import ServerErrorCheck from "@/components/providers/ServerErrorCheck";
import { useCampaignDialStatusStore } from '@/store/campaignDialStatusStore';
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
};

const CallingNumberInfo: CallingNumberListDataResponse = {
  campaign_id: 0,
  calling_number: ''
};

const CampaignDialSpeedInfo: CampaignDialSpeedUpdateRequest = {
  campaign_id: 0,
  tenant_id: 0,
  dial_speed: 0
};

export const CampaignInfo: MainDataResponse = {
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
  phone_dial_try: [],
  dial_try_interval: 0,
  trunk_access_code: '',
  DDD_code: '',
  power_divert_queue: 0,
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
  redial_strategy: [
    "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
    "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
    "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
    "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
    "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0"
  ],
  dial_mode_option: 0,
  user_option: '',
  channel_group_id: 0,
  // group_id: undefined,
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
  only_status_change: boolean;  // 캠페인 상태만 변경되었는지 체크
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
  trunk_access_code: string;
  dial_try_interval: number;
  alarm_answer_count: number;
  overdial_abandon_time: number;
  detect_mode: number;
  auto_dial_interval: number;
  power_divert_queue: number;
  next_campaign: number;
  DDD_code: string;
  callback_kind: number;
  max_ring: number;
  token_id: number;
  use_counsel_result: number;
  dial_mode_option: number;
  user_option: string;
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
};

const campaignInfoDelete: CampaignInfoDeleteRequest = {
  campaign_id: 0,
  tenant_id: 0,
  delete_dial_list: 1
};

const agientListDelte: MaxcallExtDeleteRequest = {
  campaign_id: 0,
  agent_id_list: []
};

export interface CallPacingTabParam {
  changeYn: boolean;
  campaignDialSpeedChangeYn: boolean;
  onSave: boolean;
  onClosed: boolean;
  dial_mode: number;
  progressive_dial_speed: number;
  predictive_dial_speed: number;
}

const CampaignCallPacingTabInfo: CallPacingTabParam = {
  changeYn: false,
  campaignDialSpeedChangeYn: false,
  onSave: false,
  onClosed: false,
  dial_mode: 0,
  progressive_dial_speed: 0,
  predictive_dial_speed: 0,
};

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

type Props = {
  isOpen?: boolean;
  onCampaignPopupClose?: () => void;
  campaignId?: any; // masterCampaignId를 전달받음
  setInit: (campaign_id:number) => void;
};

export default function CampaignDetail({ campaignId, isOpen, onCampaignPopupClose,setInit }: Props) {
  const [oriCampaignManagerInfo, setOriCampaignManagerInfo] = useState<CampaignInfoUpdateRequest>(CampaignManagerInfo);
  const [tempCampaignManagerInfo, setTempCampaignManagerInfo] = useState<CampaignInfoUpdateRequest>(CampaignManagerInfo);
  const [tempCampaignInfo, setTempCampaignsInfo] = useState<MainDataResponse>(CampaignInfo);
  const [tempCampaignSkills, setTempCampaignSkills] = useState<CampaignSkillUpdateRequest>(CampaignSkillInfo);
  const [tempCallingNumberInfo, setTempCallingNumberInfo] = useState<CallingNumberListDataResponse>(CallingNumberInfo);
  const [tempCampaignSchedule, setTempCampaignSchedule] = useState<CampaignScheDuleListDataResponse>(CampaignScheduleInfo);
  const [tempCampaignDialSpeedInfo, setTempCampaignDialSpeedInfo] = useState<CampaignDialSpeedUpdateRequest>(CampaignDialSpeedInfo);
  const [tempCampaignDialSpeedInfoParam, setTempCampaignDialSpeedInfoParam] = useState<CallPacingTabParam>(CampaignCallPacingTabInfo);
  const [changeYn, setChangeYn] = useState<boolean>(true);
  const [campaignInfoChangeYn, setCampaignInfoChangeYn] = useState<boolean>(false);
  const [campaignSkillChangeYn, setCampaignSkillChangeYn] = useState<boolean>(false);
  // const [callingNumberChangeYn, setCallingNumberChangeYn] = useState<boolean>(false);
  const [campaignScheduleChangeYn, setCampaignScheduleChangeYn] = useState<boolean>(false);
  const [campaignDialSpeedChangeYn, setCampaignDialSpeedChangeYn] = useState<boolean>(false);
  const [rtnMessage, setRtnMessage] = useState<string>('');
  const { tenants, setCampaigns, selectedCampaign, setSelectedCampaign, setReBroadcastType, campaigns } = useMainStore();
  const { id: user_id, tenant_id, menu_role_id, session_key } = useAuthStore();
  const { removeTab, activeTabId, activeTabKey, addTab, openedTabs, setActiveTab, campaignIdForUpdateFromSideMenu, setCampaignIdForUpdateFromSideMenu, moveTabToSection, rows } = useTabStore();
  const { callingNumbers, campaignSkills, schedules, setCampaignSkills, setSchedules, setCallingNumbers
    , setNewCampaignManagerInfo, setNewCampaignInfo , setNewTenantId, setNewCampaignSchedule
   } = useCampainManagerStore();
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
  const { environmentData } = useEnvironmentStore();
  const [ officeStartTime , setOfficeStartTime ] = useState<string>('0000');
  const [ officeEndTime, setOfficeEndTime ] = useState<string>('0000');

  // 캠페인 정보 초기화 (campaignId, selectedCampaign, 관련 데이터가 변경될 때마다 실행)
  useEffect(() => {
    if (campaignId && selectedCampaign) {
      // masterCampaignId가 변경되거나 selectedCampaign이 업데이트되면 상태 재설정
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
        dial_mode_option: selectedCampaign.dial_mode_option,
        user_option: selectedCampaign.user_option,
        redial_strategy: selectedCampaign.redial_strategy,
        channel_group_id: selectedCampaign.channel_group_id
      });

      // 캠페인 초기정보 세팅
      setOriCampaignManagerInfo(
        {
          ...oriCampaignManagerInfo,
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
          phone_dial_try1: (selectedCampaign.phone_dial_try !== undefined)
            ? Number(selectedCampaign.phone_dial_try.slice(0, 1)[0])
            : 0,
          phone_dial_try2: (selectedCampaign.phone_dial_try !== undefined)
            ? Number(selectedCampaign.phone_dial_try.slice(1, 2)[0])
            : 0,
          phone_dial_try3: (selectedCampaign.phone_dial_try !== undefined)
            ? Number(selectedCampaign.phone_dial_try.slice(2, 3)[0])
            : 0,
          phone_dial_try4: (selectedCampaign.phone_dial_try !== undefined)
            ? Number(selectedCampaign.phone_dial_try.slice(3, 4)[0])
            : 0,
          phone_dial_try5: (selectedCampaign.phone_dial_try !== undefined)
            ? Number(selectedCampaign.phone_dial_try.slice(4, 5)[0])
            : 0,
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
          outbound_sequence: '',
          channel_group_id: selectedCampaign.channel_group_id
        }
      );



      const tempSkill = campaignSkills
        .filter((skill) => skill.campaign_id === selectedCampaign.campaign_id)
        .map((data) => data.skill_id)
        .join(',');
      setInputSkills(tempSkill);
      setTempCampaignSkills({
        ...tempCampaignSkills,
        skill_id: tempSkill.split(',').map((data) => Number(data))
      });
      const tempCallNumber = callingNumbers
        .filter((callingNumber) => callingNumber.campaign_id === selectedCampaign.campaign_id)
        .map((data) => data.calling_number)
        .join(',');
      setInputCallingNumber(tempCallNumber);
      setTempCallingNumberInfo({
        ...tempCallingNumberInfo,
        calling_number: tempCallNumber
      });
      setTempCampaignDialSpeedInfo({
        ...tempCampaignDialSpeedInfo,
        campaign_id: selectedCampaign.campaign_id,
        tenant_id: selectedCampaign.tenant_id,
        dial_speed: selectedCampaign.dial_speed
      });
      setTempCampaignDialSpeedInfoParam({
        ...tempCampaignDialSpeedInfoParam,
        dial_mode: selectedCampaign.dial_mode,
        predictive_dial_speed: selectedCampaign.dial_mode === 2 ? 0 : selectedCampaign.dial_speed,
        progressive_dial_speed: selectedCampaign.dial_mode === 3 ? 0 : selectedCampaign.dial_speed
      });
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
        phone_dial_try1: (selectedCampaign.phone_dial_try !== undefined)
          ? Number(selectedCampaign.phone_dial_try.slice(0, 1)[0])
          : 0,
        phone_dial_try2: (selectedCampaign.phone_dial_try !== undefined)
          ? Number(selectedCampaign.phone_dial_try.slice(1, 2)[0])
          : 0,
        phone_dial_try3: (selectedCampaign.phone_dial_try !== undefined)
          ? Number(selectedCampaign.phone_dial_try.slice(2, 3)[0])
          : 0,
        phone_dial_try4: (selectedCampaign.phone_dial_try !== undefined)
          ? Number(selectedCampaign.phone_dial_try.slice(3, 4)[0])
          : 0,
        phone_dial_try5: (selectedCampaign.phone_dial_try !== undefined)
          ? Number(selectedCampaign.phone_dial_try.slice(4, 5)[0])
          : 0,
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
        outbound_sequence: '',
        channel_group_id: selectedCampaign.channel_group_id
      });
      if (schedules.length > 0) {
        const tempCampaignSchedule = schedules.filter((schedule) => schedule.campaign_id === selectedCampaign?.campaign_id);
        if (tempCampaignSchedule.length > 0) {
          setTempCampaignSchedule({
            ...tempCampaignSchedule[0],
            campaign_id: selectedCampaign.campaign_id,
            tenant_id: selectedCampaign.tenant_id,
            start_date: schedules.filter((schedule) => schedule.campaign_id === selectedCampaign.campaign_id)[0].start_date,
            end_date: schedules.filter((schedule) => schedule.campaign_id === selectedCampaign.campaign_id)[0].end_date,
            start_time: schedules.filter((schedule) => schedule.campaign_id === selectedCampaign.campaign_id)[0].start_time,
            end_time: schedules.filter((schedule) => schedule.campaign_id === selectedCampaign.campaign_id)[0].end_time
          });
        } else {
          setTempCampaignSchedule(CampaignScheduleInfo);
        }
      } else {
        setTempCampaignSchedule({
          ...tempCampaignSchedule,
          campaign_id: selectedCampaign.campaign_id,
          tenant_id: selectedCampaign.tenant_id
        });
      }
    } else {
      setTempCampaignsInfo(CampaignInfo);
      setTempCampaignSchedule(CampaignScheduleInfo);
    }
    // campaignId 추가하여 masterCampaignId 변경 시에도 재설정되도록 함
  }, [campaignId, selectedCampaign, campaignSkills, callingNumbers, schedules]);

  // input 데이터 변경
  const handleInputData = (value: any, col: string) => {
    if (!campaignInfoChangeYn) {
      setCampaignInfoChangeYn(true);
    }
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
  };

  // select 데이터 변경
  const handleSelectChange = (value: string, type: 'tenant' | 'dialMode') => {
    if (!campaignInfoChangeYn) {
      setCampaignInfoChangeYn(true);
    }
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
        dial_mode: Number(value),
        dial_speed: 0,
      });
      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo,
        dial_mode: Number(value),
        dial_speed: 0,
      });
      setTempCampaignDialSpeedInfoParam({
        ...tempCampaignDialSpeedInfoParam,
        dial_mode: Number(value)
      });
    }
  };

  // 스킬 선택 팝업
  const handleSelectSkills = (param: string) => {
    if (tempCampaignSkills.skill_id.join(',') !== param) {
      setCampaignSkillChangeYn(true);
      setInputSkills(param);
      setTempCampaignSkills({
        ...tempCampaignSkills,
        campaign_id: campaignId,
        skill_id: param.split(',').map((data) => Number(data))
      });
    }
    setSkillPopupState((prev) => ({ ...prev, isOpen: false }));
  };

  const showAlert = (message: string) => {
    setAlertState({
      isOpen: true,
      message,
      title: '알림',
      type: '2',
      onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
    });
  };

  // 발신번호 팝업
  const handleCallingNumlber = (param: string) => {
    
    if (inputCallingNumber !== param) {
      // setCallingNumberChangeYn(true);
      setInputCallingNumber(param);
      setTempCallingNumberInfo({
        ...tempCallingNumberInfo,
        campaign_id: campaignId,
        calling_number: param
      });
    }
    // 0424 발신번호 변경 api 추가

    // 발신번호가 비어있는 경우
    // if (!param || param.trim().length === 0) {
    //   showAlert('발신번호를 입력해주세요.');
    //   return; // 여기서 바로 종료
    // }

    // 발신번호가 숫자가 아닌 경우
    const isNumber = /^[0-9]+$/.test(param);

    // 발신번호가 이미 존재하는지 확인
    const existingCallingNumber = callingNumbers.find(num => num.campaign_id === Number(campaignId));
    const saveRequest = {
      campaign_id: Number(campaignId),
      calling_number: param,
    };
    
    if (!param || param.trim().length === 0) {
      // showAlert('발신번호는 숫자로만 입력해주세요.');
      // return; // 여기서 바로 종료
      fetchCallingNumberDelete(saveRequest);
    }else

    // 발신번호 처리 후, api 요청이 성공하면 팝업을 닫는다
    
    if (existingCallingNumber) {
      fetchCallingNumberUpdate(saveRequest);
      // showAlert은 mutate의 onSuccess에서 처리
    } else {
      fetchCallingNumberInsert(saveRequest);
      // showAlert은 mutate의 onSuccess에서 처리
    }
    

    // 발신번호가 유효하고, 처리 후 팝업을 닫을 때만 호출
    setCallingNumberPopupState((prev) => ({ ...prev, isOpen: false }));
  };

  // 캠페인 동작시간 탭 변경
  const handleCampaignScheduleChange = (value: OperationTimeParam) => {
    
    // 캠페인 정보만 변경 여부 확인
    if (value.only_status_change) {

      setOnlyCampaignStatusChange(true); // 캠페인 상태 api만 날리기 위한 표시

      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo,
        start_flag: Number(value.start_flag)
      });
      setTempCampaignsInfo({
        ...tempCampaignInfo,
        start_flag: Number(value.start_flag)
      });

    }else {
      if (value.campaignInfoChangeYn) {
        if (!campaignInfoChangeYn) {
          setCampaignInfoChangeYn(true); // ###
        }
        setTempCampaignManagerInfo({
          ...tempCampaignManagerInfo,
          start_flag: Number(value.start_flag)
        });
        setTempCampaignsInfo({
          ...tempCampaignInfo,
          start_flag: Number(value.start_flag)
        });
      }
      if (value.campaignScheduleChangeYn) {
        if (!campaignScheduleChangeYn) {
          setCampaignScheduleChangeYn(true);
        }
        setTempCampaignSchedule({
          ...tempCampaignSchedule,
          campaign_id: value.campaign_id,
          start_date: value.start_date,
          end_date: value.end_date,
          start_time: value.start_time,
          end_time: value.end_time
        });
      }
      if (value.onSave) {
        handleCampaignSave();
      }
      if (value.onClosed) {
        handleCampaignClosed();
      }
    }

    
  };

  // 캠페인 발신 순서 탭 변경
  const handleCampaignOutgoingOrderChange = (value: OutgoingOrderTabParam) => {
    if (value.campaignInfoChangeYn) {
      if (!campaignInfoChangeYn) {
        setCampaignInfoChangeYn(true);
      }
      setTempCampaignsInfo({
        ...tempCampaignInfo,
        dial_phone_id: Number(value.dial_phone_id),
        phone_dial_try: value.phone_dial_try,
        phone_order: value.phone_order
      });
      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo,
        dial_phone_id: Number(value.dial_phone_id),
        phone_dial_try1: value.phone_dial_try[0],
        phone_dial_try2: value.phone_dial_try[1],
        phone_dial_try3: value.phone_dial_try[2],
        phone_dial_try4: value.phone_dial_try[3],
        phone_dial_try5: value.phone_dial_try[4],
        phone_order: value.phone_order
      });
    }
    if (value.onSave) {
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  };

  // 캠페인 발신전략 탭 변경
  const handleOutgoingStrategyTabChange = (value: OutgoingStrategyTabParam) => {
    if (value.campaignInfoChangeYn) {
      if (!campaignInfoChangeYn) {
        setCampaignInfoChangeYn(true);
      }
      setTempCampaignsInfo({
        ...tempCampaignInfo,
        redial_strategy: value.redial_strategy
      });
      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo,
        redial_strategy1: value.redial_strategy[0],
        redial_strategy2: value.redial_strategy[1],
        redial_strategy3: value.redial_strategy[2],
        redial_strategy4: value.redial_strategy[3],
        redial_strategy5: value.redial_strategy[4]
      });
    }
    if (value.onInit) {
      if (!campaignInfoChangeYn) {
        setCampaignInfoChangeYn(true);
      }
      setTempCampaignsInfo({
        ...tempCampaignInfo,
        redial_strategy: CampaignInfo.redial_strategy
      });
      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo,
        redial_strategy1: CampaignManagerInfo.redial_strategy1,
        redial_strategy2: CampaignManagerInfo.redial_strategy2,
        redial_strategy3: CampaignManagerInfo.redial_strategy3,
        redial_strategy4: CampaignManagerInfo.redial_strategy4,
        redial_strategy5: CampaignManagerInfo.redial_strategy5
      });
    }
    if (value.onSave) {
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  };

  // 캠페인 발신방법 탭 변경
  const handleOutgoingMethodTabChange = (value: OutgoingMethodTabParam) => {
    if (value.campaignInfoChangeYn) {
      if (!campaignInfoChangeYn) {
        setCampaignInfoChangeYn(true);
      }
      setTempCampaignsInfo({
        ...tempCampaignInfo,
        trunk_access_code: value.trunk_access_code,
        dial_try_interval: value.dial_try_interval,
        alarm_answer_count: value.alarm_answer_count,
        overdial_abandon_time: value.overdial_abandon_time,
        detect_mode: value.detect_mode,
        auto_dial_interval: value.auto_dial_interval,
        power_divert_queue: value.power_divert_queue,
        next_campaign: value.next_campaign,
        DDD_code: value.DDD_code,
        callback_kind: value.callback_kind,
        max_ring: value.max_ring,
        token_id: value.token_id,
        use_counsel_result: value.use_counsel_result,
        dial_mode_option: value.dial_mode_option,
        user_option: value.user_option,
        channel_group_id: value.channel_group_id
      });
      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo,
        trunk_access_code: value.trunk_access_code,
        dial_try_interval: value.dial_try_interval,
        alarm_answer_count: value.alarm_answer_count,
        overdial_abandon_time: value.overdial_abandon_time,
        detect_mode: value.detect_mode,
        auto_dial_interval: value.auto_dial_interval,
        power_divert_queue: value.power_divert_queue + '',
        next_campaign: value.next_campaign,
        DDD_code: value.DDD_code,
        callback_kind: value.callback_kind,
        max_ring: value.max_ring,
        token_id: value.token_id,
        use_counsel_result: value.use_counsel_result,
        dial_mode_option: value.dial_mode_option,
        user_option: value.user_option,
        channel_group_id: value.channel_group_id
      });
    }
    if (value.onSave) {
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  };

  // 캠페인 콜페이싱 탭 변경
  const handleCallPacingTabChange = (value: CallPacingTabParam) => {
    if (value.campaignDialSpeedChangeYn) {
      if (!campaignInfoChangeYn) {
        setCampaignInfoChangeYn(true);
      }
      setCampaignDialSpeedChangeYn(value.campaignDialSpeedChangeYn);
      setTempCampaignDialSpeedInfoParam({
        ...tempCampaignDialSpeedInfoParam,
        predictive_dial_speed: value.predictive_dial_speed,
        progressive_dial_speed: value.progressive_dial_speed
      });
      setTempCampaignDialSpeedInfo({
        ...tempCampaignDialSpeedInfo,
        dial_speed: tempCampaignManagerInfo.dial_mode === 2 ? Math.floor(value.progressive_dial_speed) : value.predictive_dial_speed
      });
      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo,
        dial_speed: tempCampaignManagerInfo.dial_mode === 2 ? Math.floor(value.progressive_dial_speed) : value.predictive_dial_speed
      });
    }
    if (value.onSave) {
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  };

  // 캠페인 콜백 탭 변경
  const handleCallbackTabChange = (value: CallbackTabParam) => {
    if (value.campaignInfoChangeYn) {
      if (!campaignInfoChangeYn) {
        setCampaignInfoChangeYn(true);
      }
      setTempCampaignsInfo({
        ...tempCampaignInfo,
        callback_kind: Number(value.callback_kind),
        service_code: value.service_code
      });
      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo,
        callback_kind: Number(value.callback_kind),
        service_code: value.service_code
      });
    }
    if (value.onSave) {
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  };

  // 캠페인 알림 탭 변경
  const handleNotificationTabChange = (value: NotificationTabParam) => {
    if (value.campaignInfoChangeYn) {
      if (!campaignInfoChangeYn) {
        setCampaignInfoChangeYn(true);
      }
      setTempCampaignsInfo({
        ...tempCampaignInfo,
        list_alarm_count: Number(value.list_alarm_count),
        supervisor_phone: value.supervisor_phone,
        use_list_alarm: value.use_list_alarm
      });
      setTempCampaignManagerInfo({
        ...tempCampaignManagerInfo,
        list_alarm_count: Number(value.list_alarm_count),
        supervisor_phone: value.supervisor_phone,
        use_list_alarm: value.use_list_alarm
      });
    }
    if (value.onSave) {
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  };

  // 캠페인 기타정보 탭 변경
  const handleAdditionalInfoTabChange = (value: AdditionalInfoTabParam) => {
    if (value.onSave) {
      handleCampaignSave();
    }
    if (value.onClosed) {
      handleCampaignClosed();
    }
  };

  // 캠페인 취소
  const handleCampaignClosed = () => {
    if (isOpen) {
      if (onCampaignPopupClose) {
        onCampaignPopupClose();
      }
    } else {
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: '캠페인 편집창을 종료하시겠습니까?',
        onClose: handleCampaignClosedExecute,
        onCancel: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }
  };

  // 캠페인 취소 실행
  const handleCampaignClosedExecute = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
    removeTab(Number(activeTabId), activeTabKey + '');
  };

  // 캠페인 상태 변경 API 조건 체크
  const [campaignStatusUpdateCheck, setCampaignStatusUpdateCheck] = useState<boolean>(true);
  // 캠페인 상태만 변경되었는지 체크
  const [onlyCampaignStatusChange, setOnlyCampaignStatusChange] = useState<boolean>(false);
  

  // 캠페인 저장 체크
  // const saveCampaignCheck = () => {
  //   let saveCheck = true;
  //   const today = new Date();
  //   const tempDate = today.getFullYear() + ('0' + (today.getMonth() + 1)).slice(-2) + ('0' + today.getDate()).slice(-2);
  //   if (tempCampaignSchedule.start_time.length === 0) {
  //     saveCheck = false;
  //     setAlertState({
  //       ...errorMessage,
  //       isOpen: true,
  //       message: "시작시간 또는 종료시간을 지정해 주세요.",
  //       type: '2',
  //       onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
  //     });
      
  //   } else if (tempCampaignSchedule.end_date < tempDate) {
  //     saveCheck = false;
  //     setAlertState({
  //       ...errorMessage,
  //       isOpen: true,
  //       message: "종료일이 금일 이전으로 설정되어 있습니다.",
  //       type: '2',
  //       onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
  //     });
  //   }
    
  //   if( environmentData ){
  //     if( !(officeStartTime === '0000' && officeEndTime === '0000')){
  //       let timeCheck = false;
  //       for( let i=0;i< tempCampaignSchedule.start_time.length ;i++ ){
  //         if( officeStartTime > tempCampaignSchedule.start_time[i] || officeEndTime < tempCampaignSchedule.end_time[i] ){
  //           timeCheck = true;
  //         }
  //       }
  //       if( timeCheck ){
  //         saveCheck = false;
  //         setAlertState({
  //           ...errorMessage,
  //           isOpen: true,
  //           message: "설정된 발신 업무 시간에 맞지 않은 스케줄이 존재 합니다. 동작시간 탭의 시작 시간 또는 종료 시간을 변경해 주세요.",
  //           type: '2',
  //           onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
  //         });
  //       }
  //     }
  //   }

  //   const currentDialStatus = useCampaignDialStatusStore.getState().campaignDialStatus;
    
  //   // 현재 캠페인의 상태가 정지중이거나 멈춤중일때
  //   const existDial = currentDialStatus.some(( dialStatus) => 
  //                     (dialStatus.campaign_id.toString() === selectedCampaign?.campaign_id.toString()) && 
  //                     (dialStatus.status?.toString() === '5' || dialStatus.status?.toString() === '6') );
  
  //   if( existDial ) {
  //     saveCheck = false;
  //     setAlertState({
  //       ...errorMessage,
  //       title: '캠페인 상태 변경',
  //       isOpen: true,
  //       message:
  //         '발신중인 데이터 처리 중 입니다. 기다려 주시길 바랍니다. \n강제로 상태 변경을 하실 경우에는 발신 데이터 처리가 되지 않으며 \n재시작 시에는 중복 발신이 될 수도 있습니다.\n그래도 진행하시겠습니까?',
  //       onClose: () => {
  //         setAlertState((prev) => ({ ...prev, isOpen: false }));
  //         saveCheck = true;
  //         setCampaignStatusUpdateCheck(false);
  //       },
  //       onCancel: () => {
  //         setAlertState((prev) => ({ ...prev, isOpen: false }));
  //         // 취소시 아무 일도 안 함
  //       },
  //     });
  //   }
  //   return saveCheck;
  // };


  interface CampaignCheckResult {
    isSaveOk: boolean;
    isDialExist?: boolean;
  };
  
  // 캠페인 저장 체크
  const saveCampaignCheck = (): Promise<CampaignCheckResult> => {
    return new Promise((resolve) => {
      let saveCheck = true;

      const today = new Date();
      const tempDate = today.getFullYear() + ('0' + (today.getMonth() + 1)).slice(-2) + ('0' + today.getDate()).slice(-2);

      if (tempCampaignSchedule.start_time.length === 0) {
        saveCheck = false;
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: "시작시간 또는 종료시간을 지정해 주세요.",
          type: '2',
          onClose: () => {
            setAlertState((prev) => ({ ...prev, isOpen: false }));
            resolve({ isSaveOk: false }); // 즉시 종료
          }
        });
        return;
      }

      if (tempCampaignSchedule.end_date < tempDate) {
        saveCheck = false;
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: "종료일이 금일 이전으로 설정되어 있습니다.",
          type: '2',
          onClose: () => {
            setAlertState((prev) => ({ ...prev, isOpen: false }));
            resolve({ isSaveOk: false });
          }
        });
        return;
      }

      // 시간 범위 체크
      if (environmentData) {
        if (!(officeStartTime === '0000' && officeEndTime === '0000')) {
          const timeCheck = tempCampaignSchedule.start_time.some((start, i) => {
            return officeStartTime > start || officeEndTime < tempCampaignSchedule.end_time[i];
          });

          if (timeCheck) {
            saveCheck = false;
            setAlertState({
              ...errorMessage,
              isOpen: true,
              message: "설정된 발신 업무 시간에 맞지 않은 스케줄이 존재 합니다. 동작시간 탭의 시작 시간 또는 종료 시간을 변경해 주세요.",
              type: '2',
              onClose: () => {
                setAlertState((prev) => ({ ...prev, isOpen: false }));
                resolve({ isSaveOk: false });
              }
            });
            return;
          }
        }
      }

      const currentDialStatus = useCampaignDialStatusStore.getState().campaignDialStatus;
      const existDial = currentDialStatus.some(
        (dialStatus) =>
          dialStatus.campaign_id.toString() === selectedCampaign?.campaign_id.toString() &&
          (dialStatus.status?.toString() === '5' || dialStatus.status?.toString() === '6')
      );

      if (existDial) {
        saveCheck = false;
        setAlertState({
          ...errorMessage,
          title: '캠페인 상태 변경',
          isOpen: true,
          message:
            '발신중인 데이터 처리 중 입니다. 기다려 주시길 바랍니다. \n강제로 상태 변경을 하실 경우에는 발신 데이터 처리가 되지 않으며 \n재시작 시에는 중복 발신이 될 수도 있습니다.\n그래도 진행하시겠습니까?',
          onClose: () => {
            setCampaignStatusUpdateCheck(false);
            setAlertState((prev) => ({ ...prev, isOpen: false }));
            resolve({ isSaveOk: true, isDialExist : true }); // 사용자 확인 시 true로 반환
          },
          onCancel: () => {
            setAlertState((prev) => ({ ...prev, isOpen: false }));
            resolve({ isSaveOk: false }); // 사용자 취소
          }
        });
        return;
      }

      // 모든 검사를 통과했으면
      resolve({ isSaveOk: true });
    });
  };

  // 0515 비동기 처리로 변경해서 파라미터를 넘겨주는 구조로 변경
  // 캠페인 저장
  const handleCampaignSave = async () => {
    const {isSaveOk , isDialExist} = await saveCampaignCheck();
    if (isSaveOk) {
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: '캠페인 아이디: ' + tempCampaignManagerInfo.campaign_id
          + '\n캠페인 이름: ' + tempCampaignManagerInfo.campaign_name
          + '\n캠페인을 수정하시겠습니까?',
        onClose: () => {
          // 화면 깜빡임 방지를 위한 비동기처리
          setTimeout(() => {
            handleCampaignSaveExecute(isDialExist ?? false);
          }, 300);
        },
        onCancel: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }
  };

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
  
  // 캠페인 저장 실행
  const handleCampaignSaveExecute = (isDialExist: boolean) => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
    setChangeYn(false);
    
    const todayTime = getCurrentFormattedTime();
    // 캠페인 상태만 변경하는 거라면
    if(onlyCampaignStatusChange){

      // 이전 캠페인 상태와 현재 바꾸려는 캠페인의 상태가 같다면
      if(oriCampaignManagerInfo.start_flag === tempCampaignManagerInfo.start_flag){
        return;
      }
      
      // 캠페인 상태만 변경하는거지만 발신중인경우 
      if(isDialExist || !campaignStatusUpdateCheck){
        // console.log('발신중인 캠페인 상태 변경');
        fetchCampaignManagerUpdate({
          ...tempCampaignManagerInfo
          , update_user: user_id
          , update_ip: Cookies.get('userHost')+''
          , update_time: todayTime
        });
      }
      else{
        fetchCampaignStatusUpdate({
          campaign_id: tempCampaignManagerInfo.campaign_id,
          campaign_status: tempCampaignManagerInfo.start_flag
        });
      }

    }else{
      // 캠페인 상태가 아닌 수정이거나 캠페인 상태도 포함인 경우
      if (campaignInfoChangeYn) {
        if (tempCampaignManagerInfo.start_flag === 1 && oriCampaignManagerInfo.start_flag != 1) {
          fetchCampaignStatusUpdate({
            campaign_id: tempCampaignManagerInfo.campaign_id,
            campaign_status: tempCampaignManagerInfo.start_flag
          });
        } 
        else {
          if (tempCampaignManagerInfo.dial_mode === 2 || tempCampaignManagerInfo.dial_mode === 3) {
            fetchCampaignManagerUpdate({
              ...tempCampaignManagerInfo
              , update_user: user_id
              , update_ip: Cookies.get('userHost')+''
              , update_time: todayTime
            });
          } else {
            fetchCampaignManagerUpdate({
              ...tempCampaignManagerInfo
              , update_user: user_id
              , update_ip: Cookies.get('userHost')+''
              , update_time: todayTime
              , dial_speed: 0
            });
          }
          if (campaignSkillChangeYn) {
            if (tempCampaignSkills.skill_id[0] === 0) {
              fetchCampaignSkillUpdate({
                ...tempCampaignSkills,
                skill_id: []
              });
            } else {
              fetchCampaignSkillUpdate(tempCampaignSkills);
            }
          }
          if (campaignScheduleChangeYn) {
            if (tempCampaignSchedule.tenant_id === 0) {
              fetchCampaignScheduleInsert({ ...tempCampaignSchedule, tenant_id: tempCampaignManagerInfo.tenant_id });
            } else {
              fetchCampaignScheduleUpdate(tempCampaignSchedule);
            }
          }
          // if (callingNumberChangeYn) {
          //   const tempCallNumber = callingNumbers.filter((callingNumber) => callingNumber.campaign_id === tempCampaignManagerInfo.campaign_id)
          //     .map((data) => data.calling_number)
          //     .join(',');
          //   if (tempCallingNumberInfo.calling_number !== '' && tempCallNumber === '') {
          //     fetchCallingNumberInsert(tempCallingNumberInfo);
          //   } else if (tempCallingNumberInfo.calling_number === '' && tempCallNumber !== '') {
          //     fetchCallingNumberDelete(tempCallingNumberInfo);
          //   } else {
          //     fetchCallingNumberUpdate(tempCallingNumberInfo);
          //   }
          // }
          if (campaignDialSpeedChangeYn) {
            if (tempCampaignManagerInfo.dial_mode === 2 || tempCampaignManagerInfo.dial_mode === 3) {
              fetchDialSpeedUpdate(tempCampaignDialSpeedInfo);
            } else {
              fetchDialSpeedUpdate({
                ...tempCampaignDialSpeedInfo,
                dial_speed: 0
              });
            }
          }
        }
      } else {
        if (campaignSkillChangeYn) {
          if (tempCampaignSkills.skill_id[0] === 0) {
            fetchCampaignSkillUpdate({
              ...tempCampaignSkills,
              skill_id: []
            });
          } else {
            fetchCampaignSkillUpdate(tempCampaignSkills);
          }
        }
        if (campaignScheduleChangeYn) {
          if (tempCampaignSchedule.tenant_id === 0) {
            fetchCampaignScheduleInsert({ ...tempCampaignSchedule, tenant_id: tempCampaignManagerInfo.tenant_id });
          } else {
            fetchCampaignScheduleUpdate(tempCampaignSchedule);
          }
        }
        // if (callingNumberChangeYn) {
        //   const tempCallNumber = callingNumbers.filter((callingNumber) => callingNumber.campaign_id === tempCampaignManagerInfo.campaign_id)
        //     .map((data) => data.calling_number)
        //     .join(',');
        //   if (tempCallingNumberInfo.calling_number !== '' && tempCallNumber === '') {
        //     fetchCallingNumberInsert(tempCallingNumberInfo);
        //   } else if (tempCallingNumberInfo.calling_number === '' && tempCallNumber !== '') {
        //     fetchCallingNumberDelete(tempCallingNumberInfo);
        //   } else {
        //     fetchCallingNumberUpdate(tempCallingNumberInfo);
        //   }
        // }
        if (campaignDialSpeedChangeYn) {
          if (tempCampaignManagerInfo.dial_mode === 2 || tempCampaignManagerInfo.dial_mode === 3) {
            fetchDialSpeedUpdate(tempCampaignDialSpeedInfo);
          } else {
            fetchDialSpeedUpdate({
              ...tempCampaignDialSpeedInfo,
              dial_speed: 0
            });
          }
        }
      }
    }
  };

  // 캠페인 삭제
  const handleCampaignDelete = () => {  
    setAlertState({
      ...errorMessage,
      isOpen: true,
      message: '캠페인 아이디: ' + tempCampaignManagerInfo.campaign_id
        + '\n캠페인 이름: ' + tempCampaignManagerInfo.campaign_name
        + '\n삭제된 캠페인은 복구가 불가능합니다.'
        + '\n캠페인을 삭제하시겠습니까?',
      onClose: handleCampaignDeleteExecute,
      onCancel: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
    });
  };

  // 캠페인 삭제 공통함수
  const { commonDeleteCampaign } = useDeleteCampaignHelper();

  // 캠페인 삭제 실행
  const handleCampaignDeleteExecute = async () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
    if (selectedCampaign?.start_flag === 3) {

      // 캠페인 스케줄 삭제를 1번째 순서로 변경
      try{

        const callbackCampaignId = await commonDeleteCampaign(tempCampaignInfo.tenant_id, tempCampaignInfo.campaign_id);
        // 삭제로직 이후에 콜백받는 다음 인덱스 캠페인 아이디
        // console.log('Test ######## callbackCampaignId : ', callbackCampaignId);
        setInit(callbackCampaignId);

        if(callbackCampaignId){
          setAlertState({
            ...errorMessage,
            isOpen: true,
            message: '작업이 완료되었습니다.',
            type: '2',
            onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
          });
        }        
        
      } catch (e: any){
        if (e.message === 'SESSION_EXPIRED') {

          ServerErrorCheck('API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.', e.message);
          setAlertState({
            ...errorMessage,
            isOpen: true,
            message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
            type: '2',
            onClose: () => goLogin(),
          });
        } else {
          // console.error('캠페인 삭제 중 오류 발생:', e);
          setAlertState({
            ...errorMessage,
            isOpen: true,
            message: '캠페인 삭제 중 알 수 없는 오류가 발생했습니다.',
            onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
          });
        }
      } 
      
    } else {
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: '캠페인 삭제는 중지 상태에서만 가능합니다.',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
        onCancel: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }
  };

  useEffect(() => {
    if (!changeYn && !campaignInfoChangeYn && !campaignSkillChangeYn && !campaignDialSpeedChangeYn && !onlyCampaignStatusChange && !campaignScheduleChangeYn) {
      setChangeYn(true);
      // fetchMain({
      //   session_key: '',
      //   tenant_id: 0,
      // });
      setRtnMessage('');
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: '작업이 완료되었습니다.',
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
      });
    }
  }, [campaignInfoChangeYn, campaignSkillChangeYn, campaignDialSpeedChangeYn, onlyCampaignStatusChange, campaignScheduleChangeYn]);

  // 캠페인 정보 수정 API 호출
  // tofix 0417 a3 브라우져 api 로 campaign 정보 변경 후에 
  // 모니터 페이지에 캠페인 정보 변경을 broadcast로 알림
  const { mutate: fetchCampaignManagerUpdate } = useApiForCampaignManagerUpdate({
    onSuccess: (data) => {
      setCampaignInfoChangeYn(false);

      // tofix 0417 a1 hyun 
      // 캠페인 정보 수정 후에 모니터 페이지에 
      // 캠페인 정보가 변경된 것을 반영하기 위해서
      // broadcast로 캠페인 정보 변경 요청

      campaignChannel.postMessage({
        type: "campaign_basic_info_update",
        campaignId: tempCampaignManagerInfo.campaign_id,
      });
      setOnlyCampaignStatusChange(false);
      setCampaignStatusUpdateCheck(true);

    },
    onError: (error) => {
      ServerErrorCheck('캠페인 정보 수정', error.message);
    }
  });

  // 캠페인 정보 조회 API 호출
  const { mutate: fetchMain } = useApiForMain({
    onSuccess: (data) => {
      setCampaigns(data.result_data);
      setSelectedCampaign(data.result_data.filter((campaign) => campaign.campaign_id === selectedCampaign?.campaign_id)[0]);
      setTempCampaignsInfo(data.result_data.filter((campaign) => campaign.campaign_id === selectedCampaign?.campaign_id)[0]);
      setCampaignInfoChangeYn(false);
      setRtnMessage('');
      // setAlertState({
      //   ...errorMessage,
      //   isOpen: true,
      //   message: '작업이 완료되었습니다.',
      //   type: '2',
      //   onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
      // });
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 정보 조회', error.message);
    }
  });

  // 발신리스트 업로드 취소 api 호출
  const { mutate: fetchCallingListDelete } = useApiForCallingListDelete({
    onSuccess: (data) => {
      setAlertState((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (error) => {
      ServerErrorCheck('발신리스트 업로드 취소', error.message);
    }
  });

  // 캠페인 스킬 수정 API 호출
  const { mutate: fetchCampaignSkillUpdate } = useApiForCampaignSkillUpdate({
    onSuccess: (data) => {
      setCampaignSkillChangeYn(false);
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 스킬 수정', error.message);
    }
  });

  // 캠페인 스케줄 조회 API 호출
  // const { mutate: fetchSchedules } = useApiForSchedules({
  //   onSuccess: (data) => {
  //     setSchedules(data.result_data);
  //     setCampaignScheduleChangeYn(false);
  //   }
  // });

  // 캠페인 스케줄 등록 API 호출
  const { mutate: fetchCampaignScheduleInsert } = useApiForCampaignScheduleInsert({
    onSuccess: (data) => {
      // const tempTenantIdArray = tenants.map((tenant) => tenant.tenant_id);
      // fetchSchedules({ tenant_id_array: tempTenantIdArray });
      setCampaignScheduleChangeYn(false);
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 스케줄 등록', error.message);
    }
  });

  // 캠페인 스케줄 수정 API 호출
  const { mutate: fetchCampaignScheduleUpdate } = useApiForCampaignScheduleUpdate({
    onSuccess: (data) => {
      // toast.success('캠페인 스케줄 수정이 완료되었습니다.');
      // const tempTenantIdArray = tenants.map((tenant) => tenant.tenant_id);
      // fetchSchedules({ tenant_id_array: tempTenantIdArray });
      setCampaignScheduleChangeYn(false);
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 스케줄 수정', error.message);
    }
  });

  // 캠페인 정보 삭제 API 호출
  // const { mutate: fetchCampaignManagerDelete } = useApiForCampaignManagerDelete({
  //   onSuccess: (data) => {
  //     // 2)캠페인 스케줄 삭제
  //     // fetchCampaignScheduleDelete({
  //     //   ...campaignInfoDelete,
  //     //   campaign_id: tempCampaignManagerInfo.campaign_id,
  //     //   tenant_id: tempCampaignManagerInfo.tenant_id
  //     // });
  //   },
  //   onError: (data) => {
  //     if (data.message.split('||')[0] === '5') {
  //       setAlertState({
  //         ...errorMessage,
  //         isOpen: true,
  //         message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
  //         type: '2',
  //         onClose: () => goLogin(),
  //       });
  //     }
  //   }
  // });

  // 캠페인 스킬 조회 API 호출
  // const { mutate: fetchCampaignSkills } = useApiForCampaignSkill({
  //   onSuccess: (data) => {
  //     setCampaignSkills(data.result_data);
  //     setCampaignSkillChangeYn(false);
  //   }
  // });
  
  // 캠페인 스케줄 삭제 API 호출
  // const { mutate: fetchCampaignScheduleDelete } = useApiForCampaignScheduleDelete({
  //   onSuccess: (data) => {
  //     // 3)스킬편집 -> 캠페인 소속 스킬 할당 해제
  //     const tempSkill = campaignSkills.filter((skill) => skill.campaign_id === campaignId)
  //       .map((data) => data.skill_id)
  //       .join(',');
  //     if (tempSkill !== '') {
  //       fetchCampaignSkillUpdate({
  //         ...tempCampaignSkills,
  //         skill_id: []
  //       });
  //     }
  //     // 4)캠페인별 발신번호 설정 삭제
  //     const tempCallNumber = callingNumbers.filter((callingNumber) => callingNumber.campaign_id === campaignId)
  //       .map((data) => data.calling_number)
  //       .join(',');
  //     if (tempCallNumber !== '') {
  //       fetchCallingNumberDelete(tempCallingNumberInfo);
  //     }
  //     // 5)캠페인별 문자할당 삭제 : 기능 사용시 API 생성 예정
  //     // 6)채널 할당 - 캠페인 모드시, 캠페인이 할당되면 Assign 해제 -> 회선사용 안함으로 변경 : /pds/channel-group - 제외
  //     // 7)예약콜제한설정 삭제 
  //     fetchReservedCallDelete({
  //       ...campaignInfoDelete,
  //       campaign_id: tempCampaignManagerInfo.campaign_id,
  //       tenant_id: tempCampaignManagerInfo.tenant_id
  //     });
  //   }
  // });

  // 예약콜 삭제 API 호출
  // const { mutate: fetchReservedCallDelete } = useApiForReservedCallDelete({
  //   onSuccess: (data) => {
  //     // 8)분배호수제한설정에 캠페인 할당된 정보 삭제 - 캠페인 소속 상담사 리스트 정보 조회 후 삭제한다.
  //     // 캠페인 소속 상담사 리스트 요청
  //     fetchCampaignAgents({ campaign_id: tempCampaignManagerInfo.campaign_id });
  //   }
  // });

  // 캠페인 소속 상담사 리스트 요청
  // const { mutate: fetchCampaignAgents } = useApiForCampaignAgent({
  //   onSuccess: (data) => {
  //     if (data.result_data.length > 0 && data.result_data[0].agent_id.length > 0) {
  //       const agentList = data.result_data[0].agent_id.join(',');
  //       // 8)분배호수제한설정에 캠페인 할당된 정보 삭제 - 캠페인 소속 상담사 리스트 정보 조회 후 삭제한다.
  //       fetchMaxcallExtDelete({
  //         ...agientListDelte,
  //         campaign_id: tempCampaignManagerInfo.campaign_id,
  //         agent_id_list: agentList.split(',').map(agent => ({ agent_id: agent }))
  //       });
  //     } else {
  //       // 9)캠페인 예약 재발신 삭제 - 캠페인 재발신 정보 조회 후 삭제한다.
  //       fetchAutoRedials({
  //         session_key: session_key,
  //         tenant_id: tenant_id,
  //       });
  //     }
  //   },
  //   onError: (data) => {
  //     // 9)캠페인 예약 재발신 삭제 - 캠페인 재발신 정보 조회 후 삭제한다.
  //     fetchAutoRedials({
  //       session_key: session_key,
  //       tenant_id: tenant_id,
  //     });
  //   }
  // });

  // 분배제한 정보 삭제 API 호출
  // const { mutate: fetchMaxcallExtDelete } = useApiForMaxcallExtDelete({
  //   onSuccess: (data) => {
  //     // 9)캠페인 예약 재발신 삭제 - 캠페인 재발신 정보 조회 후 삭제한다.
  //     fetchAutoRedials({
  //       session_key: session_key,
  //       tenant_id: tenant_id,
  //       campaign_id : tempCampaignManagerInfo.campaign_id
  //     });
  //   }
  // });

  // 캠페인 재발신 조회 API 호출
  // const { mutate: fetchAutoRedials } = useApiForAutoRedial({
  //   onSuccess: (data) => {
  //     // 9)캠페인 예약 재발신 삭제 - 캠페인 재발신 정보 조회 후 삭제한다.
  //     if (typeof data.result_data !== 'undefined') {
  //       if (data.result_data.length > 0) {
  //         const dataList = data.result_data.filter((data) => data.campaign_id === campaignId);
  //         if (dataList.length > 0 && dataList[0].sequence_number != null) {
  //           // 9)캠페인 예약 재발신 삭제 - 캠페인 재발신 정보 조회 후 삭제한다.
  //           fetchAutoRedialDelete({
  //             campaign_id: campaignId,
  //             sequence_number: dataList[0].sequence_number
  //           });
  //         } else {
  //           //캠페인관리 화면 닫기.
  //           // setInit(0);
  //           setInit(findPreviousOrNextCampaignId(campaignId));

  //           // 마지막으로 캠페인 정보 삭제
  //           fetchCampaignManagerDelete({
  //             ...campaignInfoDelete,
  //             campaign_id: tempCampaignManagerInfo.campaign_id,
  //             tenant_id: tempCampaignManagerInfo.tenant_id
  //           });

  //           setAlertState({
  //             ...errorMessage,
  //             isOpen: true,
  //             message: '작업이 완료되었습니다.',
  //             type: '2',
  //             onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
  //           });
  //         }
  //       } else {
  //         //캠페인관리 화면 닫기.
  //         // setInit(0);
  //         setInit(findPreviousOrNextCampaignId(campaignId));

  //         // 마지막으로 캠페인 정보 삭제
  //         fetchCampaignManagerDelete({
  //           ...campaignInfoDelete,
  //           campaign_id: tempCampaignManagerInfo.campaign_id,
  //           tenant_id: tempCampaignManagerInfo.tenant_id
  //         });
  //         setAlertState({
  //           ...errorMessage,
  //           isOpen: true,
  //           message: '작업이 완료되었습니다.',
  //           type: '2',
  //           onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
  //         });
  //       }
  //     } else {
  //       // setInit(0);
  //       setInit(findPreviousOrNextCampaignId(campaignId));
  //       // 마지막으로 캠페인 정보 삭제
  //       fetchCampaignManagerDelete({
  //         ...campaignInfoDelete,
  //         campaign_id: tempCampaignManagerInfo.campaign_id,
  //         tenant_id: tempCampaignManagerInfo.tenant_id
  //       });
  //       setAlertState({
  //         ...errorMessage,
  //         isOpen: true,
  //         message: '작업이 완료되었습니다.',
  //         type: '2',
  //         onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
  //       });
  //     }
  //   },
  //   onError: (data) => {
  //     // 9)캠페인 예약 재발신 삭제 - 캠페인 재발신 정보 조회 후 삭제한다.
  //     //캠페인관리 화면 닫기.
  //     // setInit(0);
  //     setInit(findPreviousOrNextCampaignId(campaignId));
  //     setAlertState({
  //       ...errorMessage,
  //       isOpen: true,
  //       message: '작업이 완료되었습니다.',
  //       type: '2',
  //       onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
  //     });
  //   }
  // });

  // 재발신 삭제 API 호출
  // const { mutate: fetchAutoRedialDelete } = useApiForAutoRedialDelete({
  //   onSuccess: (data) => {
  //     // 마지막으로 캠페인 정보 삭제
  //     fetchCampaignManagerDelete({
  //       ...campaignInfoDelete,
  //       campaign_id: tempCampaignManagerInfo.campaign_id,
  //       tenant_id: tempCampaignManagerInfo.tenant_id
  //     });
  //     setInit(findPreviousOrNextCampaignId(campaignId));
  //   }
  // });

  // 발신번호 삭제 API 호출
  const { mutate: fetchCallingNumberDelete } = useApiForCallingNumberDelete({
    onSuccess: (data) => {      
      // setCallingNumberChangeYn(false);
    },
    onError: (error) => {
      ServerErrorCheck('발신번호 삭제', error.message);
    }
  });

  // 발신번호 추가 API 호출
  const { mutate: fetchCallingNumberInsert } = useApiForCallingNumberInsert({
    onSuccess: (data) => {
      // setCallingNumberChangeYn(false);
      // fetchCallingNumbers({ session_key: '', tenant_id: 0 });
    },
    onError: (error) => {
      ServerErrorCheck('발신번호 추가', error.message);
    }
  });

  // 발신번호 수정 API 호출
  const { mutate: fetchCallingNumberUpdate } = useApiForCallingNumberUpdate({
    onSuccess: (data) => {
      // setCallingNumberChangeYn(false);
      // fetchCallingNumbers({ session_key: '', tenant_id: 0 });
    },
    onError: (error) => {
      ServerErrorCheck('발신번호 수정', error.message);
    }
  });

  // 캠페인 상태 변경 API 호출
  const { mutate: fetchCampaignStatusUpdate } = useApiForCampaignStatusUpdate({
    onSuccess: (data) => {
      if(data.result_code === -1 && data.reason_code === -7771){
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: '발신리스트가 존재하지 않습니다. 발신리스트를 등록해주세요.',
          type: '2',
          onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
        });
      }
      else if (data.result_code === 0 || ( data.result_code === -1 && data.reason_code === -13 )) {
        // fetchCampaignManagerUpdate(tempCampaignManagerInfo);
        const todayTime = getCurrentFormattedTime();
        
        // 캠페인 상태 변경시 마스터도 수정해야 하는경우
        if(!campaignStatusUpdateCheck && !onlyCampaignStatusChange){
          fetchCampaignManagerUpdate(
            {
              ...tempCampaignManagerInfo
              , update_user: user_id
              , update_ip: Cookies.get('userHost')+''
              , update_time: todayTime
            }
          );
        }
        if (campaignSkillChangeYn) {
          if (tempCampaignSkills.skill_id[0] === 0) {
            fetchCampaignSkillUpdate({
              ...tempCampaignSkills,
              skill_id: []
            });
          } else {
            fetchCampaignSkillUpdate(tempCampaignSkills);
          }
        }
        if (campaignScheduleChangeYn) {
          if (tempCampaignSchedule.tenant_id === 0) {
            fetchCampaignScheduleInsert({ ...tempCampaignSchedule, tenant_id: tempCampaignManagerInfo.tenant_id });
          } else {
            fetchCampaignScheduleUpdate(tempCampaignSchedule);
          }
        }
        // if (callingNumberChangeYn) {
        //   const tempCallNumber = callingNumbers.filter((callingNumber) => callingNumber.campaign_id === campaignId)
        //     .map((data) => data.calling_number)
        //     .join(',');
        //   if (tempCallingNumberInfo.calling_number !== '' && tempCallNumber === '') {
        //     fetchCallingNumberInsert(tempCallingNumberInfo);
        //   } else if (tempCallingNumberInfo.calling_number === '' && tempCallNumber !== '') {
        //     fetchCallingNumberDelete(tempCallingNumberInfo);
        //   } else {
        //     fetchCallingNumberUpdate(tempCallingNumberInfo);
        //   }
        // }
        if (campaignDialSpeedChangeYn) {
          if (tempCampaignManagerInfo.dial_mode === 2 || tempCampaignManagerInfo.dial_mode === 3) {
            fetchDialSpeedUpdate(tempCampaignDialSpeedInfo);
          } else {
            fetchDialSpeedUpdate({
              ...tempCampaignDialSpeedInfo,
              dial_speed: 0
            });
          }
        }

        setOnlyCampaignStatusChange(false);
        setCampaignStatusUpdateCheck(true);

        // 캠페인 상태만 변경했을 경우
        

      // } else if (data.result_code != 200){
      //   setAlertState({
      //     ...errorMessage,
      //     isOpen: true,
      //     message: '캠페인 상태 변경 요청이 실패하였습니다. PDS 서버 시스템에 확인하여 주십시오.',
      //     type: '2',
      //     onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
      //   });
      } else {
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: CheckCampaignSaveReturnCode(data.reason_code, data.result_msg),
          type: '2',
          onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false })),
        });
        setTempCampaignsInfo({
          ...tempCampaignInfo,
          start_flag: oriCampaignManagerInfo.start_flag
        });
      }
    },
    onError: (error) => {
      ServerErrorCheck('캠페인 상태 변경', error.message);
    }
  });
  const goLogin = () => {
    logoutFunction();
    router.push('/login');
  };

  // 발신 속도 수정 API 호출
  const { mutate: fetchDialSpeedUpdate } = useApiForDialSpeedUpdate({
    onSuccess: (data) => {
      setCampaignDialSpeedChangeYn(false);
    },
    onError: (error) => {
      ServerErrorCheck('발신 속도 수정', error.message);
    }
  });

  // 발신번호 조회 API 호출
  // const { mutate: fetchCallingNumbers } = useApiForCallingNumber({
  //   onSuccess: (data) => {
  //     setCallingNumbers(data.result_data || []);
  //     setCallingNumberChangeYn(false);
  //   }
  // });

  // 새 캠페인 버튼 이벤트
  const handleNewCampaign = () => {
    setNewCampaignManagerInfo({} as CampaignInfoInsertRequest);
    setNewCampaignInfo({} as MainDataResponse);
    setNewTenantId('');
    setNewCampaignSchedule({} as CampaignScheDuleListDataResponse);
    const existingTabs = openedTabs.filter(tab => tab.id === 13);
    existingTabs.forEach(tab => {
      removeTab(tab.id, tab.uniqueKey);
    });
    const newTabKey = `13-${Date.now()}`;
    addTab({
      id: 13,
      uniqueKey: '13',
      title: '새 캠페인',
      icon: '',
      href: '',
      content: null,
    });
    setTimeout(function () {
      setActiveTab(13, newTabKey);
    }, 50);
  };

  // 리스트 적용 버튼 이벤트
  const handleListManager = () => {
    const existingTabs = openedTabs.filter(tab => tab.id === 7);
    existingTabs.forEach(tab => {
      removeTab(tab.id, tab.uniqueKey);
    });
    const newTabKey = `7-${Date.now()}`;
    addTab({
      id: 7,
      campaignId: campaignId + '',
      campaignName: tempCampaignInfo.campaign_name,
      uniqueKey: '7',
      title: '리스트 매니저',
      icon: '',
      href: '',
      content: null,
    });
    setTimeout(function () {
      setActiveTab(7, newTabKey);
    }, 50);
  };

  // 리스트 삭제 버튼 이벤트
  const handleListManagerDelete = () => {
    setAlertState({
      ...errorMessage,
      isOpen: true,
      message: '캠페인 아이디: ' + tempCampaignManagerInfo.campaign_id
        + '\n캠페인 이름: ' + tempCampaignManagerInfo.campaign_name
        + '\n\n 발신 리스트 삭제 시, 발신 리스트와 캠페인 진행 정보가 초기화됩니다.'
        + '\n삭제된 발신 리스트와 캠페인 진행 정보는 복구가 불가능합니다.'
        + '\n발신 리스트를 삭제하시겠습니까?',
      onClose: () => fetchCallingListDelete(campaignId),
      onCancel: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
    });
  };

  // 예약콜 제한건수설정 버튼 이벤트
  const handleReservedCall = () => {
    const existingTabs = openedTabs.filter(tab => tab.id === 8 || tab.id === 9 || tab.id === 11);
    // 한 탭으로 유지하기
    existingTabs.forEach(tab => {
      removeTab(tab.id, tab.uniqueKey);
    });
    const newTabKey = `8-${Date.now()}`;

    const newTab = {
      id: 8,
      campaignId: campaignId + '',
      campaignName: tempCampaignInfo.campaign_name,
      uniqueKey: newTabKey,
      title: '예약콜 제한 건수 설정',
      icon: '/header-menu/예약콜제한설정.svg',
      href: '/reserve',
      content: null,
    };

    addTab(newTab);

    const sectionId =
        rows[0].sections.find(sec =>
          sec.tabs.some(t => t.id === 8 || t.id === 9 || t.id === 11)
        )?.id ?? rows[0].sections[0].id;

    moveTabToSection(newTab.id, rows[0].id, sectionId, newTabKey);

    setTimeout(function () {
      setActiveTab(8, newTabKey);
    }, 50);
  };

  // 분배호수 제한설정 버튼 이벤트
  const handleMaxCall = () => {
    const existingTabs = openedTabs.filter(tab => tab.id === 8 || tab.id === 9 || tab.id === 11);
    existingTabs.forEach(tab => {
      removeTab(tab.id, tab.uniqueKey);
    });
    const newTabKey = `9-${Date.now()}`;

    const newTab = {
      id: 9,
      campaignId: campaignId + '',
      campaignName: tempCampaignInfo.campaign_name,
      uniqueKey: newTabKey,
      title: '분배 호수 제한 설정',
      icon: '/header-menu/분배호수제한설정.svg',
      href: '/distribute',
      content: null,
    };

    addTab(newTab);

    // 탭에 운영설정 관련 메뉴가 잇는지 확인 (없다면 default-1 있으면 section-1)
    const sectionId =
        rows[0].sections.find(sec =>
          sec.tabs.some(t => t.id === 8 || t.id === 9 || t.id === 11)
        )?.id ?? rows[0].sections[0].id;

    // console.log('sectionId : ',sectionId);

    moveTabToSection(newTab.id, rows[0].id, sectionId, newTabKey);

    setTimeout(function () {
      setActiveTab(9, newTabKey);
    }, 50);

  };

  // 재발신 버튼 이벤트
  const handleRebroadcast = () => {
    if (campaignIdForUpdateFromSideMenu == null || campaignIdForUpdateFromSideMenu === '') {
      setCampaignIdForUpdateFromSideMenu(campaignId + '');
    }
    setReBroadcastType('');
    const existingTabs = openedTabs.filter(tab => tab.id === 20);
    existingTabs.forEach(tab => {
      removeTab(tab.id, tab.uniqueKey);
    });
    const newTabKey = `20-${Date.now()}`;
    addTab({
      id: 20,
      campaignId: campaignId + '',
      campaignName: tempCampaignInfo.campaign_name,
      uniqueKey: '20',
      title: '재발신 설정',
      icon: '',
      href: '',
      content: null,
      params: {
        reBroadCastOption: 'campaign',
      }
    });
    setTimeout(function () {
      setActiveTab(20, newTabKey);
    }, 50);
  };

  useEffect(() => {
    if( environmentData ){ 
      setOfficeStartTime( environmentData.sendingWorkStartHours);
      setOfficeEndTime( environmentData.sendingWorkEndHours);
    }
  }, [environmentData]);
  
  return (
    <div className='flex flex-col gap-5 w-[58%]'>
      <div>
        <TitleWrap
          className='border-b border-gray-300 pb-1'
          title="상세 내역"
          buttons={
            menu_role_id === 1 ?
              selectedCampaign?.start_flag === 3 ?
                [
                  { label: "새 캠페인", onClick: () => handleNewCampaign() },
                  { label: "캠페인 삭제", onClick: () => handleCampaignDelete() },
                  { label: "재발신", onClick: () => handleRebroadcast(), variant: "customblue" },
                  { label: "리스트 적용", onClick: () => handleListManager(), variant: "customblue" },
                  { label: "리스트 삭제", onClick: () => handleListManagerDelete(), variant: "customblue" },
                  { label: "예약콜 제한 건수 설정", onClick: () => handleReservedCall(), variant: "customblue" },
                  { label: "분배 호수 제한 설정", onClick: () => handleMaxCall(), variant: "customblue" },
                ]
                :
                [
                  { label: "새 캠페인", onClick: () => handleNewCampaign() },
                  { label: "캠페인 삭제", onClick: () => handleCampaignDelete() },
                  { label: "재발신", onClick: () => handleRebroadcast(), variant: "customblue" },
                  { label: "리스트 적용", onClick: () => handleListManager(), variant: "customblue" },
                  { label: "예약콜 제한 건수 설정", onClick: () => handleReservedCall(), variant: "customblue" },
                  { label: "분배 호수 제한 설정", onClick: () => handleMaxCall(), variant: "customblue" },
                ]
              :
              menu_role_id === 2 ?
                selectedCampaign?.start_flag === 3 ?
                  [
                    { label: "새 캠페인", onClick: () => handleNewCampaign() },
                    { label: "캠페인 삭제", onClick: () => handleCampaignDelete() },
                    { label: "재발신", onClick: () => handleRebroadcast(), variant: "customblue" },
                    { label: "리스트 적용", onClick: () => handleListManager(), variant: "customblue" },
                    { label: "리스트 삭제", onClick: () => handleListManagerDelete(), variant: "customblue" },
                  ]
                  :
                  [
                    { label: "새 캠페인", onClick: () => handleNewCampaign() },
                    { label: "캠페인 삭제", onClick: () => handleCampaignDelete() },
                    { label: "재발신", onClick: () => handleRebroadcast(), variant: "customblue" },
                    { label: "리스트 적용", onClick: () => handleListManager(), variant: "customblue" },
                  ]
                :
                menu_role_id === 3 ?
                  [
                    { label: "새 캠페인", onClick: () => handleNewCampaign() },
                    { label: "캠페인 삭제", onClick: () => handleCampaignDelete() },
                    { label: "재발신", onClick: () => handleRebroadcast(), variant: "customblue" },
                  ]
                  :
                  selectedCampaign?.start_flag === 3 ?
                    [
                      { label: "새 캠페인", onClick: () => handleNewCampaign() },
                      { label: "캠페인 삭제", onClick: () => handleCampaignDelete() },
                      { label: "재발신", onClick: () => handleRebroadcast(), variant: "customblue" },
                      { label: "리스트 적용", onClick: () => handleListManager(), variant: "customblue" },
                      { label: "리스트 삭제", onClick: () => handleListManagerDelete(), variant: "customblue" },
                      { label: "예약콜 제한 건수 설정", onClick: () => handleReservedCall(), variant: "customblue" },
                      { label: "분배 호수 제한 설정", onClick: () => handleMaxCall(), variant: "customblue" },
                    ]
                    :
                    [
                      { label: "새 캠페인", onClick: () => handleNewCampaign() },
                      { label: "캠페인 삭제", onClick: () => handleCampaignDelete() },
                      { label: "재발신", onClick: () => handleRebroadcast(), variant: "customblue" },
                      { label: "리스트 적용", onClick: () => handleListManager(), variant: "customblue" },
                      { label: "예약콜 제한 건수 설정", onClick: () => handleReservedCall(), variant: "customblue" },
                      { label: "분배 호수 제한 설정", onClick: () => handleMaxCall(), variant: "customblue" },
                    ]
          }
        />
        <div className="grid grid-cols-3 gap-x-[26px] gap-y-2">
          <div className='flex items-center gap-2'>
            <Label className="w-[90px] min-w-[90px]">캠페인 아이디</Label>
            <CustomInput
              type="number"
              value={tempCampaignInfo.campaign_id === 0 ? 0 :campaignId}
              onChange={(e) => handleInputData(e.target.value, 'campaign_id')}
              disabled={true}
              isFullWidth={true}
            />
          </div>
          <div className='flex items-center gap-2'>
            <Label className="w-[74px] min-w-[74px]">테넌트</Label>
            <Select
              onValueChange={(value) => handleSelectChange(value, 'tenant')}
              value={tempCampaignInfo.tenant_id + '' || ''}
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
            <Label className="w-[74px] min-w-[74px]">캠페인 명</Label>
            <CustomInput
              value={tempCampaignInfo.campaign_name || ''}
              onChange={(e) => handleInputData(e.target.value, 'campaign_name')}
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
          <div className='flex items-center gap-2 relative'>
            <Label className="w-[74px] min-w-[74px]">스킬</Label>
            <CustomInput value={tempCampaignInfo.campaign_id === 0 ? '' :inputSkills} readOnly />
            <button className="absolute right-2 top-[52%] transform -translate-y-1/2 ml-2">
              <Image
                src="/skill-popup.svg"
                alt="스킬팝업"
                width={12}
                height={12}
                priority
                onClick={() =>
                  setSkillPopupState({
                    ...skillPopupState,
                    isOpen: true,
                  })
                }
              />
            </button>
          </div>
          <div className='flex items-center gap-2'>
            <Label className="w-[74px] min-w-[74px]">발신번호</Label>
            <CustomInput value={tempCampaignInfo.campaign_id === 0 ? '' :inputCallingNumber} className="w-full" disabled={selectedCampaign !== null} readOnly 

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
            <Label className="w-[90px] min-w-[90px]">설명</Label>
            <CustomInput
              value={tempCampaignInfo.campaign_desc || ''}
              className="w-full"
              onChange={(e) => handleInputData(e.target.value, 'campaign_desc')}
            />
          </div>
          {/* <div>
            <Button onClick={()=> testFunction(campaignId)}>test</Button>
          </div> */}
        </div>
      </div>
      <div>
        <CampaignTab
          campaignSchedule={tempCampaignSchedule}
          callCampaignMenu={'CampaignManager'}
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
        tenantId={tempCampaignInfo.tenant_id||-1}
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
        onClose={() => { alertState.onClose() }}
        onCancel={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
      />
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
