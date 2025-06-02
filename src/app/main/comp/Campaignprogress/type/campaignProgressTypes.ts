// C:\nproject\fe_pdsw3\src\app\main\comp\Campaignprogress\type\campaignProgressTypes.ts

import { CampaignProgressInformationResponseDataType } from "@/features/monitoring/types/monitoringIndex";

// 실제 API 연동 시 사용할 데이터 타입
export interface DispatchStatusDataType extends CampaignProgressInformationResponseDataType {
  strFlag: string;
  senderId: number;
  startFlag: string;
  endFlag: string;
  id: string;
  centerId: string;
  campaignName: string;
  progressRate: number;
  successRateList: number;
  nonSendCount: number;
  successRateSend: number;
  dialAttemptCnt: number;
  failSendCount: number;
}

export interface TreeRow extends DispatchStatusDataType {
  parentId?: string;
  isExpanded?: boolean;
  level: number;
  hasChildren?: boolean;
  children?: TreeRow[];
  [key: string]: any;
}