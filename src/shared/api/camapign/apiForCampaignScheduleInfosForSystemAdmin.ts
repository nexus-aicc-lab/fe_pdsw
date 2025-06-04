// C:\nproject\fe_pdsw2\src\shared\api\camapign\apiForCampaignScheduleInfosForSystemAdmin.ts
import { axiosInstance } from "@/lib/axios";

// 📌 캠페인 스케줄 정보 타입
export interface CampaignScheduleInfoForSystemAdmin {
  campaign_id: number;
  tenant_id: number;
  start_date: string;
  end_date: string;
  start_time: string[];
  end_time: string[];
}

// 📌 요청 타입
export interface CampaignScheduleInfosRequestForSystemAdmin {
  filter?: {
    campaign_id?: {
      start: number;
      end: number;
    };
    tenant_id?: number[];
  };
  sort: {
    tenant_id?: number; // 0: 오름차순, 1: 내림차순
    campaign_id?: number; // 0: 오름차순, 1: 내림차순
  };
  page: {
    index: number;
    items: number;
  };
}

// 📌 응답 타입
export interface CampaignScheduleInfosResponseForSystemAdmin {
  result_code: number;
  result_msg: string;
  result_count?: number;
  total_count?: number;
  result_data: CampaignScheduleInfoForSystemAdmin[];
}

// 📌 기본 요청 값
const defaultRequest: CampaignScheduleInfosRequestForSystemAdmin = {
  // filter: {
  //   campaign_id: {
  //     start: 1,
  //     end: 9999999
  //   }
  // },
  sort: {
    tenant_id: 0,
    campaign_id: 0
  },
  page: {
    index: 1,
    items: 10
  }
};

// 📌 API 호출 함수
export const apiForCampaignScheduleInfosForSystemAdmin = async (
  request: Partial<CampaignScheduleInfosRequestForSystemAdmin> = {}
): Promise<CampaignScheduleInfosResponseForSystemAdmin> => {
  const finalRequest: CampaignScheduleInfosRequestForSystemAdmin = {
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

  const response = await axiosInstance.post<CampaignScheduleInfosResponseForSystemAdmin>(
    "collections/campaign-schedule",
    finalRequest
  );

  return response.data;
};