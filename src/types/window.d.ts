// src/types/global.d.ts
export {}; // 이 줄 필수

declare global {
  interface Window {
    expandAllNodes?: () => void;
    expandTenantsOnly?: () => void;
  }
}
