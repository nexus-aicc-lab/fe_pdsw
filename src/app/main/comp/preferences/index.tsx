import React, { useState, useEffect } from 'react';
import { Table, TableRow, TableHeader, TableCell } from "@/components/ui/table-custom";
import { CommonRadio, CommonRadioItem } from "@/components/shared/CommonRadio";
import { Label } from "@/components/ui/label";
import { CustomInput } from "@/components/shared/CustomInput";
import { CommonButton } from "@/components/shared/CommonButton";
import { CustomCheckbox } from "@/components/shared/CustomCheckbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import TitleWrap from "@/components/shared/TitleWrap";
import { useEnvironmentStore } from '@/store/environmentStore';
import { useAuthStore } from '@/store/authStore';
import { useApirForEnvironmentSave } from '@/features/auth/hooks/useApiForEnvironment';
import { useApiForOperatingTime } from '@/features/preferences/hooks/useApiForOperatingTime';
import { useApiForOperatingTimeUpdate } from '@/features/preferences/hooks/useApiForOperatingTimeUpdate';
import CustomAlert from '@/components/shared/layout/CustomAlert';
import { useRouter } from 'next/navigation';
import { useTabStore } from '@/store/tabStore';
import CustomInputForTime from '@/components/shared/CustomInputForTime';

// API에 전송할 데이터 구조
interface PreferencesData {
  campaignListAlram: number;
  statisticsUpdateCycle: number;
  serverConnectionTime: number;
  showChannelCampaignDayScop: number;
  personalCampaignAlertOnly: number;
  useAlramPopup: number;
  unusedWorkHoursCalc: number;
  sendingWorkStartHours: string;
  sendingWorkEndHours: string;
  dayOfWeekSetting: string;
  maskInfo: number;
}

interface PreferencesBoardProps {
  onSubmit?: (data: PreferencesData) => void;
}

// "campaignListAlram": 0,  			알림 설정 - 리스트 잔량 부족 시 알람 모드(주기적으로 계속) 0: 한 번만, 1: 주기적으로 계속
// "statisticsUpdateCycle": 20,  		통계 갱신 주기 - 통계 가져오기 주기
// "serverConnectionTime": 100,		서버 접속 시간 - 서버와의 접속 시간을 설정합니다.
// "showChannelCampaignDayScop": 5,	채널 할당 시 보여 주는 캠페인 - 채널 할당 캠페인 범위
// "personalCampaignAlertOnly": 0,		알림 옆 라벨 - 본인 캠페인만 알림 여부 (체크 안 함) 0:전체, 1:본인
// "useAlramPopup": 0,					메시지 알림창 - 알람 팝업 사용 여부 (알리지 않음) 0:알리지 않음, 1:알림
// "unusedWorkHoursCalc": 1,			캠페인 기능 업무 시간 라벨 - 업무 시간 적용 여부 (체크) 체크되어 있을 때는 캠페인 가능 업무 시간 다 Disabled 0:사용, 1:미사용
// "sendingWorkStartHours": "0000",	발신 업무 시간 시작 시간 - 발신 업무 시작 시간
// "sendingWorkEndHours": "0000",		발신 업무 시간 종료 시간 - 발신 업무 종료 시간
// "dayOfWeekSetting": "f,f,f,f,f,f,f"	요일 설정 - 발신 업무 가능 요일 (f는 체크 안 됨, t는 체크)

export default function PreferencesBoard({ onSubmit }: PreferencesBoardProps) {
  const router = useRouter();

  // 환경설정 스토어에서 데이터 가져오기
  const { environmentData, setEnvironment, maskInfo } = useEnvironmentStore();
  // 사용자 인증 정보 가져오기
  const { id: userId, tenant_id } = useAuthStore();

  // 알림 상태
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: '',
    title: '알림',
    type: '1',
    onConfirm: () => { },
    onCancel: () => { }
  });

  // 상태 초기화 - 기본값 없이 environmentData에서만 가져오도록 수정
  const [refreshCycle, setRefreshCycle] = useState("");
  const [monitoringType, setMonitoringType] = useState("");
  const [retryCount, setRetryCount] = useState("");
  const [timeout, setCustomTimeout] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [messageType, setMessageType] = useState("");
  const [personalCampaignAlertOnly, setPersonalCampaignAlertOnly] = useState(false);
  const [unusedWorkHoursCalc, setUnusedWorkHoursCalc] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState<string[]>(['f', 'f', 'f', 'f', 'f', 'f', 'f']);
  const [isSaving, setIsSaving] = useState(false);

  const [localMaskInfo, setLocalMaskInfo] = useState(1);

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  const { activeTabId, activeTabKey, removeTab } = useTabStore();

  // 알림 유틸리티 함수
  const showAlert = (message: string) => {
    setAlertState({
      isOpen: true,
      message,
      title: '알림',
      type: '2',
      onConfirm: closeAlert,
      onCancel: () => { }
    });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
    closeCurrentTab();
  };

  const closeCurrentTab = () => {
    if (activeTabId !== null && activeTabKey !== null) {
      removeTab(activeTabId, activeTabKey);
    }
  };

  const convertBinaryString = (input: string) => {
    return input
      .split('')               // 문자열을 문자 배열로 변환
      .map(char => char === '1' ? 't' : 'f') // 각각 '1'이면 't', 아니면 'f'로
      .join(',');              // 쉼표로 연결
  };
  const convertArrayToBinaryString = (arr: string[]) => {
    let rtnValue = '';
    for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] === 'string' && arr[i].indexOf('t') > -1) {
        rtnValue = rtnValue + '1';
      } else {
        rtnValue = rtnValue + '0';
      }
    }
    return rtnValue.padEnd(7, '0');
  };

  // 환경설정 수정 API 호출
  const { mutate: environmentSave } = useApirForEnvironmentSave({
    onSuccess: (data) => {
      setIsSaving(false);

      // 환경설정 스토어도 업데이트하여 UI 반영
      if (environmentData) {
        const updatedData = {
          ...environmentData,
          campaignListAlram: monitoringType === "oneTime" ? 1 : 0,
          statisticsUpdateCycle: parseInt(retryCount),
          serverConnectionTime: parseInt(timeout),
          showChannelCampaignDayScop: parseInt(refreshCycle),
          personalCampaignAlertOnly: personalCampaignAlertOnly ? 1 : 0,
          useAlramPopup: messageType === "알림만" ? 1 : 0,
          unusedWorkHoursCalc: unusedWorkHoursCalc ? 1 : 0,
          sendingWorkStartHours: unusedWorkHoursCalc ? '0000' : startTime,
          sendingWorkEndHours: unusedWorkHoursCalc ? '0000' : endTime,
          dayOfWeekSetting: unusedWorkHoursCalc ? '0000000' : dayOfWeek.join(','),
          maskInfo : localMaskInfo
        };
        setEnvironment(updatedData);

        if (unusedWorkHoursCalc) {
          fetchOperatingTimeUpdate({
            start_time: '0000',
            end_time: '0000',
            days_of_week: '0000000'
          });
          setStartTime("0000");
          setEndTime("0000");
          setDayOfWeek(['f', 'f', 'f', 'f', 'f', 'f', 'f']);
          setUnusedWorkHoursCalc(true);
        } else {
          const work = convertArrayToBinaryString(dayOfWeek);
          fetchOperatingTimeUpdate({
            start_time: startTime,
            end_time: endTime,
            days_of_week: work
          });
          setStartTime(startTime);
          setEndTime(endTime);
          setDayOfWeek(dayOfWeek);
          setUnusedWorkHoursCalc(false);
        }
        const channel = new BroadcastChannel('environmentChannel');
        channel.postMessage({ type: 'ENV_UPDATED', payload: updatedData });
        // 통합모니터 (팝업) 인 경우를 위해 전송

        showAlert('환경설정이 저장되었습니다');
      }
    },
    onError: (error) => {
      setIsSaving(false);
      showAlert(`환경설정 저장에 실패했습니다. ${error.message}`);
    }
  });

  // 캠페인 운용 가능 시간 조회 API 호출
  const { mutate: fetchOperatingTime } = useApiForOperatingTime({
    onSuccess: (data) => {
      
      const startTime = data.result_data.start_time;
      const endTime = data.result_data.end_time;
      const work = data.result_data.days_of_week;
      if (startTime === '0000' && endTime === '0000' && work === '0000000') {
        setStartTime("0000");
        setEndTime("0000");
        setDayOfWeek(['f', 'f', 'f', 'f', 'f', 'f', 'f']);
        setUnusedWorkHoursCalc(true);
      } else {
        setStartTime(startTime);
        setEndTime(endTime);
        setDayOfWeek(convertBinaryString(work).split(','));
        setUnusedWorkHoursCalc(false);
      }
    },
    onError: (error) => {

    }
  });

  // 캠페인 운용 가능 시간 수정 API 호출
  const { mutate: fetchOperatingTimeUpdate } = useApiForOperatingTimeUpdate({
    onSuccess: (data) => {
      if (data.result_code !== 0) {
        showAlert('발신 업무 시간 저장 중 오류가 발생하였습니다.');
        return;
      }
      // console.log(data);
    },
    onError: (error) => {

    }
  });

  // 환경설정 데이터가 로드되면 상태 업데이트
  useEffect(() => {
    if (environmentData) {
      // 환경설정 데이터에서 값 설정
      setRefreshCycle(environmentData.showChannelCampaignDayScop?.toString() || "");
      setMonitoringType(environmentData.campaignListAlram === 1 ? "oneTime" : "periodic");
      setRetryCount(environmentData.statisticsUpdateCycle?.toString() || "");
      setCustomTimeout(environmentData.serverConnectionTime?.toString() || "");
      setPersonalCampaignAlertOnly(environmentData.personalCampaignAlertOnly === 1);
      setMessageType(environmentData.useAlramPopup === 1 ? "알림만" : "알림과 없음");
      setUnusedWorkHoursCalc(environmentData.unusedWorkHoursCalc === 1);
      setLocalMaskInfo(environmentData.maskInfo === 1 ? 1 : 0);
      // setStartTime(environmentData.sendingWorkStartHours || "");
      // setEndTime(environmentData.sendingWorkEndHours || "");

      // 요일 설정 파싱
      // if (environmentData.dayOfWeekSetting) {
      //   setDayOfWeek(environmentData.dayOfWeekSetting.split(','));
      // }
    }else{
      setRefreshCycle("5");
      setMonitoringType("periodic");
      setRetryCount("30");
      setCustomTimeout("100");
      setPersonalCampaignAlertOnly(false);
      setMessageType("알림과 없음");
      setUnusedWorkHoursCalc(false);
      setStartTime("0000");
      setEndTime("0000");
      setDayOfWeek(['f', 'f', 'f', 'f', 'f', 'f', 'f']);
      setLocalMaskInfo(1);
    }
  }, [environmentData]);

  // 요일 체크박스 변경 핸들러
  const handleDayChange = (index: number, checked: boolean) => {
    const newDays = [...dayOfWeek];
    newDays[index] = checked ? 't' : 'f';
    setDayOfWeek(newDays);
  };

  const handleCancel = () => {
    closeCurrentTab();
  };


  // #### 유효한 시간 형식인지 확인 (4자리 문자열이고, 시는 00~23, 분은 00~59이어야 함)
  const isTimeFormatValid = (time: string) => {
    if (time.length !== 4) return false;
    const hours = Number(time.substring(0, 2));
    const minutes = Number(time.substring(2, 4));
    if (isNaN(hours) || isNaN(minutes)) return false;
    if (hours < 0 || hours > 23) return false;
    if (minutes < 0 || minutes > 59) return false;
    return true;
  };

  // #### 추가적인 유효성 예시("1112"인 경우 무효)와 24시간 체제 확인
  const validateTime = (time: string) => {
    // "1112"는 예시로 무효 처리
    if (time === "1112") return false;
    return isTimeFormatValid(time);
  };



  // 폼 제출 핸들러
  const handleSubmit = () => {
    if (!environmentData) {
      showAlert('환경설정 데이터를 불러올 수 없습니다.');
      return;
    }

    // #### 필수 입력 및 기본 유효성 검사
    if (startTime.length === 4 && endTime.length === 4) {
      // 24시간 범위를 벗어난 경우
      if (!isTimeFormatValid(startTime) || !isTimeFormatValid(endTime)) {
        setAlertState({
          ...alertState,
          isOpen: true,
          message: "잘못된 시간 형식입니다. 00:00 ~ 23:59 범위 내 입력해 주세요.",
        });
        return;
      }
      // #### 시작시간/종료시간 추가 유효성 검사 (예: "1112" 무효 처리)
      if (!validateTime(startTime) || !validateTime(endTime)) {
        setAlertState({
          ...alertState,
          isOpen: true,
          message: "잘못된 시간입니다.",
        });
        return;
      }
      // #### 시작시간이 종료시간보다 늦은 경우
      if (startTime > endTime) {
        setAlertState({
          ...alertState,
          isOpen: true,
          message: "시작 시간이 종료 시간보다 늦을 수 없습니다.",
        });
        return;
      }
      // #### 업무시간 제한 미사용이 체크되지 않으며, 시작시각과 종료시각이 입력되었지만 요일 설정이 되지 않은경우
      if (!unusedWorkHoursCalc && dayOfWeek.findIndex(day => day === "t") === -1) {
        setAlertState({
          ...alertState,
          isOpen: true,
          message: "업무 시간 제한 사용 시 요일 설정이 필요합니다.",
        });
        return;
      }

      let check = false;

      if (
        startTime.replace(":", "") === startTime &&
        endTime.replace(":", "") === endTime
      ) {
        check = true;
      }

      if (!check) {
        setStartTime("");
        setEndTime("");

        return;
      }
    }

    setIsSaving(true);

    // API 요청을 위한 데이터 형식으로 변환
    const requestData = {
      employeeId: userId,
      campaignListAlram: monitoringType === "oneTime" ? 1 : 0,
      statisticsUpdateCycle: parseInt(retryCount) || environmentData.statisticsUpdateCycle,
      serverConnectionTime: parseInt(timeout) || environmentData.serverConnectionTime,
      showChannelCampaignDayScop: parseInt(refreshCycle) || environmentData.showChannelCampaignDayScop,
      personalCampaignAlertOnly: personalCampaignAlertOnly ? 1 : 0,
      useAlramPopup: messageType === "알림만" ? 1 : 0,
      unusedWorkHoursCalc: unusedWorkHoursCalc ? 1 : 0,
      sendingWorkStartHours: startTime || environmentData.sendingWorkStartHours,
      sendingWorkEndHours: endTime || environmentData.sendingWorkEndHours,
      dayOfWeekSetting: dayOfWeek.join(','),
      maskInfo: localMaskInfo
    };
    // #### 여기야

    // 환경설정 저장 API 호출
    environmentSave(requestData);

    // 상위 컴포넌트의 onSubmit이 있는 경우에도 호출
    if (onSubmit) {
      onSubmit(requestData);
    }
  };

  useEffect(() => {
    fetchOperatingTime();
  }, [fetchOperatingTime]);




  return (
    <div className="w-full limit-width">
      <div className="flex-col flex gap-5">
        <div>
          <TitleWrap title="화면표시" />
          <Table className='text-[#333]'>
            <tbody>
              <TableRow>
                <TableHeader className="w-[12.5rem] !pt-[6px] !pb-[5px]">
                  <Label className="w-32">채널 할당 시 보여 주는 캠페인</Label>
                </TableHeader>
                <TableCell className="w-[20rem]">
                  <div className="inline-flex items-center gap-1 flex-nowrap">
                    <CustomInput
                      type="number"
                      value={refreshCycle}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numericValue = Number(value);

                        if (value === '') {
                          setRefreshCycle('');
                        } else if (!isNaN(numericValue)) {
                          setRefreshCycle(Math.min(numericValue, 100).toString());
                        }
                      }}
                      className="!w-20 flex-shrink-0"
                      max={100}
                      isFullWidth={false}
                    />
                    <span className="text-sm whitespace-nowrap">일(day)</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">채널을 캠페인 모드로 할당 시 화면에 보여 주는 캠페인의 범위를 선택합니다. 현재 날짜를 기준으로 설정한 값만큼의 범위 안에서 캠페인을 보여 줍니다.</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHeader className="w-[12.5rem] !py-[6px]">
                  <Label className="w-32">일람 설정</Label>
                </TableHeader>
                <TableCell className="w-[20rem]">
                  <CommonRadio value={monitoringType} onValueChange={setMonitoringType} className="flex gap-8">
                    <div className="flex items-center space-x-2">
                      <CommonRadioItem value="oneTime" id="oneTime" />
                      <Label htmlFor="oneTime">한번만</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CommonRadioItem value="periodic" id="periodic" />
                      <Label htmlFor="periodic">주기적으로 계속</Label>
                    </div>
                  </CommonRadio>
                </TableCell>
                <TableCell>
                  <span className="text-sm">캠페인 리스트 잔량 부족 시의 알람 모드를 설정합니다.</span>
                </TableCell>
              </TableRow>
              {/* 2026-01-07 고객명, 고객번호 마스킹처리 새로 추가 - rody */}
              <TableRow>
                <TableHeader className="w-[12.5rem] !py-[6px]">
                  <Label className="w-32">고객정보 마스킹 설정</Label>
                </TableHeader>
                <TableCell className="w-[20rem]">
                  <CommonRadio value={String(localMaskInfo)} onValueChange={(value) => setLocalMaskInfo(Number(value))} className="flex gap-8">
                    <div className="flex items-center space-x-2">
                      <CommonRadioItem value="1" id="maskInfo-on" />
                      <Label htmlFor="maskInfo-on">설정</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CommonRadioItem value="0" id="maskInfo-off" />
                      <Label htmlFor="maskInfo-off">비설정</Label>
                    </div>
                  </CommonRadio>
                </TableCell>
                <TableCell>
                  <span className="text-sm">모니터링 정보 중 고객명, 고객번호에 대한 마스킹을 설정합니다.</span>
                </TableCell>
              </TableRow>
            </tbody>
          </Table>
        </div>
        <div>
          <TitleWrap title="통신" />
          <Table className='text-[#333]'>
            <tbody>
              {/* <TableRow>
                <TableHeader className="w-[12.5rem] !pt-[6px] !pb-[5px]">
                  <Label className="w-32">통계 갱신 주기</Label>
                </TableHeader>
                <TableCell className="w-[20rem]">
                  <div className="flex items-center gap-3">
                    <CustomInput
                      type="number"
                      value={retryCount}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numericValue = Number(value);

                        if (value === '') {
                          setRetryCount('');
                        } else if (!isNaN(numericValue)) {
                          setRetryCount(Math.min(numericValue, 60).toString());
                        }
                      }
                      }
                      className="w-20"
                      max={60}
                    />
                    <span className="text-sm whitespace-nowrap">초(sec)</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">캠페인 통계를 서버로부터 가져오는 주기를 설정합니다. (권장 30~60초)</span>
                </TableCell>
              </TableRow> */}

              <TableRow>
                <TableHeader className="w-[12.5rem] !pt-[6px] !pb-[5px]">
                  <Label className="w-32">통계 갱신 주기</Label>
                </TableHeader>
                <TableCell className="w-[20rem]">
                  <div className="inline-flex items-center gap-1 flex-nowrap">
                    <CustomInput
                      type="number"
                      value={retryCount}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numericValue = Number(value);

                        if (value === '') {
                          setRetryCount('');
                        } else if (!isNaN(numericValue)) {
                          setRetryCount(Math.min(numericValue, 60).toString());
                        }
                      }}
                      className="!w-20 flex-shrink-0"
                      max={60}
                      isFullWidth={false}
                    />
                    <span className="text-sm whitespace-nowrap">초(sec)</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">캠페인 통계를 서버로부터 가져오는 주기를 설정합니다. (권장 30~60초)</span>
                </TableCell>
              </TableRow>

              {/* <TableRow>
                <TableHeader className="w-[12.5rem] !py-[6px]">
                  <Label className="w-32">서버 접속 시간</Label>
                </TableHeader>
                <TableCell className="w-[20rem]">
                  <div className="flex items-center gap-3">
                    <CustomInput
                      type="number"
                      value={timeout}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numericValue = Number(value);

                        if (value === '') {
                          setCustomTimeout('');
                        } else if (!isNaN(numericValue)) {
                          setCustomTimeout(Math.min(numericValue, 100).toString());
                        }
                      }
                      }
                      className="w-20"
                      max={100}
                    />
                    <span className="text-sm whitespace-nowrap">초(sec)</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">서버와의 접속 시간을 설정합니다.</span>
                </TableCell>
              </TableRow> */}

              <TableRow>
                <TableHeader className="w-[12.5rem] !py-[6px]">
                  <Label className="w-32">서버 접속 시간</Label>
                </TableHeader>
                <TableCell className="w-[20rem]">
                  <div className="inline-flex items-center gap-1 flex-nowrap">
                    <CustomInput
                      type="number"
                      value={timeout}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numericValue = Number(value);

                        if (value === '') {
                          setCustomTimeout('');
                        } else if (!isNaN(numericValue)) {
                          setCustomTimeout(Math.min(numericValue, 100).toString());
                        }
                      }}
                      className="!w-20 flex-shrink-0"
                      max={100}
                      isFullWidth={false}
                    />
                    <span className="text-sm whitespace-nowrap">초(sec)</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">서버와의 접속 시간을 설정합니다.</span>
                </TableCell>
              </TableRow>

            </tbody>
          </Table>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-8">
              <h2 className="text-sm">알림</h2>
              <div className='flex items-center gap-1'>
                <CustomCheckbox
                  id="notification-enable"
                  checked={personalCampaignAlertOnly}
                  onCheckedChange={(checked) => setPersonalCampaignAlertOnly(checked as boolean)}
                />
                <Label htmlFor="notification-enable" className="text-sm">본인 캠페인만 업링크 알림</Label>
              </div>
            </div>
          </div>
          <Table className='text-[#333]'>
            <tbody>
              <TableRow>
                <TableHeader className="w-[12.5rem] !py-[6px]">
                  <Label className="w-32">메시지 알림창</Label>
                </TableHeader>
                <TableCell className="w-[20rem]">
                  <div className="flex items-center gap-3">
                    <Select value={messageType} onValueChange={setMessageType}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="알림 설정" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="알림과 없음">알리지 않음</SelectItem>
                        <SelectItem value="알림만">알림</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">주요 이벤트 알림창 알림을 설정합니다.</span>
                </TableCell>
              </TableRow>
            </tbody>
          </Table>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-8">
              <h2 className="text-sm">캠페인 가능 업무시간</h2>
              <div className='flex items-center gap-1'>
                <CustomCheckbox
                  id="worktime-enable"
                  checked={unusedWorkHoursCalc}
                  onCheckedChange={(checked) => setUnusedWorkHoursCalc(checked as boolean)}
                  disabled={tenant_id !== 0}
                />
                <Label htmlFor="worktime-enable" className="text-sm">업무 시간 제한 미사용</Label>
              </div>
            </div>
          </div>
          <Table className='text-[#333]'>
            <tbody>
              <TableRow>
                <TableHeader className="w-[12.5rem] !pt-[6px] !pb-[5px]">
                  <Label className="w-32">발신 업무 시간</Label>
                </TableHeader>
                <TableCell className="w-[20rem]">
                  <div className="flex items-center gap-3">
                    <Label>시작 시각</Label>
                    <CustomInputForTime
                      value={startTime}
                      onChange={(value) => setStartTime(value)}
                      className="w-16"
                      disabled={tenant_id !== 0 || unusedWorkHoursCalc}
                    />
                    <Label>종료 시각</Label>
                    <CustomInputForTime
                      value={endTime}
                      onChange={(value) => setEndTime(value)}
                      className="w-16"
                      disabled={tenant_id !== 0 || unusedWorkHoursCalc}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">해당 업무 시간에만 캠페인을 시작할 수 있습니다.</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHeader className="w-[12.5rem] !py-[6px]">
                  <Label className="w-32">요일 설정</Label>
                </TableHeader>
                <TableCell className="w-[20rem]" colSpan={2}>
                  <div className="flex gap-4">
                    {weekdays.map((day, index) => (
                      <div key={day} className="flex items-center gap-1">
                        <CustomCheckbox
                          id={`day-${day}`}
                          checked={dayOfWeek[index] === 't'}
                          onCheckedChange={(checked) => handleDayChange(index, checked as boolean)}
                          disabled={tenant_id !== 0 || unusedWorkHoursCalc}
                        />
                        <Label htmlFor={`day-${day}`}>{day}</Label>
                      </div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            </tbody>
          </Table>
        </div>
        <div className="flex justify-end gap-3">
          <CommonButton
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : '저장'}
          </CommonButton>
          <CommonButton onClick={handleCancel}>취소</CommonButton>
        </div>
      </div>

      <CustomAlert
        message={alertState.message}
        title={alertState.title}
        type={alertState.type}
        isOpen={alertState.isOpen}
        onClose={() => {
          setAlertState((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => {
          setAlertState((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
}