import { axiosInstance } from "@/lib/axios";

// 📌 캠페인 그룹 항목 타입
export interface CampaignGroupItemForSystemAdmin {
  tenant_id: number;
  group_id: number;
  group_name: string;
}

// 📌 요청 타입
export interface IRequestTypeForCampaignGroupForSystemAdmin {
  filter: {
    group_id?: number[];
    tenant_id?: number[];
  };
  sort?: {
    group_id?: number; // 0: 오름차순, 1: 내림차순
    tenant_id?: number; // 0: 오름차순, 1: 내림차순
  };
  page: {
    index: number;
    items: number;
  };
}

// 📌 응답 타입
export interface IResponseTypeForCampaignGroupForSystemAdmin {
  result_code: number;
  result_msg: string;
  result_count?: number;
  total_count?: number;
  result_data: CampaignGroupItemForSystemAdmin[];
}

// 📌 기본 요청 값
const defaultRequest: IRequestTypeForCampaignGroupForSystemAdmin = {
  filter: {
    group_id: [1]
  },
  sort: {
    group_id: 0
  },
  page: {
    index: 1,
    items: 10
  }
};

// 📌 API 호출 함수
export const apiForGetCampaignGroupForSystemAdmin = async (
  request: Partial<IRequestTypeForCampaignGroupForSystemAdmin> = {}
): Promise<IResponseTypeForCampaignGroupForSystemAdmin> => {
  const finalRequest: IRequestTypeForCampaignGroupForSystemAdmin = {
    filter: request.filter
      ? { ...defaultRequest.filter, ...request.filter }
      : undefined,
    sort: request.sort
      ? { ...defaultRequest.sort, ...request.sort }
      : undefined,
  } as IRequestTypeForCampaignGroupForSystemAdmin;

  const response = await axiosInstance.post<IResponseTypeForCampaignGroupForSystemAdmin>(
    "collections/campaign-group",
    finalRequest
  );

  return response.data;
};