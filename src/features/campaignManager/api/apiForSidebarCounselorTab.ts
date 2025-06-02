

// C:\Users\terec\fe_pdsw\src\features\campaignManager\api\apiForSidebarCounselorTab.ts
import { MainCredentials2 } from "@/features/auth/types/mainIndex";
import { axiosInstance, axiosRedisInstance } from "@/lib/axios";
import {
  Counselor,
  CounselorNode,
  GroupNode,
  TabData,
  TeamNode,
  TenantNode
} from "../types/typeForSideBarCounselorTab";
import { getCookie } from "@/lib/cookies";

// campaignId는 항상 "0"으로 고정되므로 별도 인자로 받지 않음
export async function apiToFetchCounselorListForSideBar(tenantId: string) {
    const sessionKey = getCookie('session_key');


  const response = await axiosRedisInstance.post(
    "/counselor/list",
    {
      tenantId,
      campaignId: "0",
      sessionKey
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  // console.log("response.data at 상담사 api 함수 (POST, 고정 campaignId) : ", response.data);

  return response.data;
}
