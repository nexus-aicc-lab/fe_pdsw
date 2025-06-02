import { create } from "zustand";
import { persist } from "zustand/middleware";

// 뷰 모드 타입: 테넌트 뷰 또는 캠페인 뷰
export type ViewMode = 'tenant' | 'campaign' | null;

// 노드 타입: 전체, 테넌트, 캠페인
export type NodeType = 'all' | 'tenant' | 'campaign';

// 정렬 필드 타입: 이름 또는 ID
export type SortType = 'name' | 'id';

// 정렬 방향: 오름차순 또는 내림차순
export type SortDirection = 'asc' | 'desc';

// 필터 모드: 전체 또는 필터링
export type FilterMode = 'all' | 'filter' | 'skill';

// 정렬 옵션 타입
export interface SortOption {
  type: SortType;
  direction: SortDirection;
  nodeType?: NodeType;
}

// 트리 메뉴 상태 인터페이스
export interface TreeMenuState {
  // 정렬 관련 상태
  campaignSort: {
    type: SortType;
    direction: SortDirection;
  };
  selectedNodeType: NodeType;
  
  // 뷰 모드
  viewMode: ViewMode;
  
  // 필터링 관련
  selectedMenus: number[];
  skilIdsForCampaignTreeMenu: string[];
  filterMode: FilterMode;
  
  // 액션
  sortByNodeType: (nodeType: NodeType, sortType: SortType, direction: SortDirection) => void;
  setCampaignSort: (option: SortOption) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedNodeType: (nodeType: NodeType) => void;
  setSkillIdsForFilter: (skillIds: string[]) => void;
  setSkilIdsForCampaignTreeMenu: (skillIds: number[] | string[]) => void;
  toggleMenu: (menuId: number) => void;
  setFilterMode: (mode: FilterMode) => void;
}

// Zustand 스토어 생성
export const useTreeMenuStore = create<TreeMenuState>()(
  persist(
    (set) => ({
      // 기본 상태
      campaignSort: {
        type: 'id',
        direction: 'asc',
      },
      selectedNodeType: 'campaign',
      viewMode: 'campaign',
      selectedMenus: [],
      skilIdsForCampaignTreeMenu: [],
      filterMode: 'all',
      
      // 정렬 옵션 설정 (완전한 옵션으로 설정)
      setCampaignSort: (option) => 
        set(() => {
          console.log("setCampaignSort 호출:", option);
          return { 
            campaignSort: {
              type: option.type,
              direction: option.direction
            },
            selectedNodeType: option.nodeType || 'all',
            // 뷰 모드는 변경하지 않음 (항상 캠페인 표시 가능하도록)
          };
        }),
      
      // 정렬 액션 - 노드 타입별 정렬 설정
      sortByNodeType: (nodeType, sortType, direction) => 
        set((state) => {
          console.log("sortByNodeType 호출:", { nodeType, sortType, direction });
          
          // 정렬 타입이 변경된 경우
          if (state.selectedNodeType !== nodeType) {
            // 새 노드 타입에 따라 확장 상태 초기화
            setTimeout(() => {
              if (nodeType === 'tenant') {
                // 테넌트 정렬: 테넌트 노드까지만 확장
                if (window.expandTenantsOnly) {
                  window.expandTenantsOnly();
                }
              } else {
                // 캠페인 또는 전체 정렬: 모든 노드 확장
                if (window.expandAllNodes) {
                  window.expandAllNodes();
                }
              }
            }, 100);
          }
          
          return {
            campaignSort: {
              type: sortType,
              direction: direction,
            },
            selectedNodeType: nodeType,
            // 뷰 모드는 변경하지 않음 (캠페인이 항상 표시되도록)
          };
        }),
      
      // 뷰 모드 설정
      setViewMode: (mode) => 
        set((state) => {
          const newState = { viewMode: mode };
          
          // 트리 노드 상태 저장/복원
          if (state.viewMode !== mode) {
            // 뷰 모드 변경 시 적절한 확장 함수 호출
            setTimeout(() => {
              if (mode === 'tenant') {
                if (window.expandTenantsOnly) {
                  console.log("테넌트 노드만 확장 (모드 변경)");
                  window.expandTenantsOnly();
                }
              } else {
                if (window.expandAllNodes) {
                  console.log("모든 노드 확장 (모드 변경)");
                  window.expandAllNodes();
                }
              }
            }, 100);
          }
          
          return newState;
        }),
      
      // 노드 타입 직접 설정
      setSelectedNodeType: (nodeType) => 
        set(() => ({
          selectedNodeType: nodeType,
          // 뷰 모드는 변경하지 않음
        })),
      
      // 필터링용 스킬 ID 설정 (신규 인터페이스)
      setSkillIdsForFilter: (skillIds) => 
        set(() => ({
          skilIdsForCampaignTreeMenu: skillIds,
          filterMode: skillIds.length > 0 ? 'filter' : 'all',
        })),
      
      // 캠페인 트리 메뉴용 스킬 ID 설정 (구 인터페이스 유지)
      setSkilIdsForCampaignTreeMenu: (skillIds) =>
        set(() => {
          // 문자열 배열로 변환 (숫자 배열이 들어올 수 있음)
          const stringSkillIds = Array.isArray(skillIds)
            ? skillIds.map(id => id.toString())
            : [];
            
          return {
            skilIdsForCampaignTreeMenu: stringSkillIds,
            // 스킬이 선택되었는지에 따라 필터 모드 자동 설정
            filterMode: stringSkillIds.length > 0 ? 'skill' : 'all',
          };
        }),
      
      // 메뉴 토글 (구 인터페이스 유지)
      toggleMenu: (menuId) =>
        set((state) => ({
          selectedMenus: state.selectedMenus.includes(menuId)
            ? state.selectedMenus.filter(id => id !== menuId)
            : [...state.selectedMenus, menuId],
        })),
      
      // 필터 모드 설정
      setFilterMode: (mode) => 
        set(() => ({
          filterMode: mode,
        })),
    }),
    {
      name: "tree-menu-storage", // localStorage에 저장될 키 이름
    }
  )
);