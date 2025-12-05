import React from "react";
import { useTabStore } from "@/store/tabStore";
import TabHeader from "./TabHeader";
import SectionContent from "./SectionContent";

// Tab 타입 정의
interface Tab {
  id: number;
  uniqueKey: string;
  title: string;
  campaignId?: string;
  campaignName?: string;
  params?: Record<string, any>;
}

// 통합된 섹션 컴포넌트 - 탭 헤더와 콘텐츠를 함께 관리
const UnifiedTabSection = ({ 
  rowId, 
  sectionId, 
  section,
  width, 
  openedTabs,
  activeTabId,
  activeTabKey,
  canRemove,
  showDivider,
  isSplitView
}: {
  rowId: string;
  sectionId: string;
  section: { tabs: Tab[], activeTabKey?: string };
  width: number;
  openedTabs: any[];
  activeTabId: number | null;
  activeTabKey: string | null;
  canRemove: boolean;
  showDivider: boolean;
  isSplitView: boolean;
}) => {
  const { setActiveTab } = useTabStore();

  return (
    <div
      className={`flex-none relative transition-colors duration-200 ${
        showDivider ? "border-r border-gray-200" : ""
      }`}
      style={{ width: `${width}%` }}
    >
      {/* 섹션 전체 컨테이너 - 세로 방향으로 탭과 콘텐츠 배치 */}
      <div className="flex flex-col h-full gap-5">
        {/* 탭 헤더 영역 */}
        <TabHeader
          rowId={rowId}
          sectionId={sectionId}
          section={section}
          openedTabs={openedTabs}
          activeTabId={activeTabId}
          activeTabKey={activeTabKey}
          canRemove={canRemove}
        />

        {/* 콘텐츠 영역 - 탭 헤더 아래에 배치 */}
        <div className={`flex-1 overflow-hidden ${
          isSplitView ? "px-5" : ""
        }`}>
          <SectionContent
            rowId={rowId}
            sectionId={sectionId}
            section={section}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(UnifiedTabSection);