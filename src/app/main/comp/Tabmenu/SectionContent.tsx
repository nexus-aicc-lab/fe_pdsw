import React, { useCallback, useEffect, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";

// 필요한 임포트 추가 - TabContent에서 필요한 컴포넌트들
import PreferencesBoard from "../preferences";
import SystemPreferences from "../SystemPreferences";
import Campaignprogress from "../Campaignprogress";
import CampaignMonitorDashbord from "../CampaignMonitorDashbord";
import OutboundCallProgressPanel from "../OutboundCallProgressPanel";
import StatusCampaign from "../StatusCampaign";
import ChannelMonitor from "../ChannelMonitor";
import ListManager from "../ListManager";
import OperationBoard from "../operation";
import NewCampaignManager from "../NewCampaignManager";
import CampaignGroupManager from "../CampaignGroupManager";
import RebroadcastSettingsPanel from "../RebroadcastSettingsPanel";
import RebroadcastSettingsGroupPanel from "../RebroadcastSettingsGroupPanel";
import CampaignManager from "../CampaignManager";
import AgentStatusMonitoring from "../AgentStatusMonitoring";
import SystemMonitoring from "../SystemMonitoring";
import IntegratedMonitoringDashboard from "../IntegratedMonitoringDashboard";
import { SkillAssignmentTab } from "@/features/campaignManager/components/treeMenus/SkillAssignmentTab";
import BlackListCountPopup from "@/features/campaignManager/components/popups/BlackListCountPopup";
import { TeamSkillAssignmentTab } from "@/features/campaignManager/components/treeMenus/TeamSkillAssignmentTab";
import { GroupSkillAssignmentTab } from "@/features/campaignManager/components/treeMenus/GroupSkillAssignmentTab";
import SkilFilterOptionPannelForCampaignTab from "../SkilFilterOptionPannelForCampaignTab";
import CampaignGroupBulkUpdatePanel from "../CampaignGroupBulkUpdatePanel";
import SkilAdminPannelForSystemAdmin from "@/widgets/SkilAdminPannelForSystemAdmin";
import CampaignClonePanel from "@/widgets/sidebar2/pannels/CampaignClonePanel";
import CampaignDeletePanel from "@/widgets/sidebar2/pannels/CampaignDeletePanel";
import { useTabStore } from "@/store/tabStore";

// Tab 타입 정의
interface Tab {
  id: number;
  uniqueKey: string;
  title: string;
  campaignId?: string;
  campaignName?: string;
  params?: Record<string, any>;
}

// 개별 탭 컨텐츠 컴포넌트 - 절대 제거되지 않음
const TabContentWrapper = React.memo(({ 
  tab, 
  isVisible, 
  renderContent 
}: { 
  tab: Tab; 
  isVisible: boolean;
  renderContent: (tabId: number, campaignId?: string, campaignName?: string, params?: Record<string, any>) => React.ReactNode;
}) => {
  // 탭이 처음 렌더링될 때만 컨텐츠 생성, 이후 재사용
  const content = useMemo(() => {
    return renderContent(tab.id, tab.campaignId, tab.campaignName, tab.params);
  }, [tab.id, tab.campaignId, tab.campaignName, tab.params, renderContent]);

  return (
    <div 
      className="absolute inset-0"
      style={{ 
        display: isVisible ? 'block' : 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {content}
    </div>
  );
});

TabContentWrapper.displayName = 'TabContentWrapper';

// 섹션 컨텐츠 컴포넌트 - 분리된 컴포넌트로 Hooks 규칙 위반 방지
const SectionContent = ({
  rowId,
  sectionId,
  section,
  activeTabId,
  activeTabKey,
  setActiveTab
}: {
  rowId: string;
  sectionId: string;
  section: { tabs: Tab[], activeTabKey?: string };
  activeTabId: number | null;
  activeTabKey: string | null;
  setActiveTab: (id: number, uniqueKey: string) => void;
}) => {
  // 드롭퍼블 훅 사용
  const { isOver, setNodeRef } = useDroppable({
    id: `content-drop-${rowId}-${sectionId}`,
    data: {
      type: "content-area",
      rowId,
      sectionId
    }
  });
  
  // TabStore에서 드래그 상태 설정 메서드 가져오기
  const setContentDragOver = useTabStore(state => state.setContentDragOver);
  
  // isOver 상태가 변경될 때마다 TabStore 업데이트
  useEffect(() => {
    setContentDragOver(isOver, rowId, sectionId);
    
    // 컴포넌트가 언마운트될 때 드래그 상태 초기화
    return () => {
      if (isOver) {
        setContentDragOver(false, null, null);
      }
    };
  }, [isOver, rowId, sectionId, setContentDragOver]);

  // 콘텐츠 클릭 핸들러
  const handleContentClick = useCallback(() => {
    const activeTab = section.tabs.find(t => t.uniqueKey === section.activeTabKey);
    if (activeTab) {
      setActiveTab(activeTab.id, activeTab.uniqueKey);
    }
  }, [section.tabs, section.activeTabKey, setActiveTab]);

  // 실제 컨텐츠 렌더링 함수 - useMemo로 메모이제이션
  const renderContent = useMemo(() => {
    // eslint-disable-next-line react/display-name
    return (tabId: number | null, campaignId?: string, campaignName?: string, params?: Record<string, any>) => {
      switch (tabId) {
        case 1:
          return <CampaignGroupManager
            groupId={params?.groupId}
            groupName={params?.groupName}
          />;
        case 2:
          return <CampaignManager
            campaignId={params?.campaignId}
          />;
        case 3:
          return <IntegratedMonitoringDashboard />;
        case 4:
          return <Campaignprogress />;
        case 5:
          return <OutboundCallProgressPanel />;
        case 6:
          return <ChannelMonitor />;
        case 7:
          return <ListManager />;
        case 8:
          return <OperationBoard />;
        case 9:
          return <OperationBoard />;
        case 10:
          return <SystemPreferences />;
        case 11:
          return <OperationBoard />;
        case 12:
          return <PreferencesBoard />;
        case 13:
          return <NewCampaignManager tenantId={params?.tenantId} />;
        case 14:
          return <StatusCampaign />;
        case 20:
          return <RebroadcastSettingsPanel
            reBroadCastOption={params?.reBroadCastOption || 'scheduled'}
          />;
        case 21:
          return <CampaignMonitorDashbord campaignId={campaignId} />;
        case 22:
          return (
            <AgentStatusMonitoring
              sessionKey={params?.sessionKey}
              campaignId={params?.campaignId}
              tenantId={params?.tenantId}
            />
          );
        case 23:
          return <SystemMonitoring />;
        case 24:
          return <RebroadcastSettingsGroupPanel />;
        case 100:
          return <>잘못된 스킬 할당 탭입니다.</>;
        case 130:
          return <CampaignClonePanel />;
        case 131:
          return <CampaignDeletePanel campaignId={campaignId} campaignName={campaignName} />;
        case 501:
          return (
            <div className="flex justify-left w-full">
              <BlackListCountPopup />
            </div>
          );
        case 600:
          return (
            <div className="flex justify-left w-full">
              <div className="max-w-[500px] w-full">
                <SkillAssignmentTab />
              </div>
            </div>
          );
        case 601:
          return (
            <div className="flex justify-left w-full">
              <div className="max-w-[530px] w-full">
                <TeamSkillAssignmentTab />
              </div>
            </div>
          );
        case 602:
          return (
            <div className="flex justify-left w-full">
              <div className="max-w-[500px] w-full">
                <GroupSkillAssignmentTab />
              </div>
            </div>
          );
        case 603:
          return (
            <div className="flex justify-left w-full">
              <div className="max-w-[500px] w-full">
                <SkilFilterOptionPannelForCampaignTab />
              </div>
            </div>
          );
        case 700:
          return (
            <div className="flex justify-left w-full">
              <div className="max-w-[1000px] w-full">
                <CampaignGroupBulkUpdatePanel
                  groupId={params?.groupId}
                  groupName={params?.groupName}
                />
              </div>
            </div>
          );
        case 701:
          return (
            <div className="flex justify-left w-full">
              <div className="max-w-[1000px] w-full">
                <SkilAdminPannelForSystemAdmin />
              </div>
            </div>
          );
        default:
          return (
            <div className="flex items-center justify-center h-full text-gray-500">
              탭을 선택하세요
            </div>
          );
      }
    };
  }, []);

  // useTabStore를 사용하여 현재 행의 섹션 수 확인
  const rows = useTabStore(state => state.rows);
  const currentRow = rows.find(r => r.id === rowId);
  const sectionCount = currentRow?.sections.length || 0;

  return (
    <div
      ref={setNodeRef}
      className={`
      overflow-auto h-full transition-all duration-200 ease-out 
      ${isOver ?
          sectionCount < 2  // 섹션 개수로 분할 표시 여부 결정하도록 변경
            ? 'bg-blue-100 border-2 border-dashed border-blue-400 relative'
            : 'bg-blue-100 border-2 border-dashed border-blue-400'
          : ''
        }
    `}
      onClick={handleContentClick}
    >
      {/* 모든 탭을 동시에 렌더링하되, 활성 탭만 표시 */}
      <div className="relative h-full">
        {section.tabs.map((tab) => (
          <TabContentWrapper
            key={tab.uniqueKey}
            tab={tab}
            isVisible={tab.uniqueKey === section.activeTabKey}
            renderContent={renderContent}
          />
        ))}

        {/* 섹션 개수 기준으로 분할 표시 */}
        {isOver && sectionCount < 2 && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="flex h-full">
              <div className="w-1/2 border-r-2 border-blue-500 border-dashed h-full bg-blue-100 bg-opacity-60 flex items-center justify-center">
                <span className="text-blue-500 opacity-80 font-semibold">현재 영역</span>
              </div>
              <div className="w-1/2 h-full bg-blue-200 bg-opacity-60 flex items-center justify-center">
                <span className="text-blue-500 opacity-80 font-semibold">새 분할 영역</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

SectionContent.displayName = 'SectionContent';

export default React.memo(SectionContent);