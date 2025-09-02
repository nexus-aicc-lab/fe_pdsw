import { CommonButton } from "@/components/shared/CommonButton";
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTabStore } from '@/store/tabStore'
import Cookies from 'js-cookie'
import { MenuItem, menuItems } from '@/widgets/header/model/menuItems'
import React, { useState, useEffect, useRef } from 'react'
import { useAuthStore, useMainStore, useCampainManagerStore } from '@/store';
import { useApiForMain } from '@/features/auth/hooks/useApiForMain';
import { useApiForTenants } from '@/features/auth/hooks/useApiForTenants';
import CustomAlert from '@/components/shared/layout/CustomAlert';
import { useApiForGetAuthorizedMenusInfoForMenuRoleId } from "./hooks/useApiForGetAuthorizedMenusInfoForMenuRoleId";
import { useAvailableMenuStore } from "@/store/useAvailableMenuStore";
import { Button } from "@/components/ui/button";
import { useApiForSkills } from '@/features/campaignManager/hooks/useApiForSkills';
import AuthTimeOutCheck from "@/components/providers/AuthTimeOutCheck";
import { useApiForGetCampaignSkills } from '@/shared/hooks/skill/useApiForGetCampaignSkills';
import { useApiForGetCampaignGroups } from "@/shared/hooks/campaign/useApiForGetCampaignGroups";
import GlobalErrorAlert from "@/components/shared/CommonGlobalError/CommonGlobalError";
import logoutFunction from "@/components/common/logoutFunction";
import ServerErrorCheck from "@/components/providers/ServerErrorCheck";
import { useEnvironmentStore } from "@/store/environmentStore";
import { useApiForCenterInfo } from "@/features/auth/hooks/useApiForCenterInfo";


const errorMessage = {
  isOpen: false,
  message: '',
  title: '로그인',
  type: '1',
  onClose: () => { },
  onCancel: () => { },
};

export default function Header() {
  const router = useRouter();
  const _tenantId = Number(Cookies.get('tenant_id'));
  const { id:userId, tenant_id, session_key: _sessionKey, role_id, menu_role_id } = useAuthStore();

  const [alertState, setAlertState] = useState(errorMessage);
  const [shouldFetchCounselors, setShouldFetchCounselors] = useState(false);
  const { setSkills } = useCampainManagerStore();

  const { environmentData, setEnvironment, centerId, centerName} = useEnvironmentStore();

  const {
    availableHeaderMenuIds,
  } = useAvailableMenuStore();

  const expires_in = useAuthStore((state) => state.expires_in);
  const startExpirationWatcher = useAuthStore((state) => state.startExpirationWatcher);
  const expires_check = useAuthStore((state) => state.expires_check);

  // 새로고침에도 만료시간 체크 유지를 위한 헤더 감시로직
  useEffect(() => {
    const now = Date.now();
    if (expires_in > 0 && !expires_check) {
      if (now > expires_in) {
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',
          type: '2',
          onClose: () => {
            logoutFunction();
            router.push('/login');
          },
        });
      } else {
        startExpirationWatcher(); // 타이머 복구
      }
    }
  }, []);


  const { mutate: centerInfo} = useApiForCenterInfo({
      onSuccess: (data) => {
        // console.log('센터 정보:', data.centerInfoList.map((item) => item.centerName)[0]);
  
        useEnvironmentStore.getState().setCenterInfo(data.centerInfoList[0].centerId, data.centerInfoList[0].centerName);
      },
      onError: (error) => {
        // console.log('센터 정보 조회 실패:', error);
        // ServerErrorCheck('센터 정보 조회', error.message);
      }
  });

  useEffect(() => {

    // 환경 데이터가 없거나 null인 경우 초기값 스토어에 설정
    if(!environmentData || environmentData === null){

      // "campaignListAlram": 0,  			알림 설정 - 리스트 잔량 부족 시 알람 모드(주기적으로 계속) 0: 한 번만, 1: 주기적으로 계속
      // "statisticsUpdateCycle": 20,  		통계 갱신 주기 - 통계 가져오기 주기
      // "serverConnectionTime": 100,		서버 접속 시간 - 서버와의 접속 시간을 설정합니다.
      // "showChannelCampaignDayScop": 5,	채널 할당 시 보여 주는 캠페인 - 채널 할당 캠페인 범위
      // "personalCampaignAlertOnly": 0,		알림 옆 라벨 - 본인 캠페인만 알림 여부 (체크 안 함) 0:전체, 1:본인
      // "useAlramPopup": 0,					메시지 알림창 - 알람 팝업 사용 여부 (알리지 않음) 0:알리지 않음, 1:알림
      // "unusedWorkHoursCalc": 1,			캠페인 기능 업무 시간 라벨 - 업무 시간 적용 여부 (체크) 체크되어 있을 때는 캠페인 가능 업무 시간 다 Disabled 0:사용, 1:미사용
      // "sendingWorkStartHours": "0000",	발신 업무 시간 시작 시간 - 발신 업무 시작 시간
      // "sendingWorkEndHours": "0000",		발신 업무 시간 종료 시간 - 발신 업무 종료 시간
      // "dayOfWeekSetting": "f,f,f,f,f,f,f"	요일 설정 - 발신 업무 가능 요일 (f는 체크 안 됨, t는 체크)

      const initialEnvironmentData = {
        code: "0",
        message: 'initial environment data',
        campaignListAlram : 0,
        statisticsUpdateCycle: 30,
        serverConnectionTime: 100,
        showChannelCampaignDayScop: 5,
        personalCampaignAlertOnly: 0,
        useAlramPopup: 0,
        unusedWorkHoursCalc: 1,
        sendingWorkStartHours: "0000",
        sendingWorkEndHours: "0000",
        dayOfWeekSetting: 'f,f,f,f,f,f,f',
      };
      if(centerId === '' || centerName === '') {
        centerInfo();
      }
      
      setEnvironment(initialEnvironmentData);        
    }
  
  }, [environmentData]);


  const popupRef = useRef<Window | null>(null);

  const openInNewWindow = () => {
    // 이미 팝업이 열려 있는 경우 새로 열지 않음
    if (popupRef.current && !popupRef.current.closed) {
      // console.log('팝업이 이미 열려 있습니다.');
      popupRef.current.moveTo(100, 100);    // 화면 좌표로 이동
      popupRef.current.resizeTo(600, 400);  // 크기 조절
      popupRef.current.focus(); // 기존 창으로 포커스 이동
      return;
    }
    const isPopupOpen = localStorage.getItem('monitorPopupOpen');
    if (isPopupOpen === 'true' && (popupRef.current && !popupRef.current.closed)) {
      // alert('이미 팝업이 열려 있습니다.'); // 또는 무시
      return;
    }
    // 현재 화면의 크기를 가져옵니다
    const width = window.screen.width;
    const height = window.screen.height;

    // 창을 화면 중앙에 위치시킵니다
    const left = 0;  // 전체 화면이므로 0으로 설정
    const top = 0;   // 전체 화면이므로 0으로 설정

    const newWindow = window.open(
      '/monitor',
      'monitor-window',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );

    if (newWindow) {
      newWindow.focus();
      // popup 창이 열려있다면 useRef에 연결 (로그아웃시 팝업창 닫히게 하기 위함)
      popupRef.current = newWindow;
      
      localStorage.setItem('monitorPopupOpen', 'true'); // 다른 탭도 알 수 있음

      // 팝업이 닫히면 상태 해제
      const timer = setInterval(() => {
        if (popupRef.current?.closed) {
          localStorage.setItem('monitorPopupOpen', 'false');
          clearInterval(timer);
        }
      }, 500);
    }
  };

  const {
    tenants,
    setCampaigns,
    setTenants,
  } = useMainStore();

  const {
    addTab,
    removeTab,
    openedTabs,
    duplicateTab,
    activeTabId,
    activeTabKey,
    getTabCountById,
    rows,
    tabGroups,
    setActiveTab,
  } = useTabStore();

  const { data: campaignSkillsData } = useApiForGetCampaignSkills();
  const { data: campaignGroupsData } = useApiForGetCampaignGroups();

  const { mutate: fetchSkills } = useApiForSkills({
    onSuccess: (data) => {
      setSkills(data.result_data || []);
      
      useMainStore.getState().setCampaignSkillsLoaded(true); 
      // console.log("Skills data loaded in header, updated store")
    },
    onError: (error) => {
      // 로딩 상태 해제
      ServerErrorCheck('스킬 리스트 조회', error.message);
      useCampainManagerStore.getState().setSkillsLoading(false); // ??
      // console.log("Error loading skills data:", error);
    },
    retry: 0,
  });

  const handleMenuClick = (item: MenuItem, event: React.MouseEvent<HTMLButtonElement>) => {
    if (item.id === 3) {
      openInNewWindow();
      return;
    }

    // 특별한 탭 처리 (2, 8, 9, 11) - 2번 탭 추가
    if ([2, 8, 9, 11].includes(item.id)) {
      // 새로운 openSingleTabAtCurrentSection 함수 사용
      // 이 함수는 배타적 탭 그룹을 지원하고 현재 활성화된 섹션에 탭을 추가함
      useTabStore.getState().openSingleTabAtCurrentSection(item.id, item);
      return;
    }

    // 일반 메뉴 클릭 처리 - 이 부분은 그대로 유지
    if (event.ctrlKey) {
      duplicateTab(item.id);
    } else {
      // 기존 동일 ID 탭 제거
      openedTabs
        .filter(tab => tab.id === item.id)
        .forEach(tab => removeTab(tab.id, tab.uniqueKey));

      // 새 탭 추가 및 활성화
      const newTabKey = `${item.id}-${Date.now()}`;
      const newTab = { ...item, uniqueKey: newTabKey, content: item.content || null };
      addTab(newTab);
      setActiveTab(item.id, newTabKey);
    }
  }


  const isTabOpened = (itemId: number) => {
    const existingTabs = openedTabs.filter(tab => tab.id === itemId);
    return existingTabs.length > 0;
  };

  const isActiveTab = (itemId: number) => {
    return openedTabs.some(
      tab => tab.id === itemId && tab.id === activeTabId && tab.uniqueKey === activeTabKey
    );
  };

  const handleLoginOut = () => {

    // 로그아웃 공통함수로 처리
    logoutFunction();

    // 통합모니터창이 열려있다면 popup close
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }

    // 홈 또는 로그인 페이지로 리다이렉트 
    router.push('/login');
  }


  const { mutate: fetchTenants } = useApiForTenants({
    onSuccess: (data) => {
      if (data.result_code === 5) {
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: '로그인 정보가 없습니다.',
          type: '2',
          onClose: () => goLogin(),
        });
        useMainStore.getState().setTenantsLoading(false);
      } else {
        if (tenant_id === 0) {
          setTenants(data.result_data);
        } else {
          setTenants(data.result_data.filter(data => data.tenant_id === tenant_id));
        }
        // console.log("Tenant data loaded in header, updated store");
      }
    },
    onError: (error) => {
      // tofix 로그인 에러 발생
      // console.log("error 에러 발생 여기 !!!!!! : ", error);
      useMainStore.getState().setTenantsLoading(false);

      ServerErrorCheck('테넌트 리스트 조회', error.message);
    }
  });

  const goLogin = () => {
    logoutFunction();
    router.push('/login');
  }

  // useEffect(() => {

  useEffect(() => {
    if (_sessionKey !== "") {
      // 테넌트 로딩 상태 설정
      const store = useMainStore.getState();

      // 데이터가 이미 로드되었으면 건너뛰기
      // if (store.tenantsLoaded && store.tenants.length > 0) {
      //   console.log("Tenants already loaded, skipping API call");
      //   return;
      // }

      // 로딩 중이면 중복 호출 방지
      if (store.tenantsLoading) {
        
        return;
      }

      // 로딩 시작
      store.setTenantsLoading(true);
      // console.log("Starting tenant data fetch from header");

      fetchTenants({
        session_key: _sessionKey,
        tenant_id: _tenantId,
      });
    }
  }, [fetchTenants, _sessionKey, _tenantId]);


  useEffect(() => {
    if (tenants.length > 0 && _sessionKey !== "") {
      // 캠페인 데이터 로딩 상태 확인
      const store = useMainStore.getState();

      // 데이터가 이미 로드되었으면 건너뛰기
      // if (store.campaignsLoaded && store.campaigns.length > 0) {
      //   console.log("Campaigns already loaded, skipping API call");
      //   return;
      // }

      // 로딩 중이면 중복 호출 방지
      if (store.campaignsLoading) {
        // console.log("Ca mpaigns loading in progress, skipping duplicate call");
        return;
      }

      // 로딩 시작
      store.setCampaignsLoading(true);
      // console.log("Starting campaign data fetch from header");

      fetchMain({
        session_key: _sessionKey,
        tenant_id: _tenantId
      });
    }
  }, [tenants]);

  // 캠페인 데이터가 변경될 때마다 로그 추가
  useEffect(() => {
    const { campaigns } = useMainStore.getState();
    // console.log("Campaigns updated in header component:", campaigns);
  }, [useMainStore.getState().campaigns]);

  const { mutate: fetchMain } = useApiForMain({
    onSuccess: (data) => {
      if (tenant_id === 0) {
        setCampaigns(data.result_data);
        //스킬 마스터 조회.
        const tempTenantIdArray = tenants.map((tenant) => tenant.tenant_id);
        fetchSkills({ tenant_id_array: tempTenantIdArray });
      } else {
        setCampaigns(data.result_data.filter(data => data.tenant_id === tenant_id));
        //스킬 마스터 조회.
        fetchSkills({ tenant_id_array: [tenant_id] });
      }
      // console.log("Campaign data loaded in header, updated store");
      setShouldFetchCounselors(true);  // 이 시점에 상담사 목록 조회 활성화
    },
    onError: (error) => {
      // 로딩 상태 해제
      useMainStore.getState().setCampaignsLoading(false);
      // console.log("Error loading campaign data:", error);
      ServerErrorCheck('캠페인 리스트 조회', error.message);
    }
  });

  // 훅 관리
  const { data: dataForMenusInfoForRoleId, menuList, headerMenuIds, isLoading: isLoadingMenuInfo } =
    useApiForGetAuthorizedMenusInfoForMenuRoleId({
      roleId: menu_role_id || 1, // menu_role_id가 없을 경우 기본값 1
      enabled: !!menu_role_id // menu_role_id가 있을 때만 활성화
    });

  useEffect(() => {
    if (tenants.length > 0 && _sessionKey !== "") {
      // 스킬 데이터 로딩 상태 확인
      const store = useCampainManagerStore.getState();

      // 데이터가 이미 로드되었으면 건너뛰기
      if (store.skillsLoaded && store.skills.length > 0) {
        // console.log("Skills already loaded, skipping API call");
        return;
      }

      // 로딩 중이면 중복 호출 방지
      if (store.skillsLoading) {
        return;
      }

      // 로딩 시작
      store.setSkillsLoading(true);

    }
  }, [tenants, _sessionKey]);

  return (
    <div className="flex flex-col">
      <AuthTimeOutCheck popupRef={popupRef} />
      <div className="header-top h-[28px] flex items-center">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <Image
              src="/header-menu/header-logo.svg"
              alt="U PDS"
              width={54}
              height={18}
              priority
            />
          </div>
          <div className="flex items-center space-x-4 text-white text-sm">

            <div className='flex items-center space-x-1'>

              <div className='flex items-center space-x-1'>
                {tenant_id === 0 && (
                  <div>
                    {/* s 글자의 outline button 으로 시스템 관리자임을 알림 shadcn ui button */}
                    <Button variant="outline" className="text-xs px-1 py-0 mr-1 bg-[#56CAD6]/20 text-[#56CAD6] rounded-full">
                      S
                    </Button>
                  </div>
                )}
              </div>

              <Image
                src="/header-menu/top_pic.svg"
                alt="사용자"
                width={14}
                height={14}
                priority
              />
              <span>{userId}</span>
            </div>
            <CommonButton
              variant="ghost"
              className="flex items-center space-x-1 text-sm text-white hover:bg-[#56CAD6]/20"
              onClick={handleLoginOut}
            >
              <Image
                src="/header-menu/log-out.svg"
                alt="로그아웃"
                width={11}
                height={12}
                priority
              />
            </CommonButton>
          </div>
        </div>
      </div>
      <header className="bg-white border-b">
        {/* menu_role_id : {menu_role_id} */}
        {/* tentant_id : {_tenantId} */}
        {/* useAlramPopup: {useAlramPopup} */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between header-padding">

            <nav className="flex overflow-x-auto gap-3">
              {menuItems
                .filter(item =>
                  availableHeaderMenuIds?.includes(item.menuId) ||
                  item.id === 701   // 15번은 예외로 무조건 출력
                )
                .map((item) => {
                  const count = getTabCountById(item.id);
                  const isActive = isActiveTab(item.id);
                  const isOpened = isTabOpened(item.id);

                  return (
                    <div key={`menu-${item.id}`} className="menu-item">
                      <CommonButton
                        variant={
                          isActive
                            ? 'menuActive'
                            : isOpened
                              ? 'menuOpened'
                              : 'menu'
                        }
                        size="default"
                        onClick={(e) => handleMenuClick(item, e)}
                        className="relative py-1.5 px-2"
                      >
                        <div className="flex items-center justify-center">
                          <Image
                            src={item.icon}
                            alt={item.title}
                            width={32}
                            height={32}
                            style={{ width: '32px', height: '32px' }}
                            className="object-contain"
                          />
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`text-xs whitespace-nowrap ${isActive ? 'text-white' : 'text-[#333]'
                              }`}
                          >
                            {item.title}
                          </span>
                          {count > 1 && (
                            <span className="ml-1 px-1.5 py-0.5 text-[10px] leading-none bg-[#E5F3F3] text-[#5BC2C1] rounded-full min-w-[16px] text-center">
                              {count}
                            </span>
                          )}
                        </div>
                      </CommonButton>
                    </div>
                  );
                })}
            </nav>


            <div>

            </div>
          </div>
        </div>
      </header>
      <CustomAlert
        message={alertState.message}
        title={alertState.title}
        type={alertState.type}
        isOpen={alertState.isOpen}
        onClose={() => {
          alertState.onClose()
        }}
        onCancel={() => setAlertState((prev) => ({ ...prev, isOpen: false }))} />
        <GlobalErrorAlert />
    </div>
  );
}