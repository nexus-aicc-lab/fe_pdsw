import { axiosInstance } from "@/lib/axios";

export interface SkillItemForSystemAdmin {
  tenant_id: number;
  skill_id: number;
  skill_name: string;
  skill_description: string;
}

export interface SkillListResponseForSystemAdmin {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: SkillItemForSystemAdmin[];
}

export interface SkillListRequestForSystemAdmin {
  filter?: {
    skill_id?: {
      start: number;
      end: number;
    };
    tenant_id: number[];
  };
  sort?: {
    skill_id: number;
    tenant_id: number;
  };
  page?: {
    index: number;
    items: number;
  };
}

// 기본 요청 구조 (선택값은 Partial 처리로 finalRequest 조립 시 사용)
const defaultSkillListRequest: Required<Omit<SkillListRequestForSystemAdmin, 'filter'>> = {
  sort: {
    skill_id: 0,
    tenant_id: 0,
  },
  page: {
    index: 1,
    items: 10,
  },
};

// API 호출 함수
export const apiForGetSkillListForSystemAdmin = async (
  request: Partial<SkillListRequestForSystemAdmin>
): Promise<SkillListResponseForSystemAdmin> => {
  const finalRequest: any = {
    sort: {
      ...defaultSkillListRequest.sort,
      ...request?.sort,
    },
    page: {
      ...defaultSkillListRequest.page,
      ...request?.page,
    },
  };

  // filter가 존재할 경우에만 포함
  if (request?.filter) {
    finalRequest.filter = {
      ...request.filter,
    };
  }

  const response = await axiosInstance.post<SkillListResponseForSystemAdmin>(
    "collections/skill",
    finalRequest
  );

  return response.data;
};
