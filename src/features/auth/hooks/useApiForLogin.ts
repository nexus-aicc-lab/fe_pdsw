// src/features/auth/hooks/useApiForLogin.ts
"use client";

import { useMutation } from '@tanstack/react-query';
import { loginApi } from '../api/login';
import { UseMutationOptions } from '@tanstack/react-query';
import { LoginCredentials, LoginResponse, AuthApiError } from '../types/loginIndex';
import { useTabStore } from '@/store/tabStore'; // 탭 초기화를 위한 store import
import { useCampainManagerStore } from '@/store';

export function useApiForLogin(
  options?: UseMutationOptions<LoginResponse, AuthApiError, LoginCredentials>
) {
  const resetTabStore = useTabStore((state) => state.resetTabStore); // 초기화 함수 가져오기
  const setResetCampaignManagerStore = useCampainManagerStore((state) => state.setResetCampaignManagerStore);

  return useMutation({
    mutationKey: ['login'],
    mutationFn: loginApi.login,
    onSuccess: (data, variables, context) => {
      // ✅ 로그인 성공 시 탭 관련 상태 초기화
      resetTabStore();
      // ✅ 캠페인 매니저 store 초기화 (이전 사용자의 copy* 잔존 데이터 방지)
      setResetCampaignManagerStore();

      // 기존 옵션 실행
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: AuthApiError, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
}
