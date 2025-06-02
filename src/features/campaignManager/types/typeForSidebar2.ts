// src/features/campaignManager/types/typeForSidebar2.ts
export interface TenantItem {
  tenant_id: number;
  tenant_name: string;
}


// types/typeForSidebar2.ts
export interface TreeItem {
  id: string;
  label: string;
  type: 'group' | 'team' | 'counselor' | 'folder' | 'campaign' | 'tenant' | 'center' | 'skill';
  children?: TreeItem[];
  tenantId?: string;
  status?: "started" | "pending" | "stopped";
  direction?: string;
  skillId?: number;
  visible?: boolean;  // 노드 표시 여부를 제어하는 속성 추가
}

export interface TabData {
  id: string;
  label: string;
  items: TreeItem[];
}

export interface CounselorData {
  centerId: string;
  centerName: string;
  tenantId: string;
  tenantName: string;
  counselorAffiliation: {
    affiliationDepth: string;
    affiliatedDepartmentId: string;
    affiliatedDepartmentName: string;
  }[];
  affiliationGroupId: string;
  affiliationGroupName: string;
  affiliationTeamId: string;
  affiliationTeamName: string;
  counselorId: string;
  counselorname: string;
  blendKind: string;
}

export type FilterType = 'all' | 'active' | 'inactive' | 'inbound' | 'outbound' | 'online' | 'offline';
export type SortType = 'name' | 'department' | 'memberCount' | 'status' | 'team' | 'group';

export interface TabData {
  id: string;
  label: string;
  items: TreeItem[];
}