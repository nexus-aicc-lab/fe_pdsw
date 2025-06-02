"use client";

import { CampaignInfoUpdateRequest } from '@/features/campaignManager/types/campaignManagerIndex';
import { MainDataResponse } from '@/features/auth/types/mainIndex';

export const CampaignManagerInfo: CampaignInfoUpdateRequest = {
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

export const UpdataCampaignInfo = (campaigns:MainDataResponse[], campaignId:number,startFlag:number) => {
  const selectedCampaign = campaigns.filter(data => data.campaign_id === campaignId)[0];
  return {
    ...CampaignManagerInfo,
    campaign_id: selectedCampaign.campaign_id,
    campaign_name: selectedCampaign.campaign_name,
    campaign_desc: selectedCampaign.campaign_desc,
    site_code: selectedCampaign.site_code,
    service_code: selectedCampaign.service_code,
    start_flag: startFlag,    
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
  };
};

//캠페인 상태 변경 에러 코드.
export  const CheckCampaignSaveReturnCode = (reasonCode: number, resultMsg: string) => {
    if (reasonCode === -1) {
      return 'DataBase 데이터 처리 중 문제가 발생 하였습니다.';
    } else if (reasonCode === -3) {
      return '상담사과 고객이 통화 중이라 캠페인 통계가 완료되지 않았습니다. \n잠시만 기다려주세요.';
    } else if (reasonCode === -10) {
      return '에러사항에 대해서 관리자에게 문의 하세요.';
    } else if (reasonCode === -15) {
      return '업무 외 시간으로 캠페인을 시작 할 수 없습니다. 캠페인 시작을 원하시면 발신 업무 시간을 변경 하십시오.';
    } else if (reasonCode === -16) {
      return '상담사과 고객이 통화 중이라 캠페인 통계가 완료되지 않았습니다. \n잠시만 기다려주세요.';
    } else if (reasonCode === -7770) {
      return '리스트 파일이 존재 하지 않습니다.';
    } else if (reasonCode === -7771) {
      return '발신 할 레코드가 존재 하지 않습니다.';
    } else if (reasonCode === -7772) {
      return '발신 순서가 없습니다.';
    } else if (reasonCode === -7773) {
      return '캠페인 시작/종료 날짜를 확인해 주시기 바랍니다.';
    } else if (reasonCode === -7774) {
      return '응대할 상담사가 없으므로 시작이 취소되었습니다.';
    } else if (reasonCode === -7775) {
      return '발신 할 트렁크가 없습니다.';
    } else if (reasonCode === -7776) {
      return '캠페인에 할당된 상담사가 없습니다.';
    } else if (reasonCode === -7777) {
      return 'CIDS가 작동중 인지 확인 하세요.에러사항에 대해서 관리자에게 문의 하세요.';
    } else if (reasonCode === -7778) {
      return '발신할 채널이 할당이 되어 있지 않습니다.';
    } else if (reasonCode === -8000) {
      return '캠페인이 상태 변경 중이므로, 캠페인을 시작할 수 없습니다.';
    } else if (reasonCode === -8001) {
      return '무한콜백 캠페인에서만 발생. UserOption Data(limit)가 있다.';
    } else if (reasonCode === -10001) {
      return '캠페인 데이터 저장공간이 남아 있지 않습니다. 관리자에게 문의 하세요.';
    } 
    else if (resultMsg) {
      return `${resultMsg} (${reasonCode}) 에러 발생. 관리자에게 문의 하세요.`
    }
    else {
      return `${reasonCode} 에러 발생. 관리자에게 문의 하세요.`
    }
  }