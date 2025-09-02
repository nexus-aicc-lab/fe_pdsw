// src/utils/tabContentRenderer.ts
import PreferencesBoard from "@/app/main/comp/preferences";
import SystemPreferences from "@/app/main/comp/SystemPreferences";
import Campaignprogress from "@/app/main/comp/Campaignprogress";
import OutboundCallProgressPanel from "@/app/main/comp/OutboundCallProgressPanel";
import StatusCampaign from "@/app/main/comp/StatusCampaign";
import ChannelMonitor from "@/app/main/comp/ChannelMonitor";
import ListManager from "@/app/main/comp/ListManager";
import OperationBoard from "@/app/main/comp/operation";
import CampaignGroupManager from "@/app/main/comp/CampaignGroupManager";
import RebroadcastSettingsPanel from "@/app/main/comp/RebroadcastSettingsPanel";
import RebroadcastSettingsGroupPanel from "@/app/main/comp/RebroadcastSettingsGroupPanel";
import CampaignManager from "@/app/main/comp/CampaignManager";
import CreateCampaignFormPanel from "./CreateCampaignFormPanel";

export const renderTabContent = (tabId: number | null) => {
  // console.log("renderTabContent tabId : ", tabId);

  switch (tabId) {
    case 1:
      return <CampaignGroupManager />;
    case 2:
      return <CampaignManager />;
    case 3:
      return <>통합모니터 컨텐츠</>;
    case 4:
      return <Campaignprogress />;
    case 5:
      return <OutboundCallProgressPanel />;
    case 6:
      return <ChannelMonitor />;
    case 7:
      return <ListManager />;
    case 8:
      return <>예약콜 제한 설정 컨텐츠</>;
    case 9:
      return <>분배호수 제한 설정 컨텐츠</>;
    case 10:
      return <SystemPreferences />;
    case 11:
      return <OperationBoard />;
    case 12:
      return <PreferencesBoard />;
    case 13:
      // 캠페인 생성 폼을 출력하는 컴포넌트
      return <CreateCampaignFormPanel />;
    case 14:
      return <StatusCampaign />;
    case 20:
      return <RebroadcastSettingsPanel />;
    case 24:
      return <RebroadcastSettingsGroupPanel />;
    case 100:
      return <>잘못된 스킬 할당 탭입니다.</>;
    default:
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          알 수 없는 탭 ID입니다. (ID: {tabId})
        </div>
      );
  }
};