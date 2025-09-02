import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { CounselorAssignListCredentials, CounselorAssignListResponse } from "../types/SystemPreferences";
import { fetchCounselorAssignList,  } from "../api/apiForCounselorList";



// 스킬 할당 상담사 목록 가져오기
export function useApiForCounselorAssignList(
  options?: UseMutationOptions<CounselorAssignListResponse, Error, CounselorAssignListCredentials>
) {
  return useMutation({
    mutationKey: ['counselorAssignList'],
    mutationFn: fetchCounselorAssignList,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: Error, variables: CounselorAssignListCredentials, context: unknown) => {
      // console.error('API Error:', error);
      options?.onError?.(error, variables, context);
    },
  })
}