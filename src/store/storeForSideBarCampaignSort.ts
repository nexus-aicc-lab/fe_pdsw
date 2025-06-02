// src/store/storeForSideBarCampaignSort.ts
import { create } from 'zustand';

// Updated sort types
export type SortType = 'name' | 'id';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  type: SortType;
  direction: SortDirection;
}

// Define the sort state store with direction
interface SortState {
  campaignSort: SortOption;
  setCampaignSort: (option: SortOption) => void;
}

// Create the sort store with direction
export const useSortStore = create<SortState>((set) => ({
  campaignSort: { type: 'name', direction: 'asc' }, // Default sorting by name ascending
  setCampaignSort: (option: SortOption) => set({ campaignSort: option }),
}));