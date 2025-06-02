// src/features/store/campainManagerStore.ts
import { create } from 'zustand';
import { SkillListDataResponse
  , CallingNumberListDataResponse
  , CampaignScheDuleListDataResponse 
  , CampaignSkillDataResponse
  , PhoneDescriptionListDataResponse
  , CampaignSkillUpdateRequest
} from '../features/campaignManager/types/campaignManagerIndex';
import { CampaignInfoInsertRequest } from '@/features/campaignManager/hooks/useApiForCampaignManagerInsert';
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import { campaignChannel } from '@/lib/broadcastChannel';
import { CampaignInfo, CampaignManagerInfo } from '@/app/main/comp/CreateCampaignFormPanel/variables/variablesForCreateCampaignForm';
import { CampaignScheduleInfo } from '@/app/main/comp/CreateCampaignFormPanel/variables/interfacesForCreateCampaign';
import { ChannelGroupListDataResponse } from "@/features/preferences/hooks/useApiForChannelGroup";
import { devtools, persist } from 'zustand/middleware';
import { ColumnSettingItem } from '@/app/main/comp/Campaignprogress/ColumnSet';

// Import default values for reset function


interface CampainManagerState {
  skills: SkillListDataResponse[];
  callingNumbers: CallingNumberListDataResponse[];
  schedules: CampaignScheDuleListDataResponse[];
  campaignSkills: CampaignSkillDataResponse[];
  phoneDescriptions: PhoneDescriptionListDataResponse[];  
  totalCount: number;
  campaignGroupManagerInit: boolean;
  newCampaignManagerInfo: CampaignInfoInsertRequest;
  newCampaignInfo: MainDataResponse;
  newTenantId: string;
  newCampaignSchedule: CampaignScheDuleListDataResponse;
  isAlreadyOpend: boolean
  campaignManagerHeaderTenantId: string;
  campaignManagerHeaderCampaignName: string;
  campaignManagerHeaderDailMode: string;
  campaignManagerHeaderSkill: string;
  campaignManagerHeaderCallNumber: string;
  campaignManagerCampaignId: string;
  // 스킬 상태 추가
  skillsLoaded: boolean;
  skillsLoading: boolean;
  channelGroupList: ChannelGroupListDataResponse[];  
  copyCampaignManagerInfo: CampaignInfoInsertRequest;
  copyCampaignInfo: MainDataResponse;
  copyTenantId: string;
  copyCampaignSchedule: CampaignScheDuleListDataResponse;
  copyCampaignSkills: CampaignSkillUpdateRequest;
  campaignTotalProgressInfoColumn: ColumnSettingItem[];
}

interface CampainManagerActions {
  setSkills: (skills: SkillListDataResponse[]) => void;
  setCallingNumbers: (callingNumbers: CallingNumberListDataResponse[]) => void;
  setSchedules: (schedules: CampaignScheDuleListDataResponse[]) => void;
  setCampaignSkills: (campaignSkills: CampaignSkillDataResponse[]) => void;
  setPhoneDescriptions: (phoneDescriptions: PhoneDescriptionListDataResponse[]) => void;
  setTotalCount: (count: number) => void;
  setCampaignGroupManagerInit: (init: boolean) => void;
  setNewCampaignManagerInfo: (newCampaignManagerInfo: CampaignInfoInsertRequest) => void;
  setNewCampaignInfo: (newCampaignInfo: MainDataResponse) => void;
  setNewTenantId: (newTenantId: string) => void;
  setNewCampaignSchedule: (newCampaignSchedule: CampaignScheDuleListDataResponse) => void;
  resetCampaignState: (tenantId?: string) => void; // Add new reset function
  setIsAlreadyOpend: (isAlreadyOpend: boolean) => void; // Add new isAlreadyOpend function
  setCampaignManagerHeaderTenantId: (campaignManagerHeaderTenantId: string) => void;
  setCampaignManagerHeaderCampaignName: (campaignManagerHeaderCampaignName: string) => void;
  setCampaignManagerHeaderDailMode: (campaignManagerHeaderDailMode: string) => void;
  setCampaignManagerHeaderSkill: (campaignManagerHeaderSkill: string) => void;
  setCampaignManagerHeaderCallNumber: (campaignManagerHeaderCallNumber: string) => void;
  setCampaignManagerCampaignId: (campaignManagerCampaignId: string) => void;
  setCopyCampaignManagerInfo: (copyCampaignManagerInfo: CampaignInfoInsertRequest) => void;
  setCopyCampaignInfo: (copyCampaignInfo: MainDataResponse) => void;
  setCopyTenantId: (copyTenantId: string) => void;
  setCopyCampaignSchedule: (copyCampaignSchedule: CampaignScheDuleListDataResponse) => void;
  setCopyCampaignSkills: (copyCampaignSkills:CampaignSkillUpdateRequest) => void;
  setcampaignTotalProgressInfoColumn: (campaignTotalProgressInfoColumn: ColumnSettingItem[]) => void;
  // 스킬 액션 추가
  setSkillsLoaded: (loaded: boolean) => void;
  setSkillsLoading: (loading: boolean) => void;
  setChannelGroupList: (channelGroupList: ChannelGroupListDataResponse[]) => void;

  // CampaignManagerStore 초기화
  setResetCampaignManagerStore: () => void;
}

type CampainManagerStore = CampainManagerState & CampainManagerActions;

export const useCampainManagerStore = create<CampainManagerStore>()(
  devtools(
    persist(
      (set,get) => ({
        skills: [],
        callingNumbers: [],
        schedules: [],
        campaignSkills: [],
        phoneDescriptions: [],
        selectedCampaign: null,
        totalCount: 0,
        campaignGroupManagerInit: false,
        newCampaignManagerInfo: {} as CampaignInfoInsertRequest,
        newCampaignInfo: {} as MainDataResponse,
        newTenantId: ' ',
        newCampaignSchedule: {} as CampaignScheDuleListDataResponse,
        campaignManagerHeaderTenantId: '',
        campaignManagerHeaderCampaignName: '',
        campaignManagerHeaderDailMode: '',
        campaignManagerHeaderSkill: '',
        campaignManagerHeaderCallNumber: '',
        campaignManagerCampaignId: '',
        copyCampaignManagerInfo: {} as CampaignInfoInsertRequest,
        copyCampaignInfo: {} as MainDataResponse,
        copyTenantId: ' ',
        copyCampaignSchedule: {} as CampaignScheDuleListDataResponse,
        copyCampaignSkills: {} as CampaignSkillUpdateRequest,
        campaignTotalProgressInfoColumn: [],
        // 스킬 상태 초기화
        skillsLoaded: false,
        skillsLoading: false,
        channelGroupList: [],
        setSkills: (skills) => {
          set({ 
            skills,
            skillsLoaded: true,
            skillsLoading: false
          });  
          campaignChannel.postMessage({
            type: "skills_info_update",
            skillsId: skills.map((skill) => skill.skill_id),
          });
        },
        setCallingNumbers: (callingNumbers) => set({ callingNumbers }),
        setSchedules: (schedules) => set({ schedules }),
        setCampaignSkills: (campaignSkills) => set({ campaignSkills }),
        setPhoneDescriptions: (phoneDescriptions) => set({ phoneDescriptions }),
        setTotalCount: (totalCount) => set({ totalCount }),
        setCampaignGroupManagerInit: (campaignGroupManagerInit) => set({ campaignGroupManagerInit }),
        setNewCampaignManagerInfo: (newCampaignManagerInfo) => set({ newCampaignManagerInfo }),
        setNewCampaignInfo: (newCampaignInfo) => set({ newCampaignInfo }),
        setNewTenantId: (newTenantId) => set({ newTenantId }),
        setNewCampaignSchedule: (newCampaignSchedule) => set({ newCampaignSchedule }),
        
        // Add new resetCampaignState function
        resetCampaignState: (tenantId) => {
          // Get default values from the imports or define them inline
          const defaultCampaignManagerInfo = {...CampaignManagerInfo};
          const defaultCampaignInfo = {...CampaignInfo};
          const defaultCampaignSchedule = {...CampaignScheduleInfo};
          
          set({
            newCampaignManagerInfo: defaultCampaignManagerInfo,
            newCampaignInfo: defaultCampaignInfo,
            newTenantId: tenantId || ' ',
            newCampaignSchedule: defaultCampaignSchedule,
          });
        },
        setIsAlreadyOpend: (isAlreadyOpend) => set({ isAlreadyOpend }),
        setCampaignManagerHeaderTenantId: (campaignManagerHeaderTenantId) => set({ campaignManagerHeaderTenantId }),
        setCampaignManagerHeaderCampaignName: (campaignManagerHeaderCampaignName) => set({ campaignManagerHeaderCampaignName }),
        setCampaignManagerHeaderDailMode: (campaignManagerHeaderDailMode) => set({ campaignManagerHeaderDailMode }),
        setCampaignManagerHeaderSkill: (campaignManagerHeaderSkill) => set({ campaignManagerHeaderSkill }),
        setCampaignManagerHeaderCallNumber: (campaignManagerHeaderCallNumber) => set({ campaignManagerHeaderCallNumber }),
        setCampaignManagerCampaignId: (campaignManagerCampaignId) => set({ campaignManagerCampaignId }),
        setCopyCampaignManagerInfo: (copyCampaignManagerInfo) => set({ copyCampaignManagerInfo }),
        setCopyCampaignInfo: (copyCampaignInfo) => set({ copyCampaignInfo }),
        setCopyTenantId: (copyTenantId) => set({ copyTenantId }),
        setCopyCampaignSchedule: (copyCampaignSchedule) => set({ copyCampaignSchedule }),
        setCopyCampaignSkills: (copyCampaignSkills) => set({ copyCampaignSkills }),
        setcampaignTotalProgressInfoColumn: (campaignTotalProgressInfoColumn) => set({ campaignTotalProgressInfoColumn }),
        // 스킬 액션 구현
        setSkillsLoaded: (loaded) => set({ skillsLoaded: loaded }),
        setSkillsLoading: (loading) => set({ skillsLoading: loading }),
        setChannelGroupList: (channelGroupList) => set({ channelGroupList }),
        isAlreadyOpend: false,


        setResetCampaignManagerStore: () => set({
          skills: [],
          callingNumbers: [],
          schedules: [],
          campaignSkills: [],
          phoneDescriptions: [],
          // selectedCampaign: null, // set 이 없어서 초기화 못시키는중 (사용 안하는듯)
          totalCount: 0,
          campaignGroupManagerInit: false,
          newCampaignManagerInfo: {} as CampaignInfoInsertRequest,
          newCampaignInfo: {} as MainDataResponse,
          newTenantId: ' ',
          newCampaignSchedule: {} as CampaignScheDuleListDataResponse,
          campaignManagerHeaderTenantId: '',
          campaignManagerHeaderCampaignName: '',
          campaignManagerHeaderDailMode: '',
          campaignManagerHeaderSkill: '',
          campaignManagerHeaderCallNumber: '',
          campaignManagerCampaignId: '',
          copyCampaignManagerInfo: {} as CampaignInfoInsertRequest,
          copyCampaignInfo: {} as MainDataResponse,
          copyTenantId: ' ',
          copyCampaignSchedule: {} as CampaignScheDuleListDataResponse,
          copyCampaignSkills: {} as CampaignSkillUpdateRequest,
          // 스킬 상태 초기화
          skillsLoaded: false,
          skillsLoading: false,
          channelGroupList: [],
          campaignTotalProgressInfoColumn: [],
        }),
      }),
      {
        name: 'campaign-manager-store', // localStorage에 저장될 키 이름
        // storage: createJSONStorage(() => sessionStorage) // 이 줄을 사용하면 sessionStorage에 저장됨
      }
    ),
    {
      name: 'campaign-manager-store-devtools',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);