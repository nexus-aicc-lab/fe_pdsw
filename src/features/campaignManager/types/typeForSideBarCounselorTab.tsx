// types/typeForSideBarCounselorTab.ts
interface BaseNode {
  id: string;
  label: string;
  type: 'tenant' | 'group' | 'team' | 'counselor';
 }
 
 export interface CounselorNode extends BaseNode {
  type: 'counselor';
  tenantId: string;
 }
 
 export interface TeamNode extends BaseNode {
  type: 'team';
  children: CounselorNode[];
 }
 
 export interface GroupNode extends BaseNode {
  type: 'group';
  children: TeamNode[];
 }
 
 export interface TenantNode extends BaseNode {
  type: 'tenant';
  children: GroupNode[];
 }
 
 export interface TabData {
  id: string;
  label: string;
  items: TenantNode[];
 }
 
 export interface Counselor {
  tenantId: string;
  tenantName: string;
  affiliationGroupId: string; 
  affiliationGroupName: string;
  affiliationTeamId: string;
  affiliationTeamName: string;
  counselorId: string;
  counselorname: string;
 }


