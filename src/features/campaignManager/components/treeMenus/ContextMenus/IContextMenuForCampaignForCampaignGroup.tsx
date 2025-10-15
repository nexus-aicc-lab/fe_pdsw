"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from 'react-toastify';
import Image from "next/image";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { useTabStore } from "@/store/tabStore";
import { useSideMenuCampaignGroupTabStore } from "@/store/storeForSideMenuCampaignGroupTab";
import { useAvailableMenuStore } from "@/store/useAvailableMenuStore";
import { useApiForCampaignBlacklistCount } from "@/features/listManager/hooks/useApiForCampaignBlacklistCount";
import useApiForCampaignListDelete from "@/features/listManager/hooks/useApiForCampaignListDelete";
import { useApiForCampaignStatusUpdate } from "@/features/campaignManager/hooks/useApiForCampaignStatusUpdate";
import { useApiForMain } from "@/features/auth/hooks/useApiForMain";
import { useMainStore } from "@/store/mainStore";
import { useAuthStore } from "@/store/authStore";

import IDialogButtonForCampaingDelete from "../dialog/IDialogButtonForCampaingDelete";
import BlackListCountPopup from '@/features/campaignManager/components/popups/BlackListCountPopup';
import CustomAlert from "@/components/shared/layout/CustomAlert";

export type CampaignStatus = 'started' | 'pending' | 'stopped';

export const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'started':
      return '/sidebar-menu/tree_play.svg';
    case 'pending':
      return '/sidebar-menu/tree_pause.svg';
    case 'stopped':
      return '/sidebar-menu/tree_stop.svg';
    default:
      return null;
  }
};

// 인터페이스 정의
interface ContextMenuForTreeNodeProps {
  children: React.ReactNode;
  item: {
    id: any;
    label: string;
    type: any;
    status: CampaignStatus;
  };
  onEdit?: () => void;
  onMonitor?: () => void;
  onHandleCampaignCopy?: () => void;
  tenantIdForCampaignTab: any;
}

export const getStatusFromFlag = (flag?: number): CampaignStatus => {
  switch (flag) {
    case 1: return 'started';
    case 2: return 'pending';
    case 3: return 'stopped';
    default: return 'stopped';
  }
};

// 메뉴 구분선 컴포넌트
const MenuSeparator = () => {
  return <div className="h-px bg-gray-200 my-1" />;
};

// 메인 컴포넌트
export function IContextMenuForCampaignForCampaignGroup({
  children,
  item,
  onEdit,
  onMonitor,
  onHandleCampaignCopy,
  tenantIdForCampaignTab,
}: ContextMenuForTreeNodeProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const subMenuRef = useRef<HTMLDivElement>(null);
  const isFolder = item.type === "folder";
  const { simulateHeaderMenuClick, setCampaignIdForUpdateFromSideMenu, setCampaignIdForCopyCampaign, addTab, addMultiTab, setActiveTab } = useTabStore();

  // Zustand 스토어에서 updateCampaignStatus 함수 가져오기
  const { updateCampaignStatus, refetchTreeDataForCampaignGroupTab } = useSideMenuCampaignGroupTabStore();

  // 권한 관리 스토어에서 사용 가능한 메뉴 ID 가져오기
  const availableMenuIds = useAvailableMenuStore(
    (state) => state.availableMenuIdsForCampaignGroupTabCampaign
  );

  const [isBlacklistPopupOpen, setIsBlacklistPopupOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<CampaignStatus>(item.status);
  const [blackListCount, setBlackListCount] = useState<number>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [menuWidth, setMenuWidth] = useState(120); // 메뉴 너비 상태 추가

  const [isStatusAlertOpen, setIsStatusAlertOpen] = useState(false);
  const [statusAlertProps, setStatusAlertProps] = useState({
    message: '',
    title: '',
    type: ''
  });

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deleteAlertProps, setDeleteAlertProps] = useState({
    message: '',
    title: '',
    type: ''
  });

  const [isDeleteCompleteAlertOpen, setIsDeleteCompleteAlertOpen] = useState(false);
  const [deleteCompleteAlertProps, setDeleteCompleteAlertProps] = useState({
    message: '',
    title: '',
    type: ''
  });

  const { tenant_id, session_key } = useAuthStore();

  const {
    setCampaigns,
    selectedCampaign,
    setSelectedCampaign
  } = useMainStore();

  // 컴포넌트가 마운트될 때 상태 초기화
  useEffect(() => {
    setCurrentStatus(item.status);
  }, [item.status]);

  // 메뉴 너비 측정 (메뉴가 열렸을 때)
  useEffect(() => {
    if (menuOpen && menuRef.current) {
      setMenuWidth(menuRef.current.offsetWidth);
    }
  }, [menuOpen]);

  const { mutate: fetchMain } = useApiForMain({
    onSuccess: (data) => {
      setCampaigns(data.result_data);
      if (selectedCampaign) {
        const updatedCampaign = data.result_data.find(
          (campaign) => campaign.campaign_id === selectedCampaign.campaign_id
        );
        if (updatedCampaign) {
          setSelectedCampaign(updatedCampaign);
        }
      }
      // 데이터 리프레시 후 사이드 메뉴 트리 데이터도 업데이트
      refetchTreeDataForCampaignGroupTab();
    }
  });

  // 상태 관련 정보
  const statusInfo = {
    started: { label: "시작", color: "#22c55e" },
    pending: { label: "멈춤", color: "#eab308" },
    stopped: { label: "중지", color: "#ef4444" },
  };

  const updateCampaignStatusMutation = useApiForCampaignStatusUpdate({
    onSuccess: () => {
      
      // CustomAlert 대신 상태 업데이트
      // setStatusAlertProps({
      //   message: "캠페인 상태가 변경되었습니다.",
      //   title: "상태 변경",
      //   type: "success"
      // });
      // setIsStatusAlertOpen(true);

      setIsProcessing(false);
    },
    onError: (error) => {
      toast.error(error.message || "상태 변경 중 오류가 발생했습니다.");
      setIsProcessing(false);
    },
  });

  const { mutate: deleteCampaignList } = useApiForCampaignListDelete({
    onSuccess: () => {
      toast.success("캠페인 리스트가 삭제되었습니다.");
      refetchTreeDataForCampaignGroupTab();
      setIsProcessing(false);
    },
    onError: (error) => {
      toast.error(error?.message || "리스트 삭제 중 오류가 발생했습니다.");
      setIsProcessing(false);
    }
  });

  // 상태 변경 알림 닫기 핸들러
  const handleStatusAlertClose = useCallback(() => {
    // setIsStatusAlertOpen(false);

    // 데이터 새로고침
    fetchMain({
      session_key: session_key,
      tenant_id: tenant_id
    });
  }, [fetchMain, session_key, tenant_id]);


  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 버블링 방지

    // 현재 처리 중이면 메뉴를 열지 않음
    if (isProcessing) return;

    // 기존에 열려 있는 메뉴 닫기
    setActiveSubMenu(null);
    setHoveredItem(null);

    // 새 메뉴 위치 설정
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  }, [isProcessing]);

  const handleCampaignListDelete = useCallback((campaignId: any) => {
    if (currentStatus !== 'stopped') {
      toast.error("캠페인이 중지 상태일 때만 리스트를 삭제할 수 있습니다.");
      return;
    }
    setIsProcessing(true);
    deleteCampaignList(campaignId);
    setMenuOpen(false);
  }, [currentStatus, deleteCampaignList]);

  const handleEditMenuClick = useCallback(() => {
    if (onEdit) {
      onEdit();
      return;
    }

    simulateHeaderMenuClick(2);
    setCampaignIdForUpdateFromSideMenu(item.id);
    setMenuOpen(false);
  }, [onEdit, simulateHeaderMenuClick, setCampaignIdForUpdateFromSideMenu, item.id]);

  const handleProgressInfoClick = useCallback((campaignId: any, campaignName: string) => {
    const uniqueKey = `progress-info-${campaignId}-${Date.now()}`;

    addMultiTab({
      id: 21,
      uniqueKey: uniqueKey,
      title: `캠페인 진행정보 - ${campaignName}`,
      icon: '',
      href: '',
      content: null,
      campaignId: campaignId
    });
    setMenuOpen(false);
  }, [addMultiTab]);

  const handleRebroadcastClick = useCallback((campaignId: any) => {
    setCampaignIdForUpdateFromSideMenu(campaignId);
    addTab({
      id: 20,
      uniqueKey: '20',
      title: '재발신 설정',
      icon: '',
      href: '',
      content: null,
    });
    setMenuOpen(false);
  }, [setCampaignIdForUpdateFromSideMenu, addTab]);

  const handleMonitorClick = useCallback((tenantIdForCampaignTab: any, campaignId: any, campaignName: string) => {
    debugger;
    
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
        campaignId: campaignId,
        campaignName: campaignName,
        tenantId: tenantIdForCampaignTab,
      }
    });
    setMenuOpen(false);
  }, [addMultiTab]);

  const handleCampaignCopy = useCallback(() => {
    // if (onHandleCampaignCopy) {
    //   onHandleCampaignCopy();
    //   return;
    // }

    setCampaignIdForUpdateFromSideMenu(item.id);
    setCampaignIdForCopyCampaign(item.id);
    // setSelectedNodeType(item.type);
    addTab({ id: 130, uniqueKey: "130", title: "캠페인 복사", icon: "", href: "", content: null });
    setMenuOpen(false);
  }, [onHandleCampaignCopy, item.label, item.id, setCampaignIdForUpdateFromSideMenu, setCampaignIdForCopyCampaign, addTab]);

  const onCampaignDelete = useCallback((status: string) => {
    if (status !== 'stopped') {
      toast.error("캠페인이 중지 상태일 때만 삭제할 수 있습니다.");
      return;
    }

    // 바로 IDialogButtonForCampaingDelete를 표시하는 대신 직접 열기
    setIsDeleteDialogOpen(true);
    setMenuOpen(false);
  }, []);

  // 캠페인 삭제 알림 처리 핸들러
  const handleDeleteAlertConfirm = useCallback(() => {
    setIsDeleteAlertOpen(false);

    // 여기에 실제 삭제 API 호출 코드 추가
    // API 호출이 성공하면 데이터 리프레시
    setIsDeleteDialogOpen(true); // 기존 삭제 다이얼로그 열기
  }, []);

  const handleDeleteAlertCancel = useCallback(() => {
    setIsDeleteAlertOpen(false);
  }, []);

  const getStatusNumber = (status: CampaignStatus): number => {
    switch (status) {
      case 'started': return 1;
      case 'pending': return 2;
      case 'stopped': return 3;
      default: return 0;
    }
  };

  const handleStartClick = useCallback(async (status: CampaignStatus) => {
    if (currentStatus === status || updateCampaignStatusMutation.isPending || isProcessing) {
      return;
    }

    try {
      setIsProcessing(true);

      // 상태 번호 얻기
      const statusNumber = getStatusNumber(status);

      // API 호출
      await updateCampaignStatusMutation.mutateAsync({
        campaign_id: Number(item.id),
        campaign_status: statusNumber
      });

      // 로컬 상태 업데이트
      setCurrentStatus(status);

      // 트리 데이터의 상태도 업데이트 (API 호출이 성공한 후)
      updateCampaignStatus(item.id, statusNumber);

      // 메뉴 닫기
      setMenuOpen(false);
      setActiveSubMenu(null);

    } catch (error) {
      // console.error('Error changing campaign status:', error);
      setIsProcessing(false);
    }
  }, [currentStatus, updateCampaignStatusMutation, item.id, updateCampaignStatus, isProcessing]);

  // 캠페인 블랙리스트 건수 조회 API 호출
  const { mutate: fetchCampaignBlacklistCount } = useApiForCampaignBlacklistCount({
    onSuccess: (data) => {
      setBlackListCount(data.result_data.blacklist_count);
      setTimeout(() => {
        setIsBlacklistPopupOpen(true);
      }, 100);
    }
  });

  // 캠페인 블랙리스트 건수 조회 클릭 이벤트
  const handleBlacklistCountCheckClick = useCallback(() => {
    fetchCampaignBlacklistCount(Number(item.id));
    setMenuOpen(false);
  }, [fetchCampaignBlacklistCount, item.id]);

  // 메뉴 아이템 정의 (JSON의 SGC 값 기준)
  const menuItems = [
    // 첫 번째 그룹
    {
      id: 46,
      group: 1,
      key: "edit-campaign",
      label: "캠페인 수정",
      action: handleEditMenuClick
    },
    {
      id: 47,
      group: 1,
      key: "start-division",
      label: "시작구분",
      isSubmenu: true,
      renderLabel: () => (
        <div className="flex items-center text-xs">
          시작구분:
          <span className="ml-1 flex items-center">
            <div className="w-3 h-3 mr-1">
              <Image
                src={getStatusIcon(currentStatus) || ''}
                alt={currentStatus}
                width={12}
                height={12}
              />
            </div>
            {statusInfo[currentStatus].label}
          </span>
        </div>
      ),
      subItems: [
        { id: 48, key: "start", label: "시작", status: "started" },
        { id: 49, key: "pause", label: "멈춤", status: "pending" },
        { id: 50, key: "stop", label: "중지", status: "stopped" }
      ]
    },
    {
      id: 51,
      group: 1,
      key: "progress-info",
      label: "캠페인 진행정보",
      action: () => handleProgressInfoClick(item.id, item.label)
    },

    // 두 번째 그룹
    {
      id: 52,
      group: 2,
      key: "rebroadcast",
      label: "재발신",
      action: () => handleRebroadcastClick(item.id)
    },

    // 세 번째 그룹
    {
      id: 53,
      group: 3,
      key: "copy-campaign",
      label: "캠페인 복사",
      action: handleCampaignCopy
    },
    {
      id: 54,
      group: 3,
      key: "delete-campaign",
      label: "캠페인 삭제",
      action: () => onCampaignDelete(currentStatus),
      className: "text-red-500",
      condition: !isFolder
    },

    // 네 번째 그룹
    {
      id: 55,
      group: 4,
      key: "delete-campaign-list",
      label: "캠페인 리스트 삭제",
      action: () => handleCampaignListDelete(item.id),
      condition: currentStatus === 'stopped'
    },
    {
      id: 56,
      group: 4,
      key: "monitor",
      label: "상담사 상태 모니터",
      action: () => handleMonitorClick(tenantIdForCampaignTab, item.id, item.label)
    },
    {
      id: 57,
      group: 4,
      key: "blacklist-count",
      label: "블랙리스트 건수 조회",
      action: handleBlacklistCountCheckClick
    }
  ];

  // 권한에 따라 메뉴 항목 필터링
  const visibleMenuItems = availableMenuIds?.length > 0
    ? menuItems.filter(item =>
      availableMenuIds.includes(item.id) &&
      (item.condition === undefined || item.condition)
    )
    : [];

  // 다이얼로그 닫힘 처리 함수
  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setIsDeleteDialogOpen(false);
    }
  }, []);

  // 삭제 완료 알림 닫기 핸들러
  const handleDeleteCompleteAlertClose = useCallback(() => {
    setIsDeleteCompleteAlertOpen(false);

    // 데이터 리프레시
    fetchMain({
      session_key: session_key,
      tenant_id: tenant_id
    });
  }, [fetchMain, session_key, tenant_id]);

  // 메뉴 항목 hover 이벤트 처리
  const handleMenuItemMouseEnter = useCallback((key: string) => {
    setHoveredItem(key);

    // 서브메뉴 항목이면 서브메뉴를 열고 그렇지 않으면 닫기
    const menuItem = menuItems.find(item => item.key === key);
    if (menuItem && menuItem.isSubmenu) {
      setActiveSubMenu(key);
    } else {
      setActiveSubMenu(null);
    }
  }, [menuItems]);

  // 메뉴 항목 hover 이벤트 처리
  const handleMenuItemMouseLeave = useCallback(() => {
    // 서브메뉴가 열려있을 때는 호버 상태 유지
    if (!activeSubMenu) {
      setHoveredItem(null);
    }
  }, [activeSubMenu]);

  // 이벤트 핸들러 등록 및 정리
  useEffect(() => {
    // 외부 클릭 시 메뉴 닫기
    const handleClickOutside = (e: MouseEvent) => {
      // 블랙리스트 팝업이나 삭제 다이얼로그가 열려있으면 무시
      if (isBlacklistPopupOpen || isDeleteDialogOpen) {
        return;
      }

      // 메뉴 외부 클릭 처리
      // onClickOutside 핸들러 내부: 서브메뉴가 없을 때도 닫히도록 조건 변경
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        (
          !subMenuRef.current ||
          !subMenuRef.current.contains(e.target as Node)
        )
      ) {
        setMenuOpen(false);
        setActiveSubMenu(null);
        setHoveredItem(null);
      }

    };

    // ESC 키 누르면 메뉴 닫기
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setActiveSubMenu(null);
        setHoveredItem(null);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen, isBlacklistPopupOpen, isDeleteDialogOpen]);

  // 마우스 이벤트 등록: 서브메뉴를 벗어나면 닫기
  const handleSubMenuMouseLeave = useCallback(() => {
    // 일정 시간 후에 서브메뉴 닫기 (갑작스럽게 닫히는 것 방지)
    setTimeout(() => {
      if (!hoveredItem) {
        setActiveSubMenu(null);
      }
    }, 100);
  }, [hoveredItem]);

  return (
    <>
      <div onContextMenu={handleContextMenu}>
        {children}
      </div>

      {/* 컨텍스트 메뉴 */}
      {menuOpen && visibleMenuItems.length > 0 && (
        <div
          ref={menuRef}
          className="fixed min-w-[160px] bg-white rounded-md shadow-md border-2 border-black z-50 py-2 px-3"
          style={{ left: `${menuPosition.x}px`, top: `${menuPosition.y}px` }}
        >
          {visibleMenuItems.map((item, index, arr) => {
            // 현재 아이템과 이전 아이템이 다른 그룹인 경우 구분선 추가
            const prevItem = index > 0 ? arr[index - 1] : null;
            const showSeparator = prevItem && prevItem.group !== item.group;
            const isHovered = hoveredItem === item.key;
            const isSubmenuActive = activeSubMenu === item.key;

            return (
              <React.Fragment key={item.key}>
                {showSeparator && <MenuSeparator />}

                <div
                  className="relative"
                  onMouseEnter={() => handleMenuItemMouseEnter(item.key)}
                  onMouseLeave={handleMenuItemMouseLeave}
                >
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center justify-between text-xs px-3 py-2",
                      isHovered ? "bg-blue-50" : "",
                      item.className
                    )}
                    onClick={item.isSubmenu ? undefined : item.action}
                    disabled={isProcessing}
                  >
                    {item.isSubmenu ? (
                      <div className="flex items-center justify-between w-full">
                        {item.renderLabel?.()}
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </div>
                    ) : (
                      item.label
                    )}
                  </button>

                  {/* 서브메뉴 */}
                  {item.isSubmenu && isSubmenuActive && (
                    <div
                      ref={subMenuRef}
                      className="absolute right-0 top-0 min-w-[150px] bg-white rounded-md shadow-md border-2 border-black z-50 py-1 px-3"
                      style={{
                        marginTop: '-1px',
                        transform: 'translateX(100%)',
                        marginRight: '-2px'
                      }}
                      onMouseLeave={handleSubMenuMouseLeave}
                    >
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.key}
                          type="button"
                          className={cn(
                            "w-full text-left flex items-center justify-between text-xs px-3 py-2",
                            hoveredItem === subItem.key ? "bg-blue-50" : "",
                            currentStatus === subItem.status ? "bg-gray-50" : "",
                            (updateCampaignStatusMutation.isPending || currentStatus === subItem.status || isProcessing)
                              ? "opacity-70 cursor-not-allowed"
                              : "cursor-pointer"
                          )}
                          onClick={() => handleStartClick(subItem.status as CampaignStatus)}
                          disabled={updateCampaignStatusMutation.isPending || currentStatus === subItem.status || isProcessing}
                          onMouseEnter={() => setHoveredItem(subItem.key)}
                        >
                          <div className="flex items-center">
                            <div className="w-3 h-3 mr-1">
                              <Image
                                src={getStatusIcon(subItem.status) || ''}
                                alt={subItem.status}
                                width={12}
                                height={12}
                              />
                            </div>
                            <span>{subItem.label}</span>
                          </div>
                          {currentStatus === subItem.status && (
                            <Check className="h-2 w-2 text-green-500 ml-1" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* 블랙리스트 팝업 */}
      {isBlacklistPopupOpen && (
        <BlackListCountPopup
          campaignId={item.id}
          blackListCount={blackListCount}
          isOpen={isBlacklistPopupOpen}
          onConfirm={() => setIsBlacklistPopupOpen(false)}
          onCancel={() => setIsBlacklistPopupOpen(false)}
        />
      )}

      {/* 삭제 완료 알림 다이얼로그 */}
      {isDeleteCompleteAlertOpen && (
        <CustomAlert
          isOpen={isDeleteCompleteAlertOpen}
          message={deleteCompleteAlertProps.message}
          title={deleteCompleteAlertProps.title}
          type={deleteCompleteAlertProps.type}
          onClose={handleDeleteCompleteAlertClose}
          onCancel={handleDeleteCompleteAlertClose}
        />
      )}

      {/* 상태 변경 알림 다이얼로그 */}
      {/* {isStatusAlertOpen && (
        <CustomAlert
          isOpen={isStatusAlertOpen}
          message={statusAlertProps.message}
          title={statusAlertProps.title}
          type={statusAlertProps.type}
          onClose={handleStatusAlertClose}
          onCancel={handleStatusAlertClose}
        />
      )} */}

      {/* 캠페인 삭제 알림 다이얼로그 */}
      {isDeleteDialogOpen && (
        <IDialogButtonForCampaingDelete
          isOpen={isDeleteDialogOpen}
          onOpenChange={handleDialogClose}
          campaignId={item.id}
          campaignName={item.label}
          tenant_id={tenantIdForCampaignTab}
          onDeleteSuccess={() => {
            // 삭제 완료 알림 표시
            setDeleteCompleteAlertProps({
              message: `"${item.label}" 캠페인이 삭제되었습니다.`,
              title: "삭제 완료",
              type: "success"
            });
            setIsDeleteCompleteAlertOpen(true);

            // 데이터 리프레시
            // setTimeout(() => {
            //   refetchTreeDataForCampaignGroupTab();
            // }, 100);
          }}
          preventAutoClose={false} // 삭제 확인 창이 자동으로 닫히는 것을 방지
        />
      )}

    </>
  );
}

