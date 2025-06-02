"use client";

import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import { CustomInput } from "@/components/shared/CustomInput";
import { CommonButton } from "@/components/shared/CommonButton";
import { Label } from "@/components/ui/label";
import CustomAlert, { CustomAlertRequest } from '@/components/shared/layout/CustomAlert';
import { CommonRadio, CommonRadioItem } from "@/components/shared/CommonRadio";
import { DatePickerProps } from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { useMainStore, useTabStore } from '@/store';

interface RebroadcastItem {
  id: number;
  scheduleStartDate: string;
  scheduleStartTime: string;
  outgoingResults: string[];
  outgoingType: string;
  outgoingTime: {
    type: string;
    startDate: string;
    endDate: string;
  };
  isDummy?: boolean;
}

const errorMessage: CustomAlertRequest = {
  isOpen: false,
  message: '',
  title: '재발신 설정',
  type: '0',
  onClose: () => {},
  onCancel: () => {},
};

type Props = {
    campaignGroupId: string;
    campaignGroupName: string;
  reservationShouldShowApply: boolean;
  reservationShouldShowAdd:boolean;
  reservationShouldShowDelete:boolean;
  handleBroadcastTypeChange: (param:string) => void;
  handleAddRebroadcast:() => void;
  handleRemoveRebroadcast:() => void;
  handleApplyRebroadcast:() => void;
  handleCheckListCount:() => void;
}

const RebroadcastSettingsGroupPanelHeader = ({campaignGroupId,campaignGroupName, reservationShouldShowApply,reservationShouldShowAdd, reservationShouldShowDelete
    , handleBroadcastTypeChange
    , handleAddRebroadcast
    , handleRemoveRebroadcast
    , handleApplyRebroadcast
    , handleCheckListCount
}:Props) => {
    // TabStore에서 현재 활성화된 탭 정보 가져오기
    const { campaigns } = useMainStore();
    const { removeTab, openedTabs } = useTabStore();
    
    const [alertState, setAlertState] = useState<CustomAlertRequest>(errorMessage);
    const [broadcastType, setBroadcastType] = useState("realtime");
    const [listCount, setListCount] = useState<number>(0);
    const [shouldShowApply, setShouldShowApply] = useState<boolean>(false);    //적용 버튼.
    const [shouldShowAdd, setShouldShowAdd] = useState<boolean>(false);        //추가 버튼.
    const [shouldShowAddDelete, setShouldShowDelete] = useState<boolean>(false);    //삭제 버튼.

    const [headerCampaignId, setHeaderCampaignId] = useState<string>('');
    const [realtime, setRealtime] = useState<boolean>(false);

    //리스트 건수 확인 버튼 클릭 이벤트.
    const handleCheckListCountHeader = () => {
        if( broadcastType === 'reservation'){   //예약인 경우.
            setAlertState({
                isOpen: true,
                message: `선택된 재발신 조건에 해당되는 리스트 수 : ${listCount}`,
                title: '리스트 건수 확인',
                type: '2',
                onClose: () => setAlertState(prev => ({ ...prev, isOpen: false })),
                onCancel: () => setAlertState(prev => ({ ...prev, isOpen: false }))
            });
        }else{  //실시간인 경우.
            handleCheckListCount();
        }
    };

    //추가 버튼 클릭 이벤트.
    const handleAddRebroadcastClick = () => {
        handleAddRebroadcast();
    };

    //삭제 버튼 클릭 이벤트.
    const handleRemoveRebroadcastClick = () => {
        handleRemoveRebroadcast();
    };

    //예약, 실시간 변경 이벤트.
    // const handleBroadcastType = (value: string) => {
    //     setBroadcastType(value);
    //     handleBroadcastTypeChange(value);
    //     if( value === 'realtime' ){
    //         setShouldShowApply(true);
    //     }else{
    //         setShouldShowApply(reservationShouldShowApply);
    //     }
    // };

    //적용 버튼 클릭 이벤트.
    const handleApplyRebroadcastClick = () => {
        handleApplyRebroadcast();
    };

    //적용 버튼 
    useEffect(() => {
        setShouldShowApply(reservationShouldShowApply);
        setShouldShowAdd(reservationShouldShowAdd);
        setShouldShowDelete(reservationShouldShowDelete);
    }, [reservationShouldShowApply,reservationShouldShowAdd,reservationShouldShowDelete]);

    // useEffect(() => {
    //     setShouldShowApply(true);
    //     if( campaigns && campaignId !== '0' ){
    //         setHeaderCampaignId(campaignId+'');
    //         const tempCampaign = campaigns.filter(data=>Number(campaignId) === data.campaign_id);
    //         if( tempCampaign.length > 0 ){
    //             setListCount(tempCampaign[0].list_count);
    //         }
    //         if( tempCampaign[0].start_flag === 1 ){
    //             setRealtime(true);
    //         }else{
    //             setRealtime(false);
    //         }
            
    //     }
    // }, [campaignId,campaigns]);

    return (
                <div className="flex title-background justify-between">
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <Label className="w-30 min-w-20">캠페인 그룹 아이디</Label>
                            <CustomInput 
                                className="w-[140px]"
                                disabled
                                value={campaignGroupId}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="w-30 min-w-20">캠페인 그룹명</Label>
                            <CustomInput 
                                className="w-[140px]"
                                disabled
                                value={campaignGroupName}
                            />
                        </div>
                        <CommonRadio
                            defaultValue="reservation"
                            className="flex gap-5"
                            // onValueChange={(value) => handleBroadcastType(value) }
                            value={broadcastType}
                            disabled={realtime}
                        >
                            {/* <div className="flex items-center space-x-2">
                                <CommonRadioItem value="reservation" id="reservation" />
                                <Label htmlFor="reservation">예약</Label>
                            </div> */}
                            <div className="flex items-center space-x-2">
                                <CommonRadioItem value="realtime" id="realtime" />
                                <Label htmlFor="realtime">실시간</Label>
                            </div>
                        </CommonRadio>
                    </div>
                    <div className="flex gap-2">
                        {/* <CommonButton onClick={handleCheckListCountHeader} disabled={true}>
                            리스트 건수 확인
                        </CommonButton>
                        <CommonButton 
                            onClick={handleAddRebroadcastClick} 
                            disabled={true}
                        >
                            추가
                        </CommonButton>
                        <CommonButton 
                            onClick={handleRemoveRebroadcastClick}
                            disabled={true}
                        >
                            삭제
                        </CommonButton> */}
                        <CommonButton 
                            onClick={handleApplyRebroadcastClick}
                            disabled={false}
                        >
                            적용
                        </CommonButton>
                        <CommonButton 
                            onClick={() => {
                                const existingTabs = openedTabs.filter(tab => tab.id === 24)[0];
                                    removeTab(24, existingTabs.uniqueKey);
                                }
                            }
                        >
                            닫기
                        </CommonButton>
                    </div>
                    <CustomAlert
                        message={alertState.message}
                        title={alertState.title}
                        type={alertState.type}
                        isOpen={alertState.isOpen}
                        onClose={() => {
                        alertState.onClose()
                        }}
                        onCancel={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}/>
                </div>

    );
};

export default RebroadcastSettingsGroupPanelHeader;