import { SuccesResponse, SuspendedCampaignListResponse, SuspendedSkillListResponse } from "../types/SystemPreferences";
import { axiosInstance } from "@/lib/axios";

// 서스펜드 캠페인 조회
export const fetchSuspendedCampaignList = async (): Promise<SuspendedCampaignListResponse> => {
    const suspendedCampaignRequestData = {
        filter: {
            "tenant_id": [1],
        }
    };

    try {
        const { data } = await axiosInstance.post<SuspendedCampaignListResponse>(
            '/collections/suspended-campaign',
            suspendedCampaignRequestData
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
}

// 서스펜드 캠페인 삭제
export const fetchDeleteSuspendedCampaign = async (campaign_id: number): Promise<SuccesResponse> => {
    try {
        const { data } = await axiosInstance.delete<SuccesResponse>(
            '/suspended-campaign',
            { 
                data: {
                    request_data: {
                        campaign_id: campaign_id
                    }
                }
            }
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
}

// 서스펜드 스킬 조회
export const fetchSuspendedSkillList = async (): Promise<SuspendedSkillListResponse> => {
    const suspendedSkillRequestData = {
        filter: {
            "tenant_id": [1],
        }
    };

    try {
        const { data } = await axiosInstance.post<SuspendedSkillListResponse>(
            '/collections/suspended-skill',
            suspendedSkillRequestData
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
}

// 서스펜드 스킬 삭제
export const fetchDeleteSuspendedSkill = async (skill_id: number): Promise<SuccesResponse> => {
    try {
        const { data } = await axiosInstance.delete<SuccesResponse>(
            '/suspended-skill',
            { 
                data: {
                    request_data: {
                        skill_id: skill_id
                    }
                }
            }
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
}