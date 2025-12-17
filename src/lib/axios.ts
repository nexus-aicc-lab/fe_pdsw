// src/lib/axios.ts
import axios from 'axios';
import { getCookie } from './cookies';
import { customAlertService } from '@/components/shared/layout/utils/CustomAlertService';
import logoutFunction from '@/components/common/logoutFunction';

export const axiosInstance = axios.create({
  baseURL: '/pds',
  withCredentials: true,
  timeout: 20000 // 20초
});

export const axiosRedisInstance = axios.create({
  baseURL: '/api_upds/v1',
  withCredentials: true,
  timeout: 20000 // 20초
  
});

let sessionCheckYn = true;

axiosRedisInstance.interceptors.request.use(
  (config) => {
    // sessionCheckYn이 false이면 요청을 막음
    if (!sessionCheckYn) {
      return Promise.reject({
        message: '세션 체크가 비활성화되어 API 요청이 차단되었습니다.',
        config,
      });
    }
    
    const sessionKey = getCookie('session_key');

    if (sessionKey && config.headers) {
      // Session-Cookie가 아닌 Session-Key로 변경
      config.headers['Session-Key'] = sessionKey;
    }
    return config;
  },
  (error) => {

    // console.log("error ???????????????", error);

    if (error.response.data.result_code === 5) {
      // 세션 만료 시 알럿 표시 후 로그인 페이지로 리다이렉트
      customAlertService.error('API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.', '세션 만료', () => {
        // console.log("### axiosRedisInstance REQUEST error throw", error);
        logoutFunction({ portcheck: false });
        window.location.href = '/login';
      });
    }

    return Promise.reject(error);
  }
);

// let sessionCheckYn = true;

// 요청 인터셉터 추가
axiosInstance.interceptors.request.use(
  (config) => {
    // sessionCheckYn이 false이면 요청을 막음
    if (!sessionCheckYn) {
      return Promise.reject({
        message: '세션 체크가 비활성화되어 API 요청이 차단되었습니다.',
        config,
      });
    }
    
    const sessionKey = getCookie('session_key');

    if (sessionKey && config.headers) {
      // Session-Cookie가 아닌 Session-Key로 변경
      config.headers['Session-Key'] = sessionKey;
    }
    return config;
  },
  (error) => {

    // console.log("error ???????????????", error);

    if (error.response.data.result_code === 5) {
      // 세션 만료 시 알럿 표시 후 로그인 페이지로 리다이렉트
      customAlertService.error('API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.', '세션 만료', () => {
        // console.log("### axiosInstance REQUEST error response", error);
        logoutFunction({ portcheck: false });
        window.location.href = '/login';
      });
    }

    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  async (response) => {
    // console.log("here 8888888888888 response", response);
    
    if (response.data.result_code === 5) {
      sessionCheckYn = false;
      // 세션 만료 시 알럿 표시 후 로그인 페이지로 리다이렉트
      customAlertService.error('API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.', '세션 만료', () => {
        // console.log("### axiosInstanc RESPONSE data error : ", response);
        logoutFunction({ portcheck: false });
        window.location.href = '/login';
      });
    }

    const url = response.config.url || '';
    const userId = getCookie('id');
    if( url !== '/login' && userId != null && userId != '' ) {
      let activation = '';
      let eventName = '';
      let queryType = 'R';
      let description = '';
      if( url === '/login' ) {
        activation = '로그인';
        eventName = 'login';
      } else if( url === '/collections/tenant' ) {
        activation = '테넌트정보조회';
        eventName = 'tenants';
      } else if( url === '/collections/phone-description' ) {
        activation = '전화번호설명템플릿조회';
        eventName = 'phone-description';
      } else if( url === '/phone-description' ) {
        if( response.config.method === 'post' ) {
          activation = '전화번호설명템플릿생성';
          eventName = 'description';
          queryType = 'C';
        }else if( response.config.method === 'put' ) {
          activation = '전화번호설명템플릿수정';
          eventName = 'description';
          queryType = 'U';
        }else if( response.config.method === 'delete' ) {
          activation = '전화번호설명템플릿삭제';
          eventName = 'description';
          queryType = 'D';
        }
      } else if( url === '/collections/dialing-device' ) {
        activation = '다이얼링장비조회';
        eventName = 'dialing-device';
      } else if( url === '/dialing-device' ) {
        if( response.config.method === 'post' ) {
          activation = '다이얼링장비생성';
          eventName = 'dialing-device';
          queryType = 'C';
        }else if( response.config.method === 'put' ) {
          activation = '다이얼링장비수정';
          eventName = 'dialing-device';
          queryType = 'U';
        }else if( response.config.method === 'delete' ) {
          activation = '다이얼링장비삭제';
          eventName = 'dialing-device';
          queryType = 'D';
        }
      } else if( url === '/collections/channel-group' ) {
        activation = '채널그룹조회';
        eventName = 'channel-group';
      } else if( url === '/channel-group' ) {
        if( response.config.method === 'post' ) {
          activation = '채널그룹생성';
          eventName = 'channel-group';
          queryType = 'C';
        }else if( response.config.method === 'put' ) {
          activation = '채널그룹수정';
          eventName = 'channel-group';
          queryType = 'U';
        }else if( response.config.method === 'delete' ) {
          activation = '채널그룹삭제';
          eventName = 'channel-group';
          queryType = 'D';
        }
      } else if( url === '/collections/channel-assign' ) {
        activation = '채널할당조회';
        eventName = 'channel-assign';
      } else if( url === '/channel-assign' ) {
        if( response.config.method === 'put' ) {
          activation = '채널할당수정';
          eventName = 'channel-assign';
          queryType = 'U';
        }
      } else if( url === '/collections/skill' || url === 'collections/skill' ) {
        activation = '스킬마스터목록조회';
        eventName = 'skills';
      } else if( url.indexOf('skills') > -1 && url.indexOf('/agent-list') == -1 ) {
        if( response.config.method === 'post' ) {
          activation = '스킬마스터생성';
          eventName = 'skills';
          queryType = 'C';
        } else if( response.config.method === 'put' ) {
          activation = '스킬마스터수정';
          eventName = 'skills';
          queryType = 'U';
        } else if( response.config.method === 'delete' ) {
          activation = '스킬마스터삭제';
          eventName = 'skills';
          queryType = 'D';
        }
      } else if( url === '/collections/skill-agent' ) {
        activation = '스킬할당상담사';
        eventName = 'skill-agent';
      } else if( url.indexOf('skills') > -1 && url.indexOf('/agent-list') > -1 ) {
        if( response.config.method === 'post' ) {
          activation = '스킬할당상담사생성';
          eventName = 'skill-agent';
          queryType = 'C';
        } else if( response.config.method === 'delete' ) {
          activation = '스킬할당상담사삭제';
          eventName = 'skill-agent';
          queryType = 'D';
        }
      } else if( url === '/collections/skill-campaign' ) {
        activation = '스킬할당캠페인';
        eventName = 'skill-campaign';
      } else if( url === '/collections/agent-skill' ) {
        activation = '상담사보유스킬';
        eventName = 'agent-skill';
      } else if( url === '/collections/campaign-skill' || url === 'collections/campaign-skill' ) {
        activation = '캠페인요구스킬조회';
        eventName = 'skill';
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/skill') > -1 ) {
        if( response.config.method === 'put' ) {
          activation = '캠페인요구스킬수정';
          eventName = 'campaign-skill';
          queryType = 'U';
        }
      } else if( url === '/collections/maxcall-init-time' ) {
        activation = '분배제한초기화시각조회';
        eventName = 'maxcall-init-time';
      } else if( url === '/maxcall-init-time' ) {
        activation = '분배제한초기화시각수정';
        eventName = 'maxcall-init-time';
        queryType = 'U';
      } else if( url === '/collections/suspended-skill' ) {
        activation = '일지중지캠페인조회';
        eventName = 'suspended-skill';
      } else if( url === '/suspended-skill' ) {
        activation = '일지중지캠페인삭제';
        eventName = 'suspended-skill';
        queryType = 'D';
      } else if( url === 'collections/campaign-list' ) {
        activation = '캠페인리스트조회';
        eventName = 'campaign-list';
      } else if( url === '/collections/campaign' ) {
        activation = '캠페인마스터목록조회';
        eventName = 'campaigns';
      } else if( url.indexOf('/collections') > -1 && url.split('/').length === 2 ) {
        if( response.config.method === 'post' ) {
          activation = '캠페인마스터생성';
          eventName = 'campaigns';
          queryType = 'C';
        }else if( response.config.method === 'put' ) {
          activation = '캠페인마스터수정';
          eventName = 'campaigns';
          queryType = 'U';
        }else if( response.config.method === 'delete' ) {
          activation = '캠페인마스터삭제';
          eventName = 'campaigns';
          queryType = 'D';
        }
      } else if( url.indexOf('/status') > -1 ) {
        const status = JSON.parse(response.config.data).request_data.campaign_status === 1 ? '시작': 
          JSON.parse(response.config.data).request_data.campaign_status === 2 ?'멈춤':'중지';
        activation = '캠페인상태변경';
        eventName = 'updateStatus';
        queryType = 'U';
        description = '캠페인 상태를 "' + status + '"으로 변경';
      } else if( url === '/collections/campaign-reserved-call' ) {
        activation = '예약호마스터조회';
        eventName = 'campaign-reserved-call';
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/reserved-call') > -1 ) {
        if( response.config.method === 'post' ) {
          activation = '예약호마스터생성';
          eventName = 'campaign-reserved-call';
          queryType = 'C';
        } else if( response.config.method === 'put' ) {
          activation = '예약호마스터수정';
          eventName = 'campaign-reserved-call';
          queryType = 'U';
        } else if( response.config.method === 'delete' ) {
          activation = '예약호마스터삭제';
          eventName = 'campaign-reserved-call';
          queryType = 'D';
        }
      } else if( url === '/collections/campaign-scheduled-redial' ) {
        activation = '캠페인예약재발신정보조회';
        eventName = 'campaign-scheduled-redial';
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/scheduled-redial') > -1 ) {
        if( response.config.method === 'post' ) {
          activation = '캠페인예약재발신정보생성';
          eventName = 'campaign-scheduled-redial';
          queryType = 'C';
        } else if( response.config.method === 'put' ) {
          activation = '캠페인예약재발신정보수정';
          eventName = 'campaign-scheduled-redial';
          queryType = 'U';
        } else if( response.config.method === 'delete' ) {
          activation = '캠페인예약재발신정보삭제';
          eventName = 'campaign-scheduled-redial';
          queryType = 'D';
        }
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/current-redial') > -1 ) {
        activation = '캠페인재발신추출수정';
        eventName = 'campaign-current-redial';
        queryType = 'U';
      } else if( url === '/collections/campaign-redial-preview' ) {
        activation = '캠페인재발신미리보기';
        eventName = 'campaign-redial-preview';
      } else if( url === '/collections/campaign-schedule' ) {
        activation = '캠페인스케줄정보조회';
        eventName = 'campaign-schedule';
      } else if( url.indexOf('/schedule') > -1 ) {
        if( response.config.method === 'post' ) {
          activation = '캠페인스케줄정보생성';
          eventName = 'campaign-schedule';
          queryType = 'C';
        }else if( response.config.method === 'put' ) {
          activation = '캠페인스케줄정보수정';
          eventName = 'campaign-schedule';
          queryType = 'U';
        }else if( response.config.method === 'delete' ) {
          activation = '캠페인스케줄정보삭제';
          eventName = 'campaign-schedule';
          queryType = 'D';
        }
      } else if( url === '/collections/campaign-calling-number' ) {
        activation = '캠페인발신번호조회';
        eventName = 'campaign-calling-number';
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/calling-number') > -1 ) {
        if( response.config.method === 'post' ) {
          activation = '캠페인발신번호생성';
          eventName = 'campaign-calling-number';
          queryType = 'C';
        } else if( response.config.method === 'put' ) {
          activation = '캠페인발신번호수정';
          eventName = 'campaign-calling-number';
          queryType = 'U';
        } else if( response.config.method === 'delete' ) {
          activation = '캠페인발신번호삭제';
          eventName = 'campaign-calling-number';
          queryType = 'D';
        }
      } else if( url === '/collections/maxcall-ext' ) {
        activation = '캠페인분배제한조회';
        eventName = 'maxcall-ext';
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/maxcall-ext') > -1 ) {
        if( response.config.method === 'post' ) {
          activation = '캠페인분배제한생성';
          eventName = 'maxcall-ext';
          queryType = 'C';
        } else if( response.config.method === 'put' ) {
          activation = '캠페인분배제한수정';
          eventName = 'maxcall-ext';
          queryType = 'U';
        } else if( response.config.method === 'delete' ) {
          activation = '캠페인분배제한삭제';
          eventName = 'maxcall-ext';
          queryType = 'D';
        }
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/calling-list') > -1 ) {
        if( response.config.method === 'post' ) {
          activation = '발신리스트업로드추가';
          eventName = 'campaign-calling-list';
          queryType = 'C';
        } else if( response.config.method === 'delete' ) {
          activation = '발신리스트업로드삭제';
          eventName = 'campaign-calling-list';
          queryType = 'D';
        }
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/black-list') > -1 ) {
        if( response.config.method === 'post' ) {
          activation = '블랙리스트업로드추가';
          eventName = 'campaign-black-list';
          queryType = 'C';
        } else if( response.config.method === 'delete' ) {
          activation = '블랙리스트업로드삭제';
          eventName = 'campaign-black-list';
          queryType = 'D';
        }
      } else if( url === '/collections/campaign-blacklist-max' ) {
        activation = '블랙리스트최대수량조회';
        eventName = 'campaign-blacklist-max';
      } else if( url === '/collections/campaign-blacklist-count' ) {
        activation = '블랙리스트수량조회';
        eventName = 'campaign-blacklist-count';
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/dial-speed') > -1 ) {
        activation = '캠페인발신속도수정';
        eventName = 'campaign-black-list';
        queryType = 'U';
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/callback-list') > -1 ) {
        activation = '캠페인콜백리스트추가';
        eventName = 'campaign-callback-list';
        queryType = 'C';
      } else if( url === '/collections/campaign-agent' ) {
        activation = '캠페인소속상담사조회';
        eventName = 'campaignAgents';
      } else if( url === '/collections/agent-campaign' ) {
        activation = '상담사소속캠페인조회';
        eventName = 'agentCampaigns';
      } else if( url === '/collections/callback-campaign' ) {
        activation = '콜백캠페인조회';
        eventName = 'callback-campaign';
      } else if( url === '/collections/campaign-history' ) {
        activation = '캠페인운영이력조회';
        eventName = 'campaign-history';
      } else if( url === '/collections/dial-result' ) {
        activation = '캠페인발신결과조회';
        eventName = 'dial-result';
      } else if( url === '/collections/agent-ready-count' ) {
        activation = '캠페인대기상담사수조회';
        eventName = 'agent-ready-count';
      } else if( url === '/collections/suspended-campaign' ) {
        activation = '일지중지캠페인조회';
        eventName = 'suspended-campaign';
      } else if( url === '/suspended-campaign' ) {
        activation = '일지중지캠페인삭제';
        eventName = 'suspended-campaign';
        queryType = 'D';
      } else if( url === '/collections/campaign-group' || url === 'collections/campaign-group' ) {
        activation = '캠페인그룹정보조회';
        eventName = 'campaignGroups';
      } else if( url.split('/')[0] === 'campaign-groups' ) {
        if( response.config.method === 'post' ) {
          activation = '캠페인그룹정보생성';
          eventName = 'campaignGroup';
          queryType = 'C';
        } else if( response.config.method === 'put' ) {
          activation = '캠페인그룹정보수정';
          eventName = 'campaignGroup';
          queryType = 'U';
        } else if( response.config.method === 'delete' ) {
          activation = '캠페인그룹정보삭제';
          eventName = 'campaignGroup';
          queryType = 'D';
          description = '캠페인 그룹 아이디 : "' + url.split('/')[1] + '"번 삭제';
        }
      } else if( url === '/collections/campaign-group-list' || url === 'collections/campaign-group-list' ) {
        activation = '캠페인그룹소속캠페인조회';
        eventName = 'campaignGroupCampaigns';
      } else if( url.split('/')[0] === 'campaign-group' && url.indexOf('/list') > -1 ) {
        if( response.config.method === 'post' ) {
          activation = '캠페인그룹소속캠페인생성';
          eventName = 'campaignGroupCampaign';
          queryType = 'C';
        } else if( response.config.method === 'delete' ) {
          activation = '캠페인그룹소속캠페인삭제';
          eventName = 'campaignGroupCampaign';
          queryType = 'D';
          description = '캠페인 그룹 아이디 : "' + url.split('/')[1] + '"번 소속캠페인 삭제';
        }
      }
      const logData = {
          "tenantId": Number(getCookie('tenant_id')),
          "employeeId": userId,
          "userHost": getCookie('userHost'),
          "queryId": response.config.url,
          "queryType": queryType,
          "activation": activation,
          "description": description,
          "successFlag": 1,
          "eventName": eventName,
          "queryRows": typeof response.data.result_data === 'undefined' ? 1 : response.data.result_data.length,
          "targetId": response.config.url,
          "userSessionType": 0,
          "exportFlag": 1,
          "memo": "",
          "updateEmployeeId": userId
      };
      const { data } = await axiosRedisInstance.post<{code:string;message:string;}>(
        `/log/save`,
        logData 
      );
    }
    return response;
  },
  async (error) => {

    if (error.code === 'ECONNABORTED') {
      customAlertService.error('요청 시간이 초과되었습니다. 다시 로그인 해주세요.', '요청 시간 초과', () => {
        logoutFunction({ portcheck: false });
        window.location.href = '/login';
      });
    }
    if( error.status === 500 ){      
      customAlertService.error('PDS 서버 시스템과 연결할 수 없습니다. 서버 동작 상태를 확인하여 주십시오. 프로그램을 종료합니다.', '세션 만료', () => {
        logoutFunction({ portcheck: false });
        window.location.href = '/login';
      });
    }    
    if (error.response.data.result_code === 5) {
      // 세션 만료 시 알럿 표시 후 로그인 페이지로 리다이렉트
      customAlertService.error('API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.', '세션 만료', () => {
        // console.log("### axiosInstanc RESPONSE throw error : ", error);
        logoutFunction({ portcheck: false });
        window.location.href = '/login';
      });
    }

    const url = error.config.url || '';
    const userId = getCookie('id');
    if( url !== '/login' && userId != null && userId != '' ) {
      let activation = '';
      let eventName = '';
      let queryType = 'R';
      // let description = '';
      if( url === '/login' ) {
        activation = '로그인';
        eventName = 'login';
      } else if( url === '/collections/tenant' ) {
        activation = '테넌트정보조회';
        eventName = 'tenants';
      } else if( url === '/collections/phone-description' ) {
        activation = '전화번호설명템플릿조회';
        eventName = 'phone-description';
      } else if( url === '/phone-description' ) {
        if( error.config.method === 'post' ) {
          activation = '전화번호설명템플릿생성';
          eventName = 'description';
          queryType = 'C';
        }else if( error.config.method === 'put' ) {
          activation = '전화번호설명템플릿수정';
          eventName = 'description';
          queryType = 'U';
        }else if( error.config.method === 'delete' ) {
          activation = '전화번호설명템플릿삭제';
          eventName = 'description';
          queryType = 'D';
        }
      } else if( url === '/collections/dialing-device' ) {
        activation = '다이얼링장비조회';
        eventName = 'dialing-device';
      } else if( url === '/dialing-device' ) {
        if( error.config.method === 'post' ) {
          activation = '다이얼링장비생성';
          eventName = 'dialing-device';
          queryType = 'C';
        }else if( error.config.method === 'put' ) {
          activation = '다이얼링장비수정';
          eventName = 'dialing-device';
          queryType = 'U';
        }else if( error.config.method === 'delete' ) {
          activation = '다이얼링장비삭제';
          eventName = 'dialing-device';
          queryType = 'D';
        }
      } else if( url === '/collections/channel-group' ) {
        activation = '채널그룹조회';
        eventName = 'channel-group';
      } else if( url === '/channel-group' ) {
        if( error.config.method === 'post' ) {
          activation = '채널그룹생성';
          eventName = 'channel-group';
          queryType = 'C';
        }else if( error.config.method === 'put' ) {
          activation = '채널그룹수정';
          eventName = 'channel-group';
          queryType = 'U';
        }else if( error.config.method === 'delete' ) {
          activation = '채널그룹삭제';
          eventName = 'channel-group';
          queryType = 'D';
        }
      } else if( url === '/collections/channel-assign' ) {
        activation = '채널할당조회';
        eventName = 'channel-assign';
      } else if( url === '/channel-assign' ) {
        if( error.config.method === 'put' ) {
          activation = '채널할당수정';
          eventName = 'channel-assign';
          queryType = 'U';
        }
      } else if( url === '/collections/skill' || url === 'collections/skill' ) {
        activation = '스킬마스터목록조회';
        eventName = 'skills';
      } else if( url.indexOf('skills') > -1 && url.indexOf('/agent-list') == -1 ) {
        if( error.config.method === 'post' ) {
          activation = '스킬마스터생성';
          eventName = 'skills';
          queryType = 'C';
        } else if( error.config.method === 'put' ) {
          activation = '스킬마스터수정';
          eventName = 'skills';
          queryType = 'U';
        } else if( error.config.method === 'delete' ) {
          activation = '스킬마스터삭제';
          eventName = 'skills';
          queryType = 'D';
        }
      } else if( url === '/collections/skill-agent' ) {
        activation = '스킬할당상담사';
        eventName = 'skill-agent';
      } else if( url.indexOf('skills') > -1 && url.indexOf('/agent-list') > -1 ) {
        if( error.config.method === 'post' ) {
          activation = '스킬할당상담사생성';
          eventName = 'skill-agent';
          queryType = 'C';
        } else if( error.config.method === 'delete' ) {
          activation = '스킬할당상담사삭제';
          eventName = 'skill-agent';
          queryType = 'D';
        }
      } else if( url === '/collections/skill-campaign' ) {
        activation = '스킬할당캠페인';
        eventName = 'skill-campaign';
      } else if( url === '/collections/agent-skill' ) {
        activation = '상담사보유스킬';
        eventName = 'agent-skill';
      } else if( url === '/collections/campaign-skill' || url === 'collections/campaign-skill' ) {
        activation = '캠페인요구스킬조회';
        eventName = 'skill';
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/skill') > -1 ) {
        if( error.config.method === 'put' ) {
          activation = '캠페인요구스킬수정';
          eventName = 'campaign-skill';
          queryType = 'U';
        }
      } else if( url === '/collections/maxcall-init-time' ) {
        activation = '분배제한초기화시각조회';
        eventName = 'maxcall-init-time';
      } else if( url === '/maxcall-init-time' ) {
        activation = '분배제한초기화시각수정';
        eventName = 'maxcall-init-time';
        queryType = 'U';
      } else if( url === '/collections/suspended-skill' ) {
        activation = '일지중지스킬조회';
        eventName = 'suspended-skill';
      } else if( url === '/suspended-skill' ) {
        activation = '일지중지스킬삭제';
        eventName = 'suspended-skill';
        queryType = 'D';
      } else if( url === 'collections/campaign-list' ) {
        activation = '캠페인리스트조회';
        eventName = 'campaign-list';
      } else if( url === '/collections/campaign' ) {
        activation = '캠페인마스터목록조회';
        eventName = 'campaigns';
      } else if( url.indexOf('/collections') > -1 && url.split('/').length === 2 ) {
        if( error.config.method === 'post' ) {
          activation = '캠페인마스터생성';
          eventName = 'campaigns';
          queryType = 'C';
        }else if( error.config.method === 'put' ) {
          activation = '캠페인마스터수정';
          eventName = 'campaigns';
          queryType = 'U';
        }else if( error.config.method === 'delete' ) {
          activation = '캠페인마스터삭제';
          eventName = 'campaigns';
          queryType = 'D';
        }
      } else if( url.indexOf('/status') > -1 ) {
        const status = JSON.parse(error.config.data).request_data.campaign_status === 1 ? '시작': 
          JSON.parse(error.config.data).request_data.campaign_status === 2 ?'멈춤':'중지';
        activation = '캠페인상태변경';
        eventName = 'updateStatus';
        queryType = 'U';
        // description = '캠페인 상태를 "' + status + '"으로 변경';
      } else if( url === '/collections/campaign-reserved-call' ) {
        activation = '예약호마스터조회';
        eventName = 'campaign-reserved-call';
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/reserved-call') > -1 ) {
        if( error.config.method === 'post' ) {
          activation = '예약호마스터생성';
          eventName = 'campaign-reserved-call';
          queryType = 'C';
        } else if( error.config.method === 'put' ) {
          activation = '예약호마스터수정';
          eventName = 'campaign-reserved-call';
          queryType = 'U';
        } else if( error.config.method === 'delete' ) {
          activation = '예약호마스터삭제';
          eventName = 'campaign-reserved-call';
          queryType = 'D';
        }
      } else if( url === '/collections/campaign-scheduled-redial' ) {
        activation = '캠페인예약재발신정보조회';
        eventName = 'campaign-scheduled-redial';
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/scheduled-redial') > -1 ) {
        if( error.config.method === 'post' ) {
          activation = '캠페인예약재발신정보생성';
          eventName = 'campaign-scheduled-redial';
          queryType = 'C';
        } else if( error.config.method === 'put' ) {
          activation = '캠페인예약재발신정보수정';
          eventName = 'campaign-scheduled-redial';
          queryType = 'U';
        } else if( error.config.method === 'delete' ) {
          activation = '캠페인예약재발신정보삭제';
          eventName = 'campaign-scheduled-redial';
          queryType = 'D';
        }
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/current-redial') > -1 ) {
        activation = '캠페인재발신추출수정';
        eventName = 'campaign-current-redial';
        queryType = 'U';
      } else if( url === '/collections/campaign-redial-preview' ) {
        activation = '캠페인재발신미리보기';
        eventName = 'campaign-redial-preview';
      } else if( url === '/collections/campaign-schedule' ) {
        activation = '캠페인스케줄정보조회';
        eventName = 'campaign-schedule';
      } else if( url.indexOf('/schedule') > -1 ) {
        if( error.config.method === 'post' ) {
          activation = '캠페인스케줄정보생성';
          eventName = 'campaign-schedule';
          queryType = 'C';
        }else if( error.config.method === 'put' ) {
          activation = '캠페인스케줄정보수정';
          eventName = 'campaign-schedule';
          queryType = 'U';
        }else if( error.config.method === 'delete' ) {
          activation = '캠페인스케줄정보삭제';
          eventName = 'campaign-schedule';
          queryType = 'D';
        }
      } else if( url === '/collections/campaign-calling-number' ) {
        activation = '캠페인발신번호조회';
        eventName = 'campaign-calling-number';
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/calling-number') > -1 ) {
        if( error.config.method === 'post' ) {
          activation = '캠페인발신번호생성';
          eventName = 'campaign-calling-number';
          queryType = 'C';
        } else if( error.config.method === 'put' ) {
          activation = '캠페인발신번호수정';
          eventName = 'campaign-calling-number';
          queryType = 'U';
        } else if( error.config.method === 'delete' ) {
          activation = '캠페인발신번호삭제';
          eventName = 'campaign-calling-number';
          queryType = 'D';
        }
      } else if( url === '/collections/maxcall-ext' ) {
        activation = '캠페인분배제한조회';
        eventName = 'maxcall-ext';
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/maxcall-ext') > -1 ) {
        if( error.config.method === 'post' ) {
          activation = '캠페인분배제한생성';
          eventName = 'maxcall-ext';
          queryType = 'C';
        } else if( error.config.method === 'put' ) {
          activation = '캠페인분배제한수정';
          eventName = 'maxcall-ext';
          queryType = 'U';
        } else if( error.config.method === 'delete' ) {
          activation = '캠페인분배제한삭제';
          eventName = 'maxcall-ext';
          queryType = 'D';
        }
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/calling-list') > -1 ) {
        if( error.config.method === 'post' ) {
          activation = '발신리스트업로드추가';
          eventName = 'campaign-calling-list';
          queryType = 'C';
        } else if( error.config.method === 'delete' ) {
          activation = '발신리스트업로드삭제';
          eventName = 'campaign-calling-list';
          queryType = 'D';
        }
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/black-list') > -1 ) {
        if( error.config.method === 'post' ) {
          activation = '블랙리스트업로드추가';
          eventName = 'campaign-black-list';
          queryType = 'C';
        } else if( error.config.method === 'delete' ) {
          activation = '블랙리스트업로드삭제';
          eventName = 'campaign-black-list';
          queryType = 'D';
        }
      } else if( url === '/collections/campaign-blacklist-max' ) {
        activation = '블랙리스트최대수량조회';
        eventName = 'campaign-blacklist-max';
      } else if( url === '/collections/campaign-blacklist-count' ) {
        activation = '블랙리스트수량조회';
        eventName = 'campaign-blacklist-count';
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/dial-speed') > -1 ) {
        activation = '캠페인발신속도수정';
        eventName = 'campaign-black-list';
        queryType = 'U';
      } else if( url.indexOf('/campaigns') > -1 && url.indexOf('/callback-list') > -1 ) {
        activation = '캠페인콜백리스트추가';
        eventName = 'campaign-callback-list';
        queryType = 'C';
      } else if( url === '/collections/campaign-agent' ) {
        activation = '캠페인소속상담사조회';
        eventName = 'campaignAgents';
      } else if( url === '/collections/agent-campaign' ) {
        activation = '상담사소속캠페인조회';
        eventName = 'agentCampaigns';
      } else if( url === '/collections/callback-campaign' ) {
        activation = '콜백캠페인조회';
        eventName = 'callback-campaign';
      } else if( url === '/collections/campaign-history' ) {
        activation = '캠페인운영이력조회';
        eventName = 'campaign-history';
      } else if( url === '/collections/dial-result' ) {
        activation = '캠페인발신결과조회';
        eventName = 'dial-result';
      } else if( url === '/collections/agent-ready-count' ) {
        activation = '캠페인대기상담사수조회';
        eventName = 'agent-ready-count';
      } else if( url === '/collections/suspended-campaign' ) {
        activation = '일지중지캠페인조회';
        eventName = 'suspended-campaign';
      } else if( url === '/suspended-campaign' ) {
        activation = '일지중지캠페인삭제';
        eventName = 'suspended-campaign';
        queryType = 'D';
      } else if( url === '/collections/campaign-group' || url === 'collections/campaign-group' ) {
        activation = '캠페인그룹정보조회';
        eventName = 'campaignGroups';
      } else if( url.split('/')[0] === 'campaign-groups' ) {
        if( error.config.method === 'post' ) {
          activation = '캠페인그룹정보생성';
          eventName = 'campaignGroup';
          queryType = 'C';
        } else if( error.config.method === 'put' ) {
          activation = '캠페인그룹정보수정';
          eventName = 'campaignGroup';
          queryType = 'U';
        } else if( error.config.method === 'delete' ) {
          activation = '캠페인그룹정보삭제';
          eventName = 'campaignGroup';
          queryType = 'D';
        }
      } else if( url === '/collections/campaign-group-list' || url === 'collections/campaign-group-list' ) {
        activation = '캠페인그룹소속캠페인조회';
        eventName = 'campaignGroupCampaigns';
      } else if( url.split('/')[0] === 'campaign-group' && url.indexOf('/list') > -1 ) {
        if( error.config.method === 'post' ) {
          activation = '캠페인그룹소속캠페인생성';
          eventName = 'campaignGroupCampaign';
          queryType = 'C';
        } else if( error.config.method === 'delete' ) {
          activation = '캠페인그룹소속캠페인삭제';
          eventName = 'campaignGroupCampaign';
          queryType = 'D';
        }
      }
      
      // if( error.status === 400 ){      
      //   customAlertService.error(activation + ' 요청이 실패하였습니다. PDS 서버 시스템에 확인하여 주십시오.', 'PDS 서버오류', () => {});
      // }else{
        const logData = {
            "tenantId": Number(getCookie('tenant_id')),
            "employeeId": userId,
            "userHost": getCookie('userHost'),
            "queryId": error.config.url,
            "queryType": queryType,
            "activation": activation,
            "description": error.message,
            "successFlag": 0,
            "eventName": eventName,
            "queryRows": 0,
            "targetId": error.config.url||0,
            "userSessionType": 0,
            "exportFlag": 1,
            "memo": "",
            "updateEmployeeId": userId
        };
        const { data } = await axiosRedisInstance.post<{code:string;message:string;}>(
          `/log/save`,
          logData 
        );
      // }
    }
    if (error.response?.status === 401) {
      logoutFunction({ portcheck: false });
      window.location.href = '/login';
      return Promise.reject(new Error('세션이 만료되었습니다. 다시 로그인해주세요.'));
    }
    return Promise.reject(error);
  }
);
// 응답 인터셉터
axiosRedisInstance.interceptors.response.use(
  async (response) => {

    // console.log("here 9999999999999999999999999999999999", response);
    

    const url = response.config.url || '';
    const userId = getCookie('id');
    if( url !== '/log/save' && userId != null && userId != '' ) {
      let activation = '';
      let eventName = '';
      let queryType = 'R';
      let description = '';
      if( url === '/auth/environment' ) {
        activation = '사용자별 환경설정 가져오기';
        eventName = 'environment';
      } else if( url.indexOf('/auth/availableMenuList') > -1 ) {
        activation = '사용가능한 메뉴 리스트 가져오기';
        eventName = 'availableMenuList';
      } else if( url.indexOf('/auth/environment') > -1 ) {
        activation = '사용자별 환경설정 가져오기';
        eventName = 'environment';
      } else if( url.indexOf('/auth/environment/save') > -1 ) {
        activation = '사용자별 환경설정 저장하기';
        eventName = 'environment-save';
        queryType = 'C';
      } else if( url.indexOf('/counselor/list') > -1 ) {
        activation = '상담사 리스트 가져오기';
        eventName = 'counselor-list';
      } else if( url.indexOf('/counselor/state') > -1 ) {
        activation = '상담사 상태정보 가져오기';
        eventName = 'counselor-state';
      } else if( url.indexOf('/counselor/counselorInfo') > -1 ) {
        activation = '캠페인 할당 상담사정보 가져오기';
        eventName = 'counselor-state';
      } else if( url.indexOf('/counselor/sillAssigned/list') > -1 ) {
        activation = '스킬 할당 상담사 목록 가져오기';
        eventName = 'counselor-sillAssigned-list';
      } else if( url.indexOf('/notification') > -1 && url.indexOf('/subscribe') > -1 ) {
        activation = '실시간 이벤트 구독';
        eventName = 'notification-subscribe';
      } else if( url.indexOf('/notification/publish') > -1 ) {
        activation = '실시간 이벤트 발행';
        eventName = 'notification-publish';
      } else if( url === '/monitor/process' ) {
        activation = '타 시스템 프로세스 상태정보 가져오기';
        eventName = 'process';
      } else if( url === '/monitor/dialer/channel' ) {
        activation = '채널 상태 정보 가져오기';
        eventName = 'channel';
      } else if( url.indexOf('/statistics') > -1 ) {
        activation = '캠페인별 진행정보 가져오기';
        eventName = 'statistics';
        description = '캠페인 아이디 : ' + url.split('/')[5] + '번 진행정보 가져오기';
      } else if( url === '/monitor/tenant/campaign/dial' ) {
        activation = '발신진행상태조회';
        eventName = 'dial';
      }
      const logData = {
          "tenantId": Number(getCookie('tenant_id')),
          "employeeId": userId,
          "userHost": getCookie('userHost'),
          "queryId": response.config.url,
          "queryType": queryType,
          "activation": activation,
          "description": description,
          "successFlag": 1,
          "eventName": eventName,
          "queryRows": typeof response.data.result_data === 'undefined' ? 1 : response.data.result_data.length,
          "targetId": response.config.url,
          "userSessionType": 0,
          "exportFlag": 1,
          "memo": "",
          "updateEmployeeId": userId
      };
      const { data } = await axiosRedisInstance.post<{code:string;message:string;}>(
        `/log/save`,
        logData 
      );
    }
    return response;
  },
  async (error) => {

    if (error.code === 'ECONNABORTED') {
      customAlertService.error('요청 시간이 초과되었습니다. 다시 로그인 해주세요.', '요청 시간 초과', () => {
        logoutFunction({ portcheck: false });
        window.location.href = '/login';
      });
    }
    // console.log("axios에서 result code 확인 1111111 : ", error);
    if( error.status === 500 ){      
      customAlertService.error('PDS 서버 시스템과 연결할 수 없습니다. 서버 동작 상태를 확인하여 주십시오. 프로그램을 종료합니다.', '세션 만료', () => {
        logoutFunction({ portcheck: false });
        window.location.href = '/login';
      });
    }    

    // result_code 5 일 경우 axiosInstance 와 동일하게 로그인 페이지로 이동
    if (error.response.data.result_code === 5) {
      customAlertService.error('로그인 세션이 만료되었습니다. 다시 로그인 해주세요.', '세션 만료', () => {
        logoutFunction({ portcheck: false });
        window.location.href = '/login';
      });
    }

    if (error.response?.status === 401) {
      logoutFunction({ portcheck: false });
      window.location.href = '/login';
      return Promise.reject(new Error('세션이 만료되었습니다. 다시 로그인해주세요.'));
    }

    const url = error.config.url || '';
    const userId = getCookie('id');
    if( url !== '/log/save' && userId != null && userId != '' ) {
      let activation = '';
      let eventName = '';
      let queryType = 'R';
      let description = '';
      if( url === '/auth/environment' ) {
        activation = '사용자별 환경설정 가져오기';
        eventName = 'environment';
      } else if( url.indexOf('/auth/availableMenuList') > -1 ) {
        activation = '사용가능한 메뉴 리스트 가져오기';
        eventName = 'availableMenuList';
      } else if( url.indexOf('/auth/environment') > -1 ) {
        activation = '사용자별 환경설정 가져오기';
        eventName = 'environment';
      } else if( url.indexOf('/auth/environment/save') > -1 ) {
        activation = '사용자별 환경설정 저장하기';
        eventName = 'environment-save';
        queryType = 'C';
      } else if( url.indexOf('/counselor/list') > -1 ) {
        activation = '상담사 리스트 가져오기';
        eventName = 'counselor-list';
      } else if( url.indexOf('/counselor/state') > -1 ) {
        activation = '상담사 상태정보 가져오기';
        eventName = 'counselor-state';
      } else if( url.indexOf('/counselor/counselorInfo') > -1 ) {
        activation = '캠페인 할당 상담사정보 가져오기';
        eventName = 'counselor-state';
      } else if( url.indexOf('/counselor/sillAssigned/list') > -1 ) {
        activation = '스킬 할당 상담사 목록 가져오기';
        eventName = 'counselor-sillAssigned-list';
      } else if( url.indexOf('/notification') > -1 && url.indexOf('/subscribe') > -1 ) {
        activation = '실시간 이벤트 구독';
        eventName = 'notification-subscribe';
      } else if( url.indexOf('/notification/publish') > -1 ) {
        activation = '실시간 이벤트 발행';
        eventName = 'notification-publish';
      } else if( url === '/monitor/process' ) {
        activation = '타 시스템 프로세스 상태정보 가져오기';
        eventName = 'process';
      } else if( url === '/monitor/dialer/channel' ) {
        activation = '채널 상태 정보 가져오기';
        eventName = 'channel';
      } else if( url.indexOf('/statistics') > -1 ) {
        activation = '캠페인별 진행정보 가져오기';
        eventName = 'statistics';
        description = '캠페인 아이디 : ' + url.split('/')[5] + '번 진행정보 가져오기';
      } else if( url === '/monitor/tenant/campaign/dial' ) {
        activation = '발신진행상태조회';
        eventName = 'dial';
      }
      const logData = {
          "tenantId": Number(getCookie('tenant_id')),
          "employeeId": userId,
          "userHost": getCookie('userHost'),
          "queryId": error.config.url,
          "queryType": queryType,
          "activation": activation,
          "description": description,          
          "successFlag": 0,
          "eventName": eventName,
          "queryRows": 0,
          "targetId": error.config.url||0,
          "userSessionType": 0,
          "exportFlag": 1,
          "memo": "",
          "updateEmployeeId": userId
      };
      const { data } = await axiosRedisInstance.post<{code:string;message:string;}>(
        `/log/save`,
        logData 
      );
    }
    return Promise.reject(error);
  }
);