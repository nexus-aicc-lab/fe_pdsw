import { axiosInstance } from "@/lib/axios";
import { CampaignListResponse, CampaignSkillListResponse, CampaignSkillUpdateRequest, CreateSkillCredentials, DeleteAgentSkillCredentials, DeleteSkillCredentials, SkillAgentListResponse, SkillCampaignListResponse, SkillListCredentials, SkillListResponse, SuccesResponse } from "../types/SystemPreferences";

// 스킬 마스터 리스트 조회 API
export const fetchSkillList = async (credentials: SkillListCredentials): Promise<SkillListResponse> => {
    const SkillListRequestData = {
        filter: {
            
            tenant_id: credentials.tenant_id_array
        },
        sort: {
            skill_id: 0,
            tenant_id: 0
        },

    };

    try {
        const { data } = await axiosInstance.post<SkillListResponse>(
            '/collections/skill',
            SkillListRequestData
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
};

// 스킬 마스터 신규 등록 API(POST)
export const createSkill = async (credentials: CreateSkillCredentials): Promise<SuccesResponse> => {
    const request_data = {
        request_data: {
            tenant_id: credentials.tenant_id,
            skill_name: credentials.skill_name,
            skill_description: credentials.skill_description
        }
    };

    try {
        const { data } = await axiosInstance.post<SuccesResponse>(
            'skills/' + credentials.skill_id,
            request_data
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
};

// 스킬 마스터 수정 API(PUT)
export const UpdateSkill = async (credentials: CreateSkillCredentials): Promise<SuccesResponse> => {
    const request_data = {
        request_data: {
            tenant_id: credentials.tenant_id,
            skill_name: credentials.skill_name,
            skill_description: credentials.skill_description
        }
    };

    try {
        const { data } = await axiosInstance.put<SuccesResponse>(
            'skills/' + credentials.skill_id,
            request_data
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
};

// 스킬 마스터 삭제 API(delete)
export const DeleteSkill = async (credentials: DeleteSkillCredentials): Promise<SuccesResponse> => {
    try {
        const { data } = await axiosInstance.delete<SuccesResponse>(
            `skills/${credentials.skill_id}`,
            {
                data: {
                    request_data: {
                        skill_name: credentials.skill_name
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
};

// 스킬 할당 캠페인 조회
export const fetchskillCampaignList = async() : Promise<SkillCampaignListResponse> => {
    const skillCampaignListRequestData = {

        sort: {
            skill_id: 0
        },
        
    };

    try {
        const { data } = await axiosInstance.post<SkillCampaignListResponse>(
            '/collections/skill-campaign',
            skillCampaignListRequestData
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
};


// 스킬 할당 상담사 조회
export const fetchSkillAgentList = async(): Promise<SkillAgentListResponse> => {
    const skillAgentListRequestData = {

        sort: {
            skill_id: 0
        },

    };

    try {
        const { data } = await axiosInstance.post<SkillAgentListResponse>(
            '/collections/skill-agent',
            skillAgentListRequestData
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
};

// 캠페인 정보 조회 API
export const fetchCampaignList = async (): Promise<CampaignListResponse> => {
    const campaignListRequestData = {

        sort: {
            campaign_id: 0,
        },

    };

    try {
        const { data } = await axiosInstance.post<CampaignListResponse>(
            '/collections/campaign',
            campaignListRequestData
        );
        return data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
    }
};

// 선택 상담사 스킬할당 해제 API(DELETE)
export const DeleteAgentSkill = async (credentials: DeleteAgentSkillCredentials): Promise<SuccesResponse> => {
    try {
        const { data } = await axiosInstance.delete<SuccesResponse>(
            `skills/${credentials.skill_id}/agent-list`,
            {
                data: {
                    request_data: {
                        agent_id: credentials.agent_id
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
};

// 캠페인 스킬 수정 요청
export const fetchCampaignSkillUpdate = async (credentials: CampaignSkillUpdateRequest): Promise<SuccesResponse> => {
    const campaignSkillListSearchRequestData = {
        request_data: {      
          skill_id: credentials.skill_id, 
        }
      };
    
      try {
        const { data } = await axiosInstance.put<SuccesResponse>(
          'campaigns/'+credentials.campaign_id+'/skill', 
          campaignSkillListSearchRequestData
        );
        return data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
      }
    };

// 캠페인별스킬 리스트 요청
export const fetchCampaignSkills = async (): Promise<CampaignSkillListResponse> => {
  const campaignSkillListSearchRequestData = {

    sort: {
      campaign_id: 0,
    },

  };

  try {
    const { data } = await axiosInstance.post<CampaignSkillListResponse>(
      '/collections/campaign-skill', 
      campaignSkillListSearchRequestData
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};