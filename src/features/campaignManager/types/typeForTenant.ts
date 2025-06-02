// src/features/auth/types/typeForTenant.ts

// Request 데이터 타입
export interface TenantRequestData {
    filter?: {
      tenant_id: {
        start: number;
        end: number;
      };
    };
    sort: {
      tenant_id: number;
    };
    page: {
      index: number;
      items: number;
    };
  }
  
  // 응답 데이터의 result_data 항목 타입
  export interface TenantListDataResponse {
    tenant_id: number;
    tenant_name: string;
  }
  
  // 응답 데이터 전체 타입
  export interface TenantListResponse {
    result_code: 0 | number;      // 0은 성공을 의미
    result_msg: "Success" | string; // "Success"는 성공을 의미
    result_count: number;
    total_count: number;
    result_data: TenantListDataResponse[];
  }
  
  // API 에러 타입
  export interface TenantApiError {
    status: number;
    message: string;
    response?: {
      data?: {
        result_code: number;
        result_msg: string;
      };
    };
  }