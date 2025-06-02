import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SystemDeviceStore {
  saveSelectDevice: string;
  setSaveSelectDevice: (device_id: string) => void;
}

export const useSystemDeviceStore = create<SystemDeviceStore>()(
  devtools(
    persist(
      (set) => ({
        saveSelectDevice: '', // 초기 디바이스 ID
        setSaveSelectDevice: (device_id: string) => set({ saveSelectDevice: device_id }),
      }),
      {
        name: 'systemDeviceStore', // 스토어 이름
      }
    )
  )
);