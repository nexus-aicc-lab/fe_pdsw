// src/features/campaignManager/hooks/fetchCampaignManagerUpdate.ts
import { axiosInstance } from '@/lib/axios';
import { CampaignInfoUpdateRequest, UpdateResponse } from '../types/campaignManagerIndex';

// 캠페인 관리 수정 요청
export const fetchCampaignManagerUpdate = async (credentials: CampaignInfoUpdateRequest): Promise<UpdateResponse> => {

  const campaignManagerUpdateRequestData = {
    request_data: {      
      campaign_name: credentials.campaign_name, 
      campaign_desc: credentials.campaign_desc,
      site_code: credentials.site_code,
      service_code: credentials.service_code,
      start_flag: credentials.start_flag,
      end_flag: credentials.end_flag,
      dial_mode: credentials.dial_mode,
      callback_kind: credentials.callback_kind,
      delete_flag: credentials.delete_flag,
      list_count: credentials.list_count,
      list_redial_query: credentials.list_redial_query,
      next_campaign: credentials.next_campaign,
      token_id: credentials.token_id,
      phone_order: credentials.phone_order,
      phone_dial_try1: credentials.phone_dial_try1,
      phone_dial_try2: credentials.phone_dial_try2,
      phone_dial_try3: credentials.phone_dial_try3,
      phone_dial_try4: credentials.phone_dial_try4,
      phone_dial_try5: credentials.phone_dial_try5,
      dial_try_interval: credentials.dial_try_interval,
      trunk_access_code: credentials.trunk_access_code,
      DDD_code: credentials.DDD_code,
      power_divert_queue: credentials.power_divert_queue,
      max_ring: credentials.max_ring,
      detect_mode: credentials.detect_mode,
      auto_dial_interval: credentials.auto_dial_interval,
      creation_user: credentials.creation_user,
      creation_time: credentials.creation_time,
      creation_ip: credentials.creation_ip,
      update_user: credentials.update_user,
      update_time: credentials.update_time,
      update_ip: credentials.update_ip,
      dial_phone_id: credentials.dial_phone_id,
      tenant_id: credentials.tenant_id,
      alarm_answer_count: credentials.alarm_answer_count,
      dial_speed: credentials.dial_speed,
      parent_campaign: credentials.parent_campaign,
      overdial_abandon_time: credentials.overdial_abandon_time,
      list_alarm_count: credentials.list_alarm_count,
      supervisor_phone: credentials.supervisor_phone,
      reuse_count: credentials.reuse_count,
      use_counsel_result: credentials.use_counsel_result,
      use_list_alarm: credentials.use_list_alarm,
      redial_strategy1: credentials.redial_strategy1,
      redial_strategy2: credentials.redial_strategy2,
      redial_strategy3: credentials.redial_strategy3,
      redial_strategy4: credentials.redial_strategy4,
      redial_strategy5: credentials.redial_strategy5,
      dial_mode_option: credentials.dial_mode_option,
      user_option: credentials.user_option,
      customer_char_id: credentials.customer_char_id,
      counsel_script_id: credentials.counsel_script_id,
      announcement_id: credentials.announcement_id,
      campaign_level: credentials.campaign_level,
      outbound_sequence: credentials.outbound_sequence,
      channel_group_id: credentials.channel_group_id
    }
  };

  try {
    const { data } = await axiosInstance.put<UpdateResponse>(
      'campaigns/'+credentials.campaign_id, 
      campaignManagerUpdateRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};