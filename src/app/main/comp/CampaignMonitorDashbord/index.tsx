import React, { useState, useEffect, useCallback } from "react";
import { useMainStore, useTabStore } from '@/store';
import TitleWrap from "@/components/shared/TitleWrap";
import { Table, TableRow, TableHeader, TableCell } from "@/components/ui/table-custom";
import { Label } from "@/components/ui/label";
import { CommonRadio, CommonRadioItem } from "@/components/shared/CommonRadio";
import { CommonButton } from "@/components/shared/CommonButton";
import UsageTimePopup from './UsageTimePopup';
import GridView from './GridView';
import ChartView from './ChartView';
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import { useApiForCampaignProgressInformation } from '@/features/monitoring/hooks/useApiForCampaignProgressInformation';
import { CampaignProgressInformationResponseDataType } from '@/features/monitoring/types/monitoringIndex';
import { useEnvironmentStore } from '@/store/environmentStore';
import ServerErrorCheck from "@/components/providers/ServerErrorCheck";

interface CallItem {
  id: number;
  label: string;
}

interface CampaignMonitorDashboardProps {
  campaignId?: string; // props로 캠페인 ID 직접 받기
}

// 캠페인진행정보 초기화 데이터 
const initData: CampaignProgressInformationResponseDataType = {
  tenantId: 0,                   //테넌트ID
  detectMachineRoaming: 0,       //해외로밍밍
  detectMachineEtc: 0,           //기타기계음
  detectMachineMissingNumber: 0, //결번
  detectSilenceCnt: 0,           //10초 동안 묵음 지속
  detectMachineLineBusy: 0,      //소리샘-통화중
  deleteBeforeDial: 0,           //미발신 삭제
  nogautoPopNotDial: 0,          //미발신 사유 코드 Autopreview시 Popup 수신후, 상담사 미발신 선택
  nogtimeOutCallback: 0,         //미발신 사유 코드 콜백 Time over
  nogautoPopNoReady: 0,          //미발신 사유 코드 Autopreview시 Popup 수신후, 상담사 상태 변경
  nogautoDialNoReady: 0,         //미발신 사유 코드 Autopreview시 CIDS->CIOD 발신 여부 확인전, 상담사 상태변경
  nogtimeContradictory: 0,       //미발신 사유 코드 발신방지, 예약시간 잘못 설정
  nogautoDialFailMode: 0,        //미발신 사유 코드 Autopreview시 CIDS->CIOD 발신 여부 확인전, 상담사 모드변경
  agentNoAnswerCnt: 0,           //상담사 무응답
  nogautoNoEmployeeId: 0,        //미발신 사유 코드 SystemPreview시 발신리스트에 상담사 이름이 입력되지 않음
  nogautoPopNoAnswer: 0,         //미발신 사유 코드 Autopreview시 Popup 수신후, 발신여부 선택 안함
  detectMachineNoanswer: 0,      //소리샘-무응답
  customerOnHookCnt: 0,          //고객이 바로 끊은 건수
  detectMachinePowerOff: 0,      //소리샘-전원꺼짐
  nogautoPopFailMode: 0,         //미발신 사유 코드 Autopreview시 Popup 수신후, 상담사 모드 변경
  reuseCnt: 0,                   //캠페인 재사용 회수 : 1(최초 발신), 2~(재발신)
  campId: 0,                     //캠페인ID
  totLstCnt: 0,                  //총 리스트 건수
  totDialCnt: 0,                 //총 발신 건수
  acct: 0,                       //기계음 실패 건수
  scct: 0,                       //발신 성공 건수
  overDial: 0,                   //대기 상담사 없음
  nonTTCT: 0,                    //순수 발신 건수
  campListQuery: '',              //List Query
  tect: 0,                       //전화번호 오류 건수
  blackList: 0,                  //통화방지 리스트
  abct: 0,                       //상담사 연결 실패
  retryCall: 0,                  //재시도 콜(현재 버퍼에 남은 Call 중 재시도 할 Call수)
  dialingCall: 0,                //발신 중인 콜
  nonServiceCnt: 0,              //고객 최대시간 초과
  firstCall: 0,                  //최초 시도 콜(현재 버퍼에 남은 Call 중 최초시도 할 Call수)
  agentBusyCnt: 0,               //상담사 통화 중
  blackListCall: 0,              //통화방지 콜
  fileIndex: 0,                  //
  recallCnt: 0,                  //예약 리스트(현재 남은 Call 중 남은 예약 Call수)
  lineStopCnt: 0,                //다이얼 실패 건수
  fact: 0,                       //팩스/모뎀 실패 건수
  noAgentCnt: 0,                 //멘트 청취 후 상담사 미연결
  nogdeleteGL: 0,                //미발신 사유 코드 실시간 발신방지 건수
  nogaddBL: 0,                   //미발신 사유 코드 실시간 블랙리스트 추가
  agentDropCnt: 0,               //상담사 바로 끊음
  customerDropCnt: 0,            //고객 포기
  nact: 0,                       //무응답 실패 건수
  deleteAfterDial: 0,            //발신 후 삭제
  etct: 0,                       //기타 실패 건수
  timeoutRecall: 0,              //타임아웃 콜(시간이 지나서 발신하지 않은 예약 호)
  dialToneSilence: 0,            //다이얼 톤이 안 들림
  buct: 0,                       //통화 중 실패 건수
  agentConnect: 0,               //상담사 연결
  nognotDialAgent: 0,            //미발신 사유 코드 지정상담사가 Dial이 아닐 때
  nogblockTime: 0,               //미발신 사유 코드 발신방지 시각
  nognotDialReady: 0,            //미발신 사유 코드 지정상담사가 Ready가 아닐 때
}

type ViewType = "gridView" | "chartView";

const CampaignMonitorDashboard: React.FC<CampaignMonitorDashboardProps> = ({ campaignId }) => {
  // 상태 추가
  const [viewType, setViewType] = useState<ViewType>("gridView");
  const [selectedCall, setSelectedCall] = useState<CampaignProgressInformationResponseDataType | null>(null);
  const { statisticsUpdateCycle } = useEnvironmentStore();
  const intervalCampaignMonitorDashbordRef = React.useRef<NodeJS.Timeout | null>(null);
  const { activeTabId, secondActiveTabId, activeTabKey, secondActiveTabKey, openedTabs } = useTabStore();

  // 사용자가 선택한 발신차수 저장용 - 09/06 추가 lab09
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  // props로 전달받은 campaignId를 사용
  const numericCampaignId = campaignId ? Number(campaignId) : null;

  const { campaigns, campaignProgressInfoViewType, setCampaignProgressInfoViewType } = useMainStore();
  const [campaignInfo, setCampaignInfo] = useState<MainDataResponse | null>(null);
  const [dataList, setDataList] = useState<CampaignProgressInformationResponseDataType[]>([initData]);
  const [campaignIdList, setCampaignIdList] = useState<number[]>([]);
  const [isPopup, setIsPopup] = useState(false);
  const [usageTimePopupState, setUsageTimePopupState] = useState<{
    campaignIdList: number[];
    dialKindList: number[];
    isOpen: boolean;
  }>({
    campaignIdList: [],
    dialKindList: [],
    isOpen: false,
  });

  // 라디오 버튼 변경 핸들러
  const handleViewTypeChange = (value: string) => {
    setViewType(value as ViewType);
    setCampaignProgressInfoViewType(value as ViewType);
  };

  // 캠페인 진행 정보 API 호출 (useMutation 사용)
  const { 
    mutate: fetchProgressData,
    data: progressData, 
    isPending, 
    isError,
  } = useApiForCampaignProgressInformation({
    onSuccess: (data) => {
      // console.log("캠페인 진행 정보 API 성공:", data);
      
      if (data && data.progressInfoList.length > 0) {
        const tempList = [...data.progressInfoList].sort((a, b) => a.reuseCnt - b.reuseCnt);
        setDataList(tempList);
        
        // 첫 번째 항목을 선택 (데이터가 있는 경우에만)
        // 마지막 항목 선택으로 변경 20250325
        // 사용자가 선택한 발신차수 interval 마다 유지되어야함 -> selectIndex 상태관리 추가 (책임님께 의견 묻기)
        if (tempList.length > 0 && selectedCall == null ) {
          // 최초 로딩시에 마지막 발신차수 선택
          setSelectedCall(tempList[tempList.length-1]);
        }else if (tempList.length > 0 && selectedCall != null && selectedCall.campId === tempList[0].campId && 
          selectedIndex !== null && selectedIndex < tempList.length){ 
          // campId !== 에서 === 으로 변경 09/06 - lab09
          // 사용자가 선택한 발신차수가 있을때 (최초 로딩 제외- 갱신주기 마다 조회시 적용)
          setSelectedCall(tempList[selectedIndex]);
        }else if(tempList.length > 0 && selectedCall != null && selectedCall.campId === tempList[0].campId){
          // 사용자가 선택한 발신차수가 없을때 (최초 로딩 제외- 갱신주기 마다 조회시 적용)
          setSelectedCall(tempList[tempList.length-1]);
        }else {
           setSelectedCall(null); // 위 조건에 해당하지 않을때 null? initData?
        }
        
        // else if (temList.length === 0) << if (data && data.progressInfoList.length > 0) 이 조건으로 걸러냈는데 굳이?
        // else if(tempList.length == 0){
        //   setSelectedCall(null);
        // }

      }else if (data && data.progressInfoList.length == 0) {
        setDataList([initData]);
        setSelectedCall(initData);
      }
    },onError: (error) => {
      if (intervalCampaignMonitorDashbordRef.current) {
        clearInterval(intervalCampaignMonitorDashbordRef.current);
      }
      ServerErrorCheck('캠페인 진행 정보 조회', error.message);
    }
  });

  // console.log("progressData 확인 : ", progressData);
  
  // 데이터 갱신 함수
  // const refreshData = useCallback(() => {
  //   if (numericCampaignId) {
  //     fetchProgressData({
  //       tenantId: campaigns.find(data => data.campaign_id === numericCampaignId)?.tenant_id || 1,
  //       campaignId: numericCampaignId
  //     });
  //   } else {
  //     // console.warn("캠페인 ID가 없어 API 호출이 비활성화됩니다.");
  //   }
  // }, [fetchProgressData, numericCampaignId]);

  const refreshData = ()=>{
      if (numericCampaignId) {
      fetchProgressData({
        tenantId: campaigns.find(data => data.campaign_id === numericCampaignId)?.tenant_id || 1,
        campaignId: numericCampaignId
      });
    } else {
      // console.warn("캠페인 ID가 없어 API 호출이 비활성화됩니다.");
    }
  };

  useEffect(()=>{
    refreshData();
  }, [fetchProgressData, numericCampaignId]);

  useEffect(() => {   
    if( campaignProgressInfoViewType != ''){      
      setViewType(campaignProgressInfoViewType as ViewType);
    }
  }, [campaignProgressInfoViewType]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsPopup(!!(window.opener && window.opener !== window));
    }
  }, []);

  // 컴포넌트 마운트 시 캠페인 정보 로드 및 데이터 조회
  useEffect(() => {
    // console.log("컴포넌트 마운트, 캠페인 ID:", numericCampaignId);
    // console.log('activeTabId changed: ',isPopup, activeTabId, activeTabKey,secondActiveTabId, secondActiveTabKey, openedTabs);
    
    if (numericCampaignId && ( (activeTabId === 21 && activeTabKey?.split('-')[2] === numericCampaignId+'')
      || ( typeof secondActiveTabKey === 'string' && secondActiveTabKey?.split('-')[2] === numericCampaignId+'' ) || isPopup)
    ) {
      // 캠페인 정보 찾기
      if (campaigns && campaigns.length > 0) {
        const tempCampaign = campaigns.find(data => data.campaign_id === numericCampaignId);
        // console.log("찾은 캠페인 정보:", tempCampaign);
        
        if (tempCampaign) {
          setCampaignInfo(tempCampaign);
          setCampaignIdList([numericCampaignId]);
        }
      }
      
      // 최초 데이터 조회
      fetchProgressData({
        tenantId: campaigns.find(data => data.campaign_id === numericCampaignId)?.tenant_id || 1,
        campaignId: numericCampaignId
      });
      if( statisticsUpdateCycle > 0 ){             
        intervalCampaignMonitorDashbordRef.current = setInterval(() => {
          refreshData();
        }, statisticsUpdateCycle * 1000);
        return () => clearInterval(intervalCampaignMonitorDashbordRef.current!);
      }    
    } else {
      if (intervalCampaignMonitorDashbordRef.current) {
        clearInterval(intervalCampaignMonitorDashbordRef.current);
      }
    }
    return () => {
      if (intervalCampaignMonitorDashbordRef.current) {
        clearInterval(intervalCampaignMonitorDashbordRef.current);
      }
    };
  }, [numericCampaignId, campaigns,statisticsUpdateCycle, activeTabId, secondActiveTabId, activeTabKey, secondActiveTabKey,isPopup]);

  return (
    <div className="flex gap-4 w-full limit-width h-full">
      {/* 왼쪽 설정 영역 */}
      <div className="flex flex-col gap-5 w-[230px] min-w-[230px] h-full">
        <div>
          <TitleWrap title="캠페인 정보" />
          <Table>
            <tbody>
              <TableRow>
                <TableHeader className="w-[120px]">
                  <Label>캠페인 아이디</Label>
                </TableHeader>
                <TableCell>
                  <span className="text-sm">{campaignInfo?.campaign_id || numericCampaignId || ''}</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHeader className="w-[120px]">
                  <Label>캠페인 이름</Label>
                </TableHeader>
                <TableCell>
                  <span className="text-sm">{campaignInfo?.campaign_name || ''}</span>
                </TableCell>
              </TableRow>
            </tbody>
          </Table>
        </div>

        <div>
          <TitleWrap title="표시 방법" />
          <CommonRadio 
            className="flex gap-8 pl-4" 
            value={viewType} 
            onValueChange={handleViewTypeChange}
          >
            <div className="flex items-center space-x-2">
              <CommonRadioItem value="gridView" id="gridView" />
              <Label htmlFor="gridView">그리드형</Label>
            </div>
            <div className="flex items-center space-x-2">
              <CommonRadioItem value="chartView" id="chartView" />
              <Label htmlFor="chartView">차트형</Label>
            </div>
          </CommonRadio>
        </div>

        <div className="flex-1 h-[250px]">
          <TitleWrap title="발신 구분" />
          <div className="border rounded overflow-y-scroll h-[calc(100%-20px)]">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {/* {isPending ? ( */}
                {false ? (
                  <tr>
                    <td className="p-4 text-center text-gray-500">로딩 중...</td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td className="p-4 text-center text-gray-500">데이터 로드 오류</td>
                  </tr>
                ) : dataList ? dataList.map((item, index) => (
                  <tr
                    key={item.reuseCnt}
                    onClick={() => {
                      setSelectedCall(item);
                      setSelectedIndex(index); //  사용자 선택 차수 추가 - 09/06 lab09
                    }
                  }
                    className={`cursor-pointer hover:bg-[#FFFAEE] ${
                      selectedCall?.reuseCnt === item.reuseCnt ? "bg-[#FFFAEE]" : ""
                    }`}
                  >
                    <td className="border-b border-r px-3 py-1">
                      {index === 0 ? '최초 발신' : index + '번째 재발신'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td className="p-4 text-center text-gray-500">데이터가 없습니다</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <CommonButton
            variant="outline"
            onClick={refreshData}
            disabled={isPending}
          >
            새로고침
          </CommonButton>
          <CommonButton 
            onClick={() => 
              setUsageTimePopupState({
                ...usageTimePopupState,
                campaignIdList: campaignIdList,
                dialKindList: [selectedCall?.reuseCnt || 0],
                isOpen: true,
              })}
            disabled={!selectedCall}
          >
            사용 시간 보기
          </CommonButton>
        </div>
      </div>

      {/* 오른쪽 대시보드 영역 */}
      <div className="flex-1">
        {viewType === "gridView" ? 
          <GridView selectedCall={selectedCall} /> : 
          <ChartView selectedCall={selectedCall} />
        }
      </div>

      {/* 사용 시간 팝업 */}
      <UsageTimePopup 
        campaignIdList={usageTimePopupState.campaignIdList}
        dialKindList={usageTimePopupState.dialKindList}
        isOpen={usageTimePopupState.isOpen}
        onClose={() => setUsageTimePopupState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default CampaignMonitorDashboard;