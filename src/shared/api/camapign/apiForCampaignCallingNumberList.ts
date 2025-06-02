import { axiosInstance } from "@/lib/axios";

// 📌 캠페인 발신번호 항목 타입
export interface CampaignCallingNumberItemForSystemAdmin {
  campaign_id: number;
  calling_number: string;
}

// 📌 요청 타입
export interface IRequestForCampaignCallingNumberListForSystemAdmin {
  filter: {
    campaign_id?: {
      start: number;
      end: number;
    };
  };
  sort: {
    campaign_id?: number; // 0: 오름차순, 1: 내림차순
  };
  page: {
    index: number;
    items: number;
  };
}

// 📌 응답 타입
export interface IResponseForCampaignCallingNumberListForSystemAdmin {
  result_code: number;
  result_msg: string;
  result_count?: number;
  total_count?: number;
  result_data: CampaignCallingNumberItemForSystemAdmin[];
}

// 📌 기본 요청 값
const defaultRequest: IRequestForCampaignCallingNumberListForSystemAdmin = {
  filter: {
    campaign_id: {
      start: 1,
      end: 9999999
    }
  },
  sort: {
    campaign_id: 0
  },
  page: {
    index: 1,
    items: 10
  }
};

// 📌 API 호출 함수
export const apiForCampaignCallingNumberListForSystemAdmin = async (
  request: Partial<IRequestForCampaignCallingNumberListForSystemAdmin> = {}
): Promise<IResponseForCampaignCallingNumberListForSystemAdmin> => {
  const finalRequest: IRequestForCampaignCallingNumberListForSystemAdmin = {
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

  const response = await axiosInstance.post<IResponseForCampaignCallingNumberListForSystemAdmin>(
    "collections/campaign-calling-number",
    finalRequest
  );

  return response.data;
};