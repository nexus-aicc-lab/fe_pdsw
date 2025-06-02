import { useMemo } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// 로딩 타입 정의
export type LoadingType =
  | 'svg-spinner'
  | 'wave-animation'
  | 'vertical-bars'
  | 'improved-wave'
  | 'horizontal-bars'

// 개별 패널의 로딩 상태
interface PanelLoadingState {
  isLoading: boolean
  loadingType: LoadingType
  startTime: number
}

// 전체 로딩 상태 맵
interface LoadingStatesMap {
  [panelId: string]: PanelLoadingState
}

// 스토어 인터페이스
interface TabPanelLoadingStore {
  loadingStates: LoadingStatesMap

  setLoading: (
    panelId: string,
    isLoading: boolean,
    type?: LoadingType
  ) => void

  clearLoading: (panelId: string) => void
  clearAllLoading: () => void

  isAnyLoading: () => boolean
  getLoadingPanels: () => string[]
  getPanelLoadingState: (panelId: string) => PanelLoadingState | null
}

// Zustand 스토어 생성
export const useTabPanelLoadingStore = create<TabPanelLoadingStore>()(
  devtools(
    (set, get) => ({
      loadingStates: {},

      setLoading: (panelId, isLoading, type = 'svg-spinner') => {
        set((state) => {
          if (isLoading) {
            return {
              loadingStates: {
                ...state.loadingStates,
                [panelId]: {
                  isLoading: true,
                  loadingType: type,
                  startTime: Date.now()
                }
              }
            }
          } else {
            const newStates = { ...state.loadingStates }
            delete newStates[panelId]
            return { loadingStates: newStates }
          }
        }, false, `setLoading-${panelId}-${isLoading}`)
      },

      clearLoading: (panelId) => {
        set((state) => {
          const newStates = { ...state.loadingStates }
          delete newStates[panelId]
          return { loadingStates: newStates }
        }, false, `clearLoading-${panelId}`)
      },

      clearAllLoading: () => {
        set({ loadingStates: {} }, false, 'clearAllLoading')
      },

      isAnyLoading: () => {
        const states = get().loadingStates
        return Object.values(states).some(state => state.isLoading)
      },

      getLoadingPanels: () => {
        const states = get().loadingStates
        return Object.keys(states).filter(panelId => states[panelId].isLoading)
      },

      getPanelLoadingState: (panelId) => {
        return get().loadingStates[panelId] || null
      }
    }),
    {
      name: 'tab-panel-loading-store',
    }
  )
)

// 간단한 훅들
export const useIsAnyPanelLoading = () => {
  return useTabPanelLoadingStore(state =>
    Object.values(state.loadingStates).some(s => s.isLoading)
  )
}

export const usePanelLoading = (panelId: string) => {
  const selector = useMemo(() => {
    return (state: TabPanelLoadingStore) => ({
      isLoading: state.loadingStates[panelId]?.isLoading || false,
      loadingState: state.loadingStates[panelId] || null,
      setLoading: (isLoading: boolean, type?: LoadingType) =>
        state.setLoading(panelId, isLoading, type),
      clearLoading: () => state.clearLoading(panelId),
    });
  }, [panelId]);

  return useTabPanelLoadingStore(selector);
};

// 디버깅용 훅
export const useLoadingDebugInfo = () => {
  return useTabPanelLoadingStore(state => ({
    totalLoadingPanels: Object.keys(state.loadingStates).length,
    loadingPanels: Object.entries(state.loadingStates).map(([id, info]) => ({
      panelId: id,
      type: info.loadingType,
      duration: Date.now() - info.startTime
    })),
    clearAll: state.clearAllLoading
  }))
}
