// C:\nproject\fe_pdsw\src\features\campaignManager\api\redis\apiForCampaign.ts

import { axiosInstance } from "@/lib/axios";
import axios from "axios";

/**
 * Redis 테스트 API 함수
 * 백엔드의 `/api/v1/monitor/hello-pub` 엔드포인트를 호출하여 Redis에 테스트 메시지 발행
 */
export const apiForRedisTest = async (): Promise<string> => {
  try {
    const { data } = await axios.get<string>("http://localhost:4000/api/v1/monitor/hello-pub");

    
    return data;
  } catch (error) {
    // console.error("❌ Redis 테스트 실패:", error);
    throw new Error("Redis 테스트 요청 중 오류가 발생했습니다.");
  }
};
