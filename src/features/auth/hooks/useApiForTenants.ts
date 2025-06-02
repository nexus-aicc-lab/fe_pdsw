// src/features/auth/hooks/useApiForLogin.tsx
import { useMutation } from '@tanstack/react-query';
import { fetchTenants } from '../api/mainTenants';
import { toast } from 'react-toastify';
import { UseMutationOptions } from '@tanstack/react-query';
import { MainCredentials, TenantListResponse, AuthApiError } from '../types/mainIndex';
import { useRef } from 'react';
// import Router, { useRouter } from 'next/router';

export function useApiForTenants(
  options?: UseMutationOptions<TenantListResponse, AuthApiError, MainCredentials>
) {
  const isFetching = useRef(false); // 요청 중인지 확인하는 상태

  return useMutation({
    mutationKey: ['mainTenants'],
    mutationFn: async (variables: MainCredentials) => {
      // if (isFetching.current) {
      //   throw new Error('이미 요청이 진행 중입니다.'); // 요청 중일 때는 에러를 던짐
      // }
      isFetching.current = true; // 요청 시작
      try {
        const response = await fetchTenants(variables);
        return response;
      } finally {
        isFetching.current = false; // 요청 완료 후 상태 초기화
      }
    },
    gcTime: 10 * 60 * 1000, // 10분
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: any, variables: MainCredentials, context: unknown) => {
      console.error('API Error:', error);

      if (error.response?.data?.result_code === 5) {
        console.log('세션 만료, 로그인으로 이동');
      } else {
        console.log('다른 에러:', error.response?.data?.result_code);
      }

      options?.onError?.(error, variables, context);
    },
  });
}