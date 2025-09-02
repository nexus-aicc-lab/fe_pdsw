// src/features/auth/api/fetchCampaigns.ts
import { axiosInstance } from '@/lib/axios';
import { MainCredentials, TenantListResponse } from '../types/mainIndex';

// 테넌트 리스트 요청
export const fetchTenants = async (credentials:MainCredentials): Promise<TenantListResponse> => {
  // const tenantRequestData = {
  //   filter: {      
  //     tenant_id: {
  //       start: credentials.tenant_id > 0?credentials.tenant_id: 0,
  //       end: credentials.tenant_id > 0?credentials.tenant_id:9999999
  //     },
  //   },
  //   sort: {
  //     tenant_id: 0,
  //   },
  //   page: {
  //     index: 1,
  //     items: 10,
  //   },
  // };

  const tenantRequestData = {
    ...(credentials.tenant_id !== -1 && credentials.tenant_id != 0 ? {
      filter:
      {
        tenant_id: { start: credentials.tenant_id, end: credentials.tenant_id },
      },
    } : {}),
  };

  try {
    const { data } = await axiosInstance.post<TenantListResponse>(
      '/collections/tenant', 
      tenantRequestData
    );

    // console.log("테넌트 가져오기 결과 확인 ????????????????????????????????????????????????????????????????????", data);
    

    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    // throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');

    // console.log("테넌트 가져오기 에러 확인 ????????????????????????????????????????????????????????????????????", error);
    

    throw error;
  }
};