// src/features/campaignManager/hooks/useApiForCampaignManagerInsert.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCampaignManagerInsert  } from '../api/mainCampaignManagerInsert';
import { UseMutationOptions } from '@tanstack/react-query';
import { CampaignInsertResponse, CampaignApiError } from '../types/campaignManagerIndex';

// 캠페인정보 등록 요청 데이터 타입
export interface CampaignInfoInsertRequest {
  campaign_id: number;
  campaign_name: string;
  campaign_desc: string;
  site_code: number;
  service_code: number;
  start_flag: number;
  end_flag: number;
  dial_mode: number;
  callback_kind: number;
  delete_flag: number;
  list_count: number;
  list_redial_query: string;
  next_campaign: number;
  token_id: number;
  phone_order: string;
  phone_dial_try1: number;
  phone_dial_try2: number;
  phone_dial_try3: number;
  phone_dial_try4: number;
  phone_dial_try5: number;
  dial_try_interval: number;  
  trunk_access_code: string;
  DDD_code: string;
  power_divert_queue: string;
  max_ring: number;
  detect_mode: number;
  auto_dial_interval: number;
  creation_user: string;
  creation_time: string;
  creation_ip: string;
  update_user: string;
  update_time: string;
  update_ip: string;
  dial_phone_id: number;
  tenant_id: number;
  alarm_answer_count: number;
  dial_speed: number;
  parent_campaign: number;
  overdial_abandon_time: number;
  list_alarm_count: number;
  supervisor_phone: string;
  reuse_count: number;
  use_counsel_result: number;
  use_list_alarm: number;
  redial_strategy1: string;
  redial_strategy2: string;
  redial_strategy3: string;
  redial_strategy4: string;
  redial_strategy5: string;  
  dial_mode_option: number;
  user_option: string;  
  customer_char_id: number;
  counsel_script_id: number;
  announcement_id: number;
  campaign_level: number;
  outbound_sequence: string;
  channel_group_id: number;
}

export function useApiForCampaignManagerInsert(
  options?: UseMutationOptions<CampaignInsertResponse, CampaignApiError, CampaignInfoInsertRequest>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['mainCampaignManagerInsert'],
    mutationFn: fetchCampaignManagerInsert,
    onSuccess: (data, variables, context) => {
      
      options?.onSuccess?.(data, variables, context);

      queryClient.invalidateQueries({ queryKey: ['treeMenuDataForSideMenu'] });
    },
    onError: (error: CampaignApiError, variables: CampaignInfoInsertRequest, context: unknown) => {
      options?.onError?.(error, variables, context);
    },
  });
}
