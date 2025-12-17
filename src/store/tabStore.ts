// src/store/tabStore.ts
"use client";

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import React from "react";
import { MenuItem, menuItems } from "@/widgets/header/model/menuItems";
import { contextMenuItems } from "@/widgets/header/model/contextMenuItems";
import { useOperationStore } from "@/app/main/comp/operation/store/OperationStore";
import { useSystemDeviceStore } from "./systemDeviceStore";

// MenuItem 인터페이스에 params 속성 추가
declare module "@/widgets/header/model/menuItems" {
  interface MenuItem {
    params?: any;
  }
}

export interface TabItem {
  id: number;
  uniqueKey: string;
  title: string;
  icon?: string | any
  href?: string;
  content?: React.ReactNode;
  campaignId?: string;
  campaignName?: string;
  params?: any;
  secondActiveTabKey?: string | null; // 분할 모드용 두번째 활성 탭 (현재는 미사용)
}

export interface TabSection {
  id: string;
  tabs: TabItem[];
  width: number;
  // 섹션 단위 활성 탭
  activeTabKey: string | null;
  secondActiveTabKey?: string | null; // 분할 모드용 두번째 활성 탭 (현재는 미사용)
}

export interface TabRow {
  id: string;
  sections: TabSection[];
}

export interface TabGroup {
  id: string;
  tabs: TabItem[];
  position: { x: number; y: number };
}

export interface TabLayoutStore {
  openedTabs: TabItem[];
  rows: TabRow[];
  tabGroups: TabGroup[];

  // 삭제된 캠페인 ID (단일 값)
  deletedCampaignIdAtSidebar: string | null;
  // 삭제된 캠페인 ID 설정 메소드
  setDeletedCampaignId: (campaignId: string | null) => void;

  // 전역 단일 activeTabId/activeTabKey (드래그 중 Overlay 표시 등에 활용)
  activeTabId: number | null;
  secondActiveTabId: number | null;
  activeTabKey: string | null;
  secondActiveTabKey: string | null;

  // 스킬 할당에 사용하던 부가 정보들
  campaignIdForUpdateFromSideMenu: string | null;

  // 캠페인 복사용 아이디
  campaignIdForCopyCampaign: string | null;

  counselorSkillAssignmentInfo: {
    tenantId: string | null;
    counselorId: string | null;
    counselorName: string | null;
  };
  setCounselorSkillAssignmentInfo: (
    info:
      | {
        tenantId: string | null;
        counselorId: string | null;
        counselorName: string | null;
      }
      | null
  ) => void;
  setCampaignIdForUpdateFromSideMenu: (id: string | null) => void;
  setCampaignIdForCopyCampaign: (id: string | null) => void;

  // -----------------------------
  // 아래는 탭 관련 로직
  // -----------------------------
  getTabCountById: (menuId: number) => number;

  // 새 탭을 열 때 사용
  addTab: (tab: TabItem) => void;
  addTabCurrentOnly: (tab: TabItem) => void;

  addMultiTab: (tab: TabItem) => void;
  addOnlyTab: (tab: TabItem, matchFn: (t: TabItem) => boolean) => void; // 조건에 맞는 탭 제거 후 추가

  // 탭 제거 시: (tabId, uniqueKey) 로 정확히 제거
  removeTab: (tabId: number, uniqueKey: string) => void;

  // 섹션 단위의 활성 탭 설정
  setSectionActiveTab: (
    rowId: string,
    sectionId: string,
    tabUniqueKey: string
  ) => void;

  // 탭 복제
  duplicateTab: (tabId: number) => void;

  // 행/섹션 추가/제거
  addRow: () => void;
  removeRow: (rowId: string) => void;
  addSection: (rowId: string, tabId?: number) => void;
  removeSection: (rowId: string, sectionId: string) => void;

  // 드래그앤드롭
  moveTabToSection: (
    tabId: number,
    targetRowId: string,
    targetSectionId: string,
    draggedTabKey: string
  ) => void;
  updateSectionWidth: (rowId: string, sectionId: string, width: number) => void;

  // 탭 그룹
  addTabGroup: (tabId: number) => void;
  removeTabGroup: (groupId: string) => void;
  moveTabToGroup: (tabId: number, groupId: string) => void;

  // 특정 기능성 탭 열기 (캠페인 관련 등)
  openCampaignManagerForUpdate: (campaignId: string, label: string) => void;
  openCampaignProgressInfo: (campaignId: string, label: string) => void;
  openRebroadcastSettings: (campaignId: string, label: string) => void;

  // ─────────────────────────────
  // 추가: 전역 activeTab을 설정하는 함수
  // ─────────────────────────────
  setActiveTab: (tabId: number, uniqueKey: string) => void;
  setSecondActiveTab: (tabId: number, uniqueKey: string ) => void;
  simulateHeaderMenuClick: (menuId: number) => void;

  // 화면 분할 관련 상태 추가
  splitMode: boolean;
  splitLayout: 'none' | 'vertical';

  // 화면 분할 관련 메서드 추가
  setSplitMode: (mode: boolean) => void;
  setSplitLayout: (layout: 'none' | 'vertical') => void;

  // 다른 탭 닫기 (현재 활성화된 탭 빼고 모두 닫기), 모든탭닫기
  closeOtherTabs: (rowId: string, sectionId: string, exceptTabKey: string) => void;
  closeAllTabs: (rowId: string, sectionId: string) => void;

  // 기존 탭 닫기
  removeExistingTabsByTabId: (tabId: number) => void;

  // 운영설정용 오픈 sectionId 설정
  openOperationSectionId: string;
  setOpenOperationSectionId: (id: string) => void;

  moveTabWithinSection: (
    tabId: number,
    tabKey: string,
    rowId: string,
    sectionId: string,
    destinationIndex: number
  ) => void;

  addSectionAndMoveTab: (
    tabId: number,
    tabKey: string,
    rowId: string,
    sectionId: string
  )
    => void;

  updateSectionWidths: (rowId: string, sectionWidths: number[]) => void;
  isResizing: boolean;
  setResizing: (isResizing: boolean) => void;

  resetTabStore: () => void; // <-- 이 줄 추가

  openSingleTabAtCurrentSection: (tabId: number, tabInfo: MenuItem) => void;

  contentDragOver: {
    isActive: boolean;
    rowId: string | null;
    sectionId: string | null;
  };
  setContentDragOver: (isActive: boolean, rowId?: string | null, sectionId?: string | null) => void;

};

const generateUniqueId = (prefix: string, existingIds: string[]) => {
  let counter = 1;
  let newId = `${prefix}-${counter}`;
  while (existingIds.includes(newId)) {
    counter++;
    newId = `${prefix}-${counter}`;
  }
  return newId;
};

const adjustSectionWidths = (sections: TabSection[]) => {
  const newWidth = 100 / sections.length;
  return sections.map((section) => ({
    ...section,
    width: newWidth,
  }));
};

export const useTabStore = create<TabLayoutStore>()(
  devtools(
    persist(
      (set, get) => ({
        // -----------------------
        // 초기 값
        // -----------------------
        openedTabs: [],
        rows: [
          {
            id: "row-1",
            sections: [
              {
                id: "default",
                tabs: [],
                width: 100,
                activeTabKey: null,
              },
            ],
          },
        ],
        tabGroups: [],

        // 전역 activeTabID/key (드래그 중 Overlay 표시 등에 사용)
        activeTabId: null,
        activeTabKey: null,
        secondActiveTabId: null,
        secondActiveTabKey: null,

        counselorSkillAssignmentInfo: {
          tenantId: null,
          counselorId: null,
          counselorName: null,
        },
        campaignIdForUpdateFromSideMenu: null,
        campaignIdForCopyCampaign: null,

        splitMode: false,
        splitLayout: 'none',

        // 삭제된 캠페인 ID 초기값
        deletedCampaignIdAtSidebar: null,
        isResizing: false,

        contentDragOver: {
          isActive: false,
          rowId: null,
          sectionId: null
        },

        setContentDragOver: (isActive, rowId = null, sectionId = null) =>
          set({
            contentDragOver: {
              isActive,
              // 드래그가 활성 상태가 아닐 경우 rowId와 sectionId를 null로 설정 보장
              rowId: isActive ? rowId : null,
              sectionId: isActive ? sectionId : null,
            }
          }),

        // 삭제된 캠페인 ID 설정 메소드
        setDeletedCampaignId: (campaignId: string | null) =>
          set({ deletedCampaignIdAtSidebar: campaignId }),

        setSplitMode: (mode) => set({ splitMode: mode }),
        setSplitLayout: (layout) => set({ splitLayout: layout }),

        // 헤더 메뉴 클릭
        simulateHeaderMenuClick: (menuId: number, campaignId?: string, label?: string) => {
          // 먼저 헤더 메뉴에서 찾기
          let menuItem = menuItems.find(item => item.id === menuId);

          // 없으면 컨텍스트 메뉴에서 찾기
          if (!menuItem) {
            const contextItem = contextMenuItems.find(item => item.id === menuId);
            // 컨텍스트 아이템을 MenuItem 형식으로 변환 (menuId 추가)
            if (contextItem) {
              menuItem = {
                ...contextItem,
                menuId: contextItem.id, // id를 menuId로 복사
              };
            }
          }

          if (!menuItem) return;

          // 기존 탭들 제거
          const existingTabs = get().openedTabs.filter(tab => tab.id === menuId);
          existingTabs.forEach(tab => {
            get().removeTab(tab.id, tab.uniqueKey);
          });

          // 새로운 탭 추가
          const newTabKey = `${menuId}-${campaignId ? campaignId : ''}-${Date.now()}`;
          const newTab = {
            ...menuItem,
            uniqueKey: newTabKey,
            content: menuItem.content || null,
            campaignId: campaignId || undefined,
            title: label ? `${menuItem.title} - ${label}` : menuItem.title
          };
          get().addTab(newTab);

          // 탭을 추가한 후 활성 탭 설정
          get().setActiveTab(menuId, newTabKey);
          get().setCampaignIdForUpdateFromSideMenu(campaignId || null);
        },

        // ------------------------
        // 스킬 할당 등 부가 로직
        // ------------------------
        setCounselorSkillAssignmentInfo: (info) =>
          set({
            counselorSkillAssignmentInfo: info
              ? info
              : { tenantId: null, counselorId: null, counselorName: null },
          }),

        setCampaignIdForUpdateFromSideMenu: (id) =>
          set({ campaignIdForUpdateFromSideMenu: id }),

        setCampaignIdForCopyCampaign: (id) =>
          set({ campaignIdForCopyCampaign: id }),

        // 특정 메뉴 id(예: 1,2,3...) 탭 개수 세기
        getTabCountById: (menuId: number) => {
          const state = get();
          let count = 0;

          state.rows.forEach((row) => {
            row.sections.forEach((section) => {
              count += section.tabs.filter((tab) => tab.id === menuId).length;
            });
          });

          state.tabGroups.forEach((group) => {
            count += group.tabs.filter((tab) => tab.id === menuId).length;
          });

          return count;
        },

        // ------------------------
        // 섹션 단위 활성 탭 설정
        // ------------------------
        setSectionActiveTab: (rowId, sectionId, tabUniqueKey) =>
          set((state) => {
            // 새로운 활성 탭 찾기: 타입 안전성을 위해 find 메서드 결과 타입을 명시
            let _secondActiveTabId = null;
            let _secondActiveTabKey = null;
            const activeTab = state.rows
              .find(row => row.id === rowId)
              ?.sections
              .find(section => section.id === sectionId)
              ?.tabs
              .find((tab): tab is TabItem => tab.uniqueKey === tabUniqueKey);  // 타입 가드 추가

            // if( activeTab?.id === 22 ){
            //   activeTab.id = Number(activeTab.id + tabUniqueKey.split('-')[1]);
            // }

            // rows 업데이트
            const newRows = state.rows.map((row) => {
              if (row.id !== rowId) return row;
              return {
                ...row,
                sections: row.sections.map((section) => {
                  if (section.id !== sectionId){
                    _secondActiveTabId = section.activeTabKey !== null
                      ? Number(section.activeTabKey?.split('-')[0] == 'progress'?21:section.activeTabKey?.split('-')[0] == 'monitor'?22:section.activeTabKey?.split('-')[0]) : null;
                    _secondActiveTabKey = section.activeTabKey !== null
                      ? section.activeTabKey : null;
                    return section;
                  }else{                    
                    return {
                      ...section,
                      activeTabKey: tabUniqueKey,
                    };
                  } 
                }),
              };
            });

            // 헤더의 활성 탭 상태도 함께 업데이트
            return {
              ...state,
              rows: newRows,
              activeTabId: activeTab ? activeTab.id : state.activeTabId,
              secondActiveTabId: _secondActiveTabId,
              secondActiveTabKey: _secondActiveTabKey,
              activeTabKey: tabUniqueKey
            };
          }),

        addTab: (tab) =>
          set((state) => {
            const isAlreadyOpened = state.openedTabs.some(
              (t) => t.id === tab.id && t.uniqueKey === tab.uniqueKey
            );
            if (isAlreadyOpened) {
              return state;
            }

            // 만약 params가 undefined라면 빈 객체로 초기화
            const tabWithParams = {
              ...tab,
              params: tab.params || {}
            };

            const newOpenedTabs = [...state.openedTabs, tabWithParams];

            const [firstRow] = state.rows;
            if (!firstRow) return state;
            const [firstSection] = firstRow.sections;
            if (!firstSection) return state;

            const updatedSection = {
              ...firstSection,
              tabs: [...firstSection.tabs, tabWithParams],
              activeTabKey: tabWithParams.uniqueKey,
            };

            const updatedSections = adjustSectionWidths(
              firstRow.sections.map((sec) =>
                sec.id === firstSection.id ? updatedSection : sec
              )
            );

            const updatedRow = { ...firstRow, sections: updatedSections };
            const newRows = state.rows.map((row) =>
              row.id === firstRow.id ? updatedRow : row
            );

            return {
              ...state,
              openedTabs: newOpenedTabs,
              rows: newRows,
              activeTabId: tabWithParams.id,
              activeTabKey: tabWithParams.uniqueKey,
            };
          }),

        addMultiTab: (tab: TabItem) =>
          set((state) => {
            // 중복 검사 없이 바로 추가
            const newOpenedTabs = [...state.openedTabs, tab];

            const [firstRow] = state.rows;
            if (!firstRow) return state;
            const [firstSection] = firstRow.sections;
            if (!firstSection) return state;

            const updatedSection = {
              ...firstSection,
              tabs: [...firstSection.tabs, tab],
              activeTabKey: tab.uniqueKey,
            };

            const updatedSections = adjustSectionWidths(
              firstRow.sections.map((sec) =>
                sec.id === firstSection.id ? updatedSection : sec
              )
            );

            const updatedRow = { ...firstRow, sections: updatedSections };
            const newRows = state.rows.map((row) =>
              row.id === firstRow.id ? updatedRow : row
            );

            return {
              ...state,
              openedTabs: newOpenedTabs,
              rows: newRows,
            };
          }),

        addOnlyTab: (tab: TabItem, matchFn: (t: TabItem) => boolean) => {
          const state = get();

          // Make sure params is initialized if undefined
          const tabWithParams = {
            ...tab,
            params: tab.params || {}
          };

          // 1. Find the active section based on activeTabKey
          let activeRowId = null;
          let activeSectionId = null;

          // Find which section contains the active tab
          for (const row of state.rows) {
            for (const section of row.sections) {
              if (section.activeTabKey === state.activeTabKey) {
                activeRowId = row.id;
                activeSectionId = section.id;
                break;
              }

              // If no section has activeTabKey matching global activeTabKey,
              // check if any section contains the tab with the active key
              if (!activeRowId && section.tabs.some(t => t.uniqueKey === state.activeTabKey)) {
                activeRowId = row.id;
                activeSectionId = section.id;
                break;
              }
            }
            if (activeRowId) break;
          }

          // If no active section found, default to first section
          if (!activeRowId || !activeSectionId) {
            if (state.rows.length > 0 && state.rows[0].sections.length > 0) {
              activeRowId = state.rows[0].id;
              activeSectionId = state.rows[0].sections[0].id;
            } else {
              // No sections available, fall back to standard addTab behavior
              state.openedTabs.filter(matchFn).forEach(t => state.removeTab(t.id, t.uniqueKey));
              state.addTab(tabWithParams); // Using tabWithParams instead of tab
              return;
            }
          }

          // 2. Remove tabs matching criteria (similar to original addOnlyTab)
          state.openedTabs
            .filter(matchFn)
            .forEach(t => {
              state.removeTab(t.id, t.uniqueKey);
            });

          // 3. Add the tab to the active section and make it the only active tab
          set((state) => {
            // Find the active section again after removing tabs
            const row = state.rows.find(r => r.id === activeRowId);
            if (!row) return state;

            const activeSection = row.sections.find(s => s.id === activeSectionId);
            if (!activeSection) return state;

            // Add tab to openedTabs if not already there
            const tabExists = state.openedTabs.some(t =>
              t.id === tabWithParams.id && t.uniqueKey === tabWithParams.uniqueKey
            );

            const newOpenedTabs = tabExists
              ? state.openedTabs
              : [...state.openedTabs, tabWithParams];

            // Add tab to the active section and make it the active tab
            const updatedRows = state.rows.map(r => {
              if (r.id !== activeRowId) return r;

              return {
                ...r,
                sections: r.sections.map(s => {
                  if (s.id !== activeSectionId) return s;

                  // Check if tab already exists in this section
                  const tabExistsInSection = s.tabs.some(t =>
                    t.id === tabWithParams.id && t.uniqueKey === tabWithParams.uniqueKey
                  );

                  // If not, add it
                  const newTabs = tabExistsInSection
                    ? s.tabs
                    : [...s.tabs, tabWithParams];

                  // Always set this tab as active
                  return {
                    ...s,
                    tabs: newTabs,
                    activeTabKey: tabWithParams.uniqueKey
                  };
                })
              };
            });

            // Update global active state to the new tab
            return {
              ...state,
              openedTabs: newOpenedTabs,
              rows: updatedRows,
              activeTabId: tabWithParams.id,
              activeTabKey: tabWithParams.uniqueKey
            };
          });
        },

        removeTab: (tabId, uniqueKey) =>
          set((state) => {
            // 1. 먼저 제거된 탭이 활성화된 탭인지 확인
            const isRemovingActiveTab = state.activeTabKey === uniqueKey;

            // tabIdr가 운영설정인 경우 clearOperationCampaign 호출
            if (tabId === 8 || tabId === 9 || tabId === 11) { // 
              useOperationStore.getState().clearOperationCampaign();
            }

            if (tabId === 10) {
              useSystemDeviceStore.getState().setSaveSelectDevice('');
            }

            // 2. 탭 제거 후 남아있는 탭 목록 생성
            const newTabs = state.openedTabs.filter(
              (t) => !(t.id === tabId && t.uniqueKey === uniqueKey)
            );

            // 3. 섹션별 처리를 위한 행 업데이트
            const updatedRows = state.rows.map((row) => ({
              ...row,
              sections: row.sections.map((sec) => {
                const newSectionTabs = sec.tabs.filter(
                  (t) => !(t.id === tabId && t.uniqueKey === uniqueKey)
                );
                return {
                  ...sec,
                  tabs: newSectionTabs,
                  activeTabKey:
                    sec.activeTabKey === uniqueKey
                      ? newSectionTabs.length > 0
                        ? newSectionTabs[newSectionTabs.length - 1].uniqueKey
                        : null
                      : sec.activeTabKey,
                };
              }),
            }));

            // 4. 탭 그룹 업데이트
            const updatedGroups = state.tabGroups
              .map((group) => ({
                ...group,
                tabs: group.tabs.filter(
                  (t) => !(t.id === tabId && t.uniqueKey === uniqueKey)
                ),
              }))
              .filter((g) => g.tabs.length > 0);

            // 5. 새로운 활성 탭 결정 (제거된 탭이 활성 탭이었을 경우에만)
            let newActiveTabId = state.activeTabId;
            let newActiveTabKey = state.activeTabKey;

            if (isRemovingActiveTab && newTabs.length > 0) {
              // 가장 최신 탭을 활성 탭으로 설정
              const latestTab = newTabs[newTabs.length - 1];
              newActiveTabId = latestTab.id;
              newActiveTabKey = latestTab.uniqueKey;

              // 해당 탭이 속한 섹션도 활성화
              updatedRows.forEach(row => {
                row.sections.forEach(sec => {
                  const tabInSection = sec.tabs.find(t => t.uniqueKey === newActiveTabKey);
                  if (tabInSection) {
                    sec.activeTabKey = newActiveTabKey;
                  }
                });
              });
            } else if (isRemovingActiveTab && newTabs.length === 0) {
              // 남은 탭이 없으면 활성 탭 정보를 null로 설정
              newActiveTabId = null;
              newActiveTabKey = null;
            }

            return {
              ...state,
              openedTabs: newTabs,
              rows: updatedRows,
              tabGroups: updatedGroups,
              activeTabId: newActiveTabId,
              activeTabKey: newActiveTabKey
            };
          }),

        // ------------------------
        // 탭 복제
        // ------------------------
        duplicateTab: (tabId) =>
          set((state) => {
            const originalTab = state.openedTabs.find((t) => t.id === tabId);
            if (!originalTab) return state;

            const duplicatedKey = `tab-${tabId}-${Date.now()}`;
            const duplicatedTab = { ...originalTab, uniqueKey: duplicatedKey };

            get().addTab(duplicatedTab);
            return state;
          }),

        // ------------------------
        // 행 추가/제거
        // ------------------------
        addRow: () =>
          set((state) => {
            const existingIds = state.rows.map((r) => r.id);
            const newRowId = generateUniqueId("row", existingIds);
            return {
              ...state,
              rows: [
                ...state.rows,
                {
                  id: newRowId,
                  sections: [
                    {
                      id: "default",
                      tabs: [],
                      width: 100,
                      activeTabKey: null,
                    },
                  ],
                },
              ],
            };
          }),

        removeRow: (rowId) =>
          set((state) => {
            if (state.rows.length <= 1) return state;
            return {
              ...state,
              rows: state.rows.filter((r) => r.id !== rowId),
            };
          }),

        // ------------------------
        // 섹션 추가/제거
        // ------------------------
        addSection: (rowId, tabId) =>
          set((state) => {
            const updatedRows = state.rows.map((row) =>
              row.id === rowId
                ? {
                  ...row,
                  sections: adjustSectionWidths([
                    ...row.sections,
                    {
                      id: generateUniqueId("section", row.sections.map((s) => s.id)),
                      tabs: [],
                      width: 0,
                      activeTabKey: null,
                    },
                  ]),
                }
                : row
            );
            return { ...state, rows: updatedRows };
          }),

        // removeSection: (rowId, sectionId) =>

        removeSection: (rowId, sectionId) =>
          set((state) => {
            const row = state.rows.find((r) => r.id === rowId);
            if (!row) return state;

            // 지울 섹션 찾기
            const sectionToRemove = row.sections.find((s) => s.id === sectionId);
            if (!sectionToRemove) return state;

            // 첫번째 섹션 찾기 (대상 섹션)
            const firstSection = row.sections.find((s) => s.id !== sectionId);
            if (!firstSection) return state; // 섹션이 하나뿐이라면 삭제하지 않음

            // 현재 삭제할 섹션의 활성 탭이 있는지 확인
            const hasActiveTab = sectionToRemove.activeTabKey !== null;
            let lastMovedTabKey = null;

            // 삭제할 섹션의 모든 탭을 첫번째 섹션으로 이동
            const updatedFirstSection = {
              ...firstSection,
              tabs: [...firstSection.tabs, ...sectionToRemove.tabs],
              // 삭제할 섹션에 활성 탭이 있었다면 그 탭을 첫번째 섹션의 활성 탭으로 설정
              // 아니면 첫번째 섹션의 원래 활성 탭 유지
              activeTabKey: hasActiveTab
                ? sectionToRemove.activeTabKey
                : firstSection.activeTabKey
            };

            // 만약 삭제할 섹션에 활성 탭이 있었다면 마지막으로 이동한 탭의 키 저장
            if (hasActiveTab) {
              lastMovedTabKey = sectionToRemove.activeTabKey;
            } else if (sectionToRemove.tabs.length > 0) {
              // 활성 탭이 없지만 탭은 있는 경우, 마지막 탭을 저장
              lastMovedTabKey = sectionToRemove.tabs[sectionToRemove.tabs.length - 1].uniqueKey;
            }

            const updatedSections = row.sections
              .filter((s) => s.id !== sectionId)
              .map((s) => (s.id === firstSection.id ? updatedFirstSection : s));

            // 섹션 너비 조정
            const adjustedSections = adjustSectionWidths(updatedSections);

            // 전역 activeTab 업데이트 (삭제되는 섹션의 활성 탭이 있었을 경우)
            const activeTab = hasActiveTab
              ? sectionToRemove.tabs.find(tab => tab.uniqueKey === sectionToRemove.activeTabKey)
              : null;

            const updatedRows = state.rows.map((r) =>
              r.id === rowId
                ? {
                  ...r,
                  sections: adjustedSections,
                }
                : r
            );

            // 전역 활성 탭 업데이트
            const newState = { ...state, rows: updatedRows };

            // 기존 전역 활성 탭이 삭제되는 섹션에 있었을 경우에만 업데이트
            if (activeTab && state.activeTabKey === sectionToRemove.activeTabKey) {
              newState.activeTabId = activeTab.id;
              newState.activeTabKey = activeTab.uniqueKey;
              newState.secondActiveTabId = null;
              newState.secondActiveTabKey = null;
            } else if (lastMovedTabKey && !state.activeTabKey) {
              // 전역 활성 탭이 없었던 경우, 이동된 탭 중 마지막 탭을 활성화
              const lastTab = sectionToRemove.tabs.find(tab => tab.uniqueKey === lastMovedTabKey);
              if (lastTab) {
                newState.activeTabId = lastTab.id;
                newState.activeTabKey = lastTab.uniqueKey;
                newState.secondActiveTabId = null;
                newState.secondActiveTabKey = null;
              }
            }

            return newState;
          }),

        moveTabToSection: (
          tabId: number,
          targetRowId: string,
          targetSectionId: string,
          draggedTabKey: string
        ) =>
          set((state) => {
            const movedTab = state.openedTabs.find(
              (t) => t.id === tabId && t.uniqueKey === draggedTabKey
            );
            if (!movedTab) return state;

            // 소스 섹션 정보 찾기
            let sourceRowId = "";
            let sourceSectionId = "";
            let sourceSection = null;
            let sourceRow = null;
            let _secondActiveTabId = null;
            let _secondActiveTabKey = null;

            for (const row of state.rows) {
              for (const section of row.sections) {
                if (section.tabs.some(t => t.id === tabId && t.uniqueKey === draggedTabKey)) {
                  sourceRowId = row.id;
                  sourceSectionId = section.id;
                  sourceSection = section;
                  sourceRow = row;
                  break;
                }
              }
              if (sourceSection) break;
            }

            // 같은 위치로 이동하는 경우 변경하지 않음
            if (sourceRowId === targetRowId && sourceSectionId === targetSectionId) {
              return state;
            }

            // 타겟 행과 섹션 찾기
            const targetRow = state.rows.find(r => r.id === targetRowId);
            if (!targetRow) return state;

            const targetSection = targetRow.sections.find(s => s.id === targetSectionId);
            if (!targetSection) return state;

            // 원본 너비 보존 (같은 행 내 이동시에만)
            const preserveWidths = sourceRowId === targetRowId;
            const originalWidths = preserveWidths ? targetRow.sections.map(s => s.width) : [];

            // 모든 상태 변경을 한번에 처리
            const updatedRows = state.rows.map((row) => {
              if (row.id === sourceRowId && row.id === targetRowId) {
                // 같은 행 내에서 이동하는 경우
                return {
                  ...row,
                  sections: row.sections.map((section) => {
                    if (section.id === sourceSectionId) {
                      // 소스 섹션에서 탭 제거
                      const remainingTabs = section.tabs.filter(
                        (t) => !(t.id === tabId && t.uniqueKey === draggedTabKey)
                      );
                      _secondActiveTabId = remainingTabs.length > 0
                        ? Number(remainingTabs[remainingTabs.length - 1].id)
                        : null;
                      _secondActiveTabKey = remainingTabs.length > 0
                        ? remainingTabs[remainingTabs.length - 1].uniqueKey
                        : null;
                      return {
                        ...section,
                        tabs: remainingTabs,
                        activeTabKey: section.activeTabKey === draggedTabKey
                          ? (remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].uniqueKey : null)
                          : section.activeTabKey,
                        width: preserveWidths ? originalWidths[row.sections.findIndex(s => s.id === sourceSectionId)] : section.width
                      };
                    } else if (section.id === targetSectionId) {
                      // 타겟 섹션에 탭 추가
                      return {
                        ...section,
                        tabs: [...section.tabs, movedTab],
                        activeTabKey: movedTab.uniqueKey,
                        width: preserveWidths ? originalWidths[row.sections.findIndex(s => s.id === targetSectionId)] : section.width
                      };
                    }
                    return {
                      ...section,
                      width: preserveWidths ? originalWidths[row.sections.findIndex(s => s.id === section.id)] : section.width
                    };
                  })
                };
              } else if (row.id === sourceRowId) {
                // 소스 행에서 탭 제거
                return {
                  ...row,
                  sections: row.sections.map((section) => {
                    if (section.id === sourceSectionId) {
                      const remainingTabs = section.tabs.filter(
                        (t) => !(t.id === tabId && t.uniqueKey === draggedTabKey)
                      );
                      return {
                        ...section,
                        tabs: remainingTabs,
                        activeTabKey: section.activeTabKey === draggedTabKey
                          ? (remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].uniqueKey : null)
                          : section.activeTabKey,
                      };
                    }
                    return section;
                  })
                };
              } else if (row.id === targetRowId) {
                // 타겟 행에 탭 추가
                const updatedSections = row.sections.map((section) => {
                  if (section.id === targetSectionId) {
                    return {
                      ...section,
                      tabs: [...section.tabs, movedTab],
                      activeTabKey: movedTab.uniqueKey,
                    };
                  }
                  return section;
                });

                return {
                  ...row,
                  sections: preserveWidths ? updatedSections : adjustSectionWidths(updatedSections),
                };
              }
              return row;
            });

            // 탭 그룹에서도 제거
            const updatedGroups = state.tabGroups
              .map((g) => ({
                ...g,
                tabs: g.tabs.filter(
                  (t) => !(t.id === tabId && t.uniqueKey === draggedTabKey)
                ),
              }))
              .filter((g) => g.tabs.length > 0);

            // 단일 상태 업데이트로 모든 변경사항 적용
            return {
              ...state,
              rows: updatedRows,
              tabGroups: updatedGroups,
              activeTabId: movedTab.id,
              secondActiveTabId: _secondActiveTabId,
              secondActiveTabKey: _secondActiveTabKey,
              activeTabKey: movedTab.uniqueKey,
            };
          }),

        updateSectionWidth: (rowId, sectionId, width) =>
          set((state) => ({
            ...state,
            rows: state.rows.map((row) =>
              row.id === rowId
                ? {
                  ...row,
                  sections: row.sections.map((sec) =>
                    sec.id === sectionId ? { ...sec, width } : sec
                  ),
                }
                : row
            ),
          })),

        // ------------------------
        // 탭 그룹
        // ------------------------
        addTabGroup: (tabId) =>
          set((state) => {
            const tab = state.openedTabs.find((t) => t.id === tabId);
            if (!tab) return state;

            const numericTabId =
              typeof tabId === "string" && String(tabId).startsWith("tab-")
                ? parseInt(String(tabId).replace("tab-", ""))
                : typeof tabId === "number"
                  ? tabId
                  : 0;

            const updatedRows = state.rows.map((row) => {
              let newSecs = row.sections.map((sec) => ({
                ...sec,
                tabs: sec.tabs.filter((t) => t.id !== numericTabId),
              }));
              newSecs = newSecs.filter(
                (sec) => sec.id === "default" || sec.tabs.length > 0
              );
              return { ...row, sections: adjustSectionWidths(newSecs) };
            });

            const existingIds = state.tabGroups.map((g) => g.id);
            const newGroupId = generateUniqueId("group", existingIds);

            const newGroup: TabGroup = {
              id: newGroupId,
              tabs: [tab],
              position: { x: 0, y: 0 },
            };

            return {
              ...state,
              rows: updatedRows,
              tabGroups: [...state.tabGroups, newGroup],
            };
          }),

        removeTabGroup: (groupId) =>
          set((state) => {
            const group = state.tabGroups.find((g) => g.id === groupId);
            if (!group) return state;

            const rowIndex = state.rows.findIndex((r) => r.id === "row-1");
            if (rowIndex === -1) return state;

            const defaultSecIndex = state.rows[rowIndex].sections.findIndex(
              (sec) => sec.id === "default"
            );
            if (defaultSecIndex === -1) return state;

            const baseSection = state.rows[rowIndex].sections[defaultSecIndex];
            const mergedSection = {
              ...baseSection,
              tabs: [...baseSection.tabs, ...group.tabs],
              activeTabKey:
                group.tabs.length > 0
                  ? group.tabs[group.tabs.length - 1].uniqueKey
                  : baseSection.activeTabKey,
            };

            let updatedSections = [...state.rows[rowIndex].sections];
            updatedSections[defaultSecIndex] = mergedSection;
            updatedSections = adjustSectionWidths(updatedSections);

            const updatedRow = {
              ...state.rows[rowIndex],
              sections: updatedSections,
            };
            const newRows = [...state.rows];
            newRows[rowIndex] = updatedRow;

            return {
              ...state,
              rows: newRows,
              tabGroups: state.tabGroups.filter((g) => g.id !== groupId),
              secondActiveTabId: null,
              secondActiveTabKey: null,
            };
          }),

        moveTabToGroup: (tabId, groupId) =>
          set((state) => {
            const tab = state.openedTabs.find((t) => t.id === tabId);
            if (!tab) return state;

            const numericTabId =
              typeof tabId === "string"
                ? parseInt(String(tabId).replace("tab-", ""))
                : typeof tabId === "number"
                  ? tabId
                  : 0;

            const updatedRows = state.rows.map((row) => {
              let newSecs = row.sections.map((sec) => ({
                ...sec,
                tabs: sec.tabs.filter((t) => t.id !== numericTabId),
              }));
              newSecs = newSecs.filter(
                (sec) => sec.id === "default" || sec.tabs.length > 0
              );
              return { ...row, sections: adjustSectionWidths(newSecs) };
            });

            const updatedGroups = state.tabGroups.map((g) => {
              if (g.id === groupId) {
                return { ...g, tabs: [...g.tabs, tab] };
              }
              return { ...g, tabs: g.tabs.filter((t) => t.id !== numericTabId) };
            });

            return {
              ...state,
              rows: updatedRows,
              tabGroups: updatedGroups,
            };
          }),

        // ------------------------
        // 캠페인 관련 탭 열기 (예시)
        // ------------------------
        openCampaignManagerForUpdate: (campaignId, label) =>
          set((state) => {
            const existingTab = state.openedTabs.find((tab) => tab.id === 2);

            if (existingTab) {
              const updatedTab = {
                ...existingTab,
                campaignId: campaignId,
                title: label !== "" ? `캠페인 관리 - ${label}` : `캠페인 관리(업데이트)`,
              };

              const updatedTabs = state.openedTabs.map((t) =>
                t.uniqueKey === existingTab.uniqueKey ? updatedTab : t
              );

              const updatedRows = state.rows.map((row) => ({
                ...row,
                sections: row.sections.map((section) => {
                  const newTabs = section.tabs.map((t) =>
                    t.uniqueKey === existingTab.uniqueKey ? updatedTab : t
                  );
                  return {
                    ...section,
                    tabs: newTabs,
                  };
                }),
              }));

              return {
                ...state,
                openedTabs: updatedTabs,
                rows: updatedRows,
              };
            }

            // 캠페인 관리 메뉴 아이템 찾기
            const campaignMenuItem = menuItems.find(item => item.id === 3);
            if (!campaignMenuItem) return state;

            // 새로운 탭 생성 및 추가
            const newTabKey = `3-${campaignId}-${Date.now()}`;
            const newTab = {
              ...campaignMenuItem,
              uniqueKey: newTabKey,
              title: label !== "" ? `통합 모니터터 - ${label}` : `통합 모니터`,
              campaignId,
              content: null,
            };

            // 탭 추가 및 활성화
            get().addTab(newTab);
            get().setActiveTab(2, newTabKey);
            get().setCampaignIdForUpdateFromSideMenu(null);

            return state;
          }),

        openCampaignProgressInfo: (campaignId, label) =>
          set((state) => {
            const oldTabs = state.openedTabs.filter((tab) => tab.id === 4);
            oldTabs.forEach((ot) => {
              get().removeTab(ot.id, ot.uniqueKey);
            });

            const newTabKey = `4-${campaignId}-${Date.now()}`;
            const newTab: TabItem = {
              id: 4,
              uniqueKey: newTabKey,
              title: label !== "" ? `총진행상황 - ${label}` : "총진행상황",
              icon: "/header-menu/총진행상황.svg",
              href: "/status",
              content: null,
              campaignId,
            };

            get().addTab(newTab);
            return state;
          }),

        openRebroadcastSettings: (campaignId, label) =>
          set((state) => {
            const oldRebroadTabs = state.openedTabs.filter((t) => t.id === 20);
            oldRebroadTabs.forEach((ot) => {
              get().removeTab(ot.id, ot.uniqueKey);
            });

            const newTabKey = `rebroadcast-${campaignId}-${Date.now()}`;
            const newTab: TabItem = {
              id: 20,
              uniqueKey: newTabKey,
              title: label ? `재발신 설정 - ${label}` : "재발신 설정",
              icon: "/header-menu/발신진행상태.svg",
              href: "/rebroadcast",
              campaignId,
              content: null,
            };

            get().addTab(newTab);
            return state;
          }),

        // ─────────────────────────────
        // 추가: 전역 activeTab을 설정하는 함수
        // ─────────────────────────────
        setActiveTab: (tabId, uniqueKey) => {
          set({
            activeTabId: tabId,
            activeTabKey: uniqueKey,
          });
        },
        // ─────────────────────────────
        // 추가: 전역 secondActiveTab을 설정하는 함수
        // ─────────────────────────────
        setSecondActiveTab: (tabId, uniqueKey) => {
          set({
            secondActiveTabId: tabId,
            secondActiveTabKey: uniqueKey
          });
        },
        // 다른 탭 닫기 (현재 활성화된 탭 빼고 모두 닫기)
        closeOtherTabs: (rowId, sectionId, exceptTabKey) =>
          set((state) => {
            // 예외 탭 찾기
            const row = state.rows.find(r => r.id === rowId);
            if (!row) return state;

            const section = row.sections.find(s => s.id === sectionId);
            if (!section) return state;

            const keepTab = section.tabs.find(tab => tab.uniqueKey === exceptTabKey);
            if (!keepTab) return state;

            // 제거할 탭들의 uniqueKey 목록
            const tabKeysToRemove = section.tabs
              .filter(tab => tab.uniqueKey !== exceptTabKey)
              .map(tab => tab.uniqueKey);

            // openedTabs에서 해당 탭들 필터링
            const newOpenedTabs = state.openedTabs.filter(
              tab => !tabKeysToRemove.includes(tab.uniqueKey)
            );

            // 행 업데이트
            const updatedRows = state.rows.map(row => {
              if (row.id !== rowId) return row;

              return {
                ...row,
                sections: row.sections.map(sec => {
                  if (sec.id !== sectionId) return sec;

                  return {
                    ...sec,
                    tabs: [keepTab],
                    activeTabKey: keepTab.uniqueKey
                  };
                })
              };
            });

            return {
              ...state,
              openedTabs: newOpenedTabs,
              rows: updatedRows
            };
          }),

        // 모든 탭 닫기 (디폴트 상태로 되돌리기)
        closeAllTabs: (rowId, sectionId) =>
          set((state) => {
            // 행과 섹션 찾기
            const row = state.rows.find(r => r.id === rowId);
            if (!row) return state;

            const section = row.sections.find(s => s.id === sectionId);
            if (!section) return state;

            // 제거할 탭들의 uniqueKey 목록
            const tabKeysToRemove = section.tabs.map(tab => tab.uniqueKey);

            // openedTabs에서 해당 탭들 필터링
            const newOpenedTabs = state.openedTabs.filter(
              tab => !tabKeysToRemove.includes(tab.uniqueKey)
            );

            // 행 업데이트 - 탭을 모두 비우고 activeTabKey를 null로 설정
            const updatedRows = state.rows.map(row => {
              if (row.id !== rowId) return row;

              return {
                ...row,
                sections: row.sections.map(sec => {
                  if (sec.id !== sectionId) return sec;

                  return {
                    ...sec,
                    tabs: [], // 빈 배열로 설정
                    activeTabKey: null // null로 설정하여 디폴트 화면 표시
                  };
                })
              };
            });

            return {
              ...state,
              openedTabs: newOpenedTabs,
              rows: updatedRows,
              // 전역 activeTabId와 activeTabKey도 null로 설정
              activeTabId: null,
              activeTabKey: null,
              openOperationSectionId: "section1" // 운영설정용 sectionId 초기화
            };
          }),

        moveTabWithinSection: (
          tabId: number,
          tabKey: string,
          rowId: string,
          sectionId: string,
          destinationIndex: number
        ) =>
          set((state) => {
            const row = state.rows.find(r => r.id === rowId);
            if (!row) return state;
            const section = row.sections.find(s => s.id === sectionId);
            if (!section) return state;

            const tabIndex = section.tabs.findIndex(t => t.id === tabId && t.uniqueKey === tabKey);
            if (tabIndex === -1) return state;

            const newTabs = [...section.tabs];
            const [movedTab] = newTabs.splice(tabIndex, 1);
            newTabs.splice(destinationIndex, 0, movedTab);

            const updatedRows = state.rows.map(r =>
              r.id !== rowId
                ? r
                : {
                  ...r,
                  sections: r.sections.map(s =>
                    s.id !== sectionId
                      ? s
                      : { ...s, tabs: newTabs, activeTabKey: tabKey }
                  ),
                }
            );

            return {
              ...state,
              rows: updatedRows,
              activeTabId: tabId,
              activeTabKey: tabKey,
            };
          }),

        // Replace the existing addTabCurrentOnly function with this improved version
        addTabCurrentOnly: (tab) =>
          set((state) => {
            // 1. Find tabs with the same ID
            const tabsToRemove = state.openedTabs.filter(t => t.id === tab.id);

            // 2. Prepare new openedTabs array without the tabs to remove
            const newOpenedTabs = state.openedTabs.filter(t => t.id !== tab.id);

            // 3. Prepare updated rows with tabs removed from all sections
            const updatedRows = state.rows.map(row => ({
              ...row,
              sections: row.sections.map(sec => {
                // Remove all tabs with matching ID from this section
                const newSectionTabs = sec.tabs.filter(t => t.id !== tab.id);

                // Update activeTabKey if needed
                let newActiveTabKey = sec.activeTabKey;
                const wasActiveTabRemoved = sec.tabs.some(t =>
                  t.id === tab.id && t.uniqueKey === sec.activeTabKey
                );

                if (wasActiveTabRemoved) {
                  newActiveTabKey = newSectionTabs.length > 0
                    ? newSectionTabs[newSectionTabs.length - 1].uniqueKey
                    : null;
                }

                return {
                  ...sec,
                  tabs: newSectionTabs,
                  activeTabKey: newActiveTabKey,
                };
              }),
            }));

            // 4. Now add the new tab to the first section of the first row
            const [firstRow] = updatedRows;
            if (!firstRow) return { ...state, openedTabs: [...newOpenedTabs, tab] };

            const [firstSection] = firstRow.sections;
            if (!firstSection) return { ...state, openedTabs: [...newOpenedTabs, tab] };

            const updatedSection = {
              ...firstSection,
              tabs: [...firstSection.tabs, tab],
              activeTabKey: tab.uniqueKey, // Set as active in this section
            };

            const updatedSections = adjustSectionWidths(
              firstRow.sections.map(sec =>
                sec.id === firstSection.id ? updatedSection : sec
              )
            );

            const finalRows = updatedRows.map(row =>
              row.id === firstRow.id
                ? { ...row, sections: updatedSections }
                : row
            );

            // 5. Return complete updated state including global active tab
            return {
              ...state,
              openedTabs: [...newOpenedTabs, tab],
              rows: finalRows,
              activeTabId: tab.id,
              activeTabKey: tab.uniqueKey // Make sure global active tab is also updated
            };
          }),

        removeExistingTabsByTabId: (tabId: number) => {
          const { openedTabs, removeTab } = get();
          openedTabs
            .filter((tab) => tab.id === tabId)
            .forEach((tab) => {
              removeTab(tab.id, tab.uniqueKey);
            });
        },

        addSectionAndMoveTab: (
          tabId: number,
          tabKey: string,
          rowId: string,
          sectionId: string
        ) =>
          set((state) => {
            // 1. 현재 행 찾기
            const row = state.rows.find(r => r.id === rowId);
            if (!row || row.sections.length >= 2) return state;

            // 2. 새 섹션 ID 생성
            const existingIds = row.sections.map(s => s.id);
            const newSectionId = generateUniqueId("section", existingIds);

            // 3. 기존 섹션의 너비 저장
            const newSectionWidths = [50, 50];

            // 4. 행 업데이트와 함께 새 섹션 추가 (너비 균등 적용 대신 명시적 너비 설정)
            const updatedRows = state.rows.map(r => {
              if (r.id !== rowId) return r;
              return {
                ...r,
                sections: [
                  // 첫 번째 섹션 (원래 섹션)
                  {
                    ...r.sections[0],
                    width: newSectionWidths[0]
                  },
                  // 두 번째 섹션 (새 섹션)
                  {
                    id: newSectionId,
                    tabs: [],
                    width: newSectionWidths[1],
                    activeTabKey: null
                  },
                ],
              };
            });

            // 5. 기존 섹션에서 탭 찾기
            const tab = state.openedTabs.find(
              t => t.id === tabId && t.uniqueKey === tabKey
            );
            if (!tab) return { ...state, rows: updatedRows }; // 탭을 찾지 못하면 섹션만 추가

            // 6. 기존 섹션에서 탭 제거하고 새 섹션에 추가하는 로직
            const updatedRowsWithTabMoved = updatedRows.map(r => {
              if (r.id !== rowId) return r;

              return {
                ...r,
                sections: r.sections.map((sec, index) => {
                  // 기존 섹션에서 탭 제거
                  if (index === 0) {
                    // 다음 활성 탭 키 결정 (undefined 방지)
                    let nextActiveKey: string | null = null;
                    let nextSecondActiveId: number | null = null;
                    if (sec.activeTabKey === tabKey) {
                      const remainingTabs = sec.tabs.filter(t => !(t.id === tabId && t.uniqueKey === tabKey));
                      nextActiveKey = remainingTabs.length > 0
                        ? remainingTabs[remainingTabs.length - 1].uniqueKey
                        : null;
                      nextSecondActiveId = remainingTabs.length > 0
                        ? remainingTabs[remainingTabs.length - 1].id
                        : null;
                    } else {
                      nextActiveKey = sec.activeTabKey;
                    }
                    
                    return {
                      ...sec,
                      tabs: sec.tabs.filter(t => !(t.id === tabId && t.uniqueKey === tabKey)),
                      activeTabKey: nextActiveKey,
                      nextSecondActiveId: nextSecondActiveId, // 두 번째 활성 탭 키도 동일하게 설정
                      width: newSectionWidths[0]
                    };
                  }

                  // 새 섹션에 탭 추가
                  if (index === 1) {
                    return {
                      ...sec,
                      tabs: [tab],
                      activeTabKey: tab.uniqueKey,
                      secondActiveTabKey: null,
                      width: newSectionWidths[1]
                    };
                  }

                  return sec;
                }),
              };
            });

            // 6. 전역 활성 탭 업데이트
            return {
              ...state,
              rows: updatedRowsWithTabMoved,
              activeTabId: tab.id,
              activeTabKey: tab.uniqueKey,
              secondActiveTabId: updatedRowsWithTabMoved[0].sections[0].tabs.length > 0
                ? updatedRowsWithTabMoved[0].sections[0].tabs[updatedRowsWithTabMoved[0].sections[0].tabs.length - 1].id
                : null,
              secondActiveTabKey: updatedRowsWithTabMoved[0].sections[0].tabs.length > 0
                ? updatedRowsWithTabMoved[0].sections[0].tabs[updatedRowsWithTabMoved[0].sections[0].tabs.length - 1].uniqueKey
                : null
            };
          }),

        updateSectionWidths: (rowId, sectionWidths) =>
          set((state) => {
            // 행의 섹션 너비 업데이트
            const updatedRows = state.rows.map((row) => {
              if (row.id === rowId) {
                // 해당 행의 모든 섹션 너비 업데이트
                const updatedSections = row.sections.map((section, index) => ({
                  ...section,
                  width: sectionWidths[index] || section.width
                }));
                return { ...row, sections: updatedSections };
              }
              return row;
            });

            return { ...state, rows: updatedRows };
          }),
        
        openSingleTabAtCurrentSection: (tabId: number, tabInfo: MenuItem, options?: {
          exclusiveTabGroups?: { [key: string]: number[] },
          showToast?: boolean
        }) => {
          const {
            openedTabs,
            removeTab,
            rows
          } = get();

          // 기본 옵션
          const defaultOptions = {
            exclusiveTabGroups: {
              'operationTabs': [8, 9, 11], // 운영 관련 탭 (상호 배타적)
              'singleTabs': [2]           // 각각 단일 인스턴스만 허용하는 탭
            },
            showToast: false
          };

          // 옵션 병합
          const mergedOptions = { ...defaultOptions, ...options };
          const { exclusiveTabGroups, showToast } = mergedOptions;

          // 0. 특정 탭이 열릴 섹션 찾기 (2, 8, 9, 11 처리)
          let targetRowId = null;
          let targetSectionId = null;

          // 디폴트 - 첫 번째 섹션 선택 (활성탭과 무관하게 대체 섹션 사용)
          const defaultRowId = rows[0]?.id;
          const defaultSectionId = rows[0]?.sections[0]?.id;

          if (tabId === 2) {
            // 2번 탭의 경우: 2번 탭이 있는 섹션 찾기
            outerloop: for (const row of rows) {
              for (const section of row.sections) {
                // 이 섹션에 2번 탭이 있는지 확인
                const hasTabId2 = section.tabs.some(tab => tab.id === 2);
                if (hasTabId2) {
                  targetRowId = row.id;
                  targetSectionId = section.id;
                  break outerloop;
                }
              }
            }
          } else if ([8, 9, 11].includes(tabId)) {
            // 운영 관련 탭(8, 9, 11)의 경우: 운영 관련 탭이 하나라도 있는 섹션 찾기
            outerloop: for (const row of rows) {
              for (const section of row.sections) {
                // 이 섹션에 8, 9, 11 중 하나라도 있는지 확인
                const hasOperationTab = section.tabs.some(tab => [8, 9, 11].includes(tab.id));
                if (hasOperationTab) {
                  targetRowId = row.id;
                  targetSectionId = section.id;
                  break outerloop;
                }
              }
            }
          }

          // 섹션을 찾지 못한 경우 첫 번째 섹션 사용 (활성탭 기준 대신 첫 번째 섹션으로 대체)
          if (!targetRowId || !targetSectionId) {
            targetRowId = defaultRowId;
            targetSectionId = defaultSectionId;
          }

          // 1. 탭 제거 로직
          let tabsToRemove: number[] = [tabId]; // 기본: 동일 ID만 제거

          // 탭 ID가 속한 배타적 그룹 찾기
          for (const [groupName, tabIds] of Object.entries(exclusiveTabGroups)) {
            if (tabIds.includes(tabId)) {
              // 같은 그룹에 속한 모든 탭 제거
              tabsToRemove = tabIds;
              break;
            }
          }

          // 제거할 모든 탭 제거
          tabsToRemove.forEach(idToRemove => {
            openedTabs
              .filter(tab => tab.id === idToRemove)
              .forEach(tab => removeTab(tab.id, tab.uniqueKey));
          });

          // 3. 새 탭 생성
          const newTabKey = `${tabId}-${Date.now()}`;
          const newTab = {
            ...tabInfo,
            uniqueKey: newTabKey,
            content: tabInfo.content || null,
            params: tabInfo.params || {}
          };

          // 4. 탭을 직접 대상 섹션에 추가
          set((state) => {
            // 새 탭을 openedTabs에 추가
            const newOpenedTabs = [...state.openedTabs, newTab];

            // 해당 섹션에 탭 직접 추가
            const updatedRows = state.rows.map(row => {
              if (row.id !== targetRowId) return row;

              return {
                ...row,
                sections: row.sections.map(section => {
                  if (section.id !== targetSectionId) return section;

                  return {
                    ...section,
                    tabs: [...section.tabs, newTab],
                    activeTabKey: newTab.uniqueKey
                  };
                })
              };
            });

            // 5. 전역 활성 탭 상태 업데이트
            return {
              ...state,
              openedTabs: newOpenedTabs,
              rows: updatedRows,
              activeTabId: tabId,
              activeTabKey: newTabKey
            };
          });

          // 6. 토스트 메시지 출력 (옵션에 따라)
          if (showToast) {
            const tabNames: { [key: number]: string } = {
              2: '캠페인 관리',
              8: '운영설정',
              9: '분배 호수',
              11: '예약콜 제한'
            };

            // if (tabNames[tabId]) {
            //   toast.info(`${tabNames[tabId]}은(는) 1탭으로 제한합니다.`);
            // }
          }

          // 7. 운영 설정 관련 탭이면 운영 스토어도 업데이트
          if ([8, 9, 11].includes(tabId)) {
            useOperationStore.getState().setActiveTab(tabId);
          }

          return newTabKey;
        },

        setResizing: (isResizing) => set((state) => ({ ...state, isResizing })),

        resetTabStore: () =>
          set(() => ({
            openedTabs: [],
            rows: [
              {
                id: "row-1",
                sections: [
                  {
                    id: "default",
                    tabs: [],
                    width: 100,
                    activeTabKey: null,
                  },
                ],
              },
            ],
            tabGroups: [],
            activeTabId: null,
            activeTabKey: null,
            campaignIdForUpdateFromSideMenu: null,
            campaignIdForCopyCampaign: null,
            counselorSkillAssignmentInfo: {
              tenantId: null,
              counselorId: null,
              counselorName: null,
            },
            openOperationSectionId: "section1",
            splitMode: false,
            splitLayout: "none",
          })),

        // 운영설정용 추가
        openOperationSectionId: "section1", // 기본값
        setOpenOperationSectionId: (id: string) => set({ openOperationSectionId: id }),
      }),
      {
        name: "tab-store", // localStorage에 저장될 키 이름
        partialize: (state) => ({
          openedTabs: state.openedTabs,
          rows: state.rows,
          tabGroups: state.tabGroups,
          activeTabId: state.activeTabId,
          activeTabKey: state.activeTabKey,
          openSectionId: state.openOperationSectionId,
          campaignIdForUpdateFromSideMenu: state.campaignIdForUpdateFromSideMenu, // 새로고침시 선택한 캠페인 유지
        }), // 저장할 상태만 선택
      }
    )
  ));