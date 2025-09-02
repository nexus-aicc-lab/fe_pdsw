'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import { Table, TableRow, TableHeader, TableCell } from "@/components/ui/table-custom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import DataGrid, { Column as DataGridColumn } from 'react-data-grid';
import { useApiForCallProgressStatus } from '@/features/monitoring/hooks/useApiForCallProgressStatus';
import { useMainStore, useCampainManagerStore, useAuthStore, useTabStore } from '@/store';
import { useApiForCampaignSkill } from '@/features/campaignManager/hooks/useApiForCampaignSkill';
import { useApiForPhoneDescription } from '@/features/campaignManager/hooks/useApiForPhoneDescription';
import { useEnvironmentStore } from '@/store/environmentStore';
import CommonButton from '@/components/shared/CommonButton';
import ServerErrorCheck from '@/components/providers/ServerErrorCheck';
import { FancyGraphLoader } from '@/shared/ui/loading/FancyGraphLoader';
import { PulseBarsLoader } from '@/shared/ui/loading/PulseBarsLoader';

// 타입 정의
interface Stats {
  waiting: number;
  firstCall: number;
  retryCall: number;
  distributing: number;
}

interface BarData {
  name: string;
  value: number;
}

interface GridData {
  skillId: string;
  campaignId: string;
  campaignName: string;
  priority: string;
  custKey: string;
  custName: string;
  phoneType: string;
  phone1: string;
  attempt1: string;
  phone2: string;
  attempt2: string;
  phone3: string;
  attempt3: string;
  phone4: string;
  attempt4: string;
  phone5: string;
  attempt5: string;
  result: string;
}

interface CampaignData {
  stats: Stats;
  barData: BarData[];
  gridData: GridData[];
}

interface CampaignDataMap {
  [key: string]: CampaignData;
}

interface Column extends DataGridColumn<GridData> {
  key: keyof GridData;
  name: string;
}

// 발신진행상태 목록 데이터 타입
interface SummaryCallProgressStatusDataType {
  campaignId: number;                 //캠페인ID
  campaignName: string;               //캠페인 이름
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
  waiting: number;                    //대기상담사
  firstCall: number;                  //최초 발신
  // _retryCall: number;                 //재시도발신 사용 않는 것으로 수정 2025-09-02 - lab09
  distributing: number;               //분배 대기
  result: string;                     //다이얼 결과
  phoneType: string;                  //발신번호 구분
}

interface OutboundCallProgressPanelProps {
  externalCampaignId?: string;
  onCampaignChange?: (campaignId: string) => void;
  onDataUpdate?: (data: CampaignData) => void;
}

const OutboundCallProgressPanel: React.FC<OutboundCallProgressPanelProps> = ({
  externalCampaignId,
  onCampaignChange,
  onDataUpdate
}) => {
  // const [internalSelectedCampaign, setInternalSelectedCampaign] = useState<string>('all');
  const { campaigns } = useMainStore();
  const { tenant_id, session_key } = useAuthStore();
  const { campaignSkills, setCampaignSkills,phoneDescriptions, setPhoneDescriptions } = useCampainManagerStore();
  const [ _campaignData, _setCampaignData ] = useState<CampaignDataMap>({});
  const [ waitingCounselorCnt, setWaitingCounselorCnt ] = useState<number>(0);
  const { statisticsUpdateCycle } = useEnvironmentStore();
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const { removeTab, activeTabId, activeTabKey, addTab, openedTabs, setActiveTab} = useTabStore();
  const [isPopup, setIsPopup] = useState(false);

  // 실제 사용할 캠페인 ID 결정
  // const selectedCampaign = externalCampaignId ?? internalSelectedCampaign;
  const [ selectedCampaign, setSelectedCampaign] = useState<string>('all');



  // 빈 데이터 정의
  const emptyData: CampaignData = {
    stats: {
      waiting: 0,
      firstCall: 0,
      retryCall: 0,
      distributing: 0
    },
    barData: [
      { name: '최초 발신중', value: 0 },
      { name: '재시도 발신중', value: 0 },
      { name: '분배 대기', value: 0 }
    ],
    gridData: []
  };

  // 전체 데이터 계산을 위한 useMemo 훅 사용
  const allCampaignData = useMemo<CampaignData>(() => {
    if (Object.keys(_campaignData).length === 0) return emptyData;
    // 모든 캠페인의 통계 합계 계산
    const totalStats = Object.values(_campaignData).reduce((acc, campaign) => ({
      waiting: acc.waiting + campaign.stats.waiting,
      firstCall: acc.firstCall + campaign.stats.firstCall,
      retryCall: acc.retryCall + campaign.stats.retryCall,
      distributing: acc.distributing + campaign.stats.distributing
    }), { waiting: 0, firstCall: 0, retryCall: 0, distributing: 0 });

    // 모든 캠페인의 바 차트 데이터 합계 계산
    const totalBarData = [
      {
        name: '최초 발신중',
        value: Object.values(_campaignData).reduce((sum, campaign) =>
          sum + (campaign.barData.find(item => item.name === '최초 발신중')?.value ?? 0), 0
        )
      },
      {
        name: '재시도 발신중',
        value: Object.values(_campaignData).reduce((sum, campaign) =>
          sum + (campaign.barData.find(item => item.name === '재시도 발신중')?.value ?? 0), 0
        )
      },
      {
        name: '분배 대기',
        value: Object.values(_campaignData).reduce((sum, campaign) =>
          sum + (campaign.barData.find(item => item.name === '분배 대기')?.value ?? 0), 0
        )
      }
    ];

    // 모든 캠페인의 그리드 데이터 통합
    const totalGridData = Object.values(_campaignData).flatMap(campaign => campaign.gridData);

    return {
      stats: totalStats,
      barData: totalBarData,
      gridData: totalGridData
    };
  }, [_campaignData]);

 // 현재 선택된 캠페인의 데이터 (안전하게 처리)
 const currentData = useMemo(() => {
  if (selectedCampaign === 'all') return allCampaignData;
  if (!selectedCampaign) return emptyData;
    
  // selectedCampaign이 특정 캠페인ID인 경우, 해당 캠페인의 모든 sequence 데이터를 합산
  const campaignKeys = Object.keys(_campaignData).filter(key => 
    key.startsWith(selectedCampaign + '-')
  );
  
  if (campaignKeys.length === 0) return emptyData;
  
  // 해당 캠페인의 모든 시퀀스 데이터를 합산
  const campaignData = campaignKeys.reduce<CampaignData>((acc, key) => {
    const data = _campaignData[key];
    return {
      stats: {
        waiting: acc.stats.waiting + data.stats.waiting,
        firstCall: acc.stats.firstCall + data.stats.firstCall,
        retryCall: acc.stats.retryCall + data.stats.retryCall,
        distributing: acc.stats.distributing + data.stats.distributing
      },
      barData: [
        { name: '최초 발신중', value: acc.barData[0].value + data.barData[0].value },
        { name: '재시도 발신중', value: acc.barData[1].value + data.barData[1].value },
        { name: '분배 대기', value: acc.barData[2].value + data.barData[2].value }
      ],
      gridData: [...acc.gridData, ...data.gridData]
    };
  }, {
    stats: { waiting: 0, firstCall: 0, retryCall: 0, distributing: 0 },
    barData: [
      { name: '최초 발신중', value: 0 },
      { name: '재시도 발신중', value: 0 },
      { name: '분배 대기', value: 0 }
    ],
    gridData: []
  });
  
  return campaignData;
}, [selectedCampaign, allCampaignData, _campaignData]);

  // 데이터 업데이트 시 부모 컴포넌트에 알림
  useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate(currentData);
    }
  }, [currentData, onDataUpdate]);

  // 그리드 컬럼 정의
  const columns: Column[] = [
    { key: 'skillId', name: '스킬 아이디' },
    { key: 'campaignId', name: '캠페인 아이디' },
    { key: 'campaignName', name: '캠페인 이름' },
    { key: 'priority', name: '다이얼 순번' },
    { key: 'custKey', name: '고객키' },
    { key: 'custName', name: '고객 이름' },
    { key: 'phoneType', name: '발신 번호 구분' },
    { key: 'phone1', name: '전화번호 1' },
    { key: 'attempt1', name: '시도 횟수' },
    { key: 'phone2', name: '전화번호 2' },
    { key: 'attempt2', name: '시도 횟수' },
    { key: 'phone3', name: '전화번호 3' },
    { key: 'attempt3', name: '시도 횟수' },
    { key: 'phone4', name: '전화번호 4' },
    { key: 'attempt4', name: '시도 횟수' },
    { key: 'phone5', name: '전화번호 5' },
    { key: 'attempt5', name: '시도 횟수' },
    { key: 'result', name: '다이얼 결과' }
  ];

  // 캠페인 변경 핸들러
  const handleCampaignChange = (value: string): void => {
    if (onCampaignChange) {
      onCampaignChange(value);
    } else {
      setSelectedCampaign(value);
    }


    // const existingTabs = openedTabs.filter(tab => tab.id === 5);
    // existingTabs.forEach(tab => {
    //   removeTab(tab.id, tab.uniqueKey);
    // });
    // const newTabKey = `5-${Date.now()}`;
    // addTab({
    //   id: 5,
    //   campaignId: value,
    //   campaignName: campaigns.find(data=>data.campaign_id === Number(value))?.campaign_name,
    //   uniqueKey: '5',
    //   title: '발신진행상태',
    //   icon: '',
    //   href: '',
    //   content: null,
    // });

    const newTabKey = `5-${Date.now()}`;
    setTimeout(function () {
      setActiveTab(5, newTabKey);
    }, 50);
  };
  //const testid = {campaignId : '39889'};
  // const testData = [
  //   {
  //           "campaignId": 39889,
  //           "campaignName": "테스트34234#$",
  //           "waitingLstCnt": 0,
  //           "event": 2,
  //           "dialSequence": 1,
  //           "dialResult": 0,
  //           "customerName": "이정수",
  //           "customerKey": "이정수",
  //           "phoneNumber": [
  //               "234432234",
  //               "",
  //               "",
  //               "",
  //               ""
  //           ],
  //           "phoneDialCount": [
  //               0,
  //               0,
  //               0,
  //               0,
  //               0
  //           ],
  //           "dialedPhone": 1,
  //           "reuseCount": 2,
  //           "retryCall": 0
  //       },
  //       {
  //           "campaignId": 39889,
  //           "campaignName": "테스트34234#$",
  //           "waitingLstCnt": 0,
  //           "event": 2,
  //           "dialSequence": 2,
  //           "dialResult": 0,
  //           "customerName": "이정수",
  //           "customerKey": "이정수",
  //           "phoneNumber": [
  //               "234432234",
  //               "",
  //               "",
  //               "",
  //               ""
  //           ],
  //           "phoneDialCount": [
  //               0,
  //               0,
  //               0,
  //               0,
  //               0
  //           ],
  //           "dialedPhone": 1,
  //           "reuseCount": 2,
  //           "retryCall": 0
  //       },
  //       {
  //           "campaignId": 39889,
  //           "campaignName": "테스트34234#$",
  //           "waitingLstCnt": 0,
  //           "event": 2,
  //           "dialSequence": 3,
  //           "dialResult": 0,
  //           "customerName": "이정수",
  //           "customerKey": "1",
  //           "phoneNumber": [
  //               "234432234",
  //               "",
  //               "",
  //               "",
  //               ""
  //           ],
  //           "phoneDialCount": [
  //               0,
  //               0,
  //               0,
  //               0,
  //               0
  //           ],
  //           "dialedPhone": 1,
  //           "reuseCount": 1,
  //           "retryCall": 0
  //       }
  // ]

  // Select 컴포넌트 렌더링 여부 결정
  const [ shouldRenderSelect , setShouldRenderSelect ] = useState<boolean>(false);

  // 발신 진행 정보 api 호출
  const { mutate: fetchCallProgressStatus } = useApiForCallProgressStatus({
    onSuccess: (data) => {  
      const tempList = data.sendingProgressStatusList;
      // const tempList = testData;
      const _campaignId = data.campaignId;
      // if( tempList.length > 0 && ((_campaignId.trim() +'' === selectedCampaign.trim() +'') || (selectedCampaign === 'all' && _campaignId === '0')) ){
      if( tempList.length > 0 && ((_campaignId.trim() +'' === selectedCampaign.trim() +'') || (selectedCampaign === 'all' && _campaignId === '0')) ){
        setWaitingCounselorCnt( data.waitingCounselorCnt );
        const sumCallProgressStatus:SummaryCallProgressStatusDataType[] = [];
        for( let i=0;i<tempList.length;i++){
          const uniqueKey = `${tempList[i].campaignId}-${tempList[i].dialSequence}`;
          const index = sumCallProgressStatus.findIndex((data) => `${data.campaignId}-${data.dialSequence}` === uniqueKey);
          // const index = sumCallProgressStatus.findIndex((data) => data.campaignId === tempList[i].campaignId);
          if( index === -1){
            sumCallProgressStatus.push({...tempList[i],
              dialSequence : tempList[i].dialSequence, // 다이얼 시퀀스별 추가
              waiting: 0,  //대기상담사
              firstCall: tempList[i].reuseCount === 1 ? 1 : 0, //최초 발신
              // _retryCall: tempList[i].reuseCount === 2 ? 1 : 0, //재시도발신 ??? _retryCall 사용되는곳 찾을수 없음
              retryCall : tempList[i].reuseCount === 2 ? 1 : 0, // 재시도발신 으로 수정 2025-09-02 - lab09
              distributing: tempList[i].waitingLstCnt, //분배 대기
              result: campaigns.find((campaign) => campaign.campaign_id === tempList[i].campaignId)?.end_flag === 1 ? '진행중' : '완료',
              phoneType: tempList[i].dialedPhone + '', // 발신번호 구분으로 예측되는 dialedPhone 컬럼으로 변경 (05/27)
            });
          }else{
            // sumCallProgressStatus[index].waiting += tempList[i].waiting;
            sumCallProgressStatus[index].firstCall += tempList[i].reuseCount === 1 ? 1 : 0;
            sumCallProgressStatus[index].retryCall += tempList[i].reuseCount === 2 ? 1 : 0;
            sumCallProgressStatus[index].distributing += tempList[i].waitingLstCnt;
          }
        }
        // console.log("##### sumCallProgressStatus: ", sumCallProgressStatus);

        const tempCampaignData: CampaignDataMap = {};
        for( let i=0;i<sumCallProgressStatus.length;i++){
          const _tempCampaignData: CampaignDataMap = {
            [`${sumCallProgressStatus[i].campaignId}-${sumCallProgressStatus[i].dialSequence}`]: {
              stats: {
                waiting: sumCallProgressStatus[i].waiting,    //대기상담사
                firstCall: sumCallProgressStatus[i].firstCall,//최초 발신
                retryCall: sumCallProgressStatus[i].retryCall,//재시도발신
                distributing: sumCallProgressStatus[i].distributing//분배 대기
              },
              barData: [
                { name: '최초 발신중', value: sumCallProgressStatus[i].firstCall },  //최초 발신용 --> 최초 발신중 변경 0526
                { name: '재시도 발신중', value: sumCallProgressStatus[i].retryCall },  //재시도 발신용 --> 최초 발신중 변경 0526
                // { name: '분배 대기', value: sumCallProgressStatus[i].waiting - (sumCallProgressStatus[i].firstCall+sumCallProgressStatus[i].retryCall) }   //분배 대기
                { name: '분배 대기', value: sumCallProgressStatus[i].distributing }   //분배 대기
              ],
              gridData: [
                {
                  skillId: campaignSkills.filter((skill) => skill.campaign_id === sumCallProgressStatus[i].campaignId)
                  .map((data) => data.skill_id)
                  .join(','),
                  campaignId: sumCallProgressStatus[i].campaignId+'',
                  campaignName: sumCallProgressStatus[i].campaignName,
                  priority: sumCallProgressStatus[i].dialSequence+'', //다이얼 순번
                  custKey: sumCallProgressStatus[i].customerKey,
                  custName: sumCallProgressStatus[i].customerName,
                  phoneType: sumCallProgressStatus[i].phoneType,  
                  phone1: sumCallProgressStatus[i].phoneNumber[0]+'',
                  attempt1: sumCallProgressStatus[i].phoneDialCount[0]+'',
                  phone2: sumCallProgressStatus[i].phoneNumber[1]+'',
                  attempt2: sumCallProgressStatus[i].phoneDialCount[1]+'',
                  phone3: sumCallProgressStatus[i].phoneNumber[2]+'',
                  attempt3: sumCallProgressStatus[i].phoneDialCount[2]+'',
                  phone4: sumCallProgressStatus[i].phoneNumber[3]+'',
                  attempt4: sumCallProgressStatus[i].phoneDialCount[3]+'',
                  phone5: sumCallProgressStatus[i].phoneNumber[4]+'',
                  attempt5: sumCallProgressStatus[i].phoneDialCount[4]+'',
                  result: sumCallProgressStatus[i].result   
                }
              ]
            }
          };
          Object.assign(tempCampaignData, _tempCampaignData);
        }
        
        _setCampaignData(tempCampaignData);
        
      }else if((_campaignId === selectedCampaign+'' || (selectedCampaign === 'all' && _campaignId === '0'))){ 
        setWaitingCounselorCnt( data.waitingCounselorCnt );
        
        _setCampaignData({
              ' ': {
                stats: {
                  waiting: data.waitingCounselorCnt,
                  firstCall: 0,
                  retryCall: 0,
                  distributing: 0
                },
                barData: [
                  { name: '최초 발신용', value: 0 },
                  { name: '재시도 발신용', value: 0 },
                  { name: '분배 대기', value: 0 }
                ],
                gridData: [
                ]
              }
        });
      }
      // setDataList(tempList);
      // setSelectedCall(tempList[0]);
      // console.log("API 응답 데이터:", tempList); 

      setIsLoading(false);
      setIsRefreshing(false);

      const endTime = new Date();
      setLastRefreshTime(endTime);
    },
    onError: (error) => {
      
      setIsLoading(false);
      setIsRefreshing(false);
      
      ServerErrorCheck('발신진행상태 조회', error.message);
    }
  });
  
  // 전화번호설명 템플릿 조회
  const { mutate: fetchPhoneDescriptions } = useApiForPhoneDescription({
    onSuccess: (data) => {
      setPhoneDescriptions(data.result_data||[]);
    },
    onError: (error) => {
      ServerErrorCheck('전화번호설명 템플릿 조회', error.message);
    }
  });

  // 캠페인스킬 조회
  const { mutate: fetchCampaignSkills } = useApiForCampaignSkill({
    onSuccess: (data) => {
      setCampaignSkills(data.result_data);
    },
    onError: (error) => {
      ServerErrorCheck('캠페인스킬 조회', error.message);
    }
  });

  useEffect(() => {
    // 먼저 이전 interval 제거
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRefreshing(true);
    setIsLoading(true);

    if( selectedCampaign != 'all' && campaigns && campaigns.length > 0 ){
      const campaignInfo = campaigns.find(data => data.campaign_id === Number(selectedCampaign));
      const tenantId = campaignInfo?.tenant_id+'' || '1';
      const campaignId = campaignInfo?.campaign_id+'' || '0';

      // 09/01 dial_sequence 추가
      // const dial_sequence = campaignInfo?.dial_sequence || '0';

      fetchCallProgressStatus({ tenantId, campaignId });
      if( statisticsUpdateCycle > 0 ){  
        intervalRef.current = setInterval(() => {
          fetchCallProgressStatus({ tenantId, campaignId });
        }, statisticsUpdateCycle * 1000);     
      }
    }else if(!isPopup){
      fetchCallProgressStatus({
        tenantId: tenant_id+'',
        campaignId: '0'
      });
      if( statisticsUpdateCycle > 0 ){  
        intervalRef.current = setInterval(() => {
          const tenantId = tenant_id+'' || '1';
          const campaignId =  '0';
          fetchCallProgressStatus({ tenantId, campaignId });
        }, statisticsUpdateCycle * 1000);     
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedCampaign,statisticsUpdateCycle,campaigns]);
  
  useEffect(() => {
    if (activeTabId === 5) {
      const tempData = openedTabs.filter(tab => tab.id === 5);
      if (tempData.length > 0 && tempData[0].campaignId && tempData[0].campaignName) {
        setSelectedCampaign(tempData[0].campaignId);
      }else{
        setSelectedCampaign('all');
      }
    }
  }, [activeTabId, openedTabs]);

  useEffect(() => {
    if( externalCampaignId ){
      setSelectedCampaign( externalCampaignId );
      setShouldRenderSelect(false);
      setWaitingCounselorCnt( 0 );
      
      _setCampaignData({
            ' ': {
              stats: {
                waiting: 0,
                firstCall: 0,
                retryCall: 0,
                distributing: 0
              },
              barData: [
                { name: '최초 발신용', value: 0 },
                { name: '재시도 발신용', value: 0 },
                { name: '분배 대기', value: 0 }
              ],
              gridData: [
              ]
            }
      });
    }else{
      setShouldRenderSelect(true);
    }
  }, [externalCampaignId,statisticsUpdateCycle]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsPopup(!!(window.opener && window.opener !== window));
    }
    let count = 0;
    if( campaignSkills.length === 0){
      fetchCampaignSkills({
        session_key: session_key,
        tenant_id: tenant_id,
      });
      count++;
    }
    if( phoneDescriptions.length === 0){
      fetchPhoneDescriptions({
        session_key: session_key,
        tenant_id: tenant_id,
      });
      count++;
    }
  }, []);


  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  const formattedLastRefreshTime = lastRefreshTime ?
    `${lastRefreshTime.toLocaleTimeString()}` :
    '아직 갱신되지 않음';

    
  // 새로고침해서 fetch 하는 함수
  const refreshData = () => {
    setIsRefreshing(true);
    setIsLoading(true);

    const campaignInfo = campaigns.find(data => data.campaign_id === Number(selectedCampaign));
    const tenantId = campaignInfo?.tenant_id+'' !== 'undefined' ? campaignInfo?.tenant_id+'' : '1';
    const campaignId = campaignInfo?.campaign_id+'' !== 'undefined' ? campaignInfo?.campaign_id+'' : '0';
    fetchCallProgressStatus({ tenantId, campaignId });

    fetchCampaignSkills({
      session_key: session_key,
      tenant_id: tenant_id,
    });

    fetchPhoneDescriptions({
      session_key: session_key,
      tenant_id: tenant_id,
    });  

  };

  // 갱신주기마다 refreshData 실행 useEffect
  useEffect(() => {
    if (statisticsUpdateCycle > 0) {
      const interval = setInterval(() => {
        refreshData();
      }, statisticsUpdateCycle * 1000);
      return () => clearInterval(interval);
    }
  }, [statisticsUpdateCycle, refreshData]);


  
  // return (
  //   <div className="flex flex-col gap-5 h-full out-wrap limit-700">
  //     {shouldRenderSelect && (
  //       <div className="flex justify-between items-center gap-2">
  //         <div className='flex items-center gap-2'>
  //           <Label className="w-20 min-w-20">캠페인</Label>
  //         <Select onValueChange={handleCampaignChange} value={selectedCampaign}>
  //           <SelectTrigger className="w-48">
  //             <SelectValue placeholder="캠페인 전체" />
  //           </SelectTrigger>
  //           <SelectContent>
  //             <SelectItem value="all">캠페인 전체</SelectItem>
  //             {campaigns.map(option => (
  //               <SelectItem key={option.campaign_id} value={option.campaign_id.toString()}>
  //                 [{option.campaign_id}]{option.campaign_name}
  //               </SelectItem>
  //             ))}
  //           </SelectContent>
  //         </Select>

  //         </div>
          
  //         {/* 새로고침 버튼 표시*/}
  //         <div className="flex justify-end gap-2 text-xs text-gray-500 min-w-[260px]">
  //           <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-md">
  //             <span className="w-2 h-2 rounded-full bg-green-500" />
  //             <span>
  //               갱신 주기: <span className="font-medium text-blue-600">{statisticsUpdateCycle}초</span>
  //             </span>
  //           </div>

  //           <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-md max-w[150px] min-w-[150px]">
  //             <span>마지막 갱신:</span>
  //             <span className="font-medium text-blue-600">{formattedLastRefreshTime}</span>
  //           </div>
  //           <CommonButton
  //             variant="outline"
  //             size="sm"
  //             onClick={refreshData}
  //             disabled={isLoading || isRefreshing}
  //             className="flex items-center whitespace-nowrap mr-2"
  //           >
  //             <svg
  //               className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
  //               xmlns="http://www.w3.org/2000/svg"
  //               fill="none"
  //               viewBox="0 0 24 24"
  //               stroke="currentColor"
  //             >
  //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  //             </svg>
  //             {/* {isRefreshing ? "갱신중" : "새로고침"} */}
  //             새로고침
  //           </CommonButton>
  //         </div>
  //       </div>
  //     )}

  //     <div className="flex gap-5 h-[calc(100%-61px)] out-call-responsive-container">
  //       <div className="flex-1 out-call-responsive-left gap-5">
  //         <div className="">
  //           <Table>
  //             <thead>
  //               <TableRow>
  //                 <TableHeader className="!bg-[#DDF4F2] !text-center text-sm font-normal text-[#3A9D6C] !h-[30px]">
  //                   대기 상담사
  //                 </TableHeader>
  //                 <TableHeader className="!bg-[#FEE9EC] !text-center text-sm font-normal text-[#C95E5E] !h-[30px]">
  //                   최초 발신
  //                 </TableHeader>
  //                 <TableHeader className="!bg-[#E8EFFA] !text-center text-sm font-normal text-[#338BD3] !h-[30px]">
  //                   재시도 발신
  //                 </TableHeader>
  //                 <TableHeader className="!bg-[#F6F0FA] !text-center text-sm font-normal text-[#9459BF] !h-[30px]">
  //                   분배 대기
  //                 </TableHeader>
  //               </TableRow>
  //             </thead>
  //             <tbody>
  //               <TableRow>
  //                 <TableCell className="!text-center text-sm !h-[30px]">{waitingCounselorCnt}</TableCell>
  //                 <TableCell className="!text-center text-sm !h-[30px]">{currentData.stats.firstCall}</TableCell>
  //                 <TableCell className="!text-center text-sm !h-[30px]">{currentData.stats.retryCall}</TableCell>
  //                 <TableCell className="!text-center text-sm !h-[30px]">{currentData.stats.distributing}</TableCell>
  //               </TableRow>
  //             </tbody>
  //           </Table>
  //         </div>

  //         <div className="w-full h-[calc(100%-57px)]">
  //           <ResponsiveContainer width="100%" height="100%" className="m-auto">
  //             <BarChart
  //               data={currentData.barData}
  //               margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
  //               layout="vertical"
  //             >
  //               <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
  //               <XAxis
  //                 type="number"
  //                 tick={{ fontSize: 13 }}
  //                 axisLine={{ stroke: '#999' }}
  //               />
  //               <YAxis
  //                 type="category"
  //                 dataKey="name"
  //                 width={100}
  //                 tick={{ fontSize: 13 }}
  //                 axisLine={{ stroke: '#999' }}
  //               />
  //               <Tooltip />
  //               <Bar
  //                 dataKey="value"
  //                 fill="#4FD1C5"
  //                 barSize={20}
  //               />
  //             </BarChart>
  //           </ResponsiveContainer>
  //         </div>
  //       </div>

  //       <div className="grid-custom-wrap flex-1 out-call-responsive-right">
  //         <DataGrid
  //           columns={columns}
  //           rows={currentData.gridData}
  //           className="grid-custom"
  //           rowHeight={30}
  //           headerRowHeight={30}
  //         />
  //       </div>
  //     </div>
  //   </div>
  // );

return (
  isLoading ? (
    <div className="flex items-center justify-center h-full">
      <PulseBarsLoader message="데이터 로딩 중입니다..." showMessage />
    </div>
  ) : (
    <div className="flex flex-col gap-5 h-full out-wrap limit-700">
      {shouldRenderSelect && (
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Label className="w-20 min-w-20">캠페인</Label>
            <Select onValueChange={handleCampaignChange} value={selectedCampaign}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="캠페인 전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">캠페인 전체</SelectItem>
                {campaigns.map(option => (
                  <SelectItem key={option.campaign_id} value={option.campaign_id.toString()}>
                    [{option.campaign_id}]{option.campaign_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 새로고침 버튼 표시 */}
          <div className="flex justify-end gap-2 text-xs text-gray-500 min-w-[260px]">
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-md">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>
                갱신 주기: <span className="font-medium text-blue-600">{statisticsUpdateCycle}초</span>
              </span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-md max-w-[150px] min-w-[150px]">
              <span>마지막 갱신:</span>
              <span className="font-medium text-blue-600">{formattedLastRefreshTime}</span>
            </div>
            <CommonButton
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isLoading || isRefreshing}
              className="flex items-center whitespace-nowrap mr-2"
            >
              <svg
                className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              새로고침
            </CommonButton>
          </div>
        </div>
      )}

      <div className="flex gap-5 h-[calc(100%-61px)] out-call-responsive-container">
        <div className="flex-1 out-call-responsive-left gap-5">
          <div className="">
            <Table>
              <thead>
                <TableRow>
                  <TableHeader className="!bg-[#DDF4F2] !text-center text-sm font-normal text-[#3A9D6C] !h-[30px]">
                    대기 상담사
                  </TableHeader>
                  <TableHeader className="!bg-[#FEE9EC] !text-center text-sm font-normal text-[#C95E5E] !h-[30px]">
                    최초 발신
                  </TableHeader>
                  <TableHeader className="!bg-[#E8EFFA] !text-center text-sm font-normal text-[#338BD3] !h-[30px]">
                    재시도 발신
                  </TableHeader>
                  <TableHeader className="!bg-[#F6F0FA] !text-center text-sm font-normal text-[#9459BF] !h-[30px]">
                    분배 대기
                  </TableHeader>
                </TableRow>
              </thead>
              <tbody>
                <TableRow>
                  <TableCell className="!text-center text-sm !h-[30px]">{waitingCounselorCnt}</TableCell>
                  <TableCell className="!text-center text-sm !h-[30px]">{currentData.stats.firstCall}</TableCell>
                  <TableCell className="!text-center text-sm !h-[30px]">{currentData.stats.retryCall}</TableCell>
                  <TableCell className="!text-center text-sm !h-[30px]">{currentData.stats.distributing}</TableCell>
                </TableRow>
              </tbody>
            </Table>
          </div>

          <div className="w-full h-[calc(100%-57px)]">
            <ResponsiveContainer width="100%" height="100%" className="m-auto">
              <BarChart
                data={currentData.barData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
                <XAxis type="number" tick={{ fontSize: 13 }} axisLine={{ stroke: '#999' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 13 }}
                  axisLine={{ stroke: '#999' }}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#4FD1C5" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid-custom-wrap flex-1 out-call-responsive-right">
          <DataGrid
            columns={columns}
            rows={currentData.gridData}
            className="grid-custom"
            rowHeight={30}
            headerRowHeight={30}
          />
        </div>
      </div>
    </div>
  )
);


};

export default OutboundCallProgressPanel;