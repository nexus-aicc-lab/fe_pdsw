
// // // import React, { useRef, useEffect, useState, useCallback } from "react";
// // // import { useTabStore } from "@/store/tabStore";
// // // import { useDroppable } from "@dnd-kit/core";
// // // import Image from "next/image";
// // // import { CommonButton } from "@/components/shared/CommonButton";
// // // import DraggableTab from "./DraggableTab";
// // // import { Trash2 } from "lucide-react";

// // // // Tab 타입 정의
// // // interface Tab {
// // //     id: number;
// // //     uniqueKey: string;
// // //     title: string;
// // //     campaignId?: string;
// // //     campaignName?: string;
// // //     params?: Record<string, any>;
// // // }

// // // // 개별 탭 아이템 - Hook 호출 문제 해결을 위한 별도 컴포넌트
// // // const TabItem = React.memo(({
// // //     tab,
// // //     isActive,
// // //     rowId,
// // //     sectionId,
// // //     openedTab
// // // }: {
// // //     tab: Tab;
// // //     isActive: boolean;
// // //     rowId: string;
// // //     sectionId: string;
// // //     openedTab?: Tab;
// // // }) => {
// // //     const { removeTab, setSectionActiveTab, setOpenOperationSectionId } = useTabStore();

// // //     // onRemove 핸들러
// // //     const handleRemove = useCallback(() => {
// // //         if (tab.id === 11) setOpenOperationSectionId("section1");
// // //         removeTab(tab.id, tab.uniqueKey);
// // //     }, [tab.id, tab.uniqueKey, removeTab, setOpenOperationSectionId]);

// // //     // onSelect 핸들러
// // //     const handleSelect = useCallback(() => {
// // //         setSectionActiveTab(rowId, sectionId, tab.uniqueKey);
// // //     }, [rowId, sectionId, tab.uniqueKey, setSectionActiveTab]);

// // //     return (
// // //         <DraggableTab
// // //             id={tab.id}
// // //             uniqueKey={tab.uniqueKey}
// // //             title={openedTab?.title || tab.title || `탭 ${tab.id}`}
// // //             isActive={isActive}
// // //             onRemove={handleRemove}
// // //             onSelect={handleSelect}
// // //             rowId={rowId}
// // //             sectionId={sectionId}
// // //         />
// // //     );
// // // });
// // // // Add display name for TabItem
// // // TabItem.displayName = 'TabItem';

// // // // TabHeader 컴포넌트
// // // const TabHeader = ({
// // //     rowId,
// // //     sectionId,
// // //     section,
// // //     openedTabs,
// // //     activeTabId,
// // //     activeTabKey,
// // //     canRemove,
// // // }: {
// // //     rowId: string;
// // //     sectionId: string;
// // //     section: { tabs: Tab[], activeTabKey?: string };
// // //     openedTabs: any[];
// // //     activeTabId: number | null;
// // //     activeTabKey: string | null;
// // //     canRemove: boolean;
// // // }) => {
// // //     const scrollRef = useRef<HTMLDivElement>(null);
// // //     const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
// // //     const [scrolling, setScrolling] = useState<"left" | "right" | null>(null);
// // //     const prevTabsLengthRef = useRef<number | null>(null);

// // //     // 섹션 ID 일관성 있게 생성
// // //     const droppableId = `section-${rowId}-${sectionId}`;

// // //     const { isOver, setNodeRef, active } = useDroppable({
// // //         id: droppableId,
// // //         data: {
// // //             type: "section",
// // //             rowId,
// // //             sectionId
// // //         },
// // //     });

// // //     const {
// // //         removeSection,
// // //         rows,
// // //         addSectionAndMoveTab,
// // //         closeAllTabs
// // //     } = useTabStore();

// // //     // TabStore에서 콘텐츠 드래그 상태 가져오기
// // //     const contentDragOver = useTabStore(state => state.contentDragOver);

// // //     // 콘텐츠 영역에서 같은 섹션으로 드래그 중인지 확인
// // //     const isContentBeingDragged = contentDragOver.isActive && 
// // //                                  contentDragOver.rowId === rowId && 
// // //                                  contentDragOver.sectionId === sectionId;

// // //     // 드래그 중인 요소가 탭인지 확인 (현재 활성화된 드래그 요소의 데이터 타입 확인)
// // //     const isDraggingTab = active?.data?.current?.type === 'tab';

// // //     // 헤더 내 드래그인 경우 오버레이를 표시하지 않음
// // //     // 오직 콘텐츠에서 헤더로 드래그하는 경우에만 오버레이 표시
// // //     const showDragOverlay = (isOver && !isDraggingTab) || isContentBeingDragged;

// // //     // 현재 탭 수 가져오기
// // //     const currentTabsLength = section?.tabs?.length || 0;

// // //     // 오른쪽 끝으로 스크롤하는 함수
// // //     const scrollToEnd = useCallback(() => {
// // //         if (scrollRef.current) {
// // //             scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
// // //         }
// // //     }, []);

// // //     // 탭 추가 감지 및 자동 스크롤 처리
// // //     useEffect(() => {
// // //         // 처음 렌더링이 아니고, 이전 탭 개수보다 현재 탭 개수가 많아졌을 경우
// // //         if (prevTabsLengthRef.current !== null && currentTabsLength > prevTabsLengthRef.current) {
// // //             // 오른쪽 끝으로 스크롤
// // //             if (scrollRef.current) {
// // //                 // 즉시 실행과 약간의 지연 후 실행(애니메이션이나 렌더링 완료 후)
// // //                 scrollToEnd();

// // //                 // 추가로 약간의 지연을 두고 한 번 더 스크롤 (렌더링이 완전히 끝난 후)
// // //                 setTimeout(scrollToEnd, 100);
// // //             }
// // //         }

// // //         // 현재 탭 개수 저장
// // //         prevTabsLengthRef.current = currentTabsLength;
// // //     }, [currentTabsLength, scrollToEnd]);

// // //     useEffect(() => {
// // //         return () => {
// // //             if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
// // //         };
// // //     }, []);

// // //     const scroll = useCallback((dir: "left" | "right") => {
// // //         if (!scrollRef.current) return;
// // //         const delta = dir === "left" ? -100 : 100;
// // //         scrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
// // //     }, []);

// // //     const startScroll = useCallback((dir: "left" | "right") => {
// // //         setScrolling(dir);
// // //         if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
// // //         scroll(dir);
// // //         scrollIntervalRef.current = setInterval(() => scroll(dir), 150);
// // //     }, [scroll]);

// // //     const stopScroll = useCallback(() => {
// // //         if (scrollIntervalRef.current) {
// // //             clearInterval(scrollIntervalRef.current);
// // //             scrollIntervalRef.current = null;
// // //         }
// // //         setScrolling(null);
// // //     }, []);

// // //     // 섹션 삭제 핸들러
// // //     const handleSectionRemove = useCallback(() => {
// // //         // 섹션 삭제 전에 업데이트된 removeSection 함수 호출
// // //         removeSection(rowId, sectionId);
// // //     }, [removeSection, rowId, sectionId]);

// // //     // 현재 행에 섹션이 여러 개인지 확인
// // //     const row = rows.find(r => r.id === rowId);
// // //     const hasMultipleSections = (row?.sections?.length || 0) > 1;
// // //     const sectionCount = row?.sections.length || 0;

// // //     return (
// // //         <div
// // //             ref={setNodeRef}
// // //             className={`relative flex-none border-b border-gray-200 transition-all duration-200 ${
// // //                 showDragOverlay
// // //                     ? "bg-blue-100 shadow-lg" 
// // //                     : "bg-white"
// // //             }`}
// // //             data-section-id={sectionId}
// // //             data-row-id={rowId}
// // //         >
// // //             {/* 높이를 일관되게 맞춘 컨테이너 */}
// // //             <div className="flex items-stretch">
// // //                 {/* Left scroll - 높이를 동일하게 */}
// // //                 <CommonButton
// // //                     variant="tabEtc"
// // //                     size="sm"
// // //                     className={`flex-none flex items-center justify-center px-3 ${scrolling === "left" ? "bg-gray-100" : ""}`}
// // //                     onMouseDown={() => startScroll("left")}
// // //                     onMouseUp={stopScroll}
// // //                     onMouseLeave={stopScroll}
// // //                     onTouchStart={() => startScroll("left")}
// // //                     onTouchEnd={stopScroll}
// // //                 >
// // //                     <Image src="/header-menu/leftArrow.svg" alt="left" width={8} height={8} />
// // //                 </CommonButton>

// // //                 {/* Tabs container - 높이와 정렬 일치 */}
// // //                 <div
// // //                     ref={scrollRef}
// // //                     className={`flex-1 flex items-stretch overflow-x-auto scrollbar-none flex-nowrap ${showDragOverlay ? "bg-blue-50" : ""}`}
// // //                     data-droppable-tabs-container={true}
// // //                     style={{ minWidth: 0 }}
// // //                 >
// // //                     {section.tabs.map((tab) => {
// // //                         // openedTabs에서 실제 탭 정보 찾기
// // //                         const openedTab = openedTabs.find(
// // //                             (t) => t.id === tab.id && t.uniqueKey === tab.uniqueKey
// // //                         );

// // //                         // 섹션 활성 탭 확인 및 전역 활성 탭 확인
// // //                         const isActiveInSection = section.activeTabKey === tab.uniqueKey;
// // //                         const isActiveGlobal = tab.id === activeTabId && tab.uniqueKey === activeTabKey;
// // //                         const isActive = isActiveInSection || isActiveGlobal;

// // //                         return (
// // //                             <TabItem
// // //                                 key={tab.uniqueKey}
// // //                                 tab={tab}
// // //                                 isActive={isActive}
// // //                                 rowId={rowId}
// // //                                 sectionId={sectionId}
// // //                                 openedTab={openedTab}
// // //                             />
// // //                         );
// // //                     })}
// // //                 </div>

// // //                 {/* Right scroll - 높이를 동일하게 */}
// // //                 <CommonButton
// // //                     variant="tabEtc"
// // //                     size="sm"
// // //                     className={`flex-none flex items-center justify-center px-3 ${scrolling === "right" ? "bg-gray-100" : ""}`}
// // //                     onMouseDown={() => startScroll("right")}
// // //                     onMouseUp={stopScroll}
// // //                     onMouseLeave={stopScroll}
// // //                     onTouchStart={() => startScroll("right")}
// // //                     onTouchEnd={stopScroll}
// // //                 >
// // //                     <Image src="/header-menu/rightArrow.svg" alt="right" width={8} height={8} />
// // //                 </CommonButton>

// // //                 {/* Remove section - 높이를 동일하게 */}
// // //                 {canRemove && hasMultipleSections && (
// // //                     <CommonButton
// // //                         variant="tabEtc"
// // //                         size="sm"
// // //                         className="flex-none flex items-center justify-center px-3"
// // //                         onClick={handleSectionRemove}
// // //                     >
// // //                         <Image src="/header-menu/tab_minus.svg" alt="remove" width={8} height={8} />
// // //                     </CommonButton>
// // //                 )}

// // //                 {/* 섹션 분할 버튼 추가 */}
// // //                 {section.tabs.length > 0 && !hasMultipleSections && (
// // //                     <CommonButton
// // //                         variant="tabEtc"
// // //                         size="sm"
// // //                         className="flex-none flex items-center justify-center px-3"
// // //                         onClick={() => {
// // //                             // 현재 섹션의 활성 탭이 있으면 그 탭을 분할
// // //                             if (section.activeTabKey) {
// // //                                 const activeTab = section.tabs.find(t => t.uniqueKey === section.activeTabKey);
// // //                                 if (activeTab) {
// // //                                     addSectionAndMoveTab(activeTab.id, activeTab.uniqueKey, rowId, sectionId);
// // //                                 }
// // //                             }
// // //                         }}
// // //                     >
// // //                         <Image src="/header-menu/tab_plus.svg" alt="split" width={8} height={8} />
// // //                     </CommonButton>
// // //                 )}

// // //                 {/* 모든 탭 닫기 버튼 */}
// // //                 {section.tabs.length > 0 && (
// // //                     <CommonButton
// // //                         variant="tabEtc"
// // //                         size="sm"
// // //                         className="flex-none flex items-center justify-center px-3"
// // //                         onClick={() => closeAllTabs(rowId, sectionId)}
// // //                         title="모든 탭 닫기"
// // //                     >
// // //                         <Trash2 size={12} className="text-gray-600" />
// // //                     </CommonButton>
// // //                 )}
// // //             </div>

// // //             {/* 개선된 드롭 가능 시각적 표시 - 오직 콘텐츠에서 헤더로 드래그할 때만 표시 */}
// // //             {showDragOverlay && (
// // //                 <div className="absolute inset-0 pointer-events-none z-10">
// // //                     {sectionCount < 2 ? (
// // //                         <div className="flex h-full">
// // //                             <div className="w-1/2 border-r-2 border-blue-500 border-dashed h-full bg-blue-100 bg-opacity-60 flex items-center justify-center">
// // //                                 {/* <span className="text-blue-500 opacity-80 font-semibold text-sm">현재 영역</span> */}
// // //                             </div>
// // //                             <div className="w-1/2 h-full bg-blue-200 bg-opacity-60 flex items-center justify-center">
// // //                                 {/* <span className="text-blue-500 opacity-80 font-semibold text-sm">새 분할 영역</span> */}
// // //                             </div>
// // //                         </div>
// // //                     ) : (
// // //                         <div className="border-2 border-dashed border-blue-400 bg-blue-100 bg-opacity-70 h-full" />
// // //                     )}
// // //                 </div>
// // //             )}
// // //         </div>
// // //     );
// // // };

// // // // Add display name for TabHeader
// // // TabHeader.displayName = 'TabHeader';

// // // export default React.memo(TabHeader);

// // import React, { useRef, useEffect, useState, useCallback } from "react";
// // import { useTabStore } from "@/store/tabStore";
// // import { useDroppable } from "@dnd-kit/core";
// // import Image from "next/image";
// // import { CommonButton } from "@/components/shared/CommonButton";
// // import DraggableTab from "./DraggableTab";
// // import { Trash2 } from "lucide-react";

// // // Tab 타입 정의
// // interface Tab {
// //     id: number;
// //     uniqueKey: string;
// //     title: string;
// //     campaignId?: string;
// //     campaignName?: string;
// //     params?: Record<string, any>;
// // }

// // // 개별 탭 아이템 - Hook 호출 문제 해결을 위한 별도 컴포넌트
// // const TabItem = React.memo(({
// //     tab,
// //     isActive,
// //     rowId,
// //     sectionId,
// //     openedTab
// // }: {
// //     tab: Tab;
// //     isActive: boolean;
// //     rowId: string;
// //     sectionId: string;
// //     openedTab?: Tab;
// // }) => {
// //     const { removeTab, setSectionActiveTab, setOpenOperationSectionId } = useTabStore();

// //     // onRemove 핸들러
// //     const handleRemove = useCallback(() => {
// //         if (tab.id === 11) setOpenOperationSectionId("section1");
// //         removeTab(tab.id, tab.uniqueKey);
// //     }, [tab.id, tab.uniqueKey, removeTab, setOpenOperationSectionId]);

// //     // onSelect 핸들러
// //     const handleSelect = useCallback(() => {
// //         setSectionActiveTab(rowId, sectionId, tab.uniqueKey);
// //     }, [rowId, sectionId, tab.uniqueKey, setSectionActiveTab]);

// //     return (
// //         <DraggableTab
// //             id={tab.id}
// //             uniqueKey={tab.uniqueKey}
// //             title={openedTab?.title || tab.title || `탭 ${tab.id}`}
// //             isActive={isActive}
// //             onRemove={handleRemove}
// //             onSelect={handleSelect}
// //             rowId={rowId}
// //             sectionId={sectionId}
// //         />
// //     );
// // });
// // // Add display name for TabItem
// // TabItem.displayName = 'TabItem';

// // // TabHeader 컴포넌트
// // const TabHeader = ({
// //     rowId,
// //     sectionId,
// //     section,
// //     openedTabs,
// //     activeTabId,
// //     activeTabKey,
// //     canRemove,
// // }: {
// //     rowId: string;
// //     sectionId: string;
// //     section: { tabs: Tab[], activeTabKey?: string };
// //     openedTabs: any[];
// //     activeTabId: number | null;
// //     activeTabKey: string | null;
// //     canRemove: boolean;
// // }) => {
// //     const scrollRef = useRef<HTMLDivElement>(null);
// //     const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
// //     const [scrolling, setScrolling] = useState<"left" | "right" | null>(null);
// //     const prevTabsLengthRef = useRef<number | null>(null);

// //     // 섹션 ID 일관성 있게 생성
// //     const droppableId = `section-${rowId}-${sectionId}`;

// //     const { isOver, setNodeRef, active } = useDroppable({
// //         id: droppableId,
// //         data: {
// //             type: "section",
// //             rowId,
// //             sectionId
// //         },
// //     });

// //     const {
// //         removeSection,
// //         rows,
// //         addSectionAndMoveTab,
// //         closeAllTabs
// //     } = useTabStore();

// //     // TabStore에서 콘텐츠 드래그 상태 가져오기
// //     const contentDragOver = useTabStore(state => state.contentDragOver);

// //     // 콘텐츠 영역에서 같은 섹션으로 드래그 중인지 확인
// //     const isContentBeingDragged = contentDragOver.isActive &&
// //         contentDragOver.rowId === rowId &&
// //         contentDragOver.sectionId === sectionId;

// //     // 드래그 중인 요소가 탭인지 확인
// //     const isDraggingTab = active?.data?.current?.type === 'tab';

// //     // 드래그 중인 탭이 현재 섹션에서 온 것인지 확인
// //     const draggingTabSectionId = active?.data?.current?.sectionId;
// //     const draggingTabRowId = active?.data?.current?.rowId;

// //     // 같은 섹션 내에서의 드래그인지 확인 (rowId와 sectionId 모두 일치하는지)
// //     const isFromCurrentSection = isDraggingTab &&
// //         draggingTabSectionId === sectionId &&
// //         draggingTabRowId === rowId;

// //     // 드래그 오버레이 표시 조건 수정:
// //     // 1. 콘텐츠에서 드래그되는 경우
// //     // 2. 다른 섹션/행에서 드래그되는 경우
// //     // 3. 같은 섹션 내에서의 드래그는 오버레이 표시 안함
// //     // const showDragOverlay = (isOver && !isFromCurrentSection) || isContentBeingDragged;
// //     const showDragOverlay = isOver || isContentBeingDragged;


// //     // 현재 탭 수 가져오기
// //     const currentTabsLength = section?.tabs?.length || 0;

// //     // 오른쪽 끝으로 스크롤하는 함수
// //     const scrollToEnd = useCallback(() => {
// //         if (scrollRef.current) {
// //             scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
// //         }
// //     }, []);

// //     // 탭 추가 감지 및 자동 스크롤 처리
// //     useEffect(() => {
// //         // 처음 렌더링이 아니고, 이전 탭 개수보다 현재 탭 개수가 많아졌을 경우
// //         if (prevTabsLengthRef.current !== null && currentTabsLength > prevTabsLengthRef.current) {
// //             // 오른쪽 끝으로 스크롤
// //             if (scrollRef.current) {
// //                 // 즉시 실행과 약간의 지연 후 실행(애니메이션이나 렌더링 완료 후)
// //                 scrollToEnd();

// //                 // 추가로 약간의 지연을 두고 한 번 더 스크롤 (렌더링이 완전히 끝난 후)
// //                 setTimeout(scrollToEnd, 100);
// //             }
// //         }

// //         // 현재 탭 개수 저장
// //         prevTabsLengthRef.current = currentTabsLength;
// //     }, [currentTabsLength, scrollToEnd]);

// //     useEffect(() => {
// //         return () => {
// //             if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
// //         };
// //     }, []);

// //     const scroll = useCallback((dir: "left" | "right") => {
// //         if (!scrollRef.current) return;
// //         const delta = dir === "left" ? -100 : 100;
// //         scrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
// //     }, []);

// //     const startScroll = useCallback((dir: "left" | "right") => {
// //         setScrolling(dir);
// //         if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
// //         scroll(dir);
// //         scrollIntervalRef.current = setInterval(() => scroll(dir), 150);
// //     }, [scroll]);

// //     const stopScroll = useCallback(() => {
// //         if (scrollIntervalRef.current) {
// //             clearInterval(scrollIntervalRef.current);
// //             scrollIntervalRef.current = null;
// //         }
// //         setScrolling(null);
// //     }, []);

// //     // 섹션 삭제 핸들러
// //     const handleSectionRemove = useCallback(() => {
// //         // 섹션 삭제 전에 업데이트된 removeSection 함수 호출
// //         removeSection(rowId, sectionId);
// //     }, [removeSection, rowId, sectionId]);

// //     // 현재 행에 섹션이 여러 개인지 확인
// //     const row = rows.find(r => r.id === rowId);
// //     const hasMultipleSections = (row?.sections?.length || 0) > 1;
// //     const sectionCount = row?.sections.length || 0;

// //     return (
// //         <div
// //             ref={setNodeRef}
// //             className={`relative flex-none transition-all duration-200 border-b border-blue-200 ${showDragOverlay
// //                 ? "bg-blue-50 shadow-lg border-2 border-dashed border-blue-400"
// //                 : "bg-white"
// //                 }`}
// //         >

// //             {/* 높이를 일관되게 맞춘 컨테이너 */}
// //             <div className="flex items-stretch">
// //                 {/* Left scroll - 높이를 동일하게 */}
// //                 <CommonButton
// //                     variant="tabEtc"
// //                     size="sm"
// //                     className={`flex-none flex items-center justify-center px-3 ${scrolling === "left" ? "bg-gray-100" : ""}`}
// //                     onMouseDown={() => startScroll("left")}
// //                     onMouseUp={stopScroll}
// //                     onMouseLeave={stopScroll}
// //                     onTouchStart={() => startScroll("left")}
// //                     onTouchEnd={stopScroll}
// //                 >
// //                     <Image src="/header-menu/leftArrow.svg" alt="left" width={8} height={8} />
// //                 </CommonButton>

// //                 {/* Tabs container - 높이와 정렬 일치 */}
// //                 <div
// //                     ref={scrollRef}
// //                     className={`flex-1 flex items-stretch overflow-x-auto scrollbar-none flex-nowrap ${showDragOverlay ? "bg-blue-50" : ""}`}
// //                     data-droppable-tabs-container={true}
// //                     style={{ minWidth: 0 }}
// //                 >
// //                     {section.tabs.map((tab) => {
// //                         // openedTabs에서 실제 탭 정보 찾기
// //                         const openedTab = openedTabs.find(
// //                             (t) => t.id === tab.id && t.uniqueKey === tab.uniqueKey
// //                         );

// //                         // 섹션 활성 탭 확인 및 전역 활성 탭 확인
// //                         const isActiveInSection = section.activeTabKey === tab.uniqueKey;
// //                         const isActiveGlobal = tab.id === activeTabId && tab.uniqueKey === activeTabKey;
// //                         const isActive = isActiveInSection || isActiveGlobal;

// //                         return (
// //                             <TabItem
// //                                 key={tab.uniqueKey}
// //                                 tab={tab}
// //                                 isActive={isActive}
// //                                 rowId={rowId}
// //                                 sectionId={sectionId}
// //                                 openedTab={openedTab}
// //                             />
// //                         );
// //                     })}
// //                 </div>

// //                 {/* Right scroll - 높이를 동일하게 */}
// //                 <CommonButton
// //                     variant="tabEtc"
// //                     size="sm"
// //                     className={`flex-none flex items-center justify-center px-3 ${scrolling === "right" ? "bg-gray-100" : ""}`}
// //                     onMouseDown={() => startScroll("right")}
// //                     onMouseUp={stopScroll}
// //                     onMouseLeave={stopScroll}
// //                     onTouchStart={() => startScroll("right")}
// //                     onTouchEnd={stopScroll}
// //                 >
// //                     <Image src="/header-menu/rightArrow.svg" alt="right" width={8} height={8} />
// //                 </CommonButton>

// //                 {/* Remove section - 높이를 동일하게 */}
// //                 {canRemove && hasMultipleSections && (
// //                     <CommonButton
// //                         variant="tabEtc"
// //                         size="sm"
// //                         className="flex-none flex items-center justify-center px-3"
// //                         onClick={handleSectionRemove}
// //                     >
// //                         <Image src="/header-menu/tab_minus.svg" alt="remove" width={8} height={8} />
// //                     </CommonButton>
// //                 )}

// //                 {/* 섹션 분할 버튼 추가 */}
// //                 {section.tabs.length > 0 && !hasMultipleSections && (
// //                     <CommonButton
// //                         variant="tabEtc"
// //                         size="sm"
// //                         className="flex-none flex items-center justify-center px-3"
// //                         onClick={() => {
// //                             // 현재 섹션의 활성 탭이 있으면 그 탭을 분할
// //                             if (section.activeTabKey) {
// //                                 const activeTab = section.tabs.find(t => t.uniqueKey === section.activeTabKey);
// //                                 if (activeTab) {
// //                                     addSectionAndMoveTab(activeTab.id, activeTab.uniqueKey, rowId, sectionId);
// //                                 }
// //                             }
// //                         }}
// //                     >
// //                         <Image src="/header-menu/tab_plus.svg" alt="split" width={8} height={8} />
// //                     </CommonButton>
// //                 )}

// //                 {/* 모든 탭 닫기 버튼 */}
// //                 {section.tabs.length > 0 && (
// //                     <CommonButton
// //                         variant="tabEtc"
// //                         size="sm"
// //                         className="flex-none flex items-center justify-center px-3"
// //                         onClick={() => closeAllTabs(rowId, sectionId)}
// //                         title="모든 탭 닫기"
// //                     >
// //                         <Trash2 size={12} className="text-gray-600" />
// //                     </CommonButton>
// //                 )}
// //             </div>

// //             {/* 개선된 드롭 가능 시각적 표시 - 다른 섹션에서 온 탭 또는 콘텐츠에서 드래그할 때만 표시 */}
// //             {showDragOverlay && (
// //                 <div className="absolute inset-0 pointer-events-none z-10">
// //                     {isContentBeingDragged ? "드래그 오버중" : "드래그 상태 아님"}
// //                     {sectionCount < 2 ? (
// //                         <div className="flex h-full">
// //                             <div
// //                                 className="
// //                                     w-1/2
// //                                     border-r-2 border-blue-500 border-dashed
// //                                     h-full
// //                                     bg-blue-50 bg-opacity-50
// //                                     flex items-center justify-center
// //                                 "
// //                             >
// //                                 {/* 현재 영역 */}
// //                             </div>
// //                             <div
// //                                 className="
// //                                     w-1/2
// //                                     h-full
// //                                     bg-blue-50 bg-opacity-50
// //                                     flex items-center justify-center
// //                                 "
// //                             >
// //                                 {/* 새 분할 영역 */}
// //                             </div>
// //                         </div>
// //                     ) : (
// //                         <div className="
// //                             border-2 border-dashed !border-blue-400
// //                             bg-blue-50 bg-opacity-50
// //                             h-full
// //                         " />
// //                     )}
// //                 </div>
// //             )}

// //         </div>
// //     );
// // };

// // // Add display name for TabHeader
// // TabHeader.displayName = 'TabHeader';

// // export default React.memo(TabHeader);

// import React, { useRef, useEffect, useState, useCallback } from "react";
// import { useTabStore } from "@/store/tabStore";
// import { useDroppable, useDndMonitor } from "@dnd-kit/core";
// import Image from "next/image";
// import { CommonButton } from "@/components/shared/CommonButton";
// import DraggableTab from "./DraggableTab";
// import { Trash2 } from "lucide-react";

// // Tab 타입 정의
// interface Tab {
//     id: number;
//     uniqueKey: string;
//     title: string;
//     campaignId?: string;
//     campaignName?: string;
//     params?: Record<string, any>;
// }

// // 개별 탭 아이템 - Hook 호출 문제 해결을 위한 별도 컴포넌트
// const TabItem = React.memo(({
//     tab,
//     isActive,
//     rowId,
//     sectionId,
//     openedTab
// }: {
//     tab: Tab;
//     isActive: boolean;
//     rowId: string;
//     sectionId: string;
//     openedTab?: Tab;
// }) => {
//     const { removeTab, setSectionActiveTab, setOpenOperationSectionId } = useTabStore();

//     // onRemove 핸들러
//     const handleRemove = useCallback(() => {
//         if (tab.id === 11) setOpenOperationSectionId("section1");
//         removeTab(tab.id, tab.uniqueKey);
//     }, [tab.id, tab.uniqueKey, removeTab, setOpenOperationSectionId]);

//     // onSelect 핸들러
//     const handleSelect = useCallback(() => {
//         setSectionActiveTab(rowId, sectionId, tab.uniqueKey);
//     }, [rowId, sectionId, tab.uniqueKey, setSectionActiveTab]);

//     return (
//         <DraggableTab
//             id={tab.id}
//             uniqueKey={tab.uniqueKey}
//             title={openedTab?.title || tab.title || `탭 ${tab.id}`}
//             isActive={isActive}
//             onRemove={handleRemove}
//             onSelect={handleSelect}
//             rowId={rowId}
//             sectionId={sectionId}
//         />
//     );
// });
// // Add display name for TabItem
// TabItem.displayName = 'TabItem';

// // TabHeader 컴포넌트
// const TabHeader = ({
//     rowId,
//     sectionId,
//     section,
//     openedTabs,
//     activeTabId,
//     activeTabKey,
//     canRemove,
// }: {
//     rowId: string;
//     sectionId: string;
//     section: { tabs: Tab[], activeTabKey?: string };
//     openedTabs: any[];
//     activeTabId: number | null;
//     activeTabKey: string | null;
//     canRemove: boolean;
// }) => {
//     const scrollRef = useRef<HTMLDivElement>(null);
//     const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
//     const [scrolling, setScrolling] = useState<"left" | "right" | null>(null);
//     const [isContentDraggedOver, setIsContentDraggedOver] = useState(false);
//     const prevTabsLengthRef = useRef<number | null>(null);

//     // 섹션 ID 일관성 있게 생성
//     const droppableId = `section-${rowId}-${sectionId}`;

//     const { isOver, setNodeRef, active } = useDroppable({
//         id: droppableId,
//         data: {
//             type: "section",
//             rowId,
//             sectionId
//         },
//     });

//     const {
//         removeSection,
//         rows,
//         addSectionAndMoveTab,
//         closeAllTabs
//     } = useTabStore();

//     // DnD 모니터를 사용하여 전역 드래그 이벤트 감지
//     useDndMonitor({
//         onDragOver(event) {
//             const { over } = event;
//             if (over && over.id === `content-drop-${rowId}-${sectionId}`) {
//                 setIsContentDraggedOver(true);
//             } else if (over && over.id !== `content-drop-${rowId}-${sectionId}`) {
//                 setIsContentDraggedOver(false);
//             }
//         },
//         onDragEnd() {
//             setIsContentDraggedOver(false);
//         },
//         onDragCancel() {
//             setIsContentDraggedOver(false);
//         }
//     });

//     // 드래그 중인 요소가 탭인지 확인
//     const isDraggingTab = active?.data?.current?.type === 'tab';

//     // 드래그 중인 탭이 현재 섹션에서 온 것인지 확인
//     const draggingTabSectionId = active?.data?.current?.sectionId;
//     const draggingTabRowId = active?.data?.current?.rowId;

//     // 같은 섹션 내에서의 드래그인지 확인 (rowId와 sectionId 모두 일치하는지)
//     const isFromCurrentSection = isDraggingTab &&
//         draggingTabSectionId === sectionId &&
//         draggingTabRowId === rowId;

//     // 개선된 드래그 오버레이 표시 조건:
//     // 1. 다른 섹션에서 드래그되는 탭의 경우
//     // 2. 콘텐츠 영역에서 드래그되는 경우
//     // 3. 같은 섹션 내에서의 드래그는 오버레이 표시 안함
//     const showDragOverlay = (isOver && !isFromCurrentSection) || isContentDraggedOver;

//     // 현재 탭 수 가져오기
//     const currentTabsLength = section?.tabs?.length || 0;

//     // 오른쪽 끝으로 스크롤하는 함수
//     const scrollToEnd = useCallback(() => {
//         if (scrollRef.current) {
//             scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
//         }
//     }, []);

//     // 탭 추가 감지 및 자동 스크롤 처리
//     useEffect(() => {
//         // 처음 렌더링이 아니고, 이전 탭 개수보다 현재 탭 개수가 많아졌을 경우
//         if (prevTabsLengthRef.current !== null && currentTabsLength > prevTabsLengthRef.current) {
//             // 오른쪽 끝으로 스크롤
//             if (scrollRef.current) {
//                 // 즉시 실행과 약간의 지연 후 실행(애니메이션이나 렌더링 완료 후)
//                 scrollToEnd();

//                 // 추가로 약간의 지연을 두고 한 번 더 스크롤 (렌더링이 완전히 끝난 후)
//                 setTimeout(scrollToEnd, 100);
//             }
//         }

//         // 현재 탭 개수 저장
//         prevTabsLengthRef.current = currentTabsLength;
//     }, [currentTabsLength, scrollToEnd]);

//     useEffect(() => {
//         return () => {
//             if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
//         };
//     }, []);

//     const scroll = useCallback((dir: "left" | "right") => {
//         if (!scrollRef.current) return;
//         const delta = dir === "left" ? -100 : 100;
//         scrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
//     }, []);

//     const startScroll = useCallback((dir: "left" | "right") => {
//         setScrolling(dir);
//         if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
//         scroll(dir);
//         scrollIntervalRef.current = setInterval(() => scroll(dir), 150);
//     }, [scroll]);

//     const stopScroll = useCallback(() => {
//         if (scrollIntervalRef.current) {
//             clearInterval(scrollIntervalRef.current);
//             scrollIntervalRef.current = null;
//         }
//         setScrolling(null);
//     }, []);

//     // 섹션 삭제 핸들러
//     const handleSectionRemove = useCallback(() => {
//         // 섹션 삭제 전에 업데이트된 removeSection 함수 호출
//         removeSection(rowId, sectionId);
//     }, [removeSection, rowId, sectionId]);

//     // 현재 행에 섹션이 여러 개인지 확인
//     const row = rows.find(r => r.id === rowId);
//     const hasMultipleSections = (row?.sections?.length || 0) > 1;
//     const sectionCount = row?.sections.length || 0;

//     // 디버깅을 위한 로깅 (개발 중에만 사용)
//     useEffect(() => {
//         if (process.env.NODE_ENV === 'development') {
//             console.log(`TabHeader [${rowId}-${sectionId}] Drag State:`, {
//                 isOver,
//                 isContentDraggedOver,
//                 showDragOverlay,
//                 isFromCurrentSection,
//                 timestamp: Date.now()
//             });
//         }
//     }, [isOver, isContentDraggedOver, showDragOverlay, isFromCurrentSection, rowId, sectionId]);

//     return (
//         <div
//             ref={setNodeRef}
//             className={`relative flex-none transition-all duration-200 ${showDragOverlay
//                 ? "bg-blue-50 shadow-lg border border-dashed border-blue-400 border-b border-blue-200"
//                 : "bg-white border border-gray-200"
//                 }`}
//         >
//             {/* 높이를 일관되게 맞춘 컨테이너 */}
//             <div className="flex items-stretch">
//                 {/* Left scroll - 높이를 동일하게 */}
//                 <CommonButton
//                     variant="tabEtc"
//                     size="sm"
//                     className={`flex-none flex items-center justify-center px-3 ${scrolling === "left" ? "bg-gray-100" : ""}`}
//                     onMouseDown={() => startScroll("left")}
//                     onMouseUp={stopScroll}
//                     onMouseLeave={stopScroll}
//                     onTouchStart={() => startScroll("left")}
//                     onTouchEnd={stopScroll}
//                 >
//                     <Image src="/header-menu/leftArrow.svg" alt="left" width={8} height={8} />
//                 </CommonButton>

//                 {/* Tabs container - 높이와 정렬 일치 */}
//                 <div
//                     ref={scrollRef}
//                     className={`flex-1 flex items-stretch overflow-x-auto scrollbar-none flex-nowrap ${showDragOverlay ? "bg-blue-50" : ""}`}
//                     data-droppable-tabs-container={true}
//                     style={{ minWidth: 0 }}
//                 >
//                     {section.tabs.map((tab) => {
//                         // openedTabs에서 실제 탭 정보 찾기
//                         const openedTab = openedTabs.find(
//                             (t) => t.id === tab.id && t.uniqueKey === tab.uniqueKey
//                         );

//                         // 섹션 활성 탭 확인 및 전역 활성 탭 확인
//                         const isActiveInSection = section.activeTabKey === tab.uniqueKey;
//                         const isActiveGlobal = tab.id === activeTabId && tab.uniqueKey === activeTabKey;
//                         const isActive = isActiveInSection || isActiveGlobal;

//                         return (
//                             <TabItem
//                                 key={tab.uniqueKey}
//                                 tab={tab}
//                                 isActive={isActive}
//                                 rowId={rowId}
//                                 sectionId={sectionId}
//                                 openedTab={openedTab}
//                             />
//                         );
//                     })}
//                 </div>

//                 {/* Right scroll - 높이를 동일하게 */}
//                 <CommonButton
//                     variant="tabEtc"
//                     size="sm"
//                     className={`flex-none flex items-center justify-center px-3 ${scrolling === "right" ? "bg-gray-100" : ""}`}
//                     onMouseDown={() => startScroll("right")}
//                     onMouseUp={stopScroll}
//                     onMouseLeave={stopScroll}
//                     onTouchStart={() => startScroll("right")}
//                     onTouchEnd={stopScroll}
//                 >
//                     <Image src="/header-menu/rightArrow.svg" alt="right" width={8} height={8} />
//                 </CommonButton>

//                 {/* Remove section - 높이를 동일하게 */}
//                 {canRemove && hasMultipleSections && (
//                     <CommonButton
//                         variant="tabEtc"
//                         size="sm"
//                         className="flex-none flex items-center justify-center px-3"
//                         onClick={handleSectionRemove}
//                     >
//                         <Image src="/header-menu/tab_minus.svg" alt="remove" width={8} height={8} />
//                     </CommonButton>
//                 )}

//                 {/* 섹션 분할 버튼 추가 */}
//                 {section.tabs.length > 0 && !hasMultipleSections && (
//                     <CommonButton
//                         variant="tabEtc"
//                         size="sm"
//                         className="flex-none flex items-center justify-center px-3"
//                         onClick={() => {
//                             // 현재 섹션의 활성 탭이 있으면 그 탭을 분할
//                             if (section.activeTabKey) {
//                                 const activeTab = section.tabs.find(t => t.uniqueKey === section.activeTabKey);
//                                 if (activeTab) {
//                                     addSectionAndMoveTab(activeTab.id, activeTab.uniqueKey, rowId, sectionId);
//                                 }
//                             }
//                         }}
//                     >
//                         <Image src="/header-menu/tab_plus.svg" alt="split" width={8} height={8} />
//                     </CommonButton>
//                 )}

//                 {/* 모든 탭 닫기 버튼 */}
//                 {section.tabs.length > 0 && (
//                     <CommonButton
//                         variant="tabEtc"
//                         size="sm"
//                         className="flex-none flex items-center justify-center px-3"
//                         onClick={() => closeAllTabs(rowId, sectionId)}
//                         title="모든 탭 닫기"
//                     >
//                         <Trash2 size={12} className="text-gray-600" />
//                     </CommonButton>
//                 )}
//             </div>

//             {/* 개선된 드롭 가능 시각적 표시 - 다른 섹션에서 온 탭 또는 콘텐츠에서 드래그할 때만 표시 */}
//             {showDragOverlay && (
//                 <div className="absolute inset-0 pointer-events-none z-10">
//                     {sectionCount < 2 ? (
//                         <div className="flex h-full">
//                             <div
//                                 className="
//                                     w-1/2
//                                     border-r-2 border-blue-500 border-dashed
//                                     h-full
//                                     bg-blue-50 bg-opacity-50
//                                     flex items-center justify-center
//                                 "
//                             >
//                                 {/* 현재 영역 */}
//                             </div>
//                             <div
//                                 className="
//                                     w-1/2
//                                     h-full
//                                     bg-blue-50 bg-opacity-50
//                                     flex items-center justify-center
//                                 "
//                             >
//                                 {/* 새 분할 영역 */}
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="
//                             border border-dashed !border-blue-400
//                             bg-blue-50 bg-opacity-50
//                             h-full
//                         " />
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// // Add display name for TabHeader
// TabHeader.displayName = 'TabHeader';

// export default React.memo(TabHeader);

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