import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { UseMutationOptions } from '@tanstack/react-query';
import { AddCampaignGroupCredentials, SuccessResponse } from '@/features/campaignManager/types/typeForCampaignGroupForSideBar';
import { apiForCreateCampaignGroup } from '../api/apiForCampaignGroup';
import { toast } from 'react-toastify';

interface CreateCampaignGroupError {
  message: string;
  status?: number;
  result_code?: string;
  result_msg?: string;
}

export function useApiForCreateCampaignGroup(
  options?: UseMutationOptions<
    SuccessResponse,
    CreateCampaignGroupError,
    AddCampaignGroupCredentials
  >
): UseMutationResult<SuccessResponse, CreateCampaignGroupError, AddCampaignGroupCredentials, unknown> {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse, any, AddCampaignGroupCredentials>({
    mutationKey: ['createCampaignGroup'],
    mutationFn: (credentials: AddCampaignGroupCredentials) => 
      apiForCreateCampaignGroup(credentials),
    onSuccess: (data, variables, context) => {

      console.log("data:", data);
      console.log("variables:", variables);
      
      // sideMenuTreeData 쿼리 캐시 무효화 - 이것만 무효화해도 데이터가 갱신됨
      queryClient.invalidateQueries({
        queryKey: ['sideMenuTreeData']
      });
      
      console.log('✅ 캠페인 그룹 생성 성공:', data);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {

      // console.log("error :", error);

      if(error.response.data.result_code === 501) {
        alert("이미 존재하는 그룹 ID입니다.");
        toast.error("이미 존재하는 그룹 ID입니다.");
        return
      }

      console.error('❌ 캠페인 그룹 생성 실패:', error);
      options?.onError?.(error, variables, context);
    },
  });
}