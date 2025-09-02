"use client";

import { useAuthStore, useCampainManagerStore, useMainStore } from "@/store";
import { useApiForCampaignScheduleDelete } from "../hooks/useApiForCampaignScheduleDelete";
import {
    CampaignSkillUpdateRequest,
    CallingNumberListDataResponse,
    CampaignInfoDeleteRequest,
    MaxcallExtDeleteRequest
  } from '@/features/campaignManager/types/campaignManagerIndex';
import { useApiForCampaignSkillUpdate } from "../hooks/useApiForCampaignSkillUpdate";
import { useApiForCallingNumberDelete } from "../hooks/useApiForCallingNumberDelete";
import { useApiForReservedCallDelete } from "../hooks/useApiForReservedCallDelete";
import { useApiForCampaignAgent } from "../hooks/useApiForCampaignAgent";
import { useApiForMaxcallExtDelete } from "../hooks/useApiForMaxcallExtDelete";
import { useApiForAutoRedial } from "../hooks/useApiForAutoRedial";
import { useApiForCampaignManagerDelete } from "../hooks/useApiForCampaignManagerDelete";
import { useApiForAutoRedialDelete } from "../hooks/useApiForAutoRedialDelete";


const campaignInfoDelete: CampaignInfoDeleteRequest = {
  campaign_id: 0,
  tenant_id: 0,
  delete_dial_list: 1
};

const CampaignSkillInfo: CampaignSkillUpdateRequest = {
  campaign_id: 0,
  skill_id: [],
};

const CallingNumberInfo: CallingNumberListDataResponse = {
  campaign_id: 0,
  calling_number: ''
};

const agientListDelte: MaxcallExtDeleteRequest = {
    campaign_id: 0,
    agent_id_list: []
};


// 캠페인 삭제 핼퍼 함수
export const useDeleteCampaignHelper = () => {

    const { callingNumbers, campaignSkills } = useCampainManagerStore();
    const { tenant_id, session_key } = useAuthStore();
    const { setCampaigns, campaigns } = useMainStore();

    // 해당 캠페인의 이전인덱스나 다음인덱스 캠페인 아이디 구하기
    const findPreviousOrNextCampaignId = (tenantId: number, campaignId: number): number => {

      // 초기값 
      const returnCampaignId = 0;

      // 같은 테넌트 캠페인 구하기
      const filteredCampaigns = campaigns.filter(data => data.tenant_id === tenantId);

      // 해당 테넌트 캠페인중 삭제될 캠페인의 index 구하기
      const currentCampaignIndex = filteredCampaigns.findIndex(data => data.campaign_id === campaignId);
  
      // 존재하지않는다면 초기값 반환
      if (currentCampaignIndex === -1) return returnCampaignId;
  
      // 이전 인덱스 캠페인 아이디 구하기
      const previousCampaignId = filteredCampaigns[currentCampaignIndex - 1]?.campaign_id;

      // 다음 인덱스 캠페인 아이디 구하기
      const nextCampaignId = filteredCampaigns[currentCampaignIndex + 1]?.campaign_id;
  
      // 이전 캠페인아이디가 있으면 이전 캠페인, 없으면 다음 캠페인 아이디 반환
      if (previousCampaignId || nextCampaignId) {
        const tempCampaigns = campaigns.filter(data => data.campaign_id !== campaignId);
        setCampaigns(tempCampaigns);
  
        return previousCampaignId || nextCampaignId;
      }

      return returnCampaignId;
    };


    // 캠페인 스킬이 있다면 초기화
    const { mutateAsync: fetchCampaignSkillUpdate } = useApiForCampaignSkillUpdate({
        onSuccess: (data) => {

        },
        onError: (error) => {
            // console.error('캠페인 스킬 업데이트 실패:', error);
        }
    });

    // 발신번호가 있다면 삭제
    const { mutateAsync: fetchCallingNumberDelete } = useApiForCallingNumberDelete({
        onSuccess: (data) => {
            
        },
        onError: (error) => {
            // console.error('발신번호 삭제 실패:', error);
        }
    });

    // 캠페인 스케줄 삭제
    const { mutateAsync: fetchCampaignScheduleDelete } = useApiForCampaignScheduleDelete({
        onSuccess: (data) => {
            
        },
        onError: (error) => {
            // console.error('캠페인 스케줄 삭제 실패:', error);
            if (error.message.split('||')[0] === '5') {
                throw new Error('SESSION_EXPIRED');
            }
            throw error; 
        }
    });

    // 예약콜 삭제
    const { mutateAsync: fetchReservedCallDelete } = useApiForReservedCallDelete({
        onSuccess: (data) => {
            
        },
        onError: (error) => {
            // console.error('예약콜 삭제 실패:', error);
        }
    });

    // 캠페인 상담사 조회
    const { mutateAsync: fetchCampaignAgents } = useApiForCampaignAgent({
        onSuccess: (data) => {
            
        },
        onError: (error) => {
            // console.error('캠페인 상담사 조회 실패:', error);
        }
    });

    // 캠페인 상담사 조회 후 삭제
    const { mutateAsync: fetchMaxcallExtDelete } = useApiForMaxcallExtDelete({
        onSuccess: (data) => {
            
        },
        onError: (error) => {
            // console.error('분배제한 정보 삭제 실패:', error);
        }
    });

    // 재발신 조회
    const { mutateAsync: fetchAutoRedials } = useApiForAutoRedial({
        onSuccess: (data) => {
            
        },
        onError: (error) => {
            // console.error('재발신 정보 조회 실패:', error);
        }
    });

    // 재발신 조회 후 삭제
    const { mutateAsync: fetchAutoRedialDelete } = useApiForAutoRedialDelete({
        onSuccess: (data) => {
            
        },
        onError: (error) => {
            // console.error('재발신 삭제 실패:', error);
        }
    });

    // 캠페인 정보 삭제 (가장 마지막)
    const { mutateAsync: fetchCampaignManagerDelete } = useApiForCampaignManagerDelete({
        onSuccess: (data) => {
            
        },
        onError: (error) => {
            // console.error('캠페인 정보 삭제 실패:', error);
        }
    });
  
    const commonDeleteCampaign = async (tenantId: number, campaignId: number): Promise<number> => {

        // 다음 index 아이디 구하기
        const nextId = findPreviousOrNextCampaignId(tenantId, campaignId);
  
        try {
            // 캠페인 스케줄 삭제
            await fetchCampaignScheduleDelete({
                ...campaignInfoDelete,
                campaign_id: campaignId,
                tenant_id: tenantId
            });
    
            // 캠페인 스킬 업데이트
            const tempSkill = campaignSkills.filter(skill => skill.campaign_id === campaignId)
            .map(skill => skill.skill_id).join(',');
    
            if (tempSkill !== '') {
                await fetchCampaignSkillUpdate({
                    ...CampaignSkillInfo,
                    campaign_id: campaignId,
                    skill_id: [],
                });
            }
    
            // 발신번호 삭제
            const tempCallNumber = callingNumbers.filter(callingNumber => callingNumber.campaign_id === campaignId)
            .map(callingNumber => callingNumber.calling_number).join(',');
    
            if (tempCallNumber !== '') {
                await fetchCallingNumberDelete({
                    ...CallingNumberInfo,
                    campaign_id: campaignId,
                    calling_number: tempCallNumber,
                });
            }
    
            // 예약콜 삭제
            await fetchReservedCallDelete({
                ...campaignInfoDelete,
                campaign_id: campaignId,
                tenant_id: tenantId
            });
    
            // 상담사 조회 및 분배제한 할당 삭제
            const agentData = await fetchCampaignAgents({
                ...agientListDelte,
                campaign_id: campaignId,
            });
            if (agentData?.result_data[0]?.agent_id?.length > 0) {
                await fetchMaxcallExtDelete({
                    ...agientListDelte,
                    campaign_id: campaignId,
                    agent_id_list: agentData.result_data[0].agent_id.map(id => ({ agent_id: id }))
                });
            }

            // 예약 재발신 조회 및 삭제
            const redialData = await fetchAutoRedials({ session_key: session_key,
                tenant_id: tenant_id,
                campaign_id: campaignId,
            });
            if (redialData?.result_data?.[0]?.sequence_number) {
                await fetchAutoRedialDelete({
                    campaign_id: campaignId,
                    sequence_number: redialData.result_data[0].sequence_number
                });
            }
    
            // 캠페인 정보 삭제
            await fetchCampaignManagerDelete({
                ...campaignInfoDelete,
                campaign_id: campaignId,
                tenant_id: tenantId,
            });
    
            return nextId;


        } catch (e : any) {
            // console.error('캠페인 삭제 중 오류 발생:', e);
            if (e.message === 'SESSION_EXPIRED') {
                throw e;
            }
            
            return 0;
        }
    };
    
    return {
        commonDeleteCampaign,            
    };

        
  };