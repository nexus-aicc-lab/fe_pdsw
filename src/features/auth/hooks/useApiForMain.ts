// src/features/auth/hooks/useApiForLogin.tsx
import { useMutation } from '@tanstack/react-query';
import { fetchCampaigns } from '../api/main';
import { toast } from 'react-toastify';
import { UseMutationOptions } from '@tanstack/react-query';
import { MainCredentials, MainResponse, AuthApiError } from '../types/mainIndex';

export function useApiForMain(
  options?: UseMutationOptions<MainResponse, AuthApiError, MainCredentials>
) {
  return useMutation({
    mutationKey: ['main'],
    mutationFn: fetchCampaigns,
    onSuccess: (data, variables, context) => {
      // console.log('API Response:', {
      //   code: data.result_code,
      //   message: data.result_msg,
      //   count: data.result_count,
      //   total: data.total_count,
      //   data: data.result_data
      // });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: AuthApiError, variables: MainCredentials, context: unknown) => {
      // console.error('API Error:', error);
      // toast.error(error.message || '데이터 로드에 실패했습니다.');
      options?.onError?.(error, variables, context);
    },
  });
}