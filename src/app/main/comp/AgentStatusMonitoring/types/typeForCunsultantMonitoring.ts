// C:\nproject\fe_pdsw\src\app\main\comp\AgentStatusMonitoring\types\typeForCunsultantMonitoring.ts

// C:\nproject\fe_pdsw\src\app\main\comp\AgentStatusMonitoring\types\typeForCunsultantMonitoring.ts

// API 응답 관련 타입
export interface AgentStateMonitoringListDataResponse {
    counselorId: string;
    counselorName: string;
    statusCode: string;
    statusTime: string;
  }
  
  export interface AgentStateMonitoringListResponse {
    code: number;
    message: string;
    counselorStatusList: AgentStateMonitoringListDataResponse[];
  }
  
  export interface IRequestTypeForFetchConsultantStatusMonitorData {
    tenantId: number;
    campaignId: number;
    sessionKey?: string;
  }
  
  // 컴포넌트 내부 타입
  export interface AgentStatus {
    waiting: boolean;
    processing: boolean;
    afterprocessing: boolean;
    rest: boolean;
  }
  
  export interface AgentData {
    id: number;
    status: 'waiting' | 'processing' | 'afterprocessing' | 'rest';
    agent: string;
    name: string;
    time: string;
    count?: string;
  }
  
  export interface StatusHeaderItem {
    status: AgentData['status'];
    bg: string;
    text: string;
    icon: string;
  }
  
  export type SortField = 'time' | 'agent' | 'name' | 'status';
  export type SortDirection = 'asc' | 'desc';
  
  export interface AgentStatusMonitoringProps {
    sessionKey?: string;
    campaignId?: number;
    tenantId?: string;
  }