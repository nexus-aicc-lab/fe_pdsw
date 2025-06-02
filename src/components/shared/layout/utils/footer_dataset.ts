'use client';

import React from 'react';
import { toast } from '../CustomToast';

type AddMessageFunction = (time: string, type: string, message: string) => void;

// Define the type for the invalidate function
type InvalidateFunction = () => void;

/**
 * FooterDataProcessor - Processes SSE event data for the Footer component
 */
export const useFooterDataProcessor = (
  campaigns: any[],
  fetchMain: (params: { session_key: string; tenant_id: number }) => void,
  useAlramPopup: number,
  debouncedInvalidate: InvalidateFunction,
  tenant_id: number,
  addMessageToFooterList: AddMessageFunction
) => {
  
  /**
   * Processes SSE event data and creates appropriate footer messages
   */
  const processEventData = React.useCallback((
    announce: string, 
    command: string, 
    data: any, 
    kind: string, 
    campaign_id: string, 
    tempEventData: any
  ): void => {
    // 시간 생성
    const today = new Date();
    const _time = String(today.getHours()).padStart(2, '0') + ':' + 
                  String(today.getMinutes()).padStart(2, '0') + ':' + 
                  String(today.getSeconds()).padStart(2, '0');

    // 트리 메뉴 데이터를 갱신해야 하는지 확인
    const shouldInvalidateTreeMenu = (
      // 캠페인 추가/수정/삭제
      (announce === '/pds/campaign' && ['INSERT', 'UPDATE', 'DELETE'].includes(command)) ||
      // 캠페인 상태 변경
      (announce === '/pds/campaign/status' && command === 'UPDATE') ||
      // 스킬 추가/수정/삭제
      (announce === '/pds/skill' && ['INSERT', 'UPDATE', 'DELETE'].includes(command)) ||
      // 캠페인 요구스킬 수정
      (announce === '/pds/campaign/skill' && command === 'UPDATE') ||
      // 상담사 리소스 수정/삭제
      (announce === 'update-agent' && ['UPDATE', 'DELETE'].includes(command))
    );

    // 필요한 경우 트리 메뉴 데이터 갱신
    if (shouldInvalidateTreeMenu) {
      debouncedInvalidate();
    }

    // 타입 설정
    let _type = 'Event';
    if (kind === 'event' || kind === 'alram') {
      _type = 'Event';
    }

    // 메시지 초기화
    let _message = '';
    let _message2 = '';

    //운영설정>캠페인별 발신번호설정
    if (announce === '/pds/campaign/calling-number') {
      _message = '캠페인 : ';
      if (command === 'INSERT') {
        _message += '[' + campaign_id + '], 사용자 발신번호 설정 추가 성공';
      } else if (command === 'DELETE') {
        _message += '[' + campaign_id + '], 사용자 발신번호 설정 삭제 성공';
      } else if (command === 'UPDATE') {
        _message += '[' + campaign_id + '], 사용자 발신번호 설정 변경 성공';
      }
      addMessageToFooterList(_time, _type, _message);
    }
    //장비 사용, 장비 사용중지
    else if (announce === 'dialing-device') {
      if (command === 'UPDATE' && data['device_status'] === 'run') {
        _message = 'CIDS 작동중';
        // 커스텀 이벤트 발생 - 장비 상태 변경을 다른 컴포넌트에 알림
        const deviceStatusEvent = new CustomEvent('deviceStatusChange', {
          detail: {
            device_id: data['device_id'].toString(),
            device_status: 'run'
          }
        });
        window.dispatchEvent(deviceStatusEvent);
        addMessageToFooterList(_time, _type, _message);
      } else if (command === 'UPDATE' && data['device_status'] === 'down') {
        _message = 'CIDS 작동중지';
        // 커스텀 이벤트 발생 - 장비 상태 변경을 다른 컴포넌트에 알림
        const deviceStatusEvent = new CustomEvent('deviceStatusChange', {
          detail: {
            device_id: data['device_id'].toString(),
            device_status: 'down'
          }
        });
        window.dispatchEvent(deviceStatusEvent);
        addMessageToFooterList(_time, _type, _message);
      }
    }
    //캠페인수정>콜페이싱 수정
    else if (announce === '/pds/campaign/dial-speed') {
      _message = '[콜페이싱] ';
      if (command === 'UPDATE') {
        const tempCampaign = campaigns.find((campaign) => campaign.campaign_id === Number(campaign_id));
        if (tempCampaign && tempCampaign.dial_mode === 2) {
          _message += '캠페인 아이디 ' + campaign_id + ' , 현재 설정값 ' + data['dial_speed'] * 2;
        } else {
          _message += '캠페인 아이디 ' + campaign_id + ' , 현재 설정값 ' + data['dial_speed'] * 2;
        }
        addMessageToFooterList(_time, _type, _message);
      }
    }
    //캠페인.
    else if (announce === '/pds/campaign') {
      _message = '캠페인 ';
      let _start_flag = '';
      if (data['start_flag'] === 1) {
        _start_flag = '시작';
      } else if (data['start_flag'] === 2) {
        _start_flag = '멈춤';
      } else if (data['start_flag'] === 3) {
        _start_flag = '중지';
      }
      let _end_flag = '';
      if (data['end_flag'] === 1) {
        _end_flag = '진행중';
      } else if (data['end_flag'] === 2) {
        _end_flag = '완료';
      }

      if (command === 'INSERT') {
        _message += '추가, 캠페인 아이디 : ' + campaign_id + ' , 캠페인 이름 : ' + data['campaign_name'] + ' , 동작상태 : ' + _start_flag + ', 완료구분 : ' + _end_flag;
        _message2 = `[EVENT] [${campaign_id}] 캠페인 추가`;

        // 캠페인 추가 시 토스트 메시지
        if (useAlramPopup === 1) {
          toast.event(_message2, {
            duration: 6000
          });
        }
        addMessageToFooterList(_time, _type, _message);
      } else if (command === 'UPDATE') {
        _message += '수정, 캠페인 아이디 : ' + campaign_id + ' , 캠페인 이름 : ' + data['campaign_name'] + ' , 동작상태 : ' + _start_flag + ', 완료구분 : ' + _end_flag;
        _message2 = `[EVENT] [${campaign_id}] 캠페인 수정`;

        // 캠페인 수정 시 토스트 메시지
        if (useAlramPopup === 1) {
          toast.event(_message2, {
            duration: 6000
          });
        }
        addMessageToFooterList(_time, _type, _message);
      } else if (command === 'DELETE') {
        _message += '삭제, 캠페인 아이디 : ' + campaign_id;
        _message2 = `[EVENT] [${campaign_id}] 캠페인 삭제`;

        // 캠페인 삭제 시 토스트 메시지
        if (useAlramPopup === 1) {
          toast.event(_message2, {
            duration: 6000
          });
        }
        addMessageToFooterList(_time, _type, _message);
      }

      fetchMain({
        session_key: '',
        tenant_id: tenant_id,
      });

      if (data['start_flag'] === 3) {
        if (useAlramPopup === 1) {
          toast.event(`[EVENT] [${campaign_id}] 캠페인 상태 변경`, {
            duration: 6000,
          });
        }
      }
    }
    //스킬.
    else if (announce === '/pds/skill/agent-list') {
      const tempAgentIdList = data['agent_id'];
      const _skillId = data['skill_id'];

      if (tempAgentIdList && tempAgentIdList.length > 0) {
        let actionType = '';
        if (command === 'UPDATE' || command === 'INSERT') {
          actionType = '할당';
        } else if (command === 'DELETE') {
          actionType = '해제';
        }

        const _message = '[EVENT] 상담사 스킬 ' + actionType;
        addMessageToFooterList(_time, _type, _message);

        // 토스트 알림은 한 번만 표시
        if (useAlramPopup === 1) {
          toast.event(`[EVENT] [${_skillId}] 상담사 스킬 ${actionType}`, {
            duration: 6000
          });
        }
      }
    }
    //스킬편집
    else if (announce === '/pds/skill') {
      _message = '[스킬 ';
      if (command === 'INSERT') {
        _message += '추가] 스킬 아이디 : ' + data['skill_id'] + ' , 스킬 이름 : ' + data['skill_name'];
      } else if (command === 'UPDATE') {
        _message += '변경] 스킬 아이디 : ' + data['skill_id'] + ' , 스킬 이름 : ' + data['skill_name'];
      } else if (command === 'DELETE') {
        _message += '삭제] 스킬 아이디 : ' + data['skill_id'] + ' , 스킬 이름 : ' + data['skill_name'];
      }
      addMessageToFooterList(_time, _type, _message);
    }
    //캠페인 요구스킬 수정
    else if (announce === '/pds/campaign/skill') {
      if (command === 'UPDATE') {
        _message = '캠페인 요구스킬 수정, 캠페인 아이디 : ' + campaign_id;
        addMessageToFooterList(_time, _type, _message);
      }
    }
    //상담사 자원 수정/삭제
    else if (announce === 'update-agent') {
      _message = '[상담사 자원 ';
      if (command === 'UPDATE') {
        _message += '수정] 상담사 아이디 : ' + data['employee_id'] + ' , 상담사 이름 : ' + data['agent_name'];
      } else if (command === 'DELETE') {
        _message += '삭제] 상담사 아이디 : ' + data['employee_id'] + ' , 상담사 이름 : ' + data['agent_name'];
      }
      addMessageToFooterList(_time, _type, _message);
    }
    //캠페인수정>동작시간 추가
    else if (announce === '/pds/campaign/schedule') {
      _message = '캠페인 스케쥴';
      if (command === 'INSERT') {
        _message += '수정, 캠페인 아이디 : ' + campaign_id;
        addMessageToFooterList(_time, _type, _message);
      }
      else if (command === 'UPDATE') {
        _message += '변경, 캠페인 아이디 : ' + campaign_id;
        addMessageToFooterList(_time, _type, _message);
      }
      else if (command === 'DELETE') {
        _message += '삭제, 캠페인 아이디 : ' + campaign_id;
        addMessageToFooterList(_time, _type, _message);
      }
    }
    //캠페인 동작상태 변경
    else if (announce === '/pds/campaign/status') {
      if (command === 'UPDATE') {
        let _start_flag = '';
        if (data['campaign_status'] === 1) {
          _start_flag = '시작';
        } else if (data['campaign_status'] === 2) {
          _start_flag = '멈춤';
        } else if (data['campaign_status'] === 3) {
          _start_flag = '중지';
        }

        // 푸터 로그 메시지
        _message = '캠페인 동작상태 변경, 캠페인 아이디 : ' + campaign_id + ', 동작상태: ' + _start_flag + ', 완료구분: 진행중';

        // 토스트 알림 표시 (한번만 표시)
        if (useAlramPopup === 1) {
          toast.event(`[EVENT] [${campaign_id}] 캠페인 상태 변경`, {
            duration: 6000,
          });
        }

        // 푸터 데이터 리스트에 추가
        addMessageToFooterList(_time, _type, _message);
      }
    }
    //발신리스트등록
    else if (announce === '/pds/campaign/calling-list') {
      if (command === 'INSERT') {
        let list_flag = '';
        if (data['list_flag'] === 'I') {
          list_flag = '신규리스트';
        } else if (data['list_flag'] === 'A') {
          list_flag = '추가리스트';
        } else if (data['list_flag'] === 'D') {
          list_flag = '삭제리스트';
        } else if (data['list_flag'] === 'L') {
          list_flag = '초기화';
        }
        _message = '발신리스트등록, 캠페인 아이디 : ' + campaign_id + ' , 리스트구분 : ' + list_flag;
        _message2 = `[EVENT] [${campaign_id}] 발신리스트 ${list_flag} 등록`;

        // 토스트 알림 표시
        if (useAlramPopup === 1) {
          toast.event(_message2, {
            duration: 6000
          });
        }

        addMessageToFooterList(_time, _type, _message);
      }
    }
  }, [campaigns, useAlramPopup, tenant_id, debouncedInvalidate, addMessageToFooterList, fetchMain]);

  return { processEventData };
};