// 시스템 모니터링
export interface SystemMonitoringResponse {
    code: string;
    message: string;
    processStatusList: ProcessStatusItem[];
  }
  
  export interface ProcessStatusItem {
    name: string;
    pid: number;
    state: number;
    time: string;
  }
  
  // 시스템 모니터링 에러
  export interface SystemMonitoringError {
    code: string;
    message: string;
  }