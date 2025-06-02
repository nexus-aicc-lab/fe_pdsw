import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { fetchCampaignStatusUpdate } from '../api/mainCampaignStatusUpdate';
import { CampaignStatusDataRequest, CampaignStatusResponse, CampaignApiError } from '../types/campaignManagerIndex';
import { customAlertService } from '@/components/shared/layout/utils/CustomAlertService';
import { useTabStore } from '@/store/tabStore';
import { useMainStore } from '@/store/mainStore';
import { toast } from 'react-toastify';

export function useApiForCampaignStatusUpdate(
  options?: UseMutationOptions<CampaignStatusResponse, CampaignApiError, CampaignStatusDataRequest>
) {
  const queryClient = useQueryClient();
  // TabStore에서 필요한 함수 가져오기
  const { simulateHeaderMenuClick, openedTabs, setActiveTab } = useTabStore();
  // Import the updateCampaignStatus function from mainStore
  const { updateCampaignStatus } = useMainStore();

  return useMutation({
    mutationKey: ['mainCampaignStatusUpdate'],
    mutationFn: fetchCampaignStatusUpdate,
    onSuccess: (data, variables, context) => {
      // Immediately update the campaign status in the store
      // This provides an optimistic update even before the invalidateQueries is processed
      // updateCampaignStatus(variables.campaign_id, variables.campaign_status);

      // Show success message

      // 0513 result_code에 따라서 상태변경이 실패할수있기 때문에 주석처리함 
      // customAlertService.success(
      //   '캠페인 상태가 성공적으로 변경되었습니다!',
      //   '캠페인 상태 변경 완료'
      // );

      // Invalidate queries to refresh data
      // queryClient.invalidateQueries({ queryKey: ['treeMenuDataForSideMenu'] });
      // queryClient.invalidateQueries({ queryKey: ['mainCampaignProgressInformation'] });
      // queryClient.invalidateQueries({ queryKey: ['mainData'] });
      // console.log("캠페인 상태변경 추적 결과 : ", data); 
      // Call the original onSuccess if provided
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: CampaignApiError, variables: CampaignStatusDataRequest, context: unknown) => {
      
      // API 오류 시 에러 메시지 표시
      // customAlertService.error(error.message || '상태 변경 중 오류가 발생했습니다.', '상태 변경 오류');
      
      // 오류 발생 후에도 캠페인 관리 탭 열기
      // openCampaignManagerTab();
      
      // Call the original onError if provided
      options?.onError?.(error, variables, context);
    },
  });
  
}