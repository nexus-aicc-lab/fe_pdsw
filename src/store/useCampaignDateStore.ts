// src/store/storeForCampaignDate.ts
import { create } from 'zustand';

export interface CampaignDateState {
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  getMinEndDate: () => Date | null;
  isDateDisabled: (date: Date, type: 'start' | 'end') => boolean;
  reset: () => void;
}

export const useCampaignDateStore = create<CampaignDateState>((set, get) => ({
  startDate: null,
  endDate: null,

  setStartDate: (date: Date | null) => {
    set((state) => {
      const newState: Partial<CampaignDateState> = { startDate: date };
      
      // 시작일이 변경되면, 종료일이 시작일보다 이전인 경우 종료일을 null로 리셋
      if (date && state.endDate && state.endDate < date) {
        newState.endDate = null;
      }
      
      return newState;
    });
  },

  setEndDate: (date: Date | null) => {
    const { startDate } = get();
    
    // 종료일이 시작일보다 이전이면 설정하지 않음
    if (date && startDate && date < startDate) {
      return;
    }
    
    set({ endDate: date });
  },

  getMinEndDate: () => {
    const { startDate } = get();
    return startDate;
  },

  isDateDisabled: (date: Date, type: 'start' | 'end') => {
    const { startDate } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (type === 'start') {
      // 시작일: 오늘 이전 날짜는 선택 불가
      return date < today;
    } else {
      // 종료일: 시작일이 없으면 오늘 이전 선택 불가, 시작일이 있으면 시작일 이전 선택 불가
      if (!startDate) {
        return date < today;
      }
      const minDate = new Date(startDate);
      minDate.setHours(0, 0, 0, 0);
      return date < minDate;
    }
  },

  reset: () => {
    set({
      startDate: null,
      endDate: null,
    });
  },
}));