
// src/features/campaignManager/api/apiForGetTreeMenuDataForSideMenu.ts
import { TabData, TreeItem } from "@/features/campaignManager/types/typeForSidebar2";
import { MainCredentials } from "@/features/auth/types/mainIndex";

/**
 * Helper function to determine campaign status from flag
 */
export function getStatusFromFlags(start_flag: number): 'started' | 'pending' | 'stopped' {
  if (start_flag === 1) return 'started';      // 종료된 상태
  if (start_flag === 2) return 'pending';      // 대기 상태
  if (start_flag === 3) return 'stopped';      // 진행중 
  return 'stopped';                            // 기타 케이스는 stopped
}

/**
 * Counselor interface used for tree data
 */
export interface Counselor {
  tenantId: string;
  counselorId: string;
  counselorname: string;
  affiliationGroupName: string;
  affiliationTeamName: string;
}

