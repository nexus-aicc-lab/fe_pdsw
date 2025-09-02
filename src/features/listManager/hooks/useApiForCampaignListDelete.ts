// C:\nproject\fe_pdsw\src\features\listManager\hooks\useApiForCampaignListDelete.ts
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { DeleteResponse, ListManagerApiError } from '../types/listManagerIndex';
import { fetchCallingListDelete } from '../api/mainCallingListDelete';
import { toast } from 'react-toastify';
import { customAlertService } from '@/components/shared/layout/utils/CustomAlertService';

const useApiForCampaignListDelete = (
  options?: UseMutationOptions<DeleteResponse, ListManagerApiError, number>
): ReturnType<typeof useMutation<DeleteResponse, ListManagerApiError, number>> => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ['campaignListDelete'],
    mutationFn: async (campaignId: number) => {
      // 삭제 전 확인 다이얼로그 표시
      return new Promise<DeleteResponse>((resolve, reject) => {
        customAlertService.show({
          message: '발신리스트 삭제시 발신리스트와 캠페인 진행정보가 초기화 됩니다.\n삭제된 발신리스트와 캠페인 진행정보는 복구가 불가능합니다.\n발신리스트를 삭제하시겠습니까?',
          title: '캠페인',
          type: '1',
          onClose: async () => {
            try {
              // 사용자가 확인을 누르면 실제 API 호출 실행
              const result = await fetchCallingListDelete(campaignId);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          },
          onCancel: () => {
            // 사용자가 취소를 누르면 작업 취소
            toast.info('캠페인 리스트 삭제가 취소되었습니다.', {
              autoClose: 3000
            });
            // reject(new Error('사용자가 삭제를 취소했습니다.'));
          }
        });
      });
    },
    onSuccess: (data, deletedCampaignId, context) => {
      
      toast.success('캠페인 리스트 삭제 성공 check !!!!!!!!!!!');

      // --- Cache Invalidation ---
      // 1. Invalidate the side menu tree data
      queryClient.invalidateQueries({
        queryKey: ['treeMenuDataForSideMenu']
      });

      // 2. Invalidate the specific campaign's progress information
      const tenantIdForQueryKey = 1; // Or get dynamically if needed

      queryClient.invalidateQueries({
        queryKey: ['mainCampaignProgressInformation', tenantIdForQueryKey, deletedCampaignId]
      });

      // 전체 진행 정보 다시 불러오기 (필요한 경우)
      queryClient.refetchQueries({ 
        queryKey: ['mainCampaignProgressInformation'],
        exact: false
      });

      // Call original onSuccess if provided
      options?.onSuccess?.(data, deletedCampaignId, context);
    },
    onError: (error: ListManagerApiError, variables: number, context: unknown) => {
      // console.error('API Error (Delete):', error);
      
      // 사용자가 의도적으로 취소한 경우가 아니라면 에러 메시지 표시
      if (error.message !== '사용자가 삭제를 취소했습니다.') {
        customAlertService.error(
          error.message || '캠페인 리스트 삭제에 실패했습니다.', 
          '오류'
        );
      }
      
      options?.onError?.(error, variables, context);
    },
  });

  return mutation;
};

export default useApiForCampaignListDelete;