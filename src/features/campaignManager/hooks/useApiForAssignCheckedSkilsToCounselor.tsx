// src/features/campaignManager/hooks/useApiForAssignCheckedSkilsToCounselor.tsx
"use client";

import { useState, useCallback } from "react";
import { CounselorSkillAssignmentResponse } from "../types/typeForCounselorSkill";
import { assignSkillsToCounselor } from "../api/apiForCounselorSkil";

interface UseApiForAssignCheckedSkilsToCounselorReturn {
  assign: (counselorIds: string[], selectedSkills: number[]) => Promise<CounselorSkillAssignmentResponse[]>;
  isLoading: boolean;
  error: Error | null;
  data: CounselorSkillAssignmentResponse[] | null;
}

/**
 * 상담사에게 선택한 스킬들을 할당하는 API 호출 로직을 관리하는 커스텀 훅입니다.
 *
 * @returns assign 함수와 isLoading, error, data 상태
 */
export function useApiForAssignCheckedSkilsToCounselor(): UseApiForAssignCheckedSkilsToCounselorReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<CounselorSkillAssignmentResponse[] | null>(null);

  const assign = useCallback(async (counselorIds: string[], selectedSkills: number[]) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("✅ API for 상담사 스킬 할당 check!");
      console.log("🎯 상담사 목록:", counselorIds);
      console.log("🔗 할당할 스킬 목록:", selectedSkills);

      const response = await assignSkillsToCounselor(counselorIds, selectedSkills);
      setData(response);
      return response;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { assign, isLoading, error, data };
}
