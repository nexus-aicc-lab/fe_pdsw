
// features/auth/api/login.ts
import { LoginCredentials, LoginRequest, LoginResponse, LoginResponseFirst } from '../types/loginIndex';
import { axiosInstance, externalAxiosInstance } from '@/lib/axios';
import useStore, { UserInfoData } from '@/features/auth/hooks/store';
import Cookies from 'js-cookie';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getRuntimeEnv } from '@/lib/getRuntimeEnv';

export const loginApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {

      // ######## 0519 로그인 과정 한번으로 통합 수정 ########

      // ✅ 반드시 함수 안에서 호출해야 env.js 로딩 이후 window 객체에 접근 가능
      // const LOGIN_URL = getRuntimeEnv('LOGIN_API_URL');

      // if (!LOGIN_URL) {
      //   console.log("🚨 LOGIN_URL이 정의되지 않았습니다.");
      //   throw new Error('LOGIN_URL이 정의되지 않았습니다.');
      // }

      
      // 🔐 첫 번째 로그인 (외부 인증)
      // const { data: dataFirst } = await externalAxiosInstance.get<LoginResponseFirst>(
      //   LOGIN_URL,
      //   {
      //     params: {
      //       id: credentials.user_name,
      //       passwd: credentials.password
      //     }
      //   }
      // );
      // if (!dataFirst.id) {
      //   throw new Error('서버 에러입니다.');
      // }

      // 0519 로그인 과정 한번으로 통합 수정

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

      // 🌐 클라이언트 IP 조회
      const { data: dataSecond } = await axios.get<{ ip: string }>(
        `https://api.ipify.org?format=json`
      );

      // 🍪 쿠키 저장
      Cookies.set('userHost', dataSecond.ip, {
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

      console.log("🍪 Cookies after setting:", {
        session_key: Cookies.get('session_key'),
        tenant_id: Cookies.get('tenant_id'),
        role_id: Cookies.get('role_id'),
        menu_role_id: Cookies.get('menu_role_id'),
      });

      // 🧠 사용자 정보 저장 (Zustand)
      const userInfo: UserInfoData = {
        id: credentials.user_name,
        tenant_id: data.tenant_id,
        session_key: data.session_key,
        role_id: data.role_id,
        menu_role_id: data.menu_role_id,
      };

      useStore.getState().setUserInfo(userInfo);
      sessionStorage.setItem('just_logged_in', 'true');

      // 🔄 SSE 연결 초기화 (Zustand 스토어 사용)
      // 브라우저 환경에서만 실행
      // if (typeof window !== 'undefined' && window.EventSource) {
      //   try {
      //     // SSE 메시지 핸들러 함수
      //     const sseMessageHandler = (eventData: any) => {
      //       // CustomEvent를 발생시켜 Footer 등의 컴포넌트에서 처리할 수 있도록 함
      //       const sseEvent = new CustomEvent('sse-message', { 
      //         detail: eventData 
      //       });
      //       window.dispatchEvent(sseEvent);
      //     };
          
      //     // useSSEStore의 initSSE 메서드 호출하여 SSE 연결 초기화
          
      //     console.log("🔌 로그인 성공 - SSE 연결 초기화됨");
      //   } catch (error) {
      //     console.error("🚨 SSE 초기화 오류:", error);
      //     // SSE 연결 실패는 로그인 실패로 취급하지 않음 - 사용자 경험을 위해
      //   }
      // }

      return data;
    } catch (error: Error | unknown) {
      const err = error as Error;
      // toast.error(`❌ 로그인 실패: ${err.message}`);
      throw err;
    }
  },
};