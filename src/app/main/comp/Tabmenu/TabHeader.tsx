import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useTabStore } from "@/store/tabStore";
import { useDroppable, useDndMonitor } from "@dnd-kit/core";
import Image from "next/image";
import { CommonButton } from "@/components/shared/CommonButton";
import DraggableTab from "./DraggableTab";
import { Trash2 } from "lucide-react";

// Tab 타입 정의
interface Tab {
    id: number;
    uniqueKey: string;
    title: string;
    campaignId?: string;
    campaignName?: string;
    params?: Record<string, any>;
}

// 최적화된 TabItem - 불필요한 리렌더링 방지
const TabItem = React.memo(({
    tab,
    isActive,
    rowId,
    sectionId,
    openedTab
}: {
    tab: Tab;
    isActive: boolean;
    rowId: string;
    sectionId: string;
    openedTab?: Tab;
}) => {
    // 안정적인 참조를 위해 selector 분리
    const removeTab = useTabStore(useCallback((state) => state.removeTab, []));
    const setSectionActiveTab = useTabStore(useCallback((state) => state.setSectionActiveTab, []));
    const setOpenOperationSectionId = useTabStore(useCallback((state) => state.setOpenOperationSectionId, []));

    // 메모이제이션된 핸들러들
    const handleRemove = useCallback(() => {
        if (tab.id === 11) setOpenOperationSectionId("section1");
        removeTab(tab.id, tab.uniqueKey);
    }, [tab.id, tab.uniqueKey, removeTab, setOpenOperationSectionId]);

    const handleSelect = useCallback(() => {
        setSectionActiveTab(rowId, sectionId, tab.uniqueKey);
    }, [rowId, sectionId, tab.uniqueKey, setSectionActiveTab]);

    // 제목 메모이제이션
    const title = useMemo(() => 
        openedTab?.title || tab.title || `탭 ${tab.id}`, 
        [openedTab?.title, tab.title, tab.id]
    );

    return (
        <DraggableTab
            id={tab.id}
            uniqueKey={tab.uniqueKey}
            title={title}
            isActive={isActive}
            onRemove={handleRemove}
            onSelect={handleSelect}
            rowId={rowId}
            sectionId={sectionId}
        />
    );
}, (prevProps, nextProps) => {
    // 정확한 비교로 불필요한 리렌더링 방지
    return (
        prevProps.tab.id === nextProps.tab.id &&
        prevProps.tab.uniqueKey === nextProps.tab.uniqueKey &&
        prevProps.isActive === nextProps.isActive &&
        prevProps.openedTab?.title === nextProps.openedTab?.title &&
        prevProps.rowId === nextProps.rowId &&
        prevProps.sectionId === nextProps.sectionId
    );
});

TabItem.displayName = 'TabItem';

// TabHeader 컴포넌트
const TabHeader = ({
    rowId,
    sectionId,
    section,
    openedTabs,
    activeTabId,
    activeTabKey,
    canRemove,
}: {
    rowId: string;
    sectionId: string;
    section: { tabs: Tab[], activeTabKey?: string };
    openedTabs: any[];
    activeTabId: number | null;
    activeTabKey: string | null;
    canRemove: boolean;
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [scrolling, setScrolling] = useState<"left" | "right" | null>(null);
    const [isContentDraggedOver, setIsContentDraggedOver] = useState(false);
    const prevTabsLengthRef = useRef<number | null>(null);

    // 섹션 ID 일관성 있게 생성
    const droppableId = `section-${rowId}-${sectionId}`;

    const { isOver, setNodeRef, active } = useDroppable({
        id: droppableId,
        data: {
            type: "section",
            rowId,
            sectionId
        },
    });

    // Store selectors 메모이제이션
    const removeSection = useTabStore(useCallback((state) => state.removeSection, []));
    const rows = useTabStore(useCallback((state) => state.rows, []));
    const addSectionAndMoveTab = useTabStore(useCallback((state) => state.addSectionAndMoveTab, []));
    const closeAllTabs = useTabStore(useCallback((state) => state.closeAllTabs, []));

    // DnD 모니터를 사용하여 전역 드래그 이벤트 감지
    useDndMonitor({
        onDragOver(event) {
            const { over } = event;
            if (over && over.id === `content-drop-${rowId}-${sectionId}`) {
                setIsContentDraggedOver(true);
            } else if (over && over.id !== `content-drop-${rowId}-${sectionId}`) {
                setIsContentDraggedOver(false);
            }
        },
        onDragEnd() {
            setIsContentDraggedOver(false);
        },
        onDragCancel() {
            setIsContentDraggedOver(false);
        }
    });

    // 드래그 상태 계산 메모이제이션
    const dragState = useMemo(() => {
        const isDraggingTab = active?.data?.current?.type === 'tab';
        const draggingTabSectionId = active?.data?.current?.sectionId;
        const draggingTabRowId = active?.data?.current?.rowId;
        const isFromCurrentSection = isDraggingTab && 
            draggingTabSectionId === sectionId && 
            draggingTabRowId === rowId;
        
        return {
            isDraggingTab,
            isFromCurrentSection,
            showDragOverlay: (isOver && !isFromCurrentSection) || isContentDraggedOver
        };
    }, [active, isOver, isContentDraggedOver, rowId, sectionId]);

    // 현재 탭 수 가져오기
    const currentTabsLength = section?.tabs?.length || 0;

    // 스크롤 함수들 메모이제이션
    const scrollToEnd = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, []);

    const scroll = useCallback((dir: "left" | "right") => {
        if (!scrollRef.current) return;
        const delta = dir === "left" ? -100 : 100;
        scrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
    }, []);

    const startScroll = useCallback((dir: "left" | "right") => {
        setScrolling(dir);
        if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
        scroll(dir);
        scrollIntervalRef.current = setInterval(() => scroll(dir), 150);
    }, [scroll]);

    const stopScroll = useCallback(() => {
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
        setScrolling(null);
    }, []);

    // 탭 추가 감지 및 자동 스크롤 처리
    useEffect(() => {
        if (prevTabsLengthRef.current !== null && currentTabsLength > prevTabsLengthRef.current) {
            if (scrollRef.current) {
                scrollToEnd();
                setTimeout(scrollToEnd, 100);
            }
        }
        prevTabsLengthRef.current = currentTabsLength;
    }, [currentTabsLength, scrollToEnd]);

    useEffect(() => {
        return () => {
            if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
        };
    }, []);

    // 섹션 정보 메모이제이션
    const sectionInfo = useMemo(() => {
        const row = rows.find(r => r.id === rowId);
        const hasMultipleSections = (row?.sections?.length || 0) > 1;
        const sectionCount = row?.sections.length || 0;
        return { hasMultipleSections, sectionCount };
    }, [rows, rowId]);

    // 핸들러들 메모이제이션
    const handleSectionRemove = useCallback(() => {
        removeSection(rowId, sectionId);
    }, [removeSection, rowId, sectionId]);

    const handleSectionSplit = useCallback(() => {
        if (section.activeTabKey) {
            const activeTab = section.tabs.find(t => t.uniqueKey === section.activeTabKey);
            if (activeTab) {
                addSectionAndMoveTab(activeTab.id, activeTab.uniqueKey, rowId, sectionId);
            }
        }
    }, [section.activeTabKey, section.tabs, addSectionAndMoveTab, rowId, sectionId]);

    const handleCloseAllTabs = useCallback(() => {
        closeAllTabs(rowId, sectionId);
    }, [closeAllTabs, rowId, sectionId]);

    // openedTabs 매핑 메모이제이션
    const tabsWithOpenedInfo = useMemo(() => {
        return section.tabs.map((tab) => {
            const openedTab = openedTabs.find(
                (t) => t.id === tab.id && t.uniqueKey === tab.uniqueKey
            );
            const isActiveInSection = section.activeTabKey === tab.uniqueKey;
            const isActiveGlobal = tab.id === activeTabId && tab.uniqueKey === activeTabKey;
            const isActive = isActiveInSection || isActiveGlobal;

            return {
                tab,
                openedTab,
                isActive,
                key: tab.uniqueKey
            };
        });
    }, [section.tabs, section.activeTabKey, openedTabs, activeTabId, activeTabKey]);

    return (
        <div
            ref={setNodeRef}
            className={`relative flex-none transition-all duration-200 ${dragState.showDragOverlay
                ? "bg-blue-50 shadow-lg border border-dashed border-blue-400 border-b border-blue-200"
                : "bg-white border border-gray-200"
                }`}
        >
            {/* 높이를 일관되게 맞춘 컨테이너 */}
            <div className="flex items-stretch">
                {/* Left scroll */}
                <CommonButton
                    variant="tabEtc"
                    size="sm"
                    className={`flex-none flex items-center justify-center px-3 ${scrolling === "left" ? "bg-gray-100" : ""}`}
                    onMouseDown={() => startScroll("left")}
                    onMouseUp={stopScroll}
                    onMouseLeave={stopScroll}
                    onTouchStart={() => startScroll("left")}
                    onTouchEnd={stopScroll}
                >
                    <Image src="/header-menu/leftArrow.svg" alt="left" width={8} height={8} />
                </CommonButton>

                {/* Tabs container */}
                <div
                    ref={scrollRef}
                    className={`flex-1 flex items-stretch overflow-x-auto scrollbar-none flex-nowrap ${dragState.showDragOverlay ? "bg-blue-50" : ""}`}
                    data-droppable-tabs-container={true}
                    style={{ minWidth: 0 }}
                >
                    {tabsWithOpenedInfo.map(({ tab, openedTab, isActive, key }) => (
                        <TabItem
                            key={key}
                            tab={tab}
                            isActive={isActive}
                            rowId={rowId}
                            sectionId={sectionId}
                            openedTab={openedTab}
                        />
                    ))}
                </div>

                {/* Right scroll */}
                <CommonButton
                    variant="tabEtc"
                    size="sm"
                    className={`flex-none flex items-center justify-center px-3 ${scrolling === "right" ? "bg-gray-100" : ""}`}
                    onMouseDown={() => startScroll("right")}
                    onMouseUp={stopScroll}
                    onMouseLeave={stopScroll}
                    onTouchStart={() => startScroll("right")}
                    onTouchEnd={stopScroll}
                >
                    <Image src="/header-menu/rightArrow.svg" alt="right" width={8} height={8} />
                </CommonButton>

                {/* Remove section */}
                {canRemove && sectionInfo.hasMultipleSections && (
                    <CommonButton
                        variant="tabEtc"
                        size="sm"
                        className="flex-none flex items-center justify-center px-3"
                        onClick={handleSectionRemove}
                    >
                        <Image src="/header-menu/tab_minus.svg" alt="remove" width={8} height={8} />
                    </CommonButton>
                )}

                {/* 섹션 분할 버튼 */}
                {section.tabs.length > 0 && !sectionInfo.hasMultipleSections && (
                    <CommonButton
                        variant="tabEtc"
                        size="sm"
                        className="flex-none flex items-center justify-center px-3"
                        onClick={handleSectionSplit}
                    >
                        <Image src="/header-menu/tab_plus.svg" alt="split" width={8} height={8} />
                    </CommonButton>
                )}

                {/* 모든 탭 닫기 버튼 */}
                {section.tabs.length > 0 && (
                    <CommonButton
                        variant="tabEtc"
                        size="sm"
                        className="flex-none flex items-center justify-center px-3"
                        onClick={handleCloseAllTabs}
                        title="모든 탭 닫기"
                    >
                        <Trash2 size={12} className="text-gray-600" />
                    </CommonButton>
                )}
            </div>

            {/* 드래그 오버레이 */}
            {dragState.showDragOverlay && (
                <div className="absolute inset-0 pointer-events-none z-10">
                    {sectionInfo.sectionCount < 2 ? (
                        <div className="flex h-full">
                            <div className="w-1/2 border-r-2 border-blue-500 border-dashed h-full bg-blue-50 bg-opacity-50 flex items-center justify-center" />
                            <div className="w-1/2 h-full bg-blue-50 bg-opacity-50 flex items-center justify-center" />
                        </div>
                    ) : (
                        <div className="border border-dashed !border-blue-400 bg-blue-50 bg-opacity-50 h-full" />
                    )}
                </div>
            )}
        </div>
    );
};

TabHeader.displayName = 'TabHeader';

export default React.memo(TabHeader);