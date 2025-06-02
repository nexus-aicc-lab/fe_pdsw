// src/shared/api/campaign/apiForCampaignListForSystemAdmin.ts

import { axiosInstance } from "@/lib/axios";

// 📌 캠페인 항목 타입
export interface CampaignItemForSystemAdmin {
  campaign_id: number;
  campaign_name: string;
  campaign_desc: string;
  tenant_id: number;
}

// 📌 요청 타입
export interface CampaignListRequestForSystemAdmin {
  filter: {
    tenant_id: {
      start: number;
      end: number;
    };
  };
  sort: {
    tenant_id: number; // 0: 오름차순, 1: 내림차순
  };
  page: {
    index: number;
    items: number;
  };
}

// 📌 응답 타입
export interface CampaignListResponseForSystemAdmin {
  result_code: number;
  result_msg: string;
  result_count?: number;
  total_count?: number;
  result_data: CampaignItemForSystemAdmin[];
}

// 📌 기본 요청 값
const defaultRequest: CampaignListRequestForSystemAdmin = {
  filter: {
    tenant_id: {
      start: 0,
      end: 99,
    },
  },
  sort: {
    tenant_id: 0,
  },
  page: {
    index: 1,
    items: 10,
  },
};

// 📌 API 호출 함수
export const apiForCampaignListForSystemAdmin = async (
  request: Partial<CampaignListRequestForSystemAdmin> = {}
): Promise<CampaignListResponseForSystemAdmin> => {
  const finalRequest: CampaignListRequestForSystemAdmin = {
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

  const response = await axiosInstance.post<CampaignListResponseForSystemAdmin>(
    "/collections/campaign-list",
    finalRequest
  );

  return response.data;
};
