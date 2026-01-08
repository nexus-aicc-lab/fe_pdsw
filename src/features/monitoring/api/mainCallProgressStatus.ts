// src/features/campaignManager/api/mainCampaignProgressInformation.ts
import { axiosRedisInstance } from '@/lib/axios';
import { getCookie } from '@/lib/cookies';

// 발신진행상태 요청 
export interface CallProgressStatusRequest {
  centerId: string;
  tenantId: string;
  campaignId: string;
  agentIds?: string[];
  maskInfo: number;
}

// 발신진행상태 응답
export interface CallProgressStatusResponse {
  code: string;
  message: string;
  waitingCounselorCnt: number;
  sendingProgressStatusList: CallProgressStatusResponseDataType[];
  campaignId: string;
}

// 발신진행상태 응답 데이터 타입
interface CallProgressStatusResponseDataType {
  campaignId: number;                 //캠페인ID
  campaignName: string;               //캠페인 이름
  waitingLstCnt: number;              //대기리스트 건수
  event: number;                      //채널에 발생한 마지막 이벤트(0(NONE), 1(ON_HOOK), 2(OFF_HOOK), 3(PRESS_DIGIT), 4(NETWORK_DELAY), 5(INTERRUPT_CALL), 6(RINGBACK), 7(CONNECT), 8(DETECT_BEGIN), 9(DETECT_END), 10(ROUTE))
  dialSequence: number;               //발신 일련 번호
  dialResult: number;                 //발신 결과 코드(0(NONE), 1(MAN), 2(BUSY), 3(NO_ANSWER), 4(FAX_MODEM), 5(ANSWERING_MACHINE), 6(ETC_FAIL), 7(INVALID_NUMBER), 8(DIALING), 9(LINE_STOP), 10(CUSTOMER_ONHOOK), 11(SILENCE), 12(DIALTONE_SILENCE), 13(BLACK_LIST), 14(ROUTE_FAIL), 15(BEFORE_BLACKLIST), 2501(MACHINE_BUSY), 2502(MACHINE_NOANSWER), 2503(MACHINE_POWEROFF), 2504(MACHINE_ROAMING), 2505(MACHINE_MISSING_NUMBER), 2506(MACHINE_ETC))
  customerName: string;               //고객 이름
  customerKey: string;                //고객 키
  phoneNumber: string[];              //발신 번호
  phoneDialCount: number[];           //발신 번호 별 시도 회수
  dialedPhone: number;                //발신 번호 인덱스
  reuseCount: number;                 //캠페인 재사용 회수 : 1(최초 발신), 2~(재발신)
  retryCall: number;                  //재시도 여부 : 0(재시도 없음), 1(재시도 있음)
}

// 발신진행상태 요청
export const fetchCallProgressStatus = async (credentials: CallProgressStatusRequest): Promise<CallProgressStatusResponse> => {
  const callProgressStatusRequestData = {
    centerId: credentials.centerId,
    tenantId: credentials.tenantId,
    campaignId: credentials.campaignId,
    agentIds: credentials.agentIds || [],
    maskInfo: credentials.maskInfo,
    sessionKey: getCookie('session_key')
  };

  try {
    const { data } = await axiosRedisInstance.post<CallProgressStatusResponse>(
      `/monitor/tenant/campaign/dial`,
      callProgressStatusRequestData 
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(error.response?.data?.result_code + '||' + error.response?.data?.result_msg || '데이터 가져오기 실패');
  }
};