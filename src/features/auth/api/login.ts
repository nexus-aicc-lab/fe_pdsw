// features/auth/api/login.ts
import { LoginCredentials, LoginRequest, LoginResponse } from '../types/loginIndex';
import { axiosInstance, axiosRedisInstance } from '@/lib/axios';
import useStore, { UserInfoData } from '@/features/auth/hooks/store';
import Cookies from 'js-cookie';

export const loginApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {

      // 🔐로그인 (내부 인증)
      const loginData: LoginRequest = {
        grant_type: 'nexus_admin',
        device_id: 'WEB',
        user_name: credentials.user_name,
        password: credentials.password,
      };

      const { data } = await axiosInstance.post<LoginResponse>('/login', loginData);

      if (data.result_code !== 0) {
        throw new Error(data.result_msg || '로그인 실패');
      }

      const { data : ipdata } = await axiosRedisInstance.post(`/auth/getIp`);
      // console.log(" 클라이언트 IP:", ipdata);

      //  쿠키 저장
      Cookies.set('userHost', ipdata, {
        expires: 1,
        secure: false,
        sameSite: 'Lax',
        path: '/',
      });

      Cookies.set('id', credentials.user_name, {
        expires: 1,
        secure: false,
        sameSite: 'Lax',
        path: '/'
      });
      // console.log("🍪 Cookies after setting userHost:", Cookies.get('userHost'));
      // ###### 로그인 시간 기준으로 세션키 만료시간 설정 ######
      const currentDate = new Date();
      const expiredDate = new Date(currentDate.getTime() + data.expires_in * 1000); // 초 더하기
      
      data.expires_in = expiredDate.getTime(); // 만료일시를 밀리세컨드로 변환하여 저장

      // 쿠키 설정
      Cookies.set('session_key', data.session_key, {
        expires: 1,
        path: '/',
        secure: false,
        sameSite: 'Lax',
        domain: window.location.hostname,
      });

      Cookies.set('tenant_id', String(data.tenant_id), { expires: 1, path: '/' });
      Cookies.set('role_id', String(data.role_id), { expires: 1, path: '/' });
      Cookies.set('menu_role_id', String(data.menu_role_id), { expires: 1, path: '/' });

      //  사용자 정보 저장 (Zustand)
      const userInfo: UserInfoData = {
        id: credentials.user_name,
        tenant_id: data.tenant_id,
        session_key: data.session_key,
        role_id: data.role_id,
        menu_role_id: data.menu_role_id,
      };

      useStore.getState().setUserInfo(userInfo);
      sessionStorage.setItem('just_logged_in', 'true');

      return data;
    } catch (error: Error | unknown) {
      const err = error as Error;
      throw err;
    }
  },
};