// src/features/campaignManager/hooks/useApiForGetRelatedInfoForAssignSkilToCounselor.ts

import { useEffect, useState } from "react";
import { CounselorSkillListResponse } from "@/features/campaignManager/types/typeForCounselorSkill";
import { apiForGetRelatedInfoForAssignSkilToCounselor } from "@/features/campaignManager/api/apiForCounselorSkil";

/**
 * 상담사의 보유 스킬 및 할당 가능한 스킬을 가져오는 커스텀 훅
 * @param counselorId 상담사 ID (null 가능)
 * @param tenantId 테넌트 ID
 * @returns 상담사가 보유한 스킬과 할당 가능한 스킬 목록, 로딩 상태, 에러 정보
 */
export const useApiForGetRelatedInfoForAssignSkilToCounselor = (
    counselorId: string | null,
    tenantId: number
) => {
    console.log("📌 useApiForGetRelatedInfoForAssignSkilToCounselor 실행:", counselorId, tenantId);

    // 상태 관리
    const [assignedSkills, setAssignedSkills] = useState<CounselorSkillListResponse | null>(null);
    const [assignableSkills, setAssignableSkills] = useState<CounselorSkillListResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!counselorId) return;

            setIsLoading(true);
            setError(null);

            try {
                const { assignedSkills, assignableSkills } = await apiForGetRelatedInfoForAssignSkilToCounselor(
                    counselorId,
                    tenantId
                );

                // console.log("✅ 상담사가 보유한 스킬:", assignedSkills);
                console.log("✅ 상담사에게 할당 가능한 스킬:", assignableSkills);

                setAssignedSkills(assignedSkills);
                setAssignableSkills(assignableSkills);
            } catch (err) {
                console.error("❌ 상담사 스킬 데이터 불러오기 실패:", err);
                setError("스킬 데이터를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [counselorId, tenantId]);

    return { assignedSkills, assignableSkills, isLoading, error };
};
