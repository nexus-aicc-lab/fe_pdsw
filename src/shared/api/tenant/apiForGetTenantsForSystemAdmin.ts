// src/shared/api/apiForGetTenants.ts

import { axiosInstance } from "@/lib/axios";

// 요청에 사용할 타입
export interface TenantFilterRequestForSystemAdmin {
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

// 테넌트 항목 타입
export interface TenantItemForSystemAdmin {
  tenant_id: number;
  tenant_name: string;
}

// 응답 타입
export interface TenantListResponseForSystemAdmin {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: TenantItemForSystemAdmin[];
}

// 기본 요청 구조
const defaultTenantListRequest: TenantFilterRequestForSystemAdmin = {
  filter: {
    tenant_id: {
      start: 0,
      end: 9999999,
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

// API 함수
export const apiForGetTenantsForSystemAdmin = async (
  request: Partial<TenantFilterRequestForSystemAdmin> = {}
): Promise<TenantListResponseForSystemAdmin> => {
  const finalRequest = {
    ...defaultTenantListRequest,
    ...request,
  };

  const response = await axiosInstance.post<TenantListResponseForSystemAdmin>(
    "/collections/tenant",
    finalRequest
  );
  return response.data;
};
