// C:\nproject2\fe_pdsw_for_playwright\src\app\(auth)\login\page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { useApiForLogin } from '@/features/auth/hooks/useApiForLogin';
import CustomAlert from '@/components/shared/layout/CustomAlert';
import { Button } from "@/components/ui/button";
import { useAuthStore } from '@/store/authStore';
import { useEnvironmentStore } from '@/store/environmentStore';
import { useApirForEnvironmentList } from '@/features/auth/hooks/useApiForEnvironment';
import { useApiForOperatingTime } from '@/features/preferences/hooks/useApiForOperatingTime';
import { EnvironmentListResponse } from "@/features/auth/types/environmentIndex";
import Cookies from 'js-cookie';
import { useApiForCenterInfo } from '@/features/auth/hooks/useApiForCenterInfo';
import { Settings } from "lucide-react";

interface LoginFormData {
  user_name: string;
  password: string;
  remember: boolean;
}
const EMPTY_ENV:EnvironmentListResponse = {
  campaignListAlram:0
  , code:""
  , dayOfWeekSetting: ""
  , message: ""
  , personalCampaignAlertOnly: 0
  , sendingWorkEndHours: ""
  , sendingWorkStartHours: ""
  , serverConnectionTime: 0
  , showChannelCampaignDayScop: 0
  , statisticsUpdateCycle: 0
  , unusedWorkHoursCalc: 0
  , useAlramPopup: 0
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, setSessionKey, tenant_id, id, expires_check, clearAuth, session_key } = useAuthStore();
  const { setEnvironment, setCenterInfo } = useEnvironmentStore(); // 새로운 환경설정 스토어 사용
  const [ _sessionKey, _setSessionKey ] = useState(''); // 임시로 session_key 상태 관리
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(true); // 환경설정/세션 로딩 상태

  const [formData, setFormData] = useState<LoginFormData>({
    user_name: '',
    password: '',
    remember: false
  });
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: '',
    title: '로그인',
    type: '0',
  });
  const [tempEnvironment, setTempEnvironment] = useState<EnvironmentListResponse>(EMPTY_ENV);

  const [appVersion, setAppVersion] = useState('0.1.0');

  // 2. 마운트 시점에만 window 객체 접근
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__RUNTIME_CONFIG__) {
      setAppVersion(window.__RUNTIME_CONFIG__.APP_VERSION || '0.1.0');
    }
  }, []);
  
  /* =========================
     이미 로그인 상태면 바로 main
  ========================= */
  useEffect(() => {
    if (session_key && !expires_check) {
      router.replace('/main');
    } else {
      setLoading(false); // 로그인 화면 렌더링 허용
    }
  }, [session_key, expires_check, router]);

  /* =========================
     아이디 기억하기
  ========================= */
  useEffect(() => {
    const remembered = localStorage.getItem('remembered_username');
    if (remembered) {
      setFormData(prev => ({
        ...prev,
        user_name: remembered,
        remember: true,
      }));
    }
  }, []);

  /* =========================
     환경설정 API
  ========================= */
  const { mutate: environment } = useApirForEnvironmentList({
    onSuccess: data => setTempEnvironment(data),
  });

  // 캠페인 운용 가능 시간 조회 API 호출
  const { mutate: fetchOperatingTime } = useApiForOperatingTime({
    onSuccess: (data) => {
      const { start_time, end_time, days_of_week } = data.result_data;

      setEnvironment({
        ...tempEnvironment,
        sendingWorkStartHours: start_time,
        sendingWorkEndHours: end_time,
        dayOfWeekSetting: days_of_week
          .split('')
          .map(v => (v === '1' ? 't' : 'f'))
          .join(','),
      });

      // 로그인시 통합모니터링창 초기화
      localStorage.setItem('monitorPopupOpen', 'false');
      // console.log('운용 가능 시간 조회 성공, 환경설정 스토어에 저장:', startTime, endTime, work);
      if( _sessionKey && _sessionKey !== ''){
        setSessionKey(_sessionKey); // authStore에 session_key 저장
      }
    },
  });

  // tempEnvironment가 업데이트 완료되었을때
  useEffect(() => {
    if (tempEnvironment && tempEnvironment.code !== "") {
      fetchOperatingTime();
    }
  }, [tempEnvironment, fetchOperatingTime]);

  /* =========================
     센터 정보
  ========================= */
  const { mutate: centerInfo} = useApiForCenterInfo({
    onSuccess: data => {
      const center = data.centerInfoList[0];
      environment({
        centerId: Number(center.centerId),
        tenantId: tenant_id,
        employeeId: formData.user_name || id,
      });
      setCenterInfo(center.centerId, center.centerName);
      setLoading(false); // 모든 초기화 완료
    },
  });
  
  /** =========================
   *  로그인 API
   * ========================= */
  const { mutate: login } = useApiForLogin({
    onSuccess: (data) => {

      setAuth(
        formData.user_name,              // id
        data.tenant_id,                  // tenant_id
        '',                // session_key
        data.role_id,                    // role_id 추가
        data.menu_role_id,
        data.expires_in, // 로그인 시 respone 받는 만료시간(밀리세컨드)
      );
      _setSessionKey(data.session_key); // 임시로 session_key 상태 관리

      // 기억하기가 체크되어 있다면 로컬 스토리지에 저장
      if (formData.remember) {
        localStorage.setItem('remembered_username', formData.user_name);
      } else {
        localStorage.removeItem('remembered_username');
      }

      centerInfo(); // 센터정보 저장하는 api 호출
    },
    onError: (e) => {
      if (e.message === 'User does not exist.') {
        setAlertState({
          isOpen: true,
          message: '존재하지 않는 아이디입니다.',
          title: '로그인',
          type: '2',
        });
      } else if (e.message === 'Password is wrong.') {
        setAlertState({
          isOpen: true,
          message: '암호가 잘못 입력되었습니다.',
          title: '로그인',
          type: '2',
        });
      } else if (e.message === 'Device is unknown.') {
        setAlertState({
          isOpen: true,
          message: '접근권한이 없습니다.',
          title: '로그인',
          type: '2',
        });
      } else if (e.message === 'Request failed with status code 500' && (e as any).config?.url?.indexOf('/agent/loginCubeC') > -1) {
        // interceptor와 중복되는 부분이라 주석처리
        setAlertState({
          isOpen: true,
          message: 'API인증이 정상적으로 이루어 지지 않았습니다.',
          title: '로그인',
          type: '2',
        });
      } else  {
        setAlertState({
          isOpen: true,
          message: e.message,
          title: '로그인',
          type: '2',
        });
      }
      setIsPending(false);
    },
  });

  /** =========================
   *  로그인 제출
   * ========================= */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.user_name === '') {
      setAlertState({
        isOpen: true,
        message: '아이디를 입력하세요',
        title: '로그인',
        type: '2',
      });
      return;
    } else if (formData.password === '') {
      setAlertState({
        isOpen: true,
        message: '비밀번호를 입력하세요',
        title: '로그인',
        type: '2',
      });
      return;
    }
    setIsPending(true);
    login(formData);
  };
  
  /** =========================
   *  세션 만료 감시
   * ========================= */
  // useEffect(() => {
  //   if (expires_check) {
  //     clearAuth(); // 세션 만료 시 로그아웃 처리
  //     setAlertState({
  //       isOpen: true,
  //       message: '세션이 만료되었습니다. 다시 로그인해주세요.',
  //       title: '로그인',
  //       type: '2',
  //     });
  //     router.replace('/login');
  //   }
  // }, [expires_check, clearAuth, router]);
  
  // // store 의 session_key가 있으면서, 쿠키에 session_key가 존재하면 main 페이지로 이동하기전에 보여지는 빈 페이지
  // if (isLoggedIn && cookiescheck) return (null);
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Settings className="w-5 h-5 text-indigo-500 animate-spin mr-3" />
        <span className="text-sm text-gray-600">환경 설정 로딩중...</span>
      </div>
    );
  }

  const handleContextMenu = (e:any) => {
    // 기본 브라우저 동작(오른쪽 클릭 메뉴)을 막습니다.
    e.preventDefault();
    alert("마우스 오른쪽 버튼 사용이 금지되었습니다."); // 사용자에게 알림 (선택 사항)
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center"  onContextMenu={handleContextMenu}>

      <Card className="w-[500px] shadow-none border-0 py-7 px-10">
        <div className="flex mb-8 mb-70">
          <Image
            src="/logo/pds-logo.svg"
            alt="U PDS"
            width={200}
            height={70}
            style={{ width: '200px', height: '70px' }}
            priority
          />
        </div>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                {/* 작은 아이콘은 공통된 방식 사용 */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
                  <Image
                    src="/logo/icon_id.svg"
                    alt="id"
                    width={14}
                    height={16}
                    priority
                  />
                </div>
                <Input
                  type="text"
                  name="username"
                  autoComplete="username"
                  placeholder="아이디를 입력하세요"
                  className="input-field"
                  value={formData.user_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
                  disabled={isPending}
                />
              </div>

              <div className="relative">
                {/* 작은 아이콘은 공통된 방식 사용 */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
                  <Image
                    src="/logo/icon_pw.svg"
                    alt="password"
                    width={14}
                    height={19}
                    style={{ width: '14px', height: '19px' }}
                    priority
                  />
                </div>
                <div className="relative flex-grow">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder="비밀번호를 입력하세요"
                    className="input-field"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    disabled={isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end mt-10 gap-2">
              <Checkbox
                id="remember"
                checked={formData.remember}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, remember: checked as boolean }))
                }
                className="peer h-5 w-5 rounded-full border border-[#8E8E8E] data-[state=checked]:!border-[#8E8E8E] focus:ring-0 focus:outline-none transition-colors duration-200"
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium cursor-pointer select-none"
              >
                ID 기억하기
              </label>
            </div>

            <Button
              variant="login"
              type="submit"
              className="mt-12 w-full"
            >
              {isPending ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="footer-text mt-4">
        © {new Date().getFullYear()} NEXUS COMMUNITY All rights reserved.
        <span className="ml-2 text-xs text-gray-500">v{appVersion}
        </span>
      </p>

      <CustomAlert
        message={alertState.message}
        title={alertState.title}
        type={alertState.type}
        isOpen={alertState.isOpen}
        onClose={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}