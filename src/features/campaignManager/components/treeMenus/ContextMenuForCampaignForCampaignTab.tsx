"use client";

import React, { useState, useRef, JSX, useEffect, useMemo } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { useTabStore } from "@/store/tabStore";
import { Check } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import Image from "next/image";

import { useAvailableMenuStore } from "@/store/useAvailableMenuStore";
import { useMainStore } from "@/store/mainStore";
import { useAuthStore } from "@/store/authStore";
import { useApiForMain } from "@/features/auth/hooks/useApiForMain";
import { useApiForCampaignStatusUpdate } from "@/features/campaignManager/hooks/useApiForCampaignStatusUpdate";
import { useApiForCampaignBlacklistCount } from "@/features/listManager/hooks/useApiForCampaignBlacklistCount";
import useApiForCampaignListDelete from "@/features/listManager/hooks/useApiForCampaignListDelete";
import BlackListCountPopup from "@/features/campaignManager/components/popups/BlackListCountPopup";
import CustomAlert, { CustomAlertRequest } from "@/components/shared/layout/CustomAlert";
import IDialogButtonForCampaingDelete from "./dialog/IDialogButtonForCampaingDelete";
import { customAlertService } from "@/components/shared/layout/utils/CustomAlertService";
import { CampaignDialStatus, useCampaignDialStatusStore } from "@/store/campaignDialStatusStore";
import { CheckCampaignSaveReturnCode, UpdataCampaignInfo } from "@/components/common/common";
import { useApiForCampaignManagerUpdate } from "../../hooks/useApiForCampaignManagerUpdate";
import Cookies from "js-cookie";
import { th } from "date-fns/locale";
import ServerErrorCheck from "@/components/providers/ServerErrorCheck";


export type CampaignStatus = "started" | "pending" | "stopped";

export const getStatusIcon = (status?: string) => {
  switch (status) {
    case "started":
      return "/sidebar-menu/tree_play.svg";
    case "pending":
      return "/sidebar-menu/tree_pause.svg";
    case "stopped":
      return "/sidebar-menu/tree_stop.svg";
    case "stoppedProgress":
      return "/sidebar-menu/tree_stop_progress.png";
    case "pauseProgress":
      return "/sidebar-menu/tree_pause_progress.png";
    case "timeset":
      return "/sidebar-menu/tree_timeset.png";
    case "timeattp":
      return "/sidebar-menu/tree_timeattp.png";
    default:
      return null;
  }
};

const errorMessage: CustomAlertRequest = {
  isOpen: false,
  message: '',
  title: '캠페인',
  type: '1',
  onClose: () => { },
  onCancel: () => { },
};

interface ContextMenuForTreeNodeProps {
  children: React.ReactNode;
  item: {
    id: string;
    label: string;
    type: any;
    status: CampaignStatus;
  };
  tenantIdForCampaignTab: any;
  onEdit: () => void;
  onMonitor: () => void;
  onHandleCampaignCopy: () => void;
}

interface MenuItemDefinition {
  menuId?: number;
  key: string;
  title?: string;
  onClick?: () => void;
  render?: () => JSX.Element;
  type?: "separator";
  condition?: boolean;
  className?: string;
}

export function ContextMenuForCampaignForCampaignTab({
  children,
  item,
  onEdit,
  onMonitor,
  tenantIdForCampaignTab,
  onHandleCampaignCopy,
}: ContextMenuForTreeNodeProps) {
  const isFolder = item.type === "folder";
  const { simulateHeaderMenuClick, setCampaignIdForUpdateFromSideMenu, addTab, addMultiTab, setActiveTab } = useTabStore.getState();
  const [isBlacklistPopupOpen, setIsBlacklistPopupOpen] = useState(false);
  const [blackListCount, setBlackListCount] = useState<number>(0);
  const [maxBlacklistCount, setMaxBlacklistCount] = useState<number>(1000000);
  const [commonBlacklistCount, setCommonBlacklistCount] = useState<number>(0);

  const preventCloseRef = useRef(false);
  const [alertState, setAlertState] = useState<CustomAlertRequest>(errorMessage);
  const { availableCampaignTabCampaignContextMenuIds } = useAvailableMenuStore();

  const { tenant_id, role_id, session_key, id: user_id } = useAuthStore();

  // 스토어에서 campaigns 데이터 직접 구독하여 항상 최신 상태 사용
  const campaigns = useMainStore(state => state.campaigns);

  const campaignDialStatus = useCampaignDialStatusStore(state => state.campaignDialStatus);

  // 변수에 저장하는 방식
  // const currentCampaignDialStatus = campaignDialStatus.find((dialStatus) => dialStatus.campaign_id === item.id);

  // state에 저장하는 방식
  const [currentCampaignDialStatus, setCurrentCampaignDialStatus] = useState<CampaignDialStatus | undefined>(undefined);
  useEffect(() => {
    // 캠페인 다이얼 상태를 업데이트
    const currentCampaignDialStatus = campaignDialStatus.find((dialStatus) => dialStatus.campaign_id === item.id);
    setCurrentCampaignDialStatus(currentCampaignDialStatus);
  }, [campaignDialStatus, item.id]);


  // 현재 캠페인 정보를 useMemo로 캐싱
  const currentCampaign = useMemo(() => {
    return campaigns?.find((c: any) => c.campaign_id === Number(item.id));
  }, [campaigns, item.id]);


  // 항상 최신 캠페인 상태 반영하기 위해 displayStatus를 로컬 상태가 아닌 계산된 값으로 사용
  const displayStatus = useMemo<CampaignStatus>(() => {
    if (currentCampaign) {
      switch (currentCampaign.campaign_status) {
        case 1: return "started";
        case 2: return "pending";
        case 3: return "stopped";

        default: return item.status;
      }
    }
    return item.status;
  }, [currentCampaign, item.status]);


  // 아이콘작업 
  const statusIconSrc = (campaignDialStatus?: CampaignDialStatus) => {
    // currentCampaign.campaign_status가 숫자(1~9 등)일 때만 분기
    switch (Number(campaignDialStatus?.status)) {
      case 1: return "/sidebar-menu/tree_play.svg";
      case 2: return "/sidebar-menu/tree_pause.svg";
      case 3: return "/sidebar-menu/tree_stop.svg";
      case 4:
      case 8:
      case 9: return "/sidebar-menu/tree_stop_progress.png";
      case 5: return "/sidebar-menu/tree_pause_progress.png";
      case 6: return "/sidebar-menu/tree_timeset.png";
      default: return null;
    }
  };

  // console.log("statusIconSrc: ", statusIconSrc);

  // 디버깅용 - 상태 변경 시 콘솔 출력
  useEffect(() => {
    // console.log(`Campaign ${item.id} status: ${displayStatus} (from store: ${currentCampaign?.campaign_status})`);
  }, [displayStatus, currentCampaign?.campaign_status, item.id]);

  // ====== API HOOKS ======
  const { mutate: fetchMain } = useApiForMain({
    onSuccess: (data) => {
      // 최신 캠페인 데이터로 스토어 업데이트
      useMainStore.getState().setCampaigns(data.result_data);
    },
  });

  const updateCampaignStatusMutation = useApiForCampaignStatusUpdate({
    onSuccess: (data, variables) => {

      // 등록된 발신리스트가 없을 경우
      if (data.result_code === -1 && data.reason_code === -7771) {

        setAlertState({
          ...alertState,
          isOpen: true,
          message: '발신리스트가 존재하지 않습니다. 발신리스트를 등록해주세요.',
          title: '알림',
          type: '2',
          onClose: () => {
            setAlertState({ ...alertState, isOpen: false });
            preventCloseRef.current = false;
          },
        });
        return;
      } else if (!(data.result_code === 0 || (data.result_code === -1 && data.reason_code === -13))) {
        setAlertState({
          ...alertState,
          isOpen: true,
          message: CheckCampaignSaveReturnCode(data.reason_code, data.result_msg),
          title: '알림',
          type: '2',
          onClose: () => {
            setAlertState({ ...alertState, isOpen: false });
            preventCloseRef.current = false;

          },
        });
        return;
      }

      // 멈춤중, 정지중에 해당하면 alert 띄우지 않기
      const reCheckCampaigns = useCampaignDialStatusStore.getState().campaignDialStatus.some((dialStatus) =>
        (dialStatus.campaign_id.toString() === item.id.toString()) &&
        (dialStatus.status?.toString() === '5' || dialStatus.status?.toString() === '6'));
      if (!reCheckCampaigns) {
        customAlertService.success(
          '캠페인 상태가 성공적으로 변경되었습니다!',
          '캠페인 상태 변경 완료'
        );
      }

      // API 성공 후 2가지 방법으로 상태 업데이트:
      // 1. 스토어의 updateCampaignStatus 직접 호출 (즉시 UI 반영)
      useMainStore.getState().updateCampaignStatus(
        Number(variables.campaign_id),
        variables.campaign_status
      );

      // 2. fetchMain으로 전체 데이터 새로고침 (백엔드와 완전히 동기화)
      fetchMain({ session_key, tenant_id });

    },
    onError: (error) => {
      ServerErrorCheck('캠페인 상태 변경', error.message);
    },
  });

  const { mutate: deleteCampaignList } = useApiForCampaignListDelete({});
  const { mutate: fetchCampaignBlacklistCount } = useApiForCampaignBlacklistCount({
    onSuccess: (data) => {
      setBlackListCount(data.result_data.blacklist_count);
      setMaxBlacklistCount(data.result_data.max_count);
      setCommonBlacklistCount(data.result_data.common_count);
      setTimeout(() => {
        setIsBlacklistPopupOpen(true);
      }, 100);
    },
  });

  // ====== HELPER FUNCTIONS ======
  const statusInfo = {
    started: { label: "시작", color: "#22c55e" },
    pending: { label: "멈춤", color: "#eab308" },
    stopped: { label: "중지", color: "#ef4444" },
  };

  const getStatusNumber = (status: CampaignStatus): number => {
    switch (status) {
      case "started":
        return 1;
      case "pending":
        return 2;
      case "stopped":
        return 3;
      default:
        return 0;
    }
  };

  // tofix 0521
  // const handleEditMenuClick = () => {
  //   simulateHeaderMenuClick(2);
  //   setCampaignIdForUpdateFromSideMenu(item.id);
  // };

  const handleEditMenuClick = () => {
    // openSingleTabAtCurrentSection 함수 사용
    const tabInfo = {
      id: 2,
      uniqueKey: `2-${Date.now()}`,
      title: `캠페인 관리`,
      content: null,
      params: { campaignId: item.id, campaignName: item.label, campaignType: item.type },
      menuId: 2,
      icon: "",
      href: ""
    };

    // 현재 섹션에 단일 탭으로 추가
    useTabStore.getState().openSingleTabAtCurrentSection(2, tabInfo);

    // 부가 상태 업데이트 (기존과 동일)
    setCampaignIdForUpdateFromSideMenu(item.id);
  };

  const handleProgressInfoClick = (campaignId: string, campaignName: string) => {
    const uniqueKey = `progress-info-${campaignId}-${Date.now()}`;

    useTabStore.getState().addOnlyTab(
      {
        id: 21,
        uniqueKey,
        title: `캠페인 진행정보 - ${campaignName}`,
        icon: '',
        href: '',
        content: null,
        campaignId,
      },
      (tab) => tab.id === 21 && tab.campaignId === campaignId
    );
  };

  const handleRebroadcastClick = (campaignId: any, reBroadCastOption: 'scheduled' | 'realtime') => {
    setCampaignIdForUpdateFromSideMenu(campaignId);

    const uniqueKey = `rebroadcast-${campaignId}-${Date.now()}`;
    const titlePrefix = reBroadCastOption === 'scheduled' ? '예약' : '실시간';

    useTabStore.getState().addOnlyTab(
      {
        id: 20,
        uniqueKey,
        title: `${titlePrefix} 재발신 설정`,
        icon: '',
        href: '',
        content: null,
        campaignId,
        params: {
          reBroadCastOption,
        }
      },
      (tab) => tab.id === 20
    );
  };

  const handleMonitorClick = (tenantIdForCampaignTab: any, campaignId: any, campaignName: string) => {
    // console.log("tenantId 확인 at 캠페인탭 : ", tenantIdForCampaignTab);
    const _uniqueKey = `monitor-${Date.now()}`;
    setActiveTab(22, _uniqueKey);
    addMultiTab({
      id: 22,
      uniqueKey: _uniqueKey,
      title: `상담사 상태 모니터 - ${campaignName}`,
      icon: '',
      href: '',
      content: null,
      campaignId: campaignId,
      params: {
        sessionKey: session_key,
        campaignId: campaignId,
        tenantId: tenantIdForCampaignTab,
      },
    });
  };


  const handleCampaignListDelete = (campaignId: any) => {
    if (displayStatus !== "stopped") {
      toast.error("캠페인이 중지 상태일 때만 리스트를 삭제할 수 있습니다.");
      return;
    }
    deleteCampaignList(campaignId);
  };

  // 캠페인 마스터 정보 수정하기
  const { mutate: fetchCampaignManagerUpdate } = useApiForCampaignManagerUpdate({
    onSuccess: (data, variables) => {

    },
    onError: (data) => {
      //ServerErrorCheck('캠페인 채널그룹 할당 해제', data.message);
    }
  });

  // 여기 수정 해야함 표시 #### 
  const handleCampaingProgressUpdate = async (status: CampaignStatus) => {
    // "started" | "pending" | "stopped"


    if (displayStatus === status || updateCampaignStatusMutation.isPending) {
      return;
    }

    const currentDialStatus = useCampaignDialStatusStore.getState().campaignDialStatus;

    // 현재 캠페인의 상태가 정지중이거나 멈춤중일때
    const existDial = currentDialStatus.some((dialStatus) =>
      (dialStatus.campaign_id.toString() === item.id.toString()) &&
      (dialStatus.status?.toString() === '5' || dialStatus.status?.toString() === '6'));

    const waitConfirm = async () => {

      // 상태변경할 캠페인 정보 가져오기
      const updatedCampaignsInfo = campaigns.filter((campaign) => campaign.campaign_id === parseInt(item.id))[0];

      // 캠페인 마스터 변경시 보낼 데이터정보 가져오기
      const currentCampaignInfo = UpdataCampaignInfo(campaigns, parseInt(item.id), updatedCampaignsInfo.start_flag);

      // 현재시간 양식 구하기.
      const getCurrentFormattedTime = () => {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 0부터 시작하므로 +1
        const day = String(now.getDate()).padStart(2, '0');

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      const todayTime = getCurrentFormattedTime();

      // 현재 캠페인 발신중이며 멈춤 중이거나 정지 중일때 === existDial
      if (!existDial) {

        // 캠페인 status API 호출
        await updateCampaignStatusMutation.mutateAsync({
          campaign_id: Number(item.id),
          campaign_status: getStatusNumber(status),
        }).then(() => {
          // console.log('#### then 으로 떨어짐 사이드바 캠페인 상태 변경');
        }).catch(error => {
          // console.log('#### 사이드바 캠페인 상태 변경 에러:', error);
        });
      }
      else {
        // console.log('#### 마스터 수정 으로 떨어짐 사이드바 캠페인 상태 변경');
        // 캠페인 마스터 API 호출
        fetchCampaignManagerUpdate(
          {
            ...currentCampaignInfo
            , start_flag: status === 'started' ? 1 : status === 'pending' ? 2 : 3
            , update_user: user_id
            , update_ip: Cookies.get('userHost') + ''
            , update_time: todayTime
          }
        );
      }
    };

    if (existDial) {
      // 시점 초기화
      document.body.style.pointerEvents = 'auto';
      setAlertState({
        ...errorMessage,
        title: '캠페인 상태 변경',
        isOpen: true,
        message:
          '발신중인 데이터 처리 중 입니다. 기다려 주시길 바랍니다. \n강제로 상태 변경을 하실 경우에는 발신 데이터 처리가 되지 않으며 \n재시작 시에는 중복 발신이 될 수도 있습니다.\n그래도 진행하시겠습니까?',
        onClose: () => {
          setAlertState((prev) => ({ ...prev, isOpen: false }));
          waitConfirm(); // 여기에 캠페인 상태 변경 로직 실행
        },
        onCancel: () => {
          setAlertState((prev) => ({ ...prev, isOpen: false }));
          // 취소시 아무 일도 안 함
        },
      });
      return;
    }

    await waitConfirm();

    // try {
    //   preventCloseRef.current = true;
    //   // 실제 API 호출
    //   await updateCampaignStatusMutation.mutateAsync({
    //     campaign_id: Number(item.id),
    //     campaign_status: getStatusNumber(status),
    //   });

    //   // API 응답 처리는 onSuccess 콜백에서 처리
    // } catch (error) {
    //   console.error('Error changing campaign status:', {
    //     campaignId: item.id,
    //     campaignName: item.label,
    //     attemptedStatus: status,
    //     error: error,
    //   });
    // }
  };



  const handleBlacklistCountCheckClick = () => {
    fetchCampaignBlacklistCount(Number(item.id));
  };

  // ====== SUB MENU FOR STATUS ======
  const renderStatusSubMenu = () => (
    <ContextMenuSub>
      <ContextMenuSubTrigger
        className="flex items-center text-sm"
        onPointerDown={() => {
          preventCloseRef.current = false;
        }}
      >
        <span className="flex items-center">
          시작구분:
          <span className="ml-1 flex items-center">
            <div className="w-4 h-4 mr-1">
              <Image
                // src={getStatusIcon(displayStatus) || ''}
                src={statusIconSrc(currentCampaignDialStatus) || getStatusIcon(displayStatus) || ''}
                alt={displayStatus}
                width={16}
                height={16}
              />
            </div>
            {statusInfo[displayStatus].label}
          </span>
        </span>
      </ContextMenuSubTrigger>
      <ContextMenuSubContent
        className="min-w-[120px] p-1"
      >
        {(Object.keys(statusInfo) as Array<CampaignStatus>).map((status) => (
          <ContextMenuItem
            key={status}
            onClick={(e) => {
              e.stopPropagation();
              handleCampaingProgressUpdate(status);
              preventCloseRef.current = true;
            }}
            className={cn(
              "flex items-center justify-between text-sm px-2 py-1.5",
              displayStatus === status ? "bg-gray-50" : "",
              updateCampaignStatusMutation.isPending ? "opacity-70" : ""
            )}
            disabled={updateCampaignStatusMutation.isPending}
          >
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2">
                <Image
                  src={getStatusIcon(status) || ''}
                  alt={status}
                  width={16}
                  height={16}
                />
              </div>
              <span>{statusInfo[status].label}</span>
            </div>
            {displayStatus === status && (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </ContextMenuItem>
        ))}
      </ContextMenuSubContent>
    </ContextMenuSub>
  );

  // ====== MAIN MENU ======
  const mainMenuItems: MenuItemDefinition[] = [
    {
      key: "edit",
      title: "캠페인 수정",
      onClick: handleEditMenuClick,
      menuId: 19,
    },
    {
      key: "status",
      render: renderStatusSubMenu,
      menuId: 20,
    },
    {
      key: "progress",
      title: "캠페인 진행정보",
      onClick: () => handleProgressInfoClick(item.id, item.label),
      menuId: 24,
    },
    {
      key: "separator1",
      type: "separator",
    },
    {
      key: "scheduled-rebroadcast",
      title: "예약 재발신",
      onClick: () => handleRebroadcastClick(item.id, 'scheduled'),
      menuId: 25,
    },
    {
      key: "realtime-rebroadcast",
      title: "실시간 재발신",
      onClick: () => handleRebroadcastClick(item.id, 'realtime'),
      menuId: 25,
    },
    {
      key: "separator2",
      type: "separator",
    },
    {
      key: "copy",
      title: "캠페인 복사",
      onClick: onHandleCampaignCopy,
      menuId: 26,
    },
    {
      key: "delete",
      render: () => (
        <div className="py-1" key="delete">
          <IDialogButtonForCampaingDelete
            campaignId={item.id}
            tenant_id={tenantIdForCampaignTab}
            campaignName={item.label}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-left text-red-500"
            buttonText="캠페인 삭제"
            isDisabled={displayStatus !== 'stopped'}
            onFocusID={(focusId) => {
              // context Menu 갇히는거 초기화
              document.body.style.pointerEvents = 'auto';

              // onFocusID 삭제 후 이동될 callback 추가, 
              setCampaignIdForUpdateFromSideMenu(focusId.toString());
            }}
          />
        </div>
      ),
      condition: !isFolder,
      className: "",
      menuId: 27,
    },
    {
      key: "separator3",
      type: "separator",
    },
    {
      key: "listDelete",
      title: "캠페인 리스트 삭제",
      onClick: () => handleCampaignListDelete(item.id),
      condition: displayStatus === 'stopped',
      menuId: 28,
    },
    {
      key: "monitor",
      title: "상담사 상태 모니터",
      onClick: () => handleMonitorClick(tenantIdForCampaignTab, item.id, item.label),
      menuId: 29,
    },
    {
      key: "blacklist",
      title: "블랙리스트 건수 조회",
      onClick: handleBlacklistCountCheckClick,
      menuId: 30,
    },
  ];

  const filteredMenuItems = mainMenuItems.filter((menuItem) => {
    if (menuItem.type === "separator") return true;
    if (menuItem.menuId === undefined) return true;

    // 캠페인 리스트 삭제 메뉴는 상태에 따라 동적으로 필터링
    if (menuItem.key === "listDelete" && displayStatus !== "stopped") return false;

    return availableCampaignTabCampaignContextMenuIds.includes(menuItem.menuId);
  });

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-[150px]">
          {filteredMenuItems.map((menuItem) => {
            if (menuItem.condition === false) return null;
            if (menuItem.type === "separator") {
              return (
                <ContextMenuSeparator
                  key={menuItem.key}
                  className="my-1"
                />
              );
            }
            if (menuItem.render) {
              return (
                <React.Fragment key={menuItem.key}>
                  {menuItem.render()}
                </React.Fragment>
              );
            }
            return (
              <ContextMenuItem
                key={menuItem.key}
                onClick={menuItem.onClick}
                className={cn("flex items-center text-sm", menuItem.className)}
              >
                {menuItem.title}
              </ContextMenuItem>
            );
          })}
        </ContextMenuContent>
      </ContextMenu>

      {isBlacklistPopupOpen && (
        <BlackListCountPopup
          campaignId={item.id}
          blackListCount={blackListCount}
          maxBlacklistCount={maxBlacklistCount}
          commonBlacklistCount={commonBlacklistCount}
          isOpen={isBlacklistPopupOpen}
          onConfirm={() => setIsBlacklistPopupOpen(false)}
          onCancel={() => setIsBlacklistPopupOpen(false)}
        />
      )}

      <CustomAlert
        message={alertState.message}
        title={alertState.title}
        type={alertState.type}
        isOpen={alertState.isOpen}
        onClose={() => {
          alertState.onClose();
        }}
        onCancel={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}