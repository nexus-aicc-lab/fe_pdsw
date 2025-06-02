// src/store/sideMenuStore.ts
import { create } from 'zustand';

interface SideMenuState {
  selectedNodeId: string | undefined;
  setSelectedNodeId: (id: string) => void;
}

export const useSideMenuStore = create<SideMenuState>((set) => ({
  selectedNodeId: undefined,
  setSelectedNodeId: (id) => set({ selectedNodeId: id })
}));