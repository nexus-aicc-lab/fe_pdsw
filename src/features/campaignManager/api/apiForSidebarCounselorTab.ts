// C:\Users\terec\fe_pdsw\src\features\campaignManager\api\apiForSidebarCounselorTab.ts
import { axiosRedisInstance } from "@/lib/axios";
import { getCookie } from "@/lib/cookies";

// 상담사 리스트를 사이드바에서 사용하기 위해 가져오는 API 함수
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

  return response.data;
}
