
// src/features/campaignManager/api/apiForTennants.ts
import { customAlertService } from "@/components/shared/layout/utils/CustomAlertService";
import { TenantApiError, TenantListResponse, TenantRequestData } from "@/features/campaignManager/types/typeForTenant";
import { axiosInstance } from "@/lib/axios";
import { toast } from "react-toastify";


export const apiForGetTenantList = async (tenant_id?: number): Promise<TenantListResponse> => {
  const tenantRequestData = {
    ...(tenant_id !== -1 && tenant_id != 0 ? {
      filter: 
      {
        tenant_id: { start: tenant_id!, end: tenant_id! },
      },
    } : {}),
    sort: {
      tenant_id: 0,
    },
  };

  try {
    const { data } = await axiosInstance.post<TenantListResponse>(
      '/collections/tenant',
      tenantRequestData
    );

    if (data.result_code === 0 && data.result_msg === "Success") {
      return data;
    } else {
      throw new Error(`API Error: ${data.result_msg}`);
    }
  } catch (error: any) {
    // if (error.response?.data?.result_code === 5) {
    //   customAlertService.error('로그인 세션이 만료되었습니다. 다시 로그인 해주세요.', '세션 만료', () => {
    //     window.location.href = '/login';
    //   });
    // }

    throw error;
  }
};


