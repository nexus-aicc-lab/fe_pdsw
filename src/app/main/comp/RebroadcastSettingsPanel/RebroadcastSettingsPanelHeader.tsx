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
    onClose: () => { },
    onCancel: () => { },
};

type Props = {
    campaignId?: string;
    reservationShouldShowApply: boolean;
    reservationShouldShowAdd: boolean;
    reservationShouldShowDelete: boolean;
    handleBroadcastTypeChange: (param: string) => void;
    handleAddRebroadcast: () => void;
    handleRemoveRebroadcast: () => void;
    handleApplyRebroadcast: () => void;
    handleCheckListCount: () => void;
    selectedRebroadcastId: any;
    textType: string;
    reBroadCastOption?: 'scheduled' | 'realtime' | 'campaign';
}

const RebroadcastSettingsPanelHeader = ({
    campaignId,
    reservationShouldShowApply,
    reservationShouldShowAdd,
    reservationShouldShowDelete,
    selectedRebroadcastId,
    textType
    , handleBroadcastTypeChange
    , handleAddRebroadcast
    , handleRemoveRebroadcast
    , handleApplyRebroadcast
    , handleCheckListCount
    , reBroadCastOption
}: Props) => {
    // TabStore에서 현재 활성화된 탭 정보 가져오기
    const { campaigns, reBroadcastType } = useMainStore();
    const { removeTab } = useTabStore();

    const [alertState, setAlertState] = useState<CustomAlertRequest>(errorMessage);
    // const [broadcastType, setBroadcastType] = useState("reservation");
    const [listCount, setListCount] = useState<number>(0);
    const [shouldShowApply, setShouldShowApply] = useState<boolean>(false);    //적용 버튼.
    const [shouldShowAdd, setShouldShowAdd] = useState<boolean>(false);        //추가 버튼.
    const [shouldShowAddDelete, setShouldShowDelete] = useState<boolean>(false);    //삭제 버튼.

    const [headerCampaignId, setHeaderCampaignId] = useState<string>('');
    const [realtime, setRealtime] = useState<boolean>(false);

    //리스트 건수 확인 버튼 클릭 이벤트.
    const handleCheckListCountHeader = () => {
        handleCheckListCount();
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
    const handleBroadcastType = (value: string) => {
        // setBroadcastType(value);
        handleBroadcastTypeChange(value);
        if (value === 'realtime') {
            setShouldShowApply(true);
        } else {
            setShouldShowApply(reservationShouldShowApply);
        }
    };

    //적용 버튼 클릭 이벤트.
    const handleApplyRebroadcastClick = () => {
        handleApplyRebroadcast();
    };

    // RebroadcastSettingsPanelHeader 컴포넌트
    // console.log('Header Props:', { reBroadCastOption, reBroadcastType });
    // console.log('Header State:', { broadcastType });

    // useEffect 내부에서
    // useEffect(() => {
    //     // console.log('Before Update:', { broadcastType });
    //     if (reBroadCastOption) {
    //         // console.log('Updating from props:', reBroadCastOption);
    //         const mappedType = reBroadCastOption === 'scheduled' ? 'reservation' : reBroadCastOption;
    //         setBroadcastType(mappedType);
    //         // console.log('After mapping:', mappedType);
    //     // } else if (reBroadcastType !== '') {
    //     //     console.log('Updating from store:', reBroadcastType);
    //     //     setBroadcastType(reBroadcastType);
    //     // } else {
    //     //     console.log('Setting default');
    //     //     setBroadcastType('reservation');
    //     }
    // }, [reBroadCastOption]);

    //적용 버튼 
    useEffect(() => {
        setShouldShowApply(reservationShouldShowApply);
        setShouldShowAdd(reservationShouldShowAdd);
        setShouldShowDelete(reservationShouldShowDelete);
    }, [reservationShouldShowApply, reservationShouldShowAdd, reservationShouldShowDelete]);

    useEffect(() => {
        if (campaigns && campaigns.length > 0 && campaignId !== '0') {
            setHeaderCampaignId(campaignId + '');
            const tempCampaign = campaigns.filter(data => Number(campaignId) === data.campaign_id);
            if (tempCampaign.length > 0) {
                setListCount(tempCampaign[0].list_count);
            }
            if (tempCampaign[0].start_flag === 1) {
                setRealtime(true);
            } else {
                setRealtime(false);
            }

            // setListCount(campaigns.filter(data=>Number(campaignId) === data.campaign_id)[0].list_count);
        }
    }, [campaignId, campaigns]);

    return (
        <div className="flex title-background justify-between">
            {/* 예약 재발신 타입 확인: {reBroadCastOption} */}
            <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                    <Label className="w-20 min-w-20">캠페인 아이디</Label>
                    <Select defaultValue='0' value={headerCampaignId} onValueChange={setHeaderCampaignId} disabled>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="캠페인 선택" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem key='0' value='0'>-선택-</SelectItem>
                            {campaigns.map(option => (
                                <SelectItem key={option.campaign_id} value={option.campaign_id + ''}>
                                    {option.campaign_id}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                </div>
                <div className="flex items-center gap-2">
                    <Label className="w-20 min-w-20">캠페인 이름</Label>
                    <CustomInput
                        className="w-[140px]"
                        disabled
                        value={headerCampaignId === '' ? ''
                            : campaigns && campaigns.length > 0 ? campaigns.filter(data => Number(headerCampaignId) === data.campaign_id)[0].campaign_name || ''
                                : ''
                        }
                    />
                </div>
                <CommonRadio
                    defaultValue="reservation"
                    className="flex gap-5"
                    onValueChange={(value) => handleBroadcastType(value)}
                    value={reBroadcastType} // reBroadcastType에서 broadcastType으로 변경
                    disabled={realtime}
                >
                    <div className="flex items-center space-x-2">
                        <CommonRadioItem value="reservation" id="reservation" />
                        <Label htmlFor="reservation">예약</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CommonRadioItem value="realtime" id="realtime" />
                        <Label htmlFor="realtime">실시간</Label>
                    </div>
                </CommonRadio>
            </div>

            <div className="flex gap-2 items-center">
                {reBroadcastType === 'reservation' && textType !== '' ?
                    <div className="px-2 py-1 text-sm font-medium text-gray-700 bg-blue-100 border border-blue-200 rounded-md shadow-sm inline-flex items-center mr-[200px]">
                        {textType}
                    </div>
                    : null
                }

                <CommonButton onClick={handleCheckListCountHeader}>
                    리스트 건수 확인
                </CommonButton>
                <CommonButton
                    onClick={handleAddRebroadcastClick}
                    disabled={!shouldShowAdd}
                >
                    추가
                </CommonButton>
                <CommonButton
                    onClick={handleRemoveRebroadcastClick}
                    disabled={!shouldShowAddDelete}
                >
                    삭제
                </CommonButton>
                <CommonButton
                    onClick={handleApplyRebroadcastClick}
                    disabled={!shouldShowApply}
                >
                    적용
                </CommonButton>
                {/* 
                0522 QA 요청으로 닫기 삭제
                <CommonButton
                    onClick={() => removeTab(20, '20')}
                >
                    닫기
                </CommonButton> */}
            </div>
            <CustomAlert
                message={alertState.message}
                title={alertState.title}
                type={alertState.type}
                isOpen={alertState.isOpen}
                onClose={() => {
                    alertState.onClose()
                }}
                onCancel={() => setAlertState((prev) => ({ ...prev, isOpen: false }))} />
        </div>

    );
};

export default RebroadcastSettingsPanelHeader;