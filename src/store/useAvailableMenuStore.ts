import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { IMenuInfo } from '@/widgets/header/api/typeForMenusAuthorityInfo';

interface AvailableMenuState {
  availableMenus: IMenuInfo[];
  availableHeaderMenus: IMenuInfo[]; 
  availableHeaderMenuIds: number[];
  // 캠페인 테넌트 컨텍스트 메뉴 (CTC)
  availableCampaignTenantContextMenus: IMenuInfo[];
  availableCampaignTenantContextMenuIds: number[];
  // 캠페인 탭 캠페인 컨텍스트 메뉴 (CCC)
  availableCampaignTabCampaignContextMenus: IMenuInfo[];
  availableCampaignTabCampaignContextMenuIds: number[];
  // 스킬 할당 메뉴 (SSG, SST, SSS)
  availableMenuIdsForSkilAssignment: number[];
  // 캠페인 그룹 탭 테넌트 메뉴 (SGT)
  availableMenuIdsForCampaignGroupTabTenant: number[];
  // 캠페인 그룹 탭 캠페인 그룹 메뉴 (SGG)
  availableMenuIdsForCampaignGroupTabCampaignGroup: number[];
  // 캠페인 그룹 탭 캠페인 메뉴 (SSS)
  availableMenuIdsForCampaignGroupTabCampaign: number[];
  isLoading: boolean;
  isError: boolean;
  setAvailableMenus: (menus: IMenuInfo[]) => void;
  setAvailableHeaderMenus: (menus: IMenuInfo[]) => void;
  setAvailableHeaderMenuIds: (ids: number[]) => void;
  // 캠페인 테넌트 컨텍스트 메뉴 setter
  setAvailableCampaignTenantContextMenus: (menus: IMenuInfo[]) => void;
  setAvailableCampaignTenantContextMenuIds: (ids: number[]) => void;
  // 캠페인 탭 캠페인 컨텍스트 메뉴 setter
  setAvailableCampaignTabCampaignContextMenus: (menus: IMenuInfo[]) => void;
  setAvailableCampaignTabCampaignContextMenuIds: (ids: number[]) => void;
  // 스킬 할당 메뉴 setter
  setAvailableMenuIdsForSkilAssignment: (ids: number[]) => void;
  // 캠페인 그룹 탭 테넌트 메뉴 setter
  setAvailableMenuIdsForCampaignGroupTabTenant: (ids: number[]) => void;
  // 캠페인 그룹 탭 캠페인 그룹 메뉴 setter
  setAvailableMenuIdsForCampaignGroupTabCampaignGroup: (ids: number[]) => void;
  // 캠페인 그룹 탭 캠페인 메뉴 setter
  setAvailableMenuIdsForCampaignGroupTabCampaign: (ids: number[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: boolean) => void;
  clearMenus: () => void;
}

export const useAvailableMenuStore = create<AvailableMenuState>()(
  devtools(
    persist(
      (set) => ({
        availableMenus: [],
        availableHeaderMenus: [],
        availableHeaderMenuIds: [],
        // 캠페인 테넌트 컨텍스트 메뉴 초기화
        availableCampaignTenantContextMenus: [],
        availableCampaignTenantContextMenuIds: [],
        // 캠페인 탭 캠페인 컨텍스트 메뉴 초기화
        availableCampaignTabCampaignContextMenus: [],
        availableCampaignTabCampaignContextMenuIds: [],
        // 스킬 할당 메뉴 초기화
        availableMenuIdsForSkilAssignment: [],
        // 캠페인 그룹 탭 테넌트 메뉴 초기화
        availableMenuIdsForCampaignGroupTabTenant: [],
        // 캠페인 그룹 탭 캠페인 그룹 메뉴 초기화
        availableMenuIdsForCampaignGroupTabCampaignGroup: [],
        // 캠페인 그룹 탭 캠페인 메뉴 초기화
        availableMenuIdsForCampaignGroupTabCampaign: [],
        isLoading: false,
        isError: false,
        setAvailableMenus: (menus) => set({ availableMenus: menus }, false, "setAvailableMenus"),
        setAvailableHeaderMenus: (menus) => set({ availableHeaderMenus: menus }, false, "setAvailableHeaderMenus"),
        setAvailableHeaderMenuIds: (ids) => set({ availableHeaderMenuIds: ids }, false, "setAvailableHeaderMenuIds"),
        // 캠페인 테넌트 컨텍스트 메뉴 setter 구현
        setAvailableCampaignTenantContextMenus: (menus) => set({ availableCampaignTenantContextMenus: menus }, false, "setAvailableCampaignTenantContextMenus"),
        setAvailableCampaignTenantContextMenuIds: (ids) => set({ availableCampaignTenantContextMenuIds: ids }, false, "setAvailableCampaignTenantContextMenuIds"),
        // 캠페인 탭 캠페인 컨텍스트 메뉴 setter 구현
        setAvailableCampaignTabCampaignContextMenus: (menus) => set({ availableCampaignTabCampaignContextMenus: menus }, false, "setAvailableCampaignTabCampaignContextMenus"),
        setAvailableCampaignTabCampaignContextMenuIds: (ids) => set({ availableCampaignTabCampaignContextMenuIds: ids }, false, "setAvailableCampaignTabCampaignContextMenuIds"),
        // 스킬 할당 메뉴 setter 구현
        setAvailableMenuIdsForSkilAssignment: (ids) => set({ availableMenuIdsForSkilAssignment: ids }, false, "setAvailableMenuIdsForSkilAssignment"),
        // 캠페인 그룹 탭 테넌트 메뉴 setter 구현
        setAvailableMenuIdsForCampaignGroupTabTenant: (ids) => set({ availableMenuIdsForCampaignGroupTabTenant: ids }, false, "setAvailableMenuIdsForCampaignGroupTabTenant"),
        // 캠페인 그룹 탭 캠페인 그룹 메뉴 setter 구현
        setAvailableMenuIdsForCampaignGroupTabCampaignGroup: (ids) => set({ availableMenuIdsForCampaignGroupTabCampaignGroup: ids }, false, "setAvailableMenuIdsForCampaignGroupTabCampaignGroup"),
        // 캠페인 그룹 탭 캠페인 메뉴 setter 구현
        setAvailableMenuIdsForCampaignGroupTabCampaign: (ids) => set({ availableMenuIdsForCampaignGroupTabCampaign: ids }, false, "setAvailableMenuIdsForCampaignGroupTabCampaign"),
        setLoading: (loading) => set({ isLoading: loading }, false, "setLoading"),
        setError: (error) => set({ isError: error }, false, "setError"), 
        clearMenus: () => set(
          { 
            availableMenus: [], 
            availableHeaderMenus: [], 
            availableHeaderMenuIds: [],
            availableCampaignTenantContextMenus: [],
            availableCampaignTenantContextMenuIds: [],
            availableCampaignTabCampaignContextMenus: [],
            availableCampaignTabCampaignContextMenuIds: [],
            availableMenuIdsForSkilAssignment: [],
            availableMenuIdsForCampaignGroupTabTenant: [],
            availableMenuIdsForCampaignGroupTabCampaignGroup: [],
            availableMenuIdsForCampaignGroupTabCampaign: []
          }, 
          false, 
          "clearMenus"
        ),
      }),
      {
        name: "available-menu-storage",
      }
    ),
    { name: "AvailableMenuStore" }
  )
);