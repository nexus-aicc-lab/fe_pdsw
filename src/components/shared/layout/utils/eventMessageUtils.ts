// C:\nproject\fe_pdsw\src\components\shared\layout\utils\eventMessageUtils.ts

import { QueryClient } from "@tanstack/react-query";

export type FooterDataType = {
  time: string;
  type: string;
  message: string;
};

type EventProcessResult = {
  messageList: FooterDataType[];
  shouldFetchMain: boolean;
  toastMessage: string;
  shouldFireDeviceEvent?: boolean;
  deviceEventDetails?: {
    device_id: string;
    device_status: string;
  };
};

// 시간 포맷팅 유틸 함수
export const formatCurrentTime = (): string => {
  const today = new Date();
  return String(today.getHours()).padStart(2, '0') + ':' + 
         String(today.getMinutes()).padStart(2, '0') + ':' + 
         String(today.getSeconds()).padStart(2, '0');
};

/**
 * 이벤트 메시지 처리 유틸리티 함수
 * 
 * @param announce 이벤트 알림 유형
 * @param command 이벤트 명령 (INSERT, UPDATE, DELETE 등)
 * @param data 이벤트 데이터
 * @param kind 이벤트 종류
 * @param campaigns 캠페인 목록
 * @param queryClient 쿼리 클라이언트
 * @param tenant_id 테넌트 ID
 * @param role_id 역할 ID
 * @returns 처리 결과 객체
 */
export const processEventMessage = (
  announce: string,
  command: string,
  data: any,
  kind: string,
  campaigns: any[],
  queryClient: QueryClient,
  tenant_id: string | number,
  role_id: string | number
): EventProcessResult => {
  // 현재 시간
  const currentTime = formatCurrentTime();
  
  // 기본 이벤트 타입
  const eventType = 'Event';
  
  // 결과 객체 초기화
  const messageList: FooterDataType[] = [];
  let shouldFetchMain = false;
  let toastMessage = '';
  let shouldFireDeviceEvent = false;
  let deviceEventDetails = undefined;

  // 메시지 변수
  let message = '';
  
  // 운영설정>캠페인별 발신번호설정
  if (announce === '/pds/campaign/calling-number') {
    message = '캠페인 : ';
    if (command === 'INSERT') {
      message += '[' + data['campaign_id'] + '], 사용자 발신번호 설정 추가 성공';
    } else if (command === 'DELETE') {
      message += '[' + data['campaign_id'] + '], 사용자 발신번호 설정 삭제 성공';
    } else if (command === 'UPDATE') {
      message += '[' + data['campaign_id'] + '], 사용자 발신번호 설정 변경 성공';
    }
  }
  
  // 장비 사용, 장비 사용중지
  else if (announce === 'dialing-device') {
    if (command === 'UPDATE' && data['device_status'] === 'run') {
      message = 'CIDS 작동중';
      shouldFireDeviceEvent = true;
      deviceEventDetails = {
        device_id: data['device_id'].toString(),
        device_status: 'run'
      };
    } else if (command === 'UPDATE' && data['device_status'] === 'down') {
      message = 'CIDS 작동중지';
      shouldFireDeviceEvent = true;
      deviceEventDetails = {
        device_id: data['device_id'].toString(),
        device_status: 'down'
      };
    }
  }
  
  // 캠페인수정>콜페이싱 수정
  else if (announce === '/pds/campaign/dial-speed') {
    message = '[콜페이싱] ';
    if (command === 'UPDATE') {
      const tempCampaign = campaigns.find((campaign) => campaign.campaign_id === data['campaign_id']);
      if (tempCampaign && tempCampaign.dial_mode === 2) {
        message += '캠페인 아이디 ' + data['campaign_id'] + ' , 현재 설정값 ' + data['dial_speed'] * 2;
      } else {
        message += '캠페인 아이디 ' + data['campaign_id'] + ' , 현재 설정값 ' + data['dial_speed'];
      }
    }
  }
  
  // 캠페인
  else if (announce === '/pds/campaign') {
    message = '캠페인 ';
    let startFlag = '';
    if (data['start_flag'] === 1) {
      startFlag = '시작';
    } else if (data['start_flag'] === 2) {
      startFlag = '멈춤';
    } else if (data['start_flag'] === 3) {
      startFlag = '중지';
    }
    
    let endFlag = '';
    if (data['end_flag'] === 1) {
      endFlag = '진행중';
    } else if (data['end_flag'] === 2) {
      endFlag = '완료';
    }
    
    if (command === 'INSERT') {
      message += '추가, 캠페인 아이디 : ' + data['campaign_id']
        + ' , 캠페인 이름 : ' + data['campaign_name']
        + ' , 동작상태 : ' + startFlag
        + ', 완료구분 : ' + endFlag;
      queryClient.invalidateQueries({ queryKey: ["treeMenuDataForSideMenu", tenant_id, role_id] });
      queryClient.invalidateQueries({ queryKey: ["campaignTreeDataForCampaignGroupTab", tenant_id] });
    } else if (command === 'UPDATE') {
      message += '수정, 캠페인 아이디 : ' + data['campaign_id'] + ' , 캠페인 이름 : '
        + data['campaign_name']
        + ' , 동작상태 : ' + startFlag
        + ', 완료구분 : ' + endFlag;
      queryClient.invalidateQueries({ queryKey: ["treeMenuDataForSideMenu", tenant_id, role_id] });
      queryClient.invalidateQueries({ queryKey: ["campaignTreeDataForCampaignGroupTab", tenant_id] });
    } else if (command === 'DELETE') {
      message += '삭제, 캠페인 아이디 : ' + data['campaign_id'];
      queryClient.invalidateQueries({ queryKey: ["treeMenuDataForSideMenu", tenant_id, role_id] });
      queryClient.invalidateQueries({ queryKey: ["campaignTreeDataForCampaignGroupTab", tenant_id] });
    }
    
    shouldFetchMain = true;
    
    if (data['start_flag'] === 3) {
      messageList.push({
        time: currentTime,
        type: eventType,
        message: '캠페인 동작상태 변경, 캠페인 아이디 : ' + data['campaign_id'] + ' , 캠페인 이름 : ' + data['campaign_name'] + ' , 동작상태 : ' + startFlag + ', 완료구분 : ' + endFlag
      });
      
      toastMessage = ' , 캠페인 이름 : ' + ' , 동작상태 : ' + startFlag;
    }
  }
  
  // 스킬
  else if (announce === '/pds/skill/agent-list') {
    const tempAgentIdList = data['agent_id'];
    const skillId = data['skill_id'];
    
    for (let i = 0; i < tempAgentIdList.length; i++) {
      let tempMessage = '[스킬 ';
      if (command === 'UPDATE') {
        tempMessage += '추가] 스킬 아이디 : ' + skillId + ' , 상담사 아이디 : ' + tempAgentIdList[i];
      } else if (command === 'DELETE') {
        tempMessage += '해제] 스킬 아이디 : ' + skillId + ' , 상담사 아이디 : ' + tempAgentIdList[i];
      } else if (command === 'INSERT') {
        tempMessage += '추가] 스킬 아이디 : ' + skillId + ' , 상담사 아이디 : ' + tempAgentIdList[i];
      }
      
      messageList.push({
        time: currentTime,
        type: eventType,
        message: tempMessage
      });
    }
    
    // 토스트 메시지 준비
    const actionType = command === 'UPDATE' || command === 'INSERT' ? '추가' : '해제';
    toastMessage = `[스킬 ${actionType}] 스킬 아이디 : ${skillId}\n${tempAgentIdList.length}명의 상담사 변경됨`;
    
    message = ''; // 이미 messageList에 추가했으므로 message는 비워둠
  }
  
  // 스킬편집
  else if (announce === '/pds/skill') {
    message = '[스킬 ';
    if (command === 'INSERT') {
      message += '추가] 스킬 아이디 : ' + data['skill_id'] + ' , 스킬 이름 : ' + data['skill_name'];
    } else if (command === 'DELETE') {
      message += '삭제] 스킬 아이디 : ' + data['skill_id'] + ' , 스킬 이름 : ' + data['skill_name'];
    } else if (command === 'UPDATE') {
      message += '수정] 스킬 아이디 : ' + data['skill_id'] + ' , 스킬 이름 : ' + data['skill_name'];
    }
  }
  
  // 캠페인 요구스킬 수정
  else if (announce === '/pds/campaign/skill') {
    message = '캠페인 요구스킬 ';
    if (command === 'UPDATE') {
      message += '수정, 캠페인 아이디 : ' + data['campaign_id'];
    } else {
      message = '';
    }
  }
  
  // 상담사 자원 수정/삭제
  else if (announce === 'update-agent') {
    message = '[상담사 자원 ';
    if (command === 'UPDATE') {
      message += '수정] 상담사 아이디 : ' + data['employee_id'] + ' , 상담사 이름 : ' + data['agent_name'];
    } else if (command === 'DELETE') {
      message += '삭제] 상담사 아이디 : ' + data['employee_id'] + ' , 상담사 이름 : ' + data['agent_name'];
    }
  }
  
  // 캠페인수정>동작시간 추가
  else if (announce === '/pds/campaign/schedule') {
    message = '캠페인 스케쥴';
    const tempCampaign = campaigns.filter((campaign) => campaign && campaign.campaign_id === Number(data['campaign_id']));
    const campaignName = tempCampaign && tempCampaign.length > 0 ? tempCampaign[0].campaign_name : '';
    if (command === 'INSERT') {
      message += '수정, 캠페인 아이디 : ' + data['campaign_id'] + ' , 캠페인 이름 : ' + campaignName;
    } else {
      message = '';
    }
  }
  
  // 캠페인 동작상태 변경
  else if (announce === '/pds/campaign/status') {
    message = '캠페인 동작상태 ';
    if (command === 'UPDATE') {
      let statusFlag = '';
      if (data['campaign_status'] === 1) {
        statusFlag = '시작';
      } else if (data['campaign_status'] === 2) {
        queryClient.invalidateQueries({ queryKey: ["treeMenuDataForSideMenu", tenant_id, role_id] });
        statusFlag = '멈춤';
      } else if (data['campaign_status'] === 3) {
        queryClient.invalidateQueries({ queryKey: ["treeMenuDataForSideMenu", tenant_id, role_id] });
        statusFlag = '중지';
      }
      
      const tempCampaign = campaigns.filter((campaign) => campaign && campaign.campaign_id === Number(data['campaign_id']));
      const campaignName = tempCampaign && tempCampaign.length > 0 ? tempCampaign[0].campaign_name : '';
      
      message += '변경, 캠페인 아이디 : ' + data['campaign_id'] + ' , 캠페인 이름 : ' + campaignName + ' , 동작상태 : ' + statusFlag + ' , 완료구분 : 진행중';
      
      // 토스트 메시지 준비
      toastMessage = `캠페인 이름 : ${campaignName}\n동작상태 : ${statusFlag}`;
      
      shouldFetchMain = true;
    }
  }
  
  // 발신리스트등록
  else if (announce === '/pds/campaign/calling-list') {
    message = '발신리스트등록, ';
    if (command === 'INSERT') {
      let listFlag = '';
      if (data['list_flag'] === 'I') {
        listFlag = '신규리스트';
      } else if (data['list_flag'] === 'A') {
        listFlag = '추가리스트';
      } else if (data['list_flag'] === 'D') {
        listFlag = '삭제리스트';
      } else if (data['list_flag'] === 'L') {
        listFlag = '초기화';
      }
      
      message += '캠페인 아이디 : ' + data['campaign_id'] + ' , 리스트구분 : ' + listFlag;
    }
  }
  
  // 단일 메시지가 있고 messageList에 이미 추가되지 않았다면, 메시지 추가
  if (message !== '' && messageList.length === 0) {
    messageList.push({
      time: currentTime,
      type: eventType,
      message: message
    });
  }
  
  // 캠페인 상태에 따른 토스트 메시지가 없으면 기본 토스트 메시지 생성
  if (toastMessage === '' && message !== '' && announce === '/pds/campaign/status') {
    let statusFlag = '';
    if (data['campaign_status'] === 1) {
      statusFlag = '시작';
    } else if (data['campaign_status'] === 2) {
      statusFlag = '멈춤';
    } else if (data['campaign_status'] === 3) {
      statusFlag = '중지';
    }
    
    const tempCampaign = campaigns.filter((campaign) => 
      campaign && campaign.campaign_id === Number(data['campaign_id'])
    );
    
    const campaignName = tempCampaign && tempCampaign.length > 0 ? tempCampaign[0].campaign_name : '';
    toastMessage = `캠페인 이름 : ${campaignName}\n동작상태 : ${statusFlag}`;
  }
  
  return {
    messageList,
    shouldFetchMain,
    toastMessage,
    shouldFireDeviceEvent,
    deviceEventDetails
  };
};