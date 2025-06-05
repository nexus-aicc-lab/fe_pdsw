'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ChevronUp, ChevronDown, Bell, BellOff, Trash } from "lucide-react";
import { debounce, isEqual, throttle } from 'lodash';
import { useAuthStore, useMainStore, useCampainManagerStore } from '@/store';
import { Resizable } from "re-resizable";
import { useApiForMain } from '@/features/auth/hooks/useApiForMain';
import { useEnvironmentStore } from "@/store/environmentStore";
import { toast, initToasts } from "./CustomToast";
import { useApiForGetTreeMenuDataForSideMenu } from "@/features/auth/hooks/useApiForGetTreeMenuDataForSideMenu";
import { useApiForGetTreeDataForCampaignGroupTab } from "@/features/campaignManager/hooks/useApiForGetTreeDataForCampaignGroupTab";
import { cn } from "@/lib/utils";
import { useCampaignDialStatusStore } from "@/store/campaignDialStatusStore";
import { sseMessageChannel, logoutChannel } from '@/lib/broadcastChannel';
import logoutFunction from "@/components/common/logoutFunction";
import { useRouter } from 'next/navigation';
import { useApiForSchedules } from '@/features/campaignManager/hooks/useApiForSchedules';
import { useApiForCallingNumber } from '@/features/campaignManager/hooks/useApiForCallingNumber';
import { useApiForCampaignSkill } from '@/features/campaignManager/hooks/useApiForCampaignSkill';
import { useSideMenuCampaignGroupTabStore } from "@/store/storeForSideMenuCampaignGroupTab";
import CustomAlert from "./CustomAlert";
import { useAgentSkillStatusStore } from "@/store/agenSkillStatusStore";
import { useQueryClient } from "@tanstack/react-query";

const errorMessage = {
  isOpen: false,
  message: '',
  title: '알림',
  type: '1',
  onClose: () => { },
  onCancel: () => { },
};

type FooterDataType = {
  time: string;
  type: string;
  message: string;
};

interface FooterProps {
  footerHeight: number;      // 열려 있을 때 푸터의 높이(px)
  startResizing?: () => void; // 드래그로 푸터 높이를 조절하기 위한 함수
  onToggleDrawer?: (isOpen: boolean) => void; // 부모 컴포넌트에 열림/닫힘 상태 전달
  onResizeHeight?: (height: number) => void; // 리사이즈된 높이를 부모 컴포넌트에 전달
  onResizeStart?: () => void; // 리사이즈 시작 이벤트
  onResizeEnd?: (height: number) => void; // 리사이즈 종료 이벤트 - height 매개변수 추가
}

// 1122
export default function Footer({
  footerHeight,
  onToggleDrawer,
  onResizeHeight,
  onResizeStart,
  onResizeEnd
}: FooterProps) {
  const [isExpanded, setIsExpanded] = useState(false);   // D(1단) / W(2단) 모드 토글
  const [isDrawerOpen, setIsDrawerOpen] = useState(true); // 푸터 열기/닫기 토글
  const [footerDataList, setFooterDataList] = useState<FooterDataType[]>([]);
  const [currentHeight, setCurrentHeight] = useState(footerHeight);
  const { id, tenant_id, role_id } = useAuthStore();
  const queryClient = useQueryClient();
  const { tenants, campaigns, setCampaigns, setSseInputMessage } = useMainStore();
  const { channelGroupList, setChannelGroupList, schedules, setSchedules, setCallingNumbers, setCampaignSkills } = useCampainManagerStore();
  const { useAlramPopup } = useEnvironmentStore();
  const [isResizing, setIsResizing] = useState(false);
  const [isHeightToggled, setIsHeightToggled] = useState(false);

  const throttledResizeUpdate = useMemo(
    () => throttle((height: number) => {
      if (onResizeHeight) {
        onResizeHeight(height);
      }
    }, 16), // 16ms throttle for smooth ~60fps
    [onResizeHeight]
  );

  const { invalidateTreeMenuData } = useApiForGetTreeMenuDataForSideMenu();
  const { invalidateCampaignGroupTreeData } = useApiForGetTreeDataForCampaignGroupTab();
  const [sseData, setSseData] = useState<string>('');
  const router = useRouter();


  const lastProcessedMessageRef = useRef<string | null>(null);

  const { addCampaignDialStatus, removeCampaignDialStatus } = useCampaignDialStatusStore();

  const debouncedInvalidate = useMemo(
    () =>
      debounce(() => {
        invalidateTreeMenuData();
        // invalidateCampaignGroupTreeData();
      }, 500),
    [] // invalidate 함수가 stable 하다면 빈 배열, 아니면 [invalidateTreeMenuData,…]
  );

  useEffect(() => {
    return () => {
      debouncedInvalidate.cancel();
    };
  }, [debouncedInvalidate]);

  useEffect(() => {
    initToasts();
  }, []);

  // 부모 컴포넌트에 열림/닫힘 상태 변경 알림
  useEffect(() => {
    if (onToggleDrawer) {
      onToggleDrawer(isDrawerOpen);
    }
  }, [isDrawerOpen, onToggleDrawer]);

  // D(1단) <-> W(2단) 전환
  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
    // 만약 닫혀 있었다면(32px 상태) W 모드 누를 때 자동 열기 (원치 않으면 제거)
    if (!isDrawerOpen) {
      setIsDrawerOpen(true);
      if (onToggleDrawer) {
        onToggleDrawer(true);
      }
    }
  };

  // 열기/닫기
  const toggleDrawer = () => {
    const newState = !isDrawerOpen;
    setIsDrawerOpen(newState);
    if (onToggleDrawer) {
      onToggleDrawer(newState);
    }
  };


  const speakMessage = (message: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const msg = new window.SpeechSynthesisUtterance(message);
      msg.lang = "ko-KR";
      window.speechSynthesis.speak(msg);
    }
  };

  // 알림 모두 비우기 기능
  const handleClearNotifications = () => {
    setFooterDataList([]);
    // 음성 알림 사용
    speakMessage("푸터 창이 초기화되었습니다.");
  };

  //캠페인 정보 조회 api 호출
  const { mutate: fetchMain } = useApiForMain({
    onSuccess: (data) => {
      setCampaigns(data.result_data);
    }
  });

  // 캠페인 스케줄 조회 API 호출
  const { mutate: fetchSchedules } = useApiForSchedules({
    onSuccess: (data) => {
      setSchedules(data.result_data);
    }
  });

  // 캠페인 발신번호 조회
  const { mutate: fetchCallingNumbers } = useApiForCallingNumber({
    onSuccess: (data) => {
      setCallingNumbers(data.result_data || []);
    }
  });

  // 캠페인스킬 조회
  const { mutate: fetchCampaignSkills } = useApiForCampaignSkill({
    onSuccess: (data) => {
      setCampaignSkills(data.result_data || []);
    }
  });

  // Helper function to add a message to footerDataList
  const addMessageToFooterList = (time: string, type: string, message: string) => {
    if (message !== '') {
      setFooterDataList((prev) => [
        {
          time,
          type,
          message
        },
        ...prev.slice(0, 9) // 상위 10개만 보이게
      ]);
    }
  };

  const footerDataSet = useCallback((announce: string, command: string, data: any, kind: string, campaign_id: string, skill_id: string, tempEventData: any): void => {
    //시간.
    const today = new Date();
    const _time = String(today.getHours()).padStart(2, '0') + ':' + String(today.getMinutes()).padStart(2, '0') + ':' + String(today.getSeconds()).padStart(2, '0');

    // Check if we need to invalidate tree menu data
    const shouldInvalidateTreeMenu = (
      // 캠페인 추가/수정/삭제
      (announce === '/pds/campaign' && ['INSERT', 'UPDATE', 'DELETE'].includes(command)) ||
      // 캠페인 상태 변경
      (announce === '/pds/campaign/status' && command === 'UPDATE') ||
      // 스킬 추가/수정/삭제
      (announce === '/pds/skill' && ['INSERT', 'UPDATE', 'DELETE'].includes(command)) ||
      // 캠페인 요구스킬 수정
      (announce === '/pds/campaign/skill' && command === 'UPDATE') ||
      // 상담사 리소스 수정/삭제
      (announce === 'update-agent' && ['UPDATE', 'DELETE'].includes(command))
    );

    // 필요한 경우 트리 메뉴 데이터 갱신
    if (shouldInvalidateTreeMenu) {
      debouncedInvalidate();
    }

    //타입.
    let _type = 'EVENT';
    if (kind === 'event') {
      _type = 'EVENT';
    } else if (kind === 'agent') {
      _type = 'AGENT';
    } else if (kind === 'alram') {
      _type = 'ALRAM';
    }

    //메시지.
    let _message = '';
    let _message2 = '';

    //운영설정>캠페인별 발신번호설정
    if (announce === '/pds/campaign/calling-number') {
      // _message = '캠페인 : ';
      // if (command === 'INSERT') {
      //   _message += '[' + campaign_id + '], 사용자 발신번호 설정 추가 성공';
      // } else if (command === 'DELETE') {
      //   _message += '[' + campaign_id + '], 사용자 발신번호 설정 삭제 성공';
      // } else if (command === 'UPDATE') {
      //   _message += '[' + campaign_id + '], 사용자 발신번호 설정 변경 성공';
      // }
      // addMessageToFooterList(_time, _type, _message);
    }
    //전화번호설명 템플릿
    else if (announce === '/pds/phone-description') {
      if (command === 'INSERT') {
        _message = '[전화번호설명 템플릿 추가]템플릿ID: ' + data['description_id'];
      } else if (command === 'UPDATE') {
        _message = '[전화번호설명 템플릿 수정]템플릿ID: ' + data['description_id'];
      } else if (command === 'DELETE') {
        _message = '[전화번호설명 템플릿 삭제]템플릿ID: ' + data['description_id'];
      }
      addMessageToFooterList(_time, _type, _message);
    }
    //장비 추가/삭제/상태(사용, 사용중지)
    else if (announce === 'dialing-device') {
      if (command === 'INSERT') {
        _message = '[장비추가]장비아이디: ' + data['device_id'];
        addMessageToFooterList(_time, _type, _message);
      } else if (command === 'UPDATE') {
        if (data['device_status'] === 'run') {
          _message = 'CIDS 작동중';
          // 커스텀 이벤트 발생 - 장비 상태 변경을 다른 컴포넌트에 알림
          const deviceStatusEvent = new CustomEvent('deviceStatusChange', {
            detail: {
              device_id: data['device_id'].toString(),
              device_status: 'run'
            }
          });
          window.dispatchEvent(deviceStatusEvent);
          addMessageToFooterList(_time, _type, _message);
        } else if (data['device_status'] === 'down') {
          _message = 'CIDS 작동 중지';
          // 커스텀 이벤트 발생 - 장비 상태 변경을 다른 컴포넌트에 알림
          const deviceStatusEvent = new CustomEvent('deviceStatusChange', {
            detail: {
              device_id: data['device_id'].toString(),
              device_status: 'down'
            }
          });
          window.dispatchEvent(deviceStatusEvent);
          addMessageToFooterList(_time, _type, _message);
        }
      } else if (command === 'DELETE') {
        _message = '[장비 제거] 장비 ID: ' + data['device_id'];
        addMessageToFooterList(_time, _type, _message);
      }
    }
    // 캠페인 수정 > 콜페이싱 수정
    else if (announce === '/pds/campaign/dial-speed') {
      // _message = '[콜페이싱] ';
      // if (command === 'UPDATE') {
      //   const tempCampaign = campaigns.find((campaign) => campaign.campaign_id === Number(campaign_id));
      //   if (tempCampaign && tempCampaign.dial_mode === 2) {
      //     _message += '캠페인 ID ' + campaign_id + ' , 현재 설정 값 ' + data['dial_speed'] * 2;
      //   } else {
      //     _message += '캠페인 ID ' + campaign_id + ' , 현재 설정 값 ' + data['dial_speed'] * 2;
      //   }
      //   addMessageToFooterList(_time, _type, _message);
      //   fetchMain({
      //     session_key: '',
      //     tenant_id: tenant_id,
      //   });
      // }
    }
    //캠페인.
    else if (announce === '/pds/campaign') {
      _message = '[캠페인 ';
      let _start_flag = '';
      if (data['start_flag'] === 1) {
        _start_flag = '시작';
      } else if (data['start_flag'] === 2) {
        _start_flag = '멈춤';
      } else if (data['start_flag'] === 3) {
        _start_flag = '중지';
      }
      let _end_flag = '';
      if (data['end_flag'] === 1) {
        _end_flag = '진행중';
      } else if (data['end_flag'] === 2) {
        _end_flag = '완료';
      }

      if (command === 'INSERT') {
        _message += '추가] 캠페인 아이디 : ' + campaign_id + ' , 캠페인 이름 : ' + data['campaign_name'] + ' , 동작상태 : ' + _start_flag + ', 완료구분 : ' + _end_flag;
        _message2 = `[EVENT] [${campaign_id}] 캠페인 추가`;

        // 캠페인 추가 시 토스트 메시지
        if (useAlramPopup === 1) {
          toast.event(_message2, {
            duration: 6000
          });
        }
        addMessageToFooterList(_time, _type, _message);
      } else if (command === 'UPDATE') {
        _message += '수정] 캠페인 아이디 : ' + campaign_id + ' , 캠페인 이름 : ' + data['campaign_name'] + ' , 동작상태 : ' + _start_flag + ', 완료구분 : ' + _end_flag;
        _message2 = `[EVENT] [${campaign_id}] 캠페인 수정`;

        // 캠페인 수정 시 토스트 메시지
        if (useAlramPopup === 1) {
          toast.event(_message2, {
            duration: 6000
          });
        }
        addMessageToFooterList(_time, _type, _message);
      } else if (command === 'DELETE') {
        _message += '삭제] 캠페인 아이디 : ' + campaign_id;
        _message2 = `[EVENT] [${campaign_id}] 캠페인 삭제`;

        // 캠페인 삭제 시 토스트 메시지
        if (useAlramPopup === 1) {
          toast.event(_message2, {
            duration: 6000
          });
        }
        addMessageToFooterList(_time, _type, _message);
      }

      fetchMain({
        session_key: '',
        tenant_id: tenant_id,
      });
      // 여기에서 직접 setSseInputMessage 호출
      useCampaignDialStatusStore.getState().setSseInputMessage('campaign:', campaign_id, command);

      if (data['start_flag'] === 3) {
        const statusMessage = '캠페인 동작상태 변경, 캠페인 아이디 : ' + campaign_id + ' , 캠페인 이름 : ' + data['campaign_name'] + ' , 동작상태 : ' + _start_flag + ', 완료구분 : ' + _end_flag;

        // 알림 설정이 활성화되어 있으면 토스트 표시
        if (useAlramPopup === 1) {
          toast.event(`[EVENT] [${campaign_id}] 캠페인 상태 변경`, {
            duration: 6000,
          });
        }

        // 이미 위에서 메시지를 추가했으므로 여기서는 추가하지 않음
      }
    }
    //스킬.
    else if (announce === '/pds/skill/agent-list') {
      const tempAgentIdList = data['agent_id'];
      const _skillId = skill_id;

      if (tempAgentIdList && tempAgentIdList.length > 0) {
        let actionType = '';
        if (command === 'UPDATE' || command === 'INSERT') {
          actionType = '할당';
        } else if (command === 'DELETE') {
          actionType = '해제';
        }
        const _message = '[상담사 스킬' + actionType + '] 스킬아이디: ' + skill_id;
        addMessageToFooterList(_time, _type, _message);

        queryClient.invalidateQueries({
          queryKey: ['counselorList']
        });

        // 분배제한 호수 전달을 위한 event 발송
        const agentSkillUpdateStatus = new CustomEvent('agentSkillUpdateStatus', {
          detail: {
            agent_status: 'update'
          }
        });
        window.dispatchEvent(agentSkillUpdateStatus);

        // 스킬편집에 전달을 위한 store 업데이트
        useAgentSkillStatusStore.getState().setAgentSkillStatus(true);
        // 캠페인 관리(상세) 전달을 위한 호출
        fetchMain({
          session_key: '',
          tenant_id: tenant_id,
        });

        // 토스트 알림은 한 번만 표시
        if (useAlramPopup === 1) {
          toast.event(`[EVENT] [${_skillId}] 상담사 스킬 ${actionType}`, {
            duration: 6000
          });
        }
      }
    }
    //스킬편집
    else if (announce === '/pds/skill') {
      _message = '[스킬 ';
      if (command === 'INSERT') {
        _message += '추가] 스킬 아이디 : ' + skill_id + ' , 스킬 이름 : ' + data['skill_name'];
      } else if (command === 'UPDATE') {
        _message += '변경] 스킬 아이디 : ' + skill_id + ' , 스킬 이름 : ' + data['skill_name'];
      } else if (command === 'DELETE') {
        _message += '삭제] 스킬 아이디 : ' + skill_id + ' , 스킬 이름 : ' + data['skill_name'];
      }
      addMessageToFooterList(_time, _type, _message);
    }
    //캠페인 요구스킬 수정
    else if (announce === '/pds/campaign/skill') {
      if (command === 'UPDATE') {
        _message = '[캠페인 요구스킬 수정] 캠페인 아이디 : ' + campaign_id;
        addMessageToFooterList(_time, _type, _message);
        fetchCampaignSkills({ session_key: '', tenant_id: 0 });
        // 커스텀 이벤트 발생 - 장비 상태 변경을 다른 컴포넌트에 알림
        const campaignSkillUpdateStatus = new CustomEvent('campaignSkillUpdateStatus', {
          detail: {
            campaign_id: campaign_id.toString(),
            campaign_status: 'update'
          }
        });
        window.dispatchEvent(campaignSkillUpdateStatus);
      }
    }
    //상담사 자원 수정/삭제
    else if (announce === 'update-agent') {
      _message = '[상담사 자원 ';
      if (command === 'INSERT') {
        _message += '추가] 상담사 아이디 : ' + data['employee_id'] + ' , 상담사 이름 : ' + data['agent_name'];
      } else if (command === 'UPDATE') {
        _message += '수정] 상담사 아이디 : ' + data['employee_id'] + ' , 상담사 이름 : ' + data['agent_name'];
      } else if (command === 'DELETE') {
        _message += '삭제] 상담사 아이디 : ' + data['employee_id'] + ' , 상담사 이름 : ' + data['agent_name'];
      }
      addMessageToFooterList(_time, _type, _message);
    }
    //캠페인수정>동작시간 추가
    else if (announce === '/pds/campaign/schedule') {
      // _message = '[캠페인 스케쥴';
      // if (command === 'INSERT') {
      //   // _message += '수정, 캠페인 아이디 : ' + campaign_id + ' , 캠페인 이름 : ' + data['campaign_name'];
      //   _message += '수정] 캠페인 아이디 : ' + campaign_id;
      //   addMessageToFooterList(_time, _type, _message);
      // }
      // else if (command === 'UPDATE') {
      //   // _message += '변경, 캠페인 아이디 : ' + campaign_id + ' , 캠페인 이름 : ' + data['campaign_name'];
      //   _message += '변경] 캠페인 아이디 : ' + campaign_id;
      //   addMessageToFooterList(_time, _type, _message);
      // }
      // else if (command === 'DELETE') {
      //   // _message += '삭제] 캠페인 아이디 : ' + campaign_id + ' , 캠페인 이름 : ' + data['campaign_name'];
      //   _message += '삭제] 캠페인 아이디 : ' + campaign_id;
      //   addMessageToFooterList(_time, _type, _message);
      // }
    }
    //캠페인 동작상태 변경
    else if (announce === '/pds/campaign/status') {
      if (command === 'UPDATE') {
        let _start_flag = '';
        let _end_flag = '';


        if (data['campaign_status'] === 1) {
          _start_flag = '시작';
        } else if (data['campaign_status'] === 2) {
          _start_flag = '멈춤';
        } else if (data['campaign_status'] === 3) {
          _start_flag = '중지';
        } else if (data['campaign_status'] === 4) {
          _start_flag = '스케줄 PAUSE';
        } else if (data['campaign_status'] === 5) {
          _start_flag = '캠페인 멈춤 중';
        } else if (data['campaign_status'] === 6) {
          _start_flag = '캠페인 정지 중';
        } else if (data['campaign_status'] === 9) {
          _start_flag = '스케줄 시작';
        }

        if (data['campaign_end_flag'] === 1) {
          _end_flag = '진행중';
        } else if (data['campaign_end_flag'] === 2) {
          _end_flag = '완료';
        }

        const camapaignDialStatus = useCampaignDialStatusStore.getState().campaignDialStatus.find((status) => status.campaign_id === campaign_id);

        // 통합모니터링창에 보내기
        useCampaignDialStatusStore.getState().setSseInputMessage('campaign_status:' + _start_flag + ':' + data['campaign_status'], campaign_id);

        // 멈춤중이나 정지중일때 store에 add
        if ((data['campaign_status'] === 5 || data['campaign_status'] === 6) && data['campaign_end_flag'] === 1) {

          // 로직 결정전 add 하기전에 항상 이미 존재하면 지워주기
          if (camapaignDialStatus) {
            removeCampaignDialStatus({ campaign_id: campaign_id });
          }

          // 캠페인 상태가 시작이며 발신중일때
          addCampaignDialStatus({ campaign_id: campaign_id, status: data['campaign_status'] });

          // fixed 0516
          useSideMenuCampaignGroupTabStore.getState().updateCampaignStatus(
            campaign_id,
            data['campaign_status']
          );

        }
        else if ( data['campaign_status'] === 2 || data['campaign_status'] === 3 ) {
          // 캠페인 상태가 멈춤이나 정지이며, 완료 되었을때 ==> 차후에 campaign_end_flag 맞춰서 변경해야함!!!
          // 0530 footer 수신이벤트가 end_flag 2로 오는경우가 추가되어서 기존 end_flag 1 조건 삭제
          removeCampaignDialStatus({ campaign_id: campaign_id });
        }

        // 스케줄 PAUSE와 스케줄 시작 구분???
        if ((data['campaign_status'] === 4 || data['campaign_status'] === 9) && data['campaign_end_flag'] === 1) {

          // 로직 결정전 add 하기전에 항상 이미 존재하면 지워주기
          if (camapaignDialStatus) {
            removeCampaignDialStatus({ campaign_id: campaign_id });
          }

          // 만약 같은 캠페인이 전달된다면?
          if ((camapaignDialStatus && data['campaign_status'] === 4 && Number(camapaignDialStatus.status) === 9) ||
            (camapaignDialStatus && data['campaign_status'] === 9 && Number(camapaignDialStatus.status) === 4)) {
            removeCampaignDialStatus({ campaign_id: campaign_id });
          }
          // 캠페인 상태가 스케줄 PAUSE와 스케줄 시작일때,
          addCampaignDialStatus({ campaign_id: campaign_id, status: data['campaign_status'] });
        }


        // 푸터 로그 메시지
        _message = '[캠페인 동작상태 변경] 캠페인 아이디 : ' + campaign_id + ', 동작상태: ' + _start_flag + ', 완료구분: ' + _end_flag;

        // 토스트 알림 표시 (한번만 표시)
        if (useAlramPopup === 1) {
          toast.event(`[EVENT] [${campaign_id}] 캠페인 상태 변경`, {
            duration: 6000,
          });
        }



        // fetchMain({
        //   session_key: '',
        //   tenant_id: tenant_id,
        // });

        // 푸터 데이터 리스트에 추가
        addMessageToFooterList(_time, _type, _message);
      }
    }
    //발신리스트등록
    else if (announce === '/pds/campaign/calling-list') {
      if (command === 'INSERT') {
        // let list_flag = '';
        // if (data['list_flag'] === 'I') {
        //   list_flag = '신규리스트';
        // } else if (data['list_flag'] === 'A') {
        //   list_flag = '추가리스트';
        // } else if (data['list_flag'] === 'D') {
        //   list_flag = '삭제리스트';
        // } else if (data['list_flag'] === 'L') {
        //   list_flag = '초기화';
        // }
        // _message = '발신리스트등록, 캠페인 아이디 : ' + campaign_id + ' , 리스트구분 : ' + list_flag;
        // _message2 = `[EVENT] [${campaign_id}] 발신리스트 ${list_flag} 등록`;
        _message = '[발신리스트등록] 캠페인 아이디 : ' + campaign_id;
        _message2 = `[EVENT] [${campaign_id}] 발신리스트 등록`;

        // 토스트 알림 표시
        if (useAlramPopup === 1) {
          toast.event(_message2, {
            duration: 6000
          });
        }

        addMessageToFooterList(_time, _type, _message);
      } else if (command === 'DELETE') {
        _message = '발신리스트 초기화, 캠페인 아이디 : ' + campaign_id;
        _message2 = `[EVENT] [${campaign_id}] 발신리스트 초기화`;

        // 토스트 알림 표시
        if (useAlramPopup === 1) {
          toast.event(_message2, {
            duration: 6000
          });
        }
        addMessageToFooterList(_time, _type, _message);
      }
    }
    //블랙리스트등록
    else if (announce === '/pds/campaign/black-list') {
      if (command === 'INSERT') {
        _message = '[블랙리스트 등록] 캠페인 아이디 : ' + campaign_id;
        _message2 = `[EVENT] [${campaign_id}] 블랙리스트 등록`;

        // 토스트 알림 표시
        if (useAlramPopup === 1) {
          toast.event(_message2, {
            duration: 6000
          });
        }

        addMessageToFooterList(_time, _type, _message);
      } else if (command === 'DELETE') {
        _message = '[블랙리스트 삭제] 캠페인 아이디 : ' + campaign_id;
        _message2 = `[EVENT] [${campaign_id}] 블랙리스트 삭제`;

        // 토스트 알림 표시
        if (useAlramPopup === 1) {
          toast.event(_message2, {
            duration: 6000
          });
        }
        addMessageToFooterList(_time, _type, _message);
      }
    }
    //예약 재발신
    else if (announce === '/pds/campaign/scheduled-redial') {
      _message = '[예약재발신 ';
      if (command === 'INSERT') {
        _message = _message + '추가] 캠페인 아이디: ' + campaign_id
        if (data['run_flag'] === 0) {
          _message = _message + ' 실행구분: 미실행'
          _message2 = `[EVENT] [${campaign_id}] 예약 재발신 등록[미실행]`;
        } else if (data['run_flag'] === 1) {
          _message = _message + ' 실행구분: 실행'
          _message2 = `[EVENT] [${campaign_id}] 예약 재발신 등록[실행]`;
        } else if (data['run_flag'] === 2) {
          _message = _message + ' 실행구분: Timeout'
          _message2 = `[EVENT] [${campaign_id}] 예약 재발신 등록[Timeout]`;
        }
      } else if (command === 'DELETE') {
        _message = _message + '삭제] 캠페인 아이디: ' + campaign_id
        _message2 = `[EVENT] [${campaign_id}] 예약 재발신 삭제`;
      }

      // 토스트 알림 표시
      if (useAlramPopup === 1) {
        toast.event(_message2, {
          duration: 6000
        });
      }

      addMessageToFooterList(_time, _type, _message);
    }
    //업무시간설정
    else if (announce === '/pds/operating-time') {
      _message = `[업무시간 변경] [${data['start_time']}~${data['end_time']}]`;
      _message2 = `[업무시간 변경]`;

      // 토스트 알림 표시
      if (useAlramPopup === 1) {
        toast.event(_message2, {
          duration: 6000
        });
      }

      addMessageToFooterList(_time, _type, _message);
    }
    //채널할당
    else if (announce === '/pds/channel-assign') {
      _message = `[채널할당] 장비번호: [${data['device_id']}], 채널번호: [${data['channel_count']}], 할당방법: `;
      if (data['assign_kind'] === 1) {
        _message = _message + '캠페인으로 할당';
      } else if (data['assign_kind'] === 2) {
        _message = _message + '발신모드로 할당';
      } else if (data['assign_kind'] === 3) {
        _message = _message + '채널그룹으로 할당';
      }
      setSseInputMessage('channel:');
      addMessageToFooterList(_time, _type, _message);
    }
    //에약콜 제한 설정
    else if (announce === '/pds/campaign/reserved-call') {
      _message = '[예약콜 제한설정 ';
      if (command === 'INSERT') {
        _message = _message + `추가] 캠페인 아이디: [${campaign_id}], 제한건수: [${data['max_call']}]`;
      } else if (command === 'UPDATE') {
        _message = _message + `수정] 캠페인 아이디: [${campaign_id}], 제한건수: [${data['max_call']}]`;
      } else if (command === 'DELETE') {
        _message = _message + `삭제] 캠페인 아이디: [${campaign_id}]`;
      }

      addMessageToFooterList(_time, _type, _message);
    }
    //콜백 리스트 초기화 시각 설정
    else if (announce === '/pds/callback-daily-init-time') {
      _message = '[콜백 리스트 초기화 시각 설정 ';
      if (data['use_flag'] === 0) {
        _message += '미사용';
      } else {
        _message += `사용[${data['init_hour']}시]`;
      }
      addMessageToFooterList(_time, _type, _message);
    }
    //분배호수 제한 초기화 시간설정
    else if (announce === '/pds/maxcall-init-time') {
      _message = `[분배호수 제한 초기화 시간설정] ${data['init_time']}`;
      addMessageToFooterList(_time, _type, _message);
    }
    //분배호수 제한설정
    else if (announce === '/pds/campaign/maxcall-ext') {
      _message = '[분배호수 제한설정 ';
      if (command === 'INSERT') {
        _message += `추가] 캠페인 아이디: [${campaign_id}]`;
      } else if (command === 'UPDATE') {
        _message += `수정] 캠페인 아이디: [${campaign_id}]`;
      } else if (command === 'DELETE') {
        _message += `삭제] 캠페인 아이디: [${campaign_id}]`;
      }

      addMessageToFooterList(_time, _type, _message);
    }
    //채널그룹 변경
    else if (announce === '/pds/channel-group') {
      // _message = '[채널그룹 설정 ';
      if (command === 'INSERT') {
        // _message += `추가] 채널그룹 아이디: [${data['group_id']}], 채널그룹명: [${data['group_name']}]`;
        setChannelGroupList([
          ...channelGroupList,
          { group_id: Number(data['group_id']), group_name: data['group_name'] }
        ]);
      } else if (command === 'UPDATE') {
        // _message += `수정] 채널그룹 아이디: [${data['group_id']}], 채널그룹명: [${data['group_name']}]`;
        setChannelGroupList(
          channelGroupList.map(item =>
            item.group_id === Number(data['group_id'])
              ? { ...item, group_name: data['group_name'] }
              : item
          )
        );
      } else if (command === 'DELETE') {
        // _message += `삭제] 채널그룹 아이디: [${data['group_id']}]`;
        setChannelGroupList(
          channelGroupList.filter(data => data.group_id !== Number(data['group_id']))
        );
      }
      // addMessageToFooterList(_time, _type, _message);channelGroupList
    }
  }, [campaigns, fetchMain, useAlramPopup, debouncedInvalidate, tenant_id]);



  // SSE 구독
  // useEffect(() => {
  //   // 브라우저 환경인지 확인
  //   const isConnected = sessionStorage.getItem("sse_connected");
  //   if (typeof window !== 'undefined' && window.EventSource && id !== '' && !isConnected) {
  //     const DOMAIN = process.env.NEXT_PUBLIC_API_URL;
  //     console.info(">>>>설정값: ", process.env.NEXT_PUBLIC_API_URL)
  //     const eventSource = new EventSource(
  //       // `${DOMAIN}/notification/${tenant_id}/subscribe/${id}`  //로컬테스트시 사용..
  //       `/notification/${tenant_id}/subscribe/${id}`  //개발
  //     );

  //     let data: any = {};
  //     let announce = "";
  //     let command = "";
  //     let kind = "";
  //     let campaign_id = "";

  //     eventSource.addEventListener('message', (event) => {
  //       console.log("footer sse event = ", event.data);

  //       if (event.data !== "Connected!!") {
  //         const tempEventData = JSON.parse(event.data);
  //         if (
  //           announce !== tempEventData["announce"] ||
  //           !isEqual(data, tempEventData.data) ||
  //           !isEqual(data, tempEventData["data"]) ||
  //           kind !== tempEventData["kind"] ||
  //           campaign_id !== tempEventData["campaign_id"]
  //         ) {
  //           announce = tempEventData["announce"];
  //           command = tempEventData["command"];
  //           data = tempEventData["data"];
  //           kind = tempEventData["kind"];
  //           campaign_id = tempEventData["campaign_id"];

  //           footerDataSet(
  //             tempEventData["announce"],
  //             tempEventData["command"],
  //             tempEventData["data"],
  //             tempEventData["kind"],
  //             tempEventData["campaign_id"],
  //             tempEventData["skill_id"] || "", // skill_id 추가 (없을 경우 빈 문자열)
  //             tempEventData // tempEventData는 7번째 매개변수
  //           );
  //         }
  //       }
  //     });
  //     eventSource.onerror = (err) => {
  //       console.warn("SSE 에러 발생...", err);
  //     };
  //     sessionStorage.setItem("sse_connected", "true");
  //   }
  // }, [id, tenant_id]);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      if (typeof window === 'undefined' || !window.EventSource || id === '') return;
      const isConnected = sessionStorage.getItem("sse_connected");
      if (isConnected) return;

      const DOMAIN = process.env.NEXT_PUBLIC_API_URL;
      // console.info(">>>>설정값: ", DOMAIN);

      let dominUrl = `/notification/${tenant_id}/subscribe/${id}`;
      if (window.location.hostname === 'localhost') {
        dominUrl = `${DOMAIN}/notification/${tenant_id}/subscribe/${id}`;
      }
      eventSource = new EventSource(dominUrl);

      let data: any = {};
      let announce = "";
      let command = "";
      let kind = "";
      let campaign_id = "";
      let skill_id = "";

      eventSource.addEventListener('message', (event) => {
        console.log("footer sse event = ", event.data);

        if (event.data !== "Connected!!") {
          try {
            const tempEventData = JSON.parse(event.data);
            if (
              announce !== tempEventData["announce"] ||
              !isEqual(data, tempEventData["data"]) ||
              command !== tempEventData["command"] ||
              kind !== tempEventData["kind"] ||
              skill_id !== tempEventData["skill_id"] ||
              campaign_id !== tempEventData["campaign_id"]
            ) {
              announce = tempEventData["announce"];
              command = tempEventData["command"];
              data = tempEventData["data"];
              kind = tempEventData["kind"];
              campaign_id = tempEventData["campaign_id"];
              skill_id = tempEventData["skill_id"];

              footerDataSet(
                announce,
                command,
                data,
                kind,
                campaign_id,
                tempEventData["skill_id"] || "",
                tempEventData
              );
              setSseData(event.data);

              sseMessageChannel.postMessage({
                type: "sseMessage",
                message: event.data,
              });
            }
          } catch (error) {
            console.error("SSE JSON parse error: ", error);
          }
        }
      });

      eventSource.onerror = (err) => {
        // eventSource?.close();
        sessionStorage.removeItem("sse_connected");

        // 재접속 시도 (3초 후)
        reconnectTimeout = setTimeout(() => {
          connectSSE();
        }, 3000);
      };

      sessionStorage.setItem("sse_connected", "true");
    };

    connectSSE();

    return () => {
      // eventSource?.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      sessionStorage.removeItem("sse_connected");
    };
  }, [id, tenant_id]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, message } = event.data;

      if (type === 'sseMessage') {
        console.log('sseMessageChannel :: ' + message);

        const tempEventData = JSON.parse(message);
        const announce = tempEventData["announce"];
        const command = tempEventData["command"];
        const data = tempEventData["data"];
        const kind = tempEventData["kind"];
        const campaign_id = tempEventData["campaign_id"];
        const skill_id = tempEventData["skill_id"];
        footerDataSet(
          announce,
          command,
          data,
          kind,
          campaign_id,
          tempEventData["skill_id"] || "",
          tempEventData
        );
        setSseData(message);
      }
    };

    sseMessageChannel.addEventListener("message", handleMessage);
    return () => {
      sseMessageChannel.removeEventListener("message", handleMessage);
    };
  }, []);

  const [alertState, setAlertState] = useState(errorMessage);

  useEffect(() => {
    const handleLogoutMessage = (event: MessageEvent) => {
      const { type, message } = event.data;

      if (type === 'logout') {

        // 일반 페이지에서 라우터 사용
        setTimeout(() => {
          setAlertState({
            ...errorMessage,
            isOpen: true,
            message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
            type: '2',
            onClose: () => {
              setAlertState({ ...errorMessage, isOpen: false });
              logoutFunction();
              router.push('/login');
            },
          });
        }, 300);
      }
    };
    logoutChannel.addEventListener("message", handleLogoutMessage);
    return () => {
      logoutChannel.removeEventListener("message", handleLogoutMessage);
    };
  }, []);

  const handleSSEMessage = (tempEventData: any) => {
    try {
      const { announce, command, data, kind, campaign_id, skill_id } = tempEventData;

      const messageId = `${announce}_${command}_${campaign_id}_${skill_id}_${JSON.stringify(data)}`;

      if (lastProcessedMessageRef.current === messageId) {
        console.log("🔄 [중복 메시지 감지] 처리 건너뜀:", messageId);
        return;
      }

      lastProcessedMessageRef.current = messageId;

      footerDataSet(
        announce,
        command,
        data,
        kind,
        campaign_id,
        skill_id,
        tempEventData
      );
    } catch (error) {
      console.error("🚨 [SSE 메시지 처리 오류]", error);
    }
  };

  const handleResizeStartInternal = () => {
    setIsResizing(true);
    onResizeStart?.();
  };

  const handleResizing = useCallback((e: any, direction: any, ref: any) => {
    const newHeight = ref.offsetHeight;

    // DOM 직접 조작으로 실시간 업데이트 (React 상태 업데이트보다 빠름)
    if (footerRef.current && footerRef.current.parentElement) {
      footerRef.current.parentElement.style.height = `${newHeight}px`;
    }

    // 상태 업데이트는 여전히 필요 (리사이징 완료 후 React 상태와 동기화)
    setCurrentHeight(newHeight);
    throttledResizeUpdate(newHeight);
  }, [throttledResizeUpdate]);

  const handleResizeStop = useCallback((e: any, direction: any, ref: any) => {
    const newHeight = ref.offsetHeight;
    setIsResizing(false);
    setCurrentHeight(newHeight);
    onResizeHeight?.(newHeight);
    onResizeEnd?.(newHeight);
  }, [onResizeHeight, onResizeEnd]);

  const handleToggleHeight = () => {
    // toast.info("드래그하여 높이를 조절하세요.");

    const minRowHeight = 24; // 각 알림 줄당 높이
    const padding = 60; // 위 아래 여백 및 테이블 헤더 등 고려
    const rowCount = footerDataList.length;
    const calculatedHeight = Math.min(500, Math.max(100, rowCount * minRowHeight + padding));

    setCurrentHeight(isHeightToggled ? 111 : calculatedHeight);
    onResizeHeight?.(isHeightToggled ? 111 : calculatedHeight);
    setIsHeightToggled(!isHeightToggled);
  };

  useEffect(() => {
    if (sseData != '') {
      console.log('sseData :: ' + sseData);
      const tempEventData = JSON.parse(sseData);
      const announce = tempEventData["announce"];
      const data = tempEventData["data"];
      const command = tempEventData["command"];
      const kind = tempEventData["kind"];
      const skill_id = tempEventData["skill_id"];
      const campaign_id = tempEventData["campaign_id"];
      //시간.
      const today = new Date();
      const _time = String(today.getHours()).padStart(2, '0') + ':' + String(today.getMinutes()).padStart(2, '0') + ':' + String(today.getSeconds()).padStart(2, '0');

      //타입.
      let _type = 'EVENT';
      if (kind === 'event') {
        _type = 'EVENT';
      } else if (kind === 'agent') {
        _type = 'AGENT';
      } else if (kind === 'alram') {
        _type = 'ALRAM';
      }

      //캠페인.
      let _message = '';
      //캠페인수정>동작시간 추가
      if (announce === '/pds/campaign/schedule') {
        _message = '[캠페인 스케쥴';
        const _campaign_name = campaigns.find(data => data.campaign_id === Number(campaign_id))?.campaign_name;
        if (command === 'INSERT') {
          // _message += '수정, 캠페인 아이디 : ' + campaign_id + ' , 캠페인 이름 : ' + data['campaign_name'];
          if (typeof _campaign_name === 'undefined') {
            _message += '수정] 캠페인 아이디 : ' + campaign_id;
            addMessageToFooterList(_time, _type, _message);
          } else {
            _message += '수정] 캠페인 아이디 : ' + campaign_id + ' , 캠페인 이름 : ' + _campaign_name;
            addMessageToFooterList(_time, _type, _message);
          }
        }
        else if (command === 'UPDATE') {
          // _message += '변경, 캠페인 아이디 : ' + campaign_id + ' , 캠페인 이름 : ' + data['campaign_name'];
          _message += '변경] 캠페인 아이디 : ' + campaign_id + ' , 캠페인 이름 : ' + _campaign_name;
          addMessageToFooterList(_time, _type, _message);
        }
        else if (command === 'DELETE') {
          // _message += '삭제] 캠페인 아이디 : ' + campaign_id + ' , 캠페인 이름 : ' + data['campaign_name'];
          _message += '삭제] 캠페인 아이디 : ' + campaign_id + ' , 캠페인 이름 : ' + _campaign_name;
          addMessageToFooterList(_time, _type, _message);
        }

        const tempTenantIdArray = tenants.map((tenant) => tenant.tenant_id);
        fetchSchedules({ tenant_id_array: tempTenantIdArray });
      }
      //캠페인수정>콜페이싱 수정
      else if (announce === '/pds/campaign/dial-speed') {
        _message = '[콜페이싱] ';
        if (command === 'UPDATE') {
          const tempCampaign = campaigns.find((campaign) => campaign.campaign_id === Number(campaign_id));
          if (tempCampaign && tempCampaign.dial_mode === 2) {
            _message += '캠페인 아이디 ' + campaign_id + ' , 현재 설정값 ' + data['dial_speed'] * 2;
          } else if (tempCampaign && tempCampaign.dial_mode === 3) {
            _message += '캠페인 아이디 ' + campaign_id + ' , 현재 설정값 ' + data['dial_speed'];
          }
          addMessageToFooterList(_time, _type, _message);
          fetchMain({
            session_key: '',
            tenant_id: tenant_id,
          });
        }
      }
      //잔량 부족 알람 사용
      else if (announce === 'list-not-enough') {
        _message = '[잔량부족알림] ';
        const _message2 = '[잔량부족알림]';
        if (command === 'UPDATE') {
          const tempCampaign = campaigns.find((campaign) => campaign.campaign_id === Number(data['campaign_id']));
          if (tempCampaign && (tempCampaign.use_list_alarm === 1 || tempCampaign.use_list_alarm === 4 || tempCampaign.use_list_alarm === 5 || tempCampaign.use_list_alarm === 7)) {
            _message += data['campaign_id'] + ' 캠페인 잔량알림 : ' + tempCampaign.list_alarm_count;
            // } else if (tempCampaign && tempCampaign.dial_mode === 3) {
            //   _message += '캠페인 아이디 ' + campaign_id + ' , 현재 설정 값 ' + data['dial_speed'];
            // addMessageToFooterList(_time, _type, _message);
            // 토스트 알림 표시
            if (useAlramPopup === 1) {
              toast.event(_message2, {
                duration: 6000
              });
            }
          }
          if (tempCampaign && (tempCampaign.use_list_alarm === 2 || tempCampaign.use_list_alarm === 4 || tempCampaign.use_list_alarm === 6 || tempCampaign.use_list_alarm === 7)) {
            // tofix ohs 소림 알림 for _message2
            const voiceMessage = `캠페인 ${data['campaign_id']} 잔량 부족 알림: ${tempCampaign.list_alarm_count}건`;
            speakMessage(voiceMessage);
          }
          if (tempCampaign && (tempCampaign.use_list_alarm === 3 || tempCampaign.use_list_alarm === 5 || tempCampaign.use_list_alarm === 6 || tempCampaign.use_list_alarm === 7)) {
            // tofix ohs 관리자에게 전화로 알림 for _message2
            // const voiceMessage = `캠페인 ${data['campaign_id']} 잔량 부족 알림: 관리자에게 알림 발송`;
            // speakMessage(voiceMessage);
          }

        }
      }
      // setCampaigns를 통한(fetchMain 을 안하고) 캠페인 상태 변경
      else if (announce === '/pds/campaign/status') {
        // sseData :: {"kind":"event","command":"UPDATE","announce":"/pds/campaign/status","data":{"campaign_status":3,"campaign_end_flag":1},"campaign_id":"38890","skill_id":null}

        const campaignStatus = data['campaign_status'];
        // campaign_id

        const isCorrectCampaign = campaigns.find((campaign) => campaign.campaign_id === Number(campaign_id));
        // MainDataResponse

        if (isCorrectCampaign) {
          const updatedCampaigns = campaigns.map((campaign) =>
            campaign.campaign_id === Number(campaign_id)
              ? { ...campaign, start_flag: campaignStatus }
              : campaign
          );

          // fixed 0516
          setCampaigns(updatedCampaigns);


          useSideMenuCampaignGroupTabStore.getState().updateCampaignStatus(
            campaign_id,
            campaignStatus
          );

        }
      }
      //운영설정>캠페인별 발신번호설정
      else if (announce === '/pds/campaign/calling-number') {
        _message = '캠페인 : ';
        if (command === 'INSERT') {
          _message += '[' + campaign_id + '], 사용자 발신번호 설정 추가 성공';
        } else if (command === 'DELETE') {
          _message += '[' + campaign_id + '], 사용자 발신번호 설정 삭제 성공';
        } else if (command === 'UPDATE') {
          _message += '[' + campaign_id + '], 사용자 발신번호 설정 변경 성공';
        }
        addMessageToFooterList(_time, _type, _message);
        fetchCallingNumbers({ session_key: '', tenant_id: 0 });
      }

    }
  }, [sseData]);

  const footerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={footerRef}>
      <Resizable
        size={{
          width: '100%',
          height: isDrawerOpen ? currentHeight : 32
        }}
        minHeight={100}
        maxHeight={500}
        enable={{
          top: isDrawerOpen,
          right: false,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }}
        className={cn(
          "border-t text-sm text-gray-600 bg-[#FBFBFB] flex flex-col group relative",
          isExpanded ? "fixed left-0 right-0 bottom-0 z-50" : "relative",
          // 리사이징 중에는 애니메이션 비활성화
          !isResizing && "transition-all duration-300 ease-in-out",
        )}
        onResizeStart={handleResizeStartInternal}
        onResizeStop={handleResizeStop}
        onResize={handleResizing}
        handleComponent={{
          top: (
            <div
              className="w-full h-2 cursor-row-resize bg-transparent hover:bg-gray-200 hover:bg-opacity-50"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 30,
              }}
            />
          ),
        }}
      >
        {/* 상단 바 영역 */}
        <div className="flex-none pt-[5px] pb-[4px] px-[20px] border-b bg-white flex justify-between items-center">
          <div className="flex items-center gap-1">
            <span className="text-[13px] text-[#333]">현재 진행 상태 </span>
          </div>

          <div className="flex items-center gap-2">
            {useAlramPopup === 1 ? (
              <>
                <span title="알림 활성화">
                  <Bell className="w-4 h-4 text-blue-500" />
                </span>
                <button onClick={handleClearNotifications} title="알림 모두 비우기">
                  <Trash className="w-4 h-4 text-gray-500" />
                </button>
              </>
            ) : (
              <span title="알림 비활성화">
                <BellOff className="w-4 h-4 text-gray-400" />
              </span>
            )}

            {/* 열기/닫기 버튼 */}
            <button
              onClick={toggleDrawer}
              className=""
              title={isDrawerOpen ? "닫기" : "열기"}
            >
              {isDrawerOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <CustomAlert
          message={alertState.message}
          title={alertState.title}
          type={alertState.type}
          isOpen={alertState.isOpen}
          onClose={() => {
            alertState.onClose()
          }}
          onCancel={() => setAlertState((prev) => ({ ...prev, isOpen: false }))} />

        {/* 푸터 내부 콘텐츠: isDrawerOpen이 true일 때만 렌더링 */}
        {isDrawerOpen && (
          <div className="flex-1 flex overflow-hidden">
            {/* D(1단) -> w-full, W(2단) -> w-1/2 + 오른쪽 테이블 */}
            <div
              className={`
                ${isExpanded ? "w-1/2" : "w-full"}
                overflow-auto py-[7px] px-[20px]
                ${isExpanded ? "border-r" : ""}
              `}
            >
              <table className="w-full text-sm">
                <tbody>
                  {footerDataList.map((log, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap text-[13px]">[{log.time}]</td>
                      <td className="whitespace-nowrap text-[13px] px-1">[{log.type}]</td>
                      <td className="text-[13px]">{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </Resizable>
    </div>
  );
}

