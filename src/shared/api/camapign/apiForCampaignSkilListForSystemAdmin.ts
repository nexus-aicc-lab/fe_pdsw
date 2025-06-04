import { axiosInstance } from "@/lib/axios";

// 📌 캠페인 스킬 항목 타입
export interface CampaignSkillItemForSystemAdmin {
  skill_id: number;
  tenant_id: number;
  name?: string;
  campaign_id?: number | number[]; // Allow for both single ID or array of IDs
  description?: string;
}

// 📌 요청 타입
export interface IRequestTypeForCampaignSkillListForSystemAdmin {
  filter?: {
    skill_id?: {
      start: number;
      end: number;
    };
    tenant_id?: number[];
  };
  sort?: {
    skill_id?: number; // 0: 오름차순, 1: 내림차순
    tenant_id?: number; // 0: 오름차순, 1: 내림차순
  };
  page: {
    index: number;
    items: number;
  };
}

// 📌 응답 타입
export interface IResponseTypeForCampaignSkillListForSystemAdmin {
  result_code: number;
  result_msg: string;
  result_count?: number;
  total_count?: number;
  result_data: CampaignSkillItemForSystemAdmin[];
}

// 📌 기본 요청 값
const defaultRequest: IRequestTypeForCampaignSkillListForSystemAdmin = {
  // filter: {
  //   skill_id: {
  //     start: 1,
  //     end: 9999999
  //   }
  // },
  sort: {
    skill_id: 0
  },
  page: {
    index: 1,
    items: 10
  }
};

// 📌 API 호출 함수
export const apiForCampaignSkillListForSystemAdmin = async (
  request: Partial<IRequestTypeForCampaignSkillListForSystemAdmin> = {}
): Promise<IResponseTypeForCampaignSkillListForSystemAdmin> => {
  const finalRequest: IRequestTypeForCampaignSkillListForSystemAdmin = {
    ...defaultRequest,
    ...request,
    filter: {
      ...defaultRequest.filter,
      ...request.filter,
    },
    sort: {
      ...defaultRequest.sort,
      ...request.sort,
    },
    page: {
      ...defaultRequest.page,
      ...request.page,
    },
  };

  const response = await axiosInstance.post<IResponseTypeForCampaignSkillListForSystemAdmin>(
    "collections/skill-campaign",
    finalRequest
  );

  return response.data;
};