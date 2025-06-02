

"use client";

import { useQuery } from "@tanstack/react-query";
import { getAssignableSkillsForCounselor } from "@/features/campaignManager/api/apiForCounselorSkil";

/**
 * 상담사에게 할당 가능한 스킬 목록을 가져오는 TanStack Query 훅
 * @param tenantId 테넌트 ID
 * @returns 할당 가능한 스킬 목록 (skill_id, skill_name 포함), 로딩 상태, 에러 정보
 */
export const useAssignableSkills = (tenantId?: number) => {
  return useQuery({
    queryKey: ["assignableSkills", tenantId], // 쿼리 키 (캐싱을 위한 식별자)
    queryFn: async () => {
      // console.log("🟢 할당 가능한 스킬 목록을 불러오는 중...");

      const response = await getAssignableSkillsForCounselor(tenantId!);

      if (response.result_code === 0 && response.result_msg === "Success") {
        // console.log("✅ 불러온 스킬 목록:", response.result_data);

        // skill_id와 skill_name을 포함한 배열로 반환
        return response.result_data.map((skill) => ({
          skill_id: skill.skill_id,
          skill_name: skill.skill_name,
        }));
      } else {
        throw new Error(`API 오류: ${response.result_msg}`);
      }
    },
    enabled: tenantId !== -1,
  });
};

