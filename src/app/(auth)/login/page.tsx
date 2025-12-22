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

interface LoginFormData {
  user_name: string;
  password: string;
  remember: boolean;
}
const data:EnvironmentListResponse = {
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
  const [cookiesSessionKey, setCookiesSessionKey] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    user_name: '',
    password: '',
    remember: false
  });
  const [isPending, setIsPending] = useState(false);
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: '',
    title: '로그인',
    type: '0',
  });

  const { setAuth, tenant_id, id } = useAuthStore();
  const { setEnvironment, centerId } = useEnvironmentStore(); // 새로운 환경설정 스토어 사용
  const [tempEnvironment, setTempEnvironment] = useState<EnvironmentListResponse>(data);
  // 캠페인 운용 가능 시간 조회 API 호출
  const { mutate: fetchOperatingTime } = useApiForOperatingTime({
    onSuccess: (data) => {

      const startTime = data.result_data.start_time;
      const endTime = data.result_data.end_time;
      const work = data.result_data.days_of_week;
      
      if( startTime === '0000' && endTime === '0000' && work === '0000000' ){
        // setStartTime("0000");
        // setEndTime("0000");          
        // setDayOfWeek(['f','f','f','f','f','f','f']);
        // setUnusedWorkHoursCalc(true);
        // 환경설정 데이터를 별도 스토어에 저장
        setEnvironment({
          ...tempEnvironment,
          sendingWorkEndHours: endTime,
          sendingWorkStartHours: startTime,
          dayOfWeekSetting: 'f,f,f,f,f,f,f',
        });
      }else{
        // setStartTime(startTime);
        // setEndTime(endTime);
        // setDayOfWeek(convertBinaryString(work).split(','));
        // setUnusedWorkHoursCalc(false);
        // 환경설정 데이터를 별도 스토어에 저장
        setEnvironment({
          ...tempEnvironment,
          sendingWorkEndHours: endTime,
          sendingWorkStartHours: startTime,
          dayOfWeekSetting: convertBinaryString(work),
        });
      }

      // 로그인시 통합모니터링창 초기화
      localStorage.setItem('monitorPopupOpen', 'false');
      // console.log('운용 가능 시간 조회 성공, 환경설정 스토어에 저장:', startTime, endTime, work);
      // router.push('/main');
    },
    onError: (error) => {
      // console.log('운용 가능 시간 조회 실패:', error);
      // router.push('/main');
    }
  });
  const convertBinaryString = (input:string) => {
    return input
      .split('')               // 문자열을 문자 배열로 변환
      .map(char => char === '1' ? 't' : 'f') // 각각 '1'이면 't', 아니면 'f'로
      .join(',');              // 쉼표로 연결
  };

  const { mutate: centerInfo} = useApiForCenterInfo({
    onSuccess: (data) => {
      // console.log('센터 정보:', data.centerInfoList.map((item) => item.centerName)[0]);

      useEnvironmentStore.getState().setCenterInfo(data.centerInfoList[0].centerId,data.centerInfoList[0].centerName);
    },
    onError: (error) => {
      // console.error('센터 정보 로드 실패:', error);
      setAlertState({
        isOpen: true,
        message: '센터 정보를 불러오는데 실패했습니다.',
        title: '로그인',
        type: '2',
      });
    }
  });
  
  const { mutate: environment } = useApirForEnvironmentList({
    onSuccess: (data) => {
      
      // centerInfo(); // 센터정보 저장하는 api 호출

      setTempEnvironment(data); // 환경설정 데이터를 state로 저장 (이후 useEffect로 store에 저장)
      
    },
    onError: (error) => {
      // console.error('환경설정 데이터 로드 실패:', error);
      setAlertState({
        isOpen: true,
        message: '환경설정 데이터를 불러오는데 실패했습니다.',
        title: '환경설정',
        type: '2',
      });
    }
  });

  // tempEnvironment가 업데이트 완료되었을때
  useEffect(() => {
    if (tempEnvironment && tempEnvironment.code !== "") {
      fetchOperatingTime();
    }
  }, [tempEnvironment, fetchOperatingTime]);

  const { mutate: login } = useApiForLogin({
    onSuccess: (data) => {

      setAuth(
        formData.user_name,              // id
        data.tenant_id,                  // tenant_id
        data.session_key,                // session_key
        data.role_id,                    // role_id 추가
        data.menu_role_id,
        data.expires_in, // 로그인 시 respone 받는 만료시간(밀리세컨드)
      );

      // 기억하기가 체크되어 있다면 로컬 스토리지에 저장
      if (formData.remember) {
        localStorage.setItem('remembered_username', formData.user_name);
      } else {
        localStorage.removeItem('remembered_username');
      }

      // 환경설정 정보 요청
      // environment({
      //   centerId: 1,                 // 하드코딩된 값
      //   tenantId: data.tenant_id,    // 로그인 응답에서 받은 tenant_id
      //   employeeId: formData.user_name  // 로그인 시 입력한 user_name
      // });
      // setIsPending(false); 
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    if (formData.user_name === '') {
      setAlertState({
        isOpen: true,
        message: '아이디를 입력하세요',
        title: '로그인',
        type: '2',
      });
      setIsPending(false);
    } else if (formData.password === '') {
      setAlertState({
        isOpen: true,
        message: '비밀번호를 입력하세요',
        title: '로그인',
        type: '2',
      });
      setIsPending(false);
    } else {
      login(formData);
    }
  };

  // 환경설정 정보 요청
  useEffect(() => {
    if( tenant_id > -1 && centerId !== '' ){
      environment({
        centerId: Number(centerId),                 // 하드코딩된 값
        tenantId: tenant_id,    // 로그인 응답에서 받은 tenant_id
        employeeId: formData.user_name || id  // 로그인 시 입력한 user_name
      });
      setIsPending(false); 
    }
  }, [tenant_id, centerId]);

  // 컴포넌트 마운트 시 저장된 사용자 이름 불러오기
  useEffect(() => {
    const rememberedUsername = localStorage.getItem('remembered_username');
    if (rememberedUsername) {
      setFormData(prev => ({
        ...prev,
        user_name: rememberedUsername,
        remember: true
      }));
    }
    // useEnvironmentStore.getState().setCenterInfo('','');
    // 쿠키는 클라이언트에서만 읽기
    setCookiesSessionKey(Cookies.get('session_key'));
  }, []);

  

  // 쿠키에서 관리되는 session_key
  // const [cookiesSessionKey, setCookiesSessionKey] = useState(Cookies.get('session_key'));

  // store에서 관리되는 세션 타임아웃 체크
  const isSessionTimeCheck = useAuthStore((state) => state.expires_check);
  
  // store에 session_key가 존재하는지 확인
  // const isLoggedIn = useAuthStore((state) => state.session_key !== ''); 
  const sessionKey = useAuthStore((state) => state.session_key);
  const isLoggedIn = !!sessionKey;

  // 쿠키가 session_key가 존재하는지 확인
  // const cookiesSessionKey = Cookies.get('session_key');
  const cookiescheck = cookiesSessionKey !== undefined && cookiesSessionKey !== ''; 

  useEffect(() => {
    // console.log('쿠키에서 관리되는 session_key:', cookiesSessionKey);
    // console.log('store에서 관리되는 세션 타임아웃 체크:', isSessionTimeCheck);
    // console.log('store에 session_key가 존재하는지 확인:', isLoggedIn);
    // 로그인 되어있는 상태로 login 페이지 접근시 replace
    // console.log('로그인 상태로 login 페이지 접근시 main 페이지로 이동 처리 :: ',sessionKey);
    if (isLoggedIn && isSessionTimeCheck === false && sessionKey && sessionKey !== '') {
      // store나 쿠키에 session_key가 존재하면서 세션 만료가 아닌 경우 login 페이지 접근시 main 페이지로 이동
      router.push('/main');
    }
  }, [isLoggedIn, isSessionTimeCheck, sessionKey, router]); // 로그아웃이 안되는 현상 발생하여 수정 20251127
  // useEffect(() => {
  //   // console.log('쿠키에서 관리되는 session_key:', cookiesSessionKey);
  //   // console.log('store에서 관리되는 세션 타임아웃 체크:', isSessionTimeCheck);
  //   // console.log('store에 session_key가 존재하는지 확인:', isLoggedIn);
  //   // 로그인 되어있는 상태로 login 페이지 접근시 replace
  //   if (isLoggedIn && cookiescheck && isSessionTimeCheck === false) {
  //     // store나 쿠키에 session_key가 존재하면서 세션 만료가 아닌 경우 login 페이지 접근시 main 페이지로 이동
  //     router.replace('/main');
  //   }
  // }, [isLoggedIn, cookiescheck, isSessionTimeCheck, router]); // 로그아웃이 안되는 현상 발생하여 수정 20251127

  // // store 의 session_key가 있으면서, 쿠키에 session_key가 존재하면 main 페이지로 이동하기전에 보여지는 빈 페이지
  if (isLoggedIn && cookiescheck) return (null);

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
        <span className="ml-2 text-xs text-gray-500">v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
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