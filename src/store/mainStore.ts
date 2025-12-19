
// src/features/store/mainStore.ts
import { create } from 'zustand';
import { MainDataResponse, TenantListDataResponse } from '../features/auth/types/mainIndex';
import { campaignChannel } from '@/lib/broadcastChannel';
import { devtools, persist } from 'zustand/middleware';
import { CampaignSkillItemForSystemAdmin } from '@/shared/api/camapign/apiForCampaignSkilListForSystemAdmin';
import { CampaignGroupItemForSystemAdmin } from '@/shared/api/camapign/apiForGetCampaignGroupForSystemAdmin';

// Define the DataProps type for selectedCampaignRow
export interface DataProps {
  no: number;
  campaignId: number;
  idName: string;
  startDate: string;
  endDate: string;
  skill: string;
  dialMode: string;
  callingNumber: string;
}

export interface FormatRow {
  id?: string;
  name: string;
  start: number;
  length: number;
  field: string;
}

interface MainState {
  campaigns: MainDataResponse[];
  tenants: TenantListDataResponse[];
  counselers: any[];
  selectedCampaign: MainDataResponse | null;
  selectedCampaignRow: DataProps | null; // Added selectedCampaignRow
  totalCount: number;
  reBroadcastType: string;
  sendingStatusCampaignId: string;
  listManagerFileFormatRows: FormatRow[];
  sseInputMessage: string;
  listManagerDelimiter: string;
  listManagerCampaignId: string;
  listManagerFileFormat: string;
  reBroadcastRedialCondition: string;
  // 테넌트 상태
  tenantsLoaded: boolean;  // 테넌트 데이터 로딩 여부
  tenantsLoading: boolean; // 테넌트 데이터 로딩 중 여부
  // 캠페인 상태
  campaignsLoaded: boolean;  // 캠페인 데이터 로딩 여부
  campaignsLoading: boolean; // 캠페인 데이터 로딩 중 여부
  // 채널 모니터
  channelMonitorFirstSelect: string;
  channelMonitorSecondSelect: string;
  channelMonitorThirdSelect: string;
  campaignProgressInfoViewType: string;
  campaignTotalProgressInfoCampaignId: string;

  // 캠페인 스킬 관련
  campaignSkills: CampaignSkillItemForSystemAdmin[];
  campaignSkillsLoaded: boolean;
  campaignSkillsLoading: boolean;

  // 캠페인 그룹 관련
  campaignGroups: CampaignGroupItemForSystemAdmin[];
  campaignGroupsLoaded: boolean;
  campaignGroupsLoading: boolean;

}

interface MainActions {
  setCampaigns: (campaigns: MainDataResponse[]) => void;
  setTenants: (tenants: TenantListDataResponse[]) => void;
  setCounselers: (counselers: any[]) => void;
  setSelectedCampaign: (campaign: MainDataResponse | null) => void;
  setSelectedCampaignRow: (row: DataProps | null) => void; // Added setter for selectedCampaignRow
  setTotalCount: (count: number) => void;
  setReBroadcastType: (reBroadcastType: string) => void;
  setSendingStatusCampaignId: (sendingStatusCampaignId: string) => void;
  setListManagerFileFormatRows: (listManagerFileFormatRows: FormatRow[]) => void;
  setSseInputMessage: (sseInputMessage: string) => void;
  setListManagerDelimiter: (listManagerDelimiter: string) => void;
  setListManagerCampaignId: (listManagerCampaignId: string) => void;
  setListManagerFileFormat: (listManagerFileFormat: string) => void;
  setReBroadcastRedialCondition: (reBroadcastRedialCondition: string) => void;
  // 테넌트 액션
  setTenantsLoaded: (loaded: boolean) => void;
  setTenantsLoading: (loading: boolean) => void;
  // 캠페인 액션
  setCampaignsLoaded: (loaded: boolean) => void;
  setCampaignsLoading: (loading: boolean) => void;
  setChannelMonitorFirstSelect: (channelMonitorFirstSelect: string) => void;
  setChannelMonitorSecondSelect: (channelMonitorSecondSelect: string) => void;
  setChannelMonitorThirdSelect: (channelMonitorThirdSelect: string) => void;
  setCampaignProgressInfoViewType: (campaignProgressInfoViewType: string) => void;
  updateCampaignStatus: (campaignId: number, newStatus: number) => void;
  setCampaignTotalProgressInfoCampaignId: (campaignTotalProgressInfoCampaignId: string) => void;

  // 스킬 캠페인 액션 추가
  setSkillCampaigns: (skills: CampaignSkillItemForSystemAdmin[]) => void;
  setSkillCampaignsLoaded: (loaded: boolean) => void;
  setSkillCampaignsLoading: (loading: boolean) => void;
  getSkillCampaignsByCampaignId: (campaignId: number) => CampaignSkillItemForSystemAdmin[];


  // 캠페인 그룹 관련 액션 추가
  // 캠페인 그룹 액션 추가
  setCampaignGroups: (groups: CampaignGroupItemForSystemAdmin[]) => void;
  setCampaignGroupsLoaded: (loaded: boolean) => void;
  setCampaignGroupsLoading: (loading: boolean) => void;

  // MainStore 초기화
  setResetMainStore: () => void;

}

type MainStore = MainState & MainActions;

// Redux 개발자 도구 미들웨어 추가
export const useMainStore = create<MainStore>()(
  devtools(
    persist(
      (set, get) => ({
        campaigns: [],
        tenants: [],
        counselers: [],
        selectedCampaign: null,
        selectedCampaignRow: null, // Initialize selectedCampaignRow as null
        totalCount: 0,
        reBroadcastType: '',
        sendingStatusCampaignId: '',
        listManagerFileFormatRows: [],
        sseInputMessage: '',
        listManagerDelimiter: '',
        listManagerCampaignId: '',
        listManagerFileFormat: '',
        reBroadcastRedialCondition: '',
        // 테넌트 상태 초기화
        tenantsLoaded: false,
        tenantsLoading: false,
        // 캠페인 상태 초기화
        campaignsLoaded: false,
        campaignsLoading: false,
        channelMonitorFirstSelect: '',
        channelMonitorSecondSelect: '',
        channelMonitorThirdSelect: '',
        campaignProgressInfoViewType: '',
        campaignTotalProgressInfoCampaignId: '',

        // 캠페인 스킬 관련
        campaignSkills: [],
        campaignSkillsLoaded: false,
        campaignSkillsLoading: false,

        // 캠페인 그룹 관련
        campaignGroups: [],
        campaignGroupsLoaded: false,
        campaignGroupsLoading: false,

        setCampaigns: (campaigns) => set({
          campaigns,
          campaignsLoaded: true,
          campaignsLoading: false
        }, false, 'setCampaigns'),
        setTenants: (tenants) => set({
          tenants,
          tenantsLoaded: true,
          tenantsLoading: false
        }, false, 'setTenants'),
        setCounselers: (counselers) => set({ counselers }, false, 'setCounselers'),
        setSelectedCampaign: (campaign) => set({ selectedCampaign: campaign }, false, 'setSelectedCampaign'),
        setSelectedCampaignRow: (row) => set({ selectedCampaignRow: row }, false, 'setSelectedCampaignRow'), // Set selectedCampaignRow
        setTotalCount: (totalCount) => set({ totalCount }, false, 'setTotalCount'),
        setReBroadcastType: (reBroadcastType) => set({ reBroadcastType }, false, 'setReBroadcastType'),
        setSendingStatusCampaignId: (sendingStatusCampaignId) => set({ sendingStatusCampaignId }, false, 'setSendingStatusCampaignId'),
        setListManagerFileFormatRows: (listManagerFileFormatRows) => set({ listManagerFileFormatRows }, false, 'setListManagerFileFormatRows'),
        setSseInputMessage: (sseInputMessage) => {
          set({ sseInputMessage }, false, 'setSseInputMessage');
          campaignChannel.postMessage({
            type: sseInputMessage,
          });
        },
        setListManagerDelimiter: (listManagerDelimiter) => set({ listManagerDelimiter }, false, 'setListManagerDelimiter'),
        setListManagerCampaignId: (listManagerCampaignId) => set({ listManagerCampaignId }, false, 'setListManagerCampaignId'),
        setListManagerFileFormat: (listManagerFileFormat) => set({ listManagerFileFormat }, false, 'setListManagerFileFormat'),
        setReBroadcastRedialCondition: (reBroadcastRedialCondition) => set({ reBroadcastRedialCondition }, false, 'setReBroadcastRedialCondition'),
        // 테넌트 액션
        setTenantsLoaded: (loaded) => set({ tenantsLoaded: loaded }, false, 'setTenantsLoaded'),
        setTenantsLoading: (loading) => set({ tenantsLoading: loading }, false, 'setTenantsLoading'),
        // 캠페인 액션
        setCampaignsLoaded: (loaded) => set({ campaignsLoaded: loaded }, false, 'setCampaignsLoaded'),
        setCampaignsLoading: (loading) => set({ campaignsLoading: loading }, false, 'setCampaignsLoading'),
        setChannelMonitorFirstSelect: (channelMonitorFirstSelect) => set({ channelMonitorFirstSelect }, false, 'setChannelMonitorFirstSelect'),
        setChannelMonitorSecondSelect: (channelMonitorSecondSelect) => set({ channelMonitorSecondSelect }, false, 'setChannelMonitorSecondSelect'),
        setChannelMonitorThirdSelect: (channelMonitorThirdSelect) => set({ channelMonitorThirdSelect }, false, 'setChannelMonitorThirdSelect'),
        setCampaignProgressInfoViewType: (campaignProgressInfoViewType) => set({ campaignProgressInfoViewType }, false, 'setCampaignProgressInfoViewType'),
        setCampaignTotalProgressInfoCampaignId: (campaignTotalProgressInfoCampaignId) => set({ campaignTotalProgressInfoCampaignId }, false, 'setCampaignTotalProgressInfoCampaignId'),

        updateCampaignStatus: (campaignId: number, newStatus: number) => {
          set(state => {
            const updatedCampaigns = state.campaigns.map(campaign => {
              if (campaign.campaign_id === campaignId) {
                return {
                  ...campaign,
                  campaign_status: newStatus,
                  start_flag: newStatus  // ✅ 상태 반영은 그대로
                };
              }
              return campaign;
            });
        
            const updatedSelectedCampaign = state.selectedCampaign?.campaign_id === campaignId
              ? {
                  ...state.selectedCampaign,
                  campaign_status: newStatus,
                  start_flag: newStatus
                }
              : state.selectedCampaign;
        
            return {
              campaigns: updatedCampaigns,
              selectedCampaign: updatedSelectedCampaign
            };
          }, false, 'updateCampaignStatus');
        
          // ✅ 상태 반영 후 invalidate는 외부에서 별도로 처리
          // 예: setTimeout(() => invalidateTreeMenuData(), 300);
          // 또는 수동 버튼/로직으로 트리 UI 재로딩
        },      

        // 캠페인 스킬 액션
        setSkillCampaigns: (skills) => set({
          campaignSkills: skills,
          campaignSkillsLoaded: true,
          campaignSkillsLoading: false
        }, false, 'setSkillCampaigns'),
        
        setSkillCampaignsLoaded: (loaded) => set({ 
          campaignSkillsLoaded: loaded 
        }, false, 'setSkillCampaignsLoaded'),
        
        setSkillCampaignsLoading: (loading) => set({ 
          campaignSkillsLoading: loading 
        }, false, 'setSkillCampaignsLoading'),
        
        // 특정 캠페인 ID에 연결된 스킬 목록 반환
        getSkillCampaignsByCampaignId: (campaignId) => {
          // 캠페인 ID에 해당하는 스킬 필터링
          return get().campaignSkills.filter(skill => 
            skill.campaign_id && skill.campaign_id === campaignId
          );
        },

        setCampaignGroups: (groups) => set({
          campaignGroups: groups,
          campaignGroupsLoaded: true,
          campaignGroupsLoading: false
        }, false, 'setCampaignGroups'),
        
        setCampaignGroupsLoaded: (loaded) => set({
          campaignGroupsLoaded: loaded
        }, false, 'setCampaignGroupsLoaded'),
        
        setCampaignGroupsLoading: (loading) => set({
          campaignGroupsLoading: loading
        }, false, 'setCampaignGroupsLoading'),

        // MainStore 초기화
        setResetMainStore: () => set({
          campaigns: [],
          tenants: [],
          counselers: [],
          selectedCampaign: null,
          selectedCampaignRow: null, // Initialize selectedCampaignRow as null
          totalCount: 0,
          reBroadcastType: '',
          sendingStatusCampaignId: '',
          listManagerFileFormatRows: [],
          sseInputMessage: '',
          listManagerDelimiter: '',
          listManagerCampaignId: '',
          listManagerFileFormat: '',
          reBroadcastRedialCondition: '',
          // 테넌트 상태 초기화
          tenantsLoaded: false,
          tenantsLoading: false,
          // 캠페인 상태 초기화
          campaignsLoaded: false,
          campaignsLoading: false,
          channelMonitorFirstSelect: '',
          channelMonitorSecondSelect: '',
          channelMonitorThirdSelect: '',
          campaignProgressInfoViewType: '',
          campaignTotalProgressInfoCampaignId: '',

          // 캠페인 스킬 관련
          campaignSkills: [],
          campaignSkillsLoaded: false,
          campaignSkillsLoading: false,

          // 캠페인 그룹 관련
          campaignGroups: [],
          campaignGroupsLoaded: false,
          campaignGroupsLoading: false,
        }, false, 'setResetMainStore'),

      }),
      {
        name: 'main-store', // localStorage에 저장될 키 이름
        // storage: createJSONStorage(() => sessionStorage) // 이 줄을 사용하면 sessionStorage에 저장됨
      }
    ),
    {
      name: 'main-store-devtools',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);