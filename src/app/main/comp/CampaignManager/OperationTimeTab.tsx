"use client";
import React, { useState, useEffect } from "react";
import TitleWrap from "@/components/shared/TitleWrap";
import { Label } from "@/components/ui/label";
import { CustomInput } from "@/components/shared/CustomInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import DataGrid from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { CommonButton } from "@/components/shared/CommonButton";
import DatePicker from "react-date-picker";
import { Calendar as CalendarIcon, X } from "lucide-react";
import Image from "next/image";
import { OperationTimeParam } from "./CampaignManagerDetail";
import { CampaignScheDuleListDataResponse } from "@/features/campaignManager/types/campaignManagerIndex";
import CustomAlert, { CustomAlertRequest } from "@/components/shared/layout/CustomAlert";
import { MainDataResponse } from "@/features/auth/types/mainIndex";
import CustomInputForTime from "@/components/shared/CustomInputForTime";
import { CalendarHeadless } from "@/components/shared/CalendarRadix";
import { toast } from "react-toastify";

interface DataProps {
  no: number;
  division: number;
  startTime: string;
  endTime: string;
}

const errorMessage: CustomAlertRequest = {
  isOpen: false,
  message: "",
  title: "캠페인 동작 시간",
  type: "0",
  onClose: () => {},
  onCancel: () => {},
};

type Props = {
  callCampaignMenu: string;
  campaignInfo: MainDataResponse;
  campaignSchedule: CampaignScheDuleListDataResponse;
  onCampaignScheduleChange: (param: OperationTimeParam) => void;
};

const today = new Date();
const tempOperationTimeTab: OperationTimeParam = {
  changeYn: false,
  campaignInfoChangeYn: false,
  campaignScheduleChangeYn: false,
  onSave: false,
  onClosed: false,
  campaign_id: 0,
  start_date:
    today.getFullYear() +
    ("0" + (today.getMonth() + 1)).slice(-2) +
    ("0" + today.getDate()).slice(-2),
  end_date:
    today.getFullYear() +
    ("0" + (today.getMonth() + 1)).slice(-2) +
    ("0" + today.getDate()).slice(-2),
  start_time: [],
  end_time: [],
  start_flag: "",
  only_status_change: false,
};

const OperationTimeTab: React.FC<Props> = ({
  callCampaignMenu,
  campaignInfo,
  campaignSchedule,
  onCampaignScheduleChange,
}) => {
  const [tempData, setTempData] = useState<DataProps[]>([]);
  const [startTime, setStartTime] = useState(""); // 시작시간 (예: "1110")
  const [endTime, setEndTime] = useState(""); // 종료시간 (예: "1210")
  const [isValidForStartAndEndTime, setIsValidForStartAndEndTime] = useState(true);
  const [tempCampaignSchedule, setTempCampaignSchedule] = useState<OperationTimeParam>(tempOperationTimeTab);
  const [alertState, setAlertState] = useState<CustomAlertRequest>(errorMessage);

  // 유효한 시간 형식인지 확인 (4자리 문자열이고, 시는 00~23, 분은 00~59이어야 함)
  const isTimeFormatValid = (time: string) => {
    if (time.length !== 4) return false;
    const hours = Number(time.substring(0, 2));
    const minutes = Number(time.substring(2, 4));
    if (isNaN(hours) || isNaN(minutes)) return false;
    if (hours < 0 || hours > 23) return false;
    if (minutes < 0 || minutes > 59) return false;
    return true;
  };

  // 시작 시간 종료 시간 유효성 검사
  const validateTime = (time: string) => {
    if (time === "1112") return false;
    return isTimeFormatValid(time);
  };

  // startTime, endTime 값이 변경될 때마다 유효성 검사 실행
  useEffect(() => {
    if ((startTime && !validateTime(startTime)) || (endTime && !validateTime(endTime))) {
      setIsValidForStartAndEndTime(false);
    } else {
      setIsValidForStartAndEndTime(true);
    }
  }, [startTime, endTime]);

  const handleSelectChange = (value: any, col: string) => {
    onCampaignScheduleChange({
      ...tempCampaignSchedule,
      changeYn: true,
      campaignInfoChangeYn: true,
      start_flag: value,
      only_status_change: true,
    });
  };

  useEffect(() => {
    if (campaignInfo && campaignSchedule.start_date !== "") {
      const tempCampaignScheduleData = campaignSchedule;
      const CampaignScheduleStartTime = tempCampaignScheduleData.start_time;
      const CampaignScheduleEndTime = tempCampaignScheduleData.end_time;
      setTempData([]);
      if (CampaignScheduleStartTime.length > 0 && CampaignScheduleEndTime.length > 0) {
        CampaignScheduleStartTime.forEach((item: string, index) => {
          setTempData((prev) => [
            ...prev,
            {
              no: index + 1,
              division: index + 1,
              startTime: item.substring(0, 2) + ":" + item.substring(2, 4),
              endTime:
                (CampaignScheduleEndTime[index] + "")
                  .substring(0, 2) +
                ":" +
                (CampaignScheduleEndTime[index] + "").substring(2, 4),
            },
          ]);
        });
      }
      let _start_flag = campaignInfo.start_flag;
      if( _start_flag > 3){
        _start_flag = 2;
      }
      setTempCampaignSchedule({
        ...tempOperationTimeTab,
        campaign_id: campaignInfo.campaign_id,
        start_date: tempCampaignScheduleData.start_date,
        end_date: tempCampaignScheduleData.end_date,
        start_time: CampaignScheduleStartTime,
        end_time: CampaignScheduleEndTime,
        start_flag: _start_flag + "",
        onSave: false,
      });
    }
  }, [callCampaignMenu, campaignSchedule, campaignInfo]);

  // 행 삭제 함수
  const handleDelete = (no: number) => {
    setTempData((prevData) => {
      const newData = prevData
        .filter((item) => item.no !== no)
        .map((item, index) => ({
          ...item,
          no: index + 1,
          division: index + 1,
        }));
      const newStartTimes = newData.map((item) =>
        item.startTime.split(":").join("")
      );
      const newEndTimes = newData.map((item) =>
        item.endTime.split(":").join("")
      );
      const updatedSchedule = {
        ...tempCampaignSchedule,
        changeYn: true,
        campaignScheduleChangeYn: true,
        start_time: newStartTimes,
        end_time: newEndTimes,
      };
      setTempCampaignSchedule(updatedSchedule);
      onCampaignScheduleChange(updatedSchedule);
      return newData;
    });
  };

  // 그리드 컬럼 정의 (삭제 버튼 컬럼 추가, delete 열에 width 추가)
  const gridColumns = [
    // { key: "no", name: "NO" },
    { key: "division", name: "구분" },
    { key: "startTime", name: "시작 시간" },
    { key: "endTime", name: "종료 시간" },
    {
      key: "delete",
      name: "",
      width: 50,
      frozen: false,
      sortable: false,
      resizable: false,
      renderCell: ({ row }: { row: DataProps }) => (
        <div className="flex justify-center items-center w-full h-full">
          <button
            onClick={() => handleDelete(row.no)}
            className="text-gray-600 hover:text-red-500"
          >
            <X size={16} />
          </button>
        </div>
      )
    }
  ];

  // 시간 구간 겹침 검사 함수
  function isTimeOverlap(start: string, end: string, data: DataProps[]) {
    const newStart = parseInt(start, 10);
    const newEnd = parseInt(end, 10);
    return data.some(item => {
      const existStart = parseInt(item.startTime.replace(":", ""), 10);
      const existEnd = parseInt(item.endTime.replace(":", ""), 10);
      // 구간이 겹치는지 검사
      return !(newEnd <= existStart || newStart >= existEnd);
    });
  }

  return (
    <div className="pt-[20px]">
      <div className="flex gap-[30px]">
        <div className="w-[30%]">
          <TitleWrap
            className="border-b border-gray-300 pb-1 !text-[#444] !mb-3"
            title="선택"
          />
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-[10px] justify-between">
              <Label className="w-[70px] min-w-[70px]">시작</Label>
              <Select
                value={
                  callCampaignMenu === "NewCampaignManager" ||
                  callCampaignMenu === "CampaignGroupManager"
                    ? "2"
                    : campaignInfo.start_flag > 3?"2":campaignInfo.start_flag+ ""
                }
                onValueChange={(value) => handleSelectChange(value, "startFlag")}
                disabled={
                  callCampaignMenu === "NewCampaignManager" ||
                  callCampaignMenu === "CampaignGroupManager"
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="시작" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">시작</SelectItem>
                  <SelectItem value="2">멈춤</SelectItem>
                  <SelectItem value="3">중지</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-[10px] justify-between">
              <Label className="w-[70px] min-w-[70px]">종료 구분</Label>
              <CustomInput
                disabled={true}
                value={
                  campaignInfo?.end_flag === 1
                    ? "진행 중"
                    : campaignInfo?.end_flag === 2
                    ? "완료"
                    : ""
                }
              />
            </div>

            <div className="flex items-center gap-[10px] justify-between">
              <Label className="w-[70px] min-w-[70px]">시작 날짜</Label>
              <CalendarHeadless
                date={new Date(
                  `${tempCampaignSchedule.start_date.substring(0, 4)}-${tempCampaignSchedule.start_date.substring(4, 6)}-${tempCampaignSchedule.start_date.substring(6, 8)}`
                )}
                setDate={(value) => {
                  if (value instanceof Date || value === null) {
                    let tempStartDate = "";
                    let tempEndDate = tempCampaignSchedule.end_date;
                    if (value) {
                      tempStartDate = `${value.getFullYear()}${("0" + (value.getMonth() + 1)).slice(-2)}${("0" + value.getDate()).slice(-2)}`;
                      if (tempStartDate > tempEndDate) {
                        tempEndDate = tempStartDate;
                      }
                    }
                    onCampaignScheduleChange({
                      ...tempCampaignSchedule,
                      changeYn: true,
                      campaignScheduleChangeYn: true,
                      start_date: tempStartDate,
                      end_date: tempEndDate,
                    });
                  }
                }}
              />
            </div>

            <div className="flex items-center gap-[10px] justify-between">
              <Label className="w-[70px] min-w-[70px]">종료 날짜</Label>
              <CalendarHeadless
                date={new Date(
                  `${tempCampaignSchedule.end_date.substring(0, 4)}-${tempCampaignSchedule.end_date.substring(4, 6)}-${tempCampaignSchedule.end_date.substring(6, 8)}`
                )}
                setDate={(value) => {
                  if (value instanceof Date || value === null) {
                    const tempStartDate = tempCampaignSchedule.start_date;
                    let tempEndDate = "";
                    if (value) {
                      tempEndDate = `${value.getFullYear()}${("0" + (value.getMonth() + 1)).slice(-2)}${("0" + value.getDate()).slice(-2)}`;
                      if (tempEndDate < tempStartDate) {
                        tempEndDate = tempStartDate;
                      }
                    }
                    onCampaignScheduleChange({
                      ...tempCampaignSchedule,
                      changeYn: true,
                      campaignScheduleChangeYn: true,
                      start_date: tempStartDate,
                      end_date: tempEndDate,
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="w-[70%]">
          <TitleWrap
            className="border-b border-gray-300 pb-1 !text-[#444] !mb-3"
            title="추가"
          />
          <div className="flex gap-[20px]">
            <div className="w-[40%]">
              <div className="flex flex-col gap-y-2">
                <div className="flex items-center gap-[10px] justify-between">
                  <Label className="w-[70px] min-w-[70px]">시작 시간</Label>
                  <CustomInputForTime
                    value={startTime}
                    onChange={(value) => setStartTime(value)}
                  />
                </div>
                <div className="flex items-center gap-[10px] justify-between">
                  <Label className="w-[70px] min-w-[70px]">종료 시간</Label>
                  <CustomInputForTime
                    value={endTime}
                    onChange={(value) => setEndTime(value)}
                  />
                </div>
                <div className="flex justify-end">
                  <CommonButton
                    variant="secondary"
                    disabled={!isValidForStartAndEndTime}
                    onClick={() => {
                      if (startTime.length === 4 && endTime.length === 4) {
                        if (!isTimeFormatValid(startTime) || !isTimeFormatValid(endTime)) {
                          setAlertState({
                            ...alertState,
                            isOpen: true,
                            message: "잘못된 시간 형식입니다. 00:00 ~ 23:59 범위 내 입력해 주세요.",
                          });
                          return;
                        }
                        if (!validateTime(startTime) || !validateTime(endTime)) {
                          setAlertState({
                            ...alertState,
                            isOpen: true,
                            message: "잘못된 시간입니다.",
                          });
                          return;
                        }
                        if (startTime > endTime) {
                          setAlertState({
                            ...alertState,
                            isOpen: true,
                            message: "시작 시간이 종료 시간보다 늦을 수 없습니다.",
                          });
                          return;
                        }
                        if (startTime === endTime) {
                          setAlertState({
                            ...alertState,
                            isOpen: true,
                            message: "종료 시간 설정이 잘못되었습니다.",
                          });
                          return;
                        }
                        // === 겹치는 시간 구간 검사 추가 ===
                        if (isTimeOverlap(startTime, endTime, tempData)) {
                          // toast.error("기존에 등록된 시간과 겹칩니다.");
                          setAlertState({
                            ...alertState,
                            isOpen: true,
                            message: "기존에 등록된 시간과 중복됩니다.",
                          });
                          return;
                        }
                        // === 기존 동일 시간 검사 ===
                        let check = false;
                        const tempStartTime: string[] = [];
                        const tempEndTime: string[] = [];
                        tempData.forEach((item) => {
                          if (
                            item.startTime.replace(":", "") === startTime &&
                            item.endTime.replace(":", "") === endTime
                          ) {
                            setAlertState({
                              ...alertState,
                              isOpen: true,
                              message: "동일한 시간이 이미 설정되어 있습니다.",
                            });
                            check = true;
                          }
                          tempStartTime.push(item.startTime.replace(":", ""));
                          tempEndTime.push(item.endTime.replace(":", ""));
                        });
                        if (!check) {
                          tempStartTime.push(startTime);
                          tempEndTime.push(endTime);
                          onCampaignScheduleChange({
                            ...tempCampaignSchedule,
                            changeYn: true,
                            campaignScheduleChangeYn: true,
                            start_time: tempStartTime,
                            end_time: tempEndTime,
                          });
                          setTempData((prev) => [
                            ...prev,
                            {
                              no: prev.length + 1,
                              division: prev.length + 1,
                              startTime: startTime.substring(0, 2) + ":" + startTime.substring(2, 4),
                              endTime: endTime.substring(0, 2) + ":" + endTime.substring(2, 4),
                            },
                          ]);
                          setStartTime("");
                          setEndTime("");
                        }
                      }
                    }}
                  >
                    시간 추가
                    <Image src="/addArrow.svg" alt="화살표" width={10} height={10} style={{ width: 'auto', height: 'auto' }} />
                  </CommonButton>
                </div>
              </div>
            </div>
            <div className="w-[60%]">
              <div className="grid-custom-wrap h-[270px]">
                <DataGrid
                  columns={gridColumns}
                  rows={tempData}
                  className="grid-custom"
                  rowHeight={30}
                  headerRowHeight={30}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {!(callCampaignMenu === "NewCampaignManager" ||
        callCampaignMenu === "CampaignGroupManager" ||
        callCampaignMenu === "CampaignClone") && (
          <div className="flex justify-end gap-2 mt-5">
            <CommonButton
              variant="secondary"
              onClick={() =>
                onCampaignScheduleChange({
                  ...tempCampaignSchedule,
                  onSave: true,
                })
              }
            >
              확인
            </CommonButton>
            <CommonButton
              variant="secondary"
              onClick={() =>
                onCampaignScheduleChange({
                  ...tempCampaignSchedule,
                  onClosed: true,
                })
              }
            >
              취소
            </CommonButton>
          </div>
        )}

        
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
};

export default OperationTimeTab;
