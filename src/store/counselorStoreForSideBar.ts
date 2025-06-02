// C:\nproject\fe_pdsw\src\store\counselorStoreForSideBar.ts
import { create } from 'zustand';
import { TabData, TreeItem } from '@/features/campaignManager/types/typeForSidebar2';

interface CounselorStoreState {
  treeData: TabData[] | null;
  isLoading: boolean;
  error: string | null;
  updateTreeData: (data: TabData[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCounselorStoreForSideBar = create<CounselorStoreState>((set) => ({
  treeData: null,
  isLoading: true,
  error: null,
  updateTreeData: (data) => set({ treeData: data, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
}));
