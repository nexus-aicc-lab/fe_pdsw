"use client";

import React, { useState, useEffect } from "react";
import { CustomInput } from "@/components/shared/CustomInput";
import { Label } from "@/components/ui/label";
import CustomAlert, { CustomAlertRequest } from '@/components/shared/layout/CustomAlert';
import { CommonRadio, CommonRadioItem } from "@/components/shared/CommonRadio";
import TitleWrap from "@/components/shared/TitleWrap";
import DatePicker from "react-date-picker";
import { DatePickerProps } from 'react-date-picker';
type Value = DatePickerProps['value'];
import { CustomCheckbox } from "@/components/shared/CustomCheckbox";
import { Calendar as CalendarIcon } from "lucide-react";
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { useTabStore, useMainStore, useAuthStore } from '@/store';
import RebroadcastSettingsGroupPanelHeader from './RebroadcastSettingsGroupPanelHeader';
import { useApiForAutoRedial } from '@/features/campaignManager/hooks/useApiForAutoRedial';
import { useApiForCampaignAutoRedialInsert } from '@/features/rebroadcastSettingsPanel/hooks/useApiForCampaignAutoRedialInsert';
import { useApiForAutoRedialDelete } from '@/features/campaignManager/hooks/useApiForAutoRedialDelete';
import { useApiForCampaignRedialPreviewSearch } from '@/features/rebroadcastSettingsPanel/hooks/useApiForCampaignRedialPreviewSearch';
import { useApiForCampaignCurrentRedial } from '@/features/rebroadcastSettingsPanel/hooks/useApiForCampaignCurrentRedial';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useApiForCampaignStatusUpdate } from '@/features/campaignManager/hooks/useApiForCampaignStatusUpdate';
import { CheckCampaignSaveReturnCode,CampaignManagerInfo } from '@/components/common/common';
import { useApiForCampaignGroupCampaignList } from '@/features/campaignGroupManager/hooks/useApiForCampaignGroupCampaignList';
import { CampaignGroupGampaignListItem } from '@/features/campaignManager/types/typeForCampaignGroupForSideBar';
import { CampaignInfoUpdateRequest } from '@/features/campaignManager/types/campaignManagerIndex';
import { useApiForCampaignManagerUpdate } from '@/features/campaignManager/hooks/useApiForCampaignManagerUpdate';
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import { useApiForCampaignProgressInformation } from '@/features/monitoring/hooks/useApiForCampaignProgressInformation';
import logoutFunction from "@/components/common/logoutFunction";

interface RebroadcastSettings {
    campaignId: string;
    startDate: string;
    startTime: string;
    changeYn: boolean;
    scheduleChangeYn: boolean;
}

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
    redialCondition: string;
    run_flag: number;
    isDummy?: boolean;
}

const errorMessage: CustomAlertRequest = {
    isOpen: false,
    message: '',
    title: '재발신 설정',
    type: '1',
    onClose: () => { },
    onCancel: () => { },
};

const today = new Date();
const initialSettings: RebroadcastSettings = {
    campaignId: '',
    startDate: today.getFullYear() + ('0' + (today.getMonth() + 1)).slice(-2) + ('0' + today.getDate()).slice(-2),
    startTime: '',
    changeYn: false,
    scheduleChangeYn: false
};

const getOutgoingResultLabel = (key: string) => {
    const labels: { [key: string]: string } = {
        'outgoing-success-ok': '발신 성공 상담사 연결 성공',
        'outgoing-success-no': '발신 성공 상담사 연결 실패',
        'fail-busy': '통화중 실패',
        'fail-no-answer': '무응답 실패',
        'fail-fax': '팩스/모뎀 실패',
        'fail-machine': '기계음 실패',
        'fail-etc': '기타실패',
        'fail-wrong-num': '전화번호 오류 실패',
        'fail-line': '회선오류 실패',
        'fail-hangup': '고객 바로끊음 실패',
        'fail-no-tone': '통화음 없음 실패',
        'fail-no-dial': '다이얼톤 없음 실패',
        'outgoing-attempt': '발신 시도 건수',
    };
    return labels[key] || key;
};

const initOutgoingResult = {
    'outgoing-success-ok': false,
    'outgoing-success-no': true,
    'fail-busy': true,
    'fail-no-answer': true,
    'fail-fax': false,
    'fail-machine': true,
    'fail-etc': false,
    'fail-wrong-num': false,
    'fail-line': false,
    'fail-hangup': true,
    'fail-no-tone': false,
    'fail-no-dial': false,
    'outgoing-attempt': true
};

const RebroadcastSettingsGroupPanel = () => {
    // TabStore에서 현재 활성화된 탭 정보 가져오기
    const { campaigns } = useMainStore();
    const { campaignIdForUpdateFromSideMenu,activeTabId, openedTabs } = useTabStore();
    const router = useRouter();

    const [settings, setSettings] = useState<RebroadcastSettings>(initialSettings);
    const [startDate, setStartDate] = useState<Value | null>(new Date());
    const [endDate, setEndDate] = useState<Value | null>(new Date());
    const [startTime, setStartTime] = useState("");
    const [alertState, setAlertState] = useState<CustomAlertRequest>(errorMessage);
    const [broadcastType, setBroadcastType] = useState("reservation");
    const [outgoingResultChecked, setOutgoingResultChecked] = useState(true);
    const [outgoingTypeChecked, setOutgoingTypeChecked] = useState(false);
    const [callType, setCallType] = useState("not-sent");
    const [outgoingTimeChecked, setOutgoingTimeChecked] = useState(false);
    const [timeType, setTimeType] = useState("final-call-date");
    const [rebroadcastList, setRebroadcastList] = useState<RebroadcastItem[]>([]);
    const [selectedRebroadcastId, setSelectedRebroadcastId] = useState<number | null>(null);
    const [selectedRebroadcastDetails, setSelectedRebroadcastDetails] = useState<RebroadcastItem | null>(null);

    const [_campaignId, set_campaignId] = useState<string>('0');
    const [listRedialQuery, setListRedialQuery] = useState<string>('');
    const [reservationShouldShowApply,setReservationShouldShowApply ] = useState<boolean>(false);   //적용 버튼.
    const [reservationShouldShowAdd,setReservationShouldShowAdd ] = useState<boolean>(false);       //추가 버튼.
    const [reservationShouldShowDelete,setReservationShouldShowDelete ] = useState<boolean>(false);       //삭제 버튼.
    const [outgoingResultDisabled,setOutgoingResultDisabled ] = useState<boolean>(false);
    const [sequenceNumber, setSequenceNumber] = useState<number>(1);
    const [caseType, setCaseType] = useState<number>(0);
    const [textType, setTextType] = useState<string>('');
    const [campaignGroupId, setCampaignGroupId] = useState<string>('');
    const [campaignGroupName, setCampaignGroupName] = useState<string>('');
    const [campaignGroupCampaignListData, setCampaignGroupCampaignListData] = useState<CampaignGroupGampaignListItem[]>([]);
    const [tempCampaignManagerInfo, setTempCampaignManagerInfo] = useState<CampaignInfoUpdateRequest>(CampaignManagerInfo);
    const [tempCampaigns, setTempCampaigns] = useState<MainDataResponse[]>([]);
    const [tempCampaignsCount, setTempCampaignsCount] = useState<number>(0);
    const [rebroadcastRunIndex, setRebroadcastRunIndex] = useState<number>(-1);
    const [failCount, setFailCount] = useState<number>(0);
    const [successCount, setSuccessCount] = useState<number>(0);

    // 발신결과 체크박스 상태 관리
    const [selectedOutgoingResults, setSelectedOutgoingResults] = useState<{ [key: string]: boolean }>(initOutgoingResult);

    const resetAllStates = () => {
        setStartDate(new Date());
        setEndDate(new Date());
        setStartTime("0000");
        setTimeType("final-call-date"); //발신시간.
        setCallType("not-sent");
        
        setSelectedRebroadcastId(null);
        setSelectedRebroadcastDetails(null);

        // 모드별 체크박스 상태 설정
        setOutgoingResultChecked(true);
        setOutgoingTypeChecked(false);
        setOutgoingTimeChecked(false);
    };

    const handleDateChange = (value: Value) => {
        if (value instanceof Date || value === null) {
            let tempStartDate = '';
            if (value != null) {
                tempStartDate = value.getFullYear() +
                    ('0' + (value.getMonth() + 1)).slice(-2) +
                    ('0' + value.getDate()).slice(-2);
            }
            setStartDate(value);
            setSettings(prev => ({
                ...prev,
                startDate: tempStartDate,
                changeYn: true,
                scheduleChangeYn: true
            }));
        }
    };

    const handleEndDateChange = (value: Value) => {
        setEndDate(value);
    };

    //시작시간 이벤트.
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= 4 && /^\d*$/.test(value)) {
            setStartTime(value);
        }
    };

    const handleOutgoingResultChange = (id: string, checked: boolean) => {
        setSelectedOutgoingResults(prev => ({
            ...prev,
            [id]: checked
        }));
    };

    const MakeRedialPacket = () => {
        let returnValue = '';
        //발신결과.
        if( outgoingResultChecked ){            
            if( selectedOutgoingResults['outgoing-success-ok'] && selectedOutgoingResults['outgoing-success-no'] ){
                returnValue += "35210@";
            }else{
                //80954, "발신 성공 상담사 연결 성공"
                if( selectedOutgoingResults['outgoing-success-ok'] ){
                    returnValue += "35233@";
                }
                //80955, "발신 성공 상담사 연결 실패"
                if( selectedOutgoingResults['outgoing-success-no'] ){
                    returnValue += "35223@35213@";
                }
            }
            //80174, "통화중 실패")
            if( selectedOutgoingResults['fail-busy'] ){
                returnValue += "26232@";
            }
            //80175, "무응답 실패")
            if( selectedOutgoingResults['fail-no-answer'] ){
                returnValue += "26233@";
            }
            //80176, "팩스/모뎀 실패)
            if( selectedOutgoingResults['fail-fax'] ){
                returnValue += "26234@";
            }
            //80177, "기계음 실패"
            if( selectedOutgoingResults['fail-machine'] ){
                returnValue += "26235@";
            }
            //80178, "기타실패"
            if( selectedOutgoingResults['fail-etc'] ){
                returnValue += "26236@";
            }
            //80179, "전화번호 오류 실패"
            if( selectedOutgoingResults['fail-wrong-num'] ){
                returnValue += "26237@";
            }
            //80180, "회선오류 실패"
            if( selectedOutgoingResults['fail-line'] ){
                returnValue += "26239@";
            }
            //80181, "고객 바로끊음 실패"
            if( selectedOutgoingResults['fail-hangup'] ){
                returnValue += "262310@";
            }
            //80182, "통화음 없음 실패"
            if( selectedOutgoingResults['fail-no-tone'] ){
                returnValue += "262311@";
            }
            //80183, "다이얼톤 없음 실패"
            if( selectedOutgoingResults['fail-no-dial'] ){
                returnValue += "262312@";
            }
            //80185, "발신 시도 건수"
            if( selectedOutgoingResults['outgoing-attempt'] ){
                returnValue += "26238@";
            }
        }
        //발신구분 체크박스.
        if( outgoingTypeChecked ){
            returnValue += "^";
            //발신되지 않은 예약콜
            if( callType === 'not-sent'){
                returnValue += "402399";
            }
            //발신되어진 예약콜
            if( callType === 'sent'){
                returnValue += "4023100";
            }
        }
        //발신시간 체크박스
        if( outgoingTimeChecked ){
            if(!outgoingResultChecked && !outgoingTypeChecked ){
                // 최종발신날짜
                if( timeType === 'final-call-date'){
                    if (startDate && endDate) {
                        if (startDate instanceof Date && endDate instanceof Date) {
                            returnValue += "2714" + startDate.toISOString().slice(0, 10).replace(/-/g, '') + " 000000^2715" + endDate.toISOString().slice(0, 10).replace(/-/g, '') + " 235959";
                        }
                    }
                }else{// 재콜예약날짜
                    if (startDate && endDate) {
                        if (startDate instanceof Date && endDate instanceof Date) {
                            returnValue += "4315" + startDate.toISOString().slice(0, 10).replace(/-/g, '') + " 000000^2715" + endDate.toISOString().slice(0, 10).replace(/-/g, '') + " 235959";
                        }
                    }
                }
            }else{
                returnValue += "^";
                // 최종발신날짜
                if( timeType === 'final-call-date'){
                    if (startDate && endDate) {
                        if (startDate instanceof Date && endDate instanceof Date) {
                            returnValue += "(2714" + startDate.toISOString().slice(0, 10).replace(/-/g, '') + " 000000^2715" + endDate.toISOString().slice(0, 10).replace(/-/g, '') + " 235959)";
                        }
                    }
                }else{// 재콜예약날짜
                    if (startDate && endDate) {
                        if (startDate instanceof Date && endDate instanceof Date) {
                            returnValue += "(4315" + startDate.toISOString().slice(0, 10).replace(/-/g, '') + " 000000^2715" + endDate.toISOString().slice(0, 10).replace(/-/g, '') + " 235959)";
                        }
                    }
                }
            }
        }

        return returnValue;
    };

    //재발송 예약 추가 버튼 클릭 이벤트.
    const handleAddRebroadcast = () => {
        const redialCondition = MakeRedialPacket();
        const newRebroadcast: RebroadcastItem = {
            id: sequenceNumber,
            scheduleStartDate: "",
            scheduleStartTime: '0000',
            outgoingResults: [],
            outgoingType: "",
            outgoingTime: {
                type: "",
                startDate: "",
                endDate: ""
            },
            run_flag: 0,
            redialCondition:'',
            isDummy: true
        };
        //버튼 설정.        
        setReservationShouldShowApply(true);            
        setReservationShouldShowAdd(false);
        setReservationShouldShowDelete(false);
        //발신결과 disabled 설정.
        setOutgoingResultDisabled(false);   

        setTextType('재발신 추가중');
        setRebroadcastList([...rebroadcastList, newRebroadcast]);
        resetAllStates();
    };

    //삭제 버튼 클릭 이벤트.
    const handleRemoveRebroadcast = () => {
        if (selectedRebroadcastId !== null && rebroadcastList.some(item => item.id === selectedRebroadcastId)) {
            fetchAutoRedialDelete({
              campaign_id: Number(campaignIdForUpdateFromSideMenu)
              , sequence_number: selectedRebroadcastId
            });
            setTextType('');
        }
    };

    const handleWorkDelete = () => {
        const tempRebroadcastList = rebroadcastList.filter(data => !data.isDummy);
        setRebroadcastList(tempRebroadcastList);
        setAlertState(prev => ({ ...prev, isOpen: false }));
        //버튼 설정.        
        setReservationShouldShowApply(false);            
        setReservationShouldShowAdd(true);
        setReservationShouldShowDelete(true);
        //발신결과 disabled 설정. 
        setOutgoingResultChecked(false);
        setOutgoingTypeChecked(false);
        setOutgoingTimeChecked(false);
        setOutgoingResultDisabled(true);   
    };

    //그리드 클릭이벤트..
    const handleSelectRebroadcast = (id: number) => {

        // 더미 항목이 있는지 확인
        const hasDummyItem = rebroadcastList.some(item => item.isDummy);

        if (hasDummyItem) {
            setAlertState({
                ...errorMessage,
                isOpen: true,
                message: '재발신 추가중입니다. \n추가를 중단하고 삭제하시겠습니까?',
                title: '알림',
                type: '1',
                onClose: handleWorkDelete,
                onCancel: () => setAlertState(prev => ({ ...prev, isOpen: false }))
            });
            return;
        }

        // 기존 선택 로직
        setSelectedRebroadcastId(prevId => (prevId === id ? null : id));

        // 선택된 항목 찾기
        const selected = rebroadcastList.find(item => item.id === id);

        if (selected) {
            setSelectedRebroadcastDetails(selected);

            // 날짜 및 시간 설정
            if (selected.scheduleStartDate) {
                setStartDate(new Date(selected.scheduleStartDate));
            }

            if (selected.scheduleStartTime) {
                setStartTime(selected.scheduleStartTime);
            }

            if (selected.outgoingType) {
                setCallType(selected.outgoingType);
            }

            if (selected.outgoingTime && selected.outgoingTime.type) {
                setTimeType(selected.outgoingTime.type);
            }

            if (selected.outgoingTime && selected.outgoingTime.endDate) {
                setEndDate(new Date(selected.outgoingTime.endDate));
            }
            if( selected.run_flag === 2){
                setTextType('Time out');
            }else if( selected.run_flag === 1){
                setTextType('실행');
            }else if( selected.run_flag === 0){
                setTextType('미실행');
            }
            setListRedialQuery(selected.redialCondition);
        } else {
            // 선택 해제된 경우 상태 초기화
            setSelectedRebroadcastDetails(null);
            resetAllStates();
        }
    };

    //적용 버튼 클릭 이벤트.
    const handleApplyRebroadcast = () => {
        setFailCount(0);
        setSuccessCount(0);
        setCaseType(2);
        // fetchCampaignRedialPreviewSearch({
        //     campaign_id: Number(campaignIdForUpdateFromSideMenu),
        //     condition: MakeRedialPacket()
        // });
        if(tempCampaignsCount === 0){            
            setAlertState({
                isOpen: true,
                message: '재발신할 캠페인이 없습니다.',
                title: '캠페인 건수',
                type: '2',
                onClose: () => setAlertState(prev => ({ ...prev, isOpen: false })),
                onCancel: () => setAlertState(prev => ({ ...prev, isOpen: false }))
            });
        }
        
        //4-1. 실시간 재발신 적용
        setRebroadcastRunIndex(0);
    };

    //실시간 재발신 적용
    useEffect(() => {
        if (rebroadcastRunIndex > -1) {
            if( rebroadcastRunIndex < tempCampaignsCount){
                //4-1. 실시간 재발신 적용 - 리스트 건수가 0 보다 큰 경우 실행.
                fetchCampaignRedialPreviewSearch({
                    campaign_id: Number(tempCampaigns[rebroadcastRunIndex].campaign_id),
                    condition: MakeRedialPacket()
                });
            }else{ 
                setAlertState({
                    isOpen: true,
                    message: `재발신 성공: ${successCount}건, 실패: ${failCount}건 완료했습니다.`,
                    title: '재발신',
                    type: '2',
                    onClose: () => setAlertState(prev => ({ ...prev, isOpen: false })),
                    onCancel: () => setAlertState(prev => ({ ...prev, isOpen: false }))
                });
            }
        }
    }, [rebroadcastRunIndex]);

    //예약, 실시간 변경 이벤트.
    const handleBroadcastTypeChange = (param:string) => {
        setBroadcastType(param);        
        resetAllStates();
        //버튼 설정.        
        setReservationShouldShowApply(true);            
        setReservationShouldShowAdd(false);
        setReservationShouldShowDelete(false);
        setOutgoingResultDisabled(false);  
    };
    
    useEffect(() => {
        if( listRedialQuery !== '' ){
            if( broadcastType === 'realtime'){
                setSelectedOutgoingResults(initOutgoingResult);
            }else{
                let outgoingSuccessOk = false;  //80954, "발신 성공 상담사 연결 성공"
                if( listRedialQuery.indexOf('35233') > -1 ){   
                    outgoingSuccessOk = true;
                }
                let outgoingSuccessNo = false;  //80955, "발신 성공 상담사 연결 실패"
                if( listRedialQuery.indexOf('35223@35213') > -1 ){   
                    outgoingSuccessNo = true;
                }
                if( listRedialQuery.indexOf('35210') > -1 ){   
                    outgoingSuccessOk = true;
                    outgoingSuccessNo = true;
                }
                let failBusy = false;           //80174, "통화중 실패"
                if( listRedialQuery.indexOf('26232') > -1 ){   
                    // 2018.07.10 Gideon #24364 삼성화재(중국) 장애현상 수정 - 아래 || str == "0026232" 부분 추가
                    const tempList = listRedialQuery.split('@');
                    if( tempList.filter(data => data === '26232' || data === '0026232').length > 0 ){
                        failBusy = true;
                    }
                }
                let failNoAnswer = false;       //80175, "무응답 실패"
                if( listRedialQuery.indexOf('26233') > -1 ){   
                    failNoAnswer = true;
                }
                let failFax = false;            //80176, "팩스/모뎀 실패"
                if( listRedialQuery.indexOf('26234') > -1 ){   
                    failFax = true;
                }
                let failMachine = false;        //80177, "기계음 실패"
                if( listRedialQuery.indexOf('26235') > -1 ){   
                    failMachine = true;
                }
                let failEtc = false;            //80178, "기타실패"
                if( listRedialQuery.indexOf('26236') > -1 ){   
                    failEtc = true;
                }
                let failWrongNum = false;       //80179, "전화번호 오류 실패"
                if( listRedialQuery.indexOf('26237') > -1 ){   
                    failWrongNum = true;
                }
                let failLine = false;           //80180, "회선오류 실패"
                if( listRedialQuery.indexOf('26239') > -1 ){   
                    failLine = true;
                }
                let failHangup = false;         //80181, "고객 바로끊음 실패"
                if( listRedialQuery.indexOf('262310') > -1 ){   
                    failHangup = true;
                }
                let failNoTone = false;         //80182, "통화음 없음 실패"
                if( listRedialQuery.indexOf('262311') > -1 ){   
                    failNoTone = true;
                }
                let failNoDial = false;         //80183, "다이얼톤 없음 실패
                if( listRedialQuery.indexOf('262312') > -1 ){   
                    failNoDial = true;
                }
                let outgoingAttempt = false;//80185, "발신 시도 건수"
                if( listRedialQuery.indexOf('26238') > -1 || listRedialQuery.indexOf('0026238') > -1 ){   
                    outgoingAttempt = true;
                }
                //발신결과 체크박스.
                setSelectedOutgoingResults({...initOutgoingResult
                    , 'outgoing-success-ok': outgoingSuccessOk
                    , 'outgoing-success-no': outgoingSuccessNo
                    , 'fail-busy': failBusy
                    , 'fail-no-answer': failNoAnswer
                    , 'fail-fax': failFax
                    , 'fail-machine': failMachine
                    , 'fail-etc': failEtc
                    , 'fail-wrong-num': failWrongNum
                    , 'fail-line': failLine
                    , 'fail-hangup': failHangup
                    , 'fail-no-tone': failNoTone
                    , 'fail-no-dial': failNoDial
                    , 'outgoing-attempt': outgoingAttempt
                });
                if (listRedialQuery.indexOf("(") > 0 || listRedialQuery.indexOf("235959") > 0){
                    if( listRedialQuery.indexOf("(") > 0 ){
                        const strTimes = listRedialQuery.split(/[()]/);
                        if (strTimes[1].indexOf("2714") > 0) // 최종발신날짜 
                        {
                            setTimeType("final-call-date");
                            setStartDate(strTimes[1].substring(4, 8) + "-" + strTimes[1].substring(8, 10) + "-" + strTimes[1].substring(10, 12));
                            setEndDate(strTimes[1].substring(24, 28) + "-" + strTimes[1].substring(28, 30) + "-" + strTimes[1].substring(30, 32));
                        } else {// 재콜예약날짜
                            setTimeType("recall-date");
                            setStartDate(strTimes[1].substring(4, 8) + "-" + strTimes[1].substring(8, 10) + "-" + strTimes[1].substring(10, 12));
                            setEndDate(strTimes[1].substring(24, 28) + "-" + strTimes[1].substring(28, 30) + "-" + strTimes[1].substring(30, 32));
                        }
                    }
                    // setOutgoingTimeChecked(true);
                }
                //발신되지 않은 예약콜
                if( listRedialQuery.indexOf('402399') > -1 ){   
                    setCallType("not-sent");
                }
                //발신되어진 예약콜
                if( listRedialQuery.indexOf('4023100') > -1 ){   
                    setCallType('sent');
                }
            }
        }else{
            setSelectedOutgoingResults(initOutgoingResult);
        }
    }, [listRedialQuery, broadcastType]);

    // 캠페인 재발신 정보 리스트 조회
    const { mutate: fetchCampaignAutoRedials } = useApiForAutoRedial({
        onSuccess: (data) => {
            if (data.result_data.length > 0) {
                const tempList = data.result_data.filter(data => data.campaign_id === Number(campaignIdForUpdateFromSideMenu));
                if (tempList.length > 0) {                  
                    const prevList = tempList.map(item => ({
                        id: item.sequence_number,
                        scheduleStartDate: item.start_date.substring(0, 4) + '-' + item.start_date.substring(4, 6) + '-' + item.start_date.substring(6, 8),
                        scheduleStartTime: item.start_date.substring(8, 12),
                        outgoingResults: [],
                        outgoingType: "",
                        outgoingTime: { type: "", startDate: "", endDate: "" },
                        run_flag: item.run_flag,
                        redialCondition: item.redial_condition,
                        isDummy: false
                    }));
                    setRebroadcastList(prevList);
                    //첫번째 row 선택.
                    setSelectedRebroadcastId(prevList[0].id);
                    // handleSelectRebroadcast(prevList[0].id);
                    setListRedialQuery(prevList[0].redialCondition);
                    //발신결과 disabled 설정.
                    setOutgoingResultChecked(false);
                    setOutgoingTypeChecked(false);
                    setOutgoingTimeChecked(false);
                    setOutgoingResultDisabled(true);    
                    setSequenceNumber(Math.max(...tempList.map(item => item.sequence_number))+1);  
                    
                    // 선택된 항목 찾기
                    const selected = prevList[0];
                    setSelectedRebroadcastDetails(prevList[0]);
                    // 날짜 및 시간 설정
                    if (selected.scheduleStartDate) {
                        setStartDate(new Date(selected.scheduleStartDate));
                    }
                    if (selected.scheduleStartTime) {
                        setStartTime(selected.scheduleStartTime);
                    }
                    if (selected.outgoingType) {
                        setCallType(selected.outgoingType);
                    }
                    if (selected.outgoingTime && selected.outgoingTime.type) {
                        setTimeType(selected.outgoingTime.type);
                    }
                    if (selected.outgoingTime && selected.outgoingTime.endDate) {
                        setEndDate(new Date(selected.outgoingTime.endDate));
                    }
                    if( selected.run_flag === 2){
                        setTextType('Time out');
                    }else if( selected.run_flag === 1){
                        setTextType('실행');
                    }else if( selected.run_flag === 0){
                        setTextType('미실행');
                    }
                    setListRedialQuery(selected.redialCondition);
                }
            }
        },onError: (data) => {      
          if (data.message.split('||')[0] === '5') {
            setAlertState({
              ...errorMessage,
              isOpen: true,
              message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
              type: '2',
              onClose: () => goLogin(),
            });
          }
        }
    });
    const goLogin = () => {
    logoutFunction();
    router.push('/login');
  };
    
    // 캠페인 재발신 정보 추가
    const { mutate: fetchCampaignAutoRedialInsert } = useApiForCampaignAutoRedialInsert({
        onSuccess: (data) => {
            const tempData = data.result_data;
            const processedRebroadcasts = rebroadcastList
                .filter(item => item.isDummy)
                .map(item => ({
                    id: tempData.sequence_number,
                    scheduleStartDate: tempData.start_date.substring(0,4)+'-'+tempData.start_date.substring(4,6)+'-'+tempData.start_date.substring(6,8),
                    scheduleStartTime: tempData.start_date.substring(8,12),
                    outgoingResults: [],
                    outgoingType: callType,
                    outgoingTime: {
                        type: timeType,
                        startDate: startDate ? startDate.toString() : '',
                        endDate: endDate ? endDate.toString() : '',
                    },
                    run_flag: 0,
                    redialCondition:tempData.redial_condition,
                    isDummy: false
                }));

            setRebroadcastList(prevList =>
                prevList.map(item =>
                    item.isDummy
                        ? processedRebroadcasts.find(proc => proc.id === item.id) || item
                        : item
                )
            );
            //발신결과 disabled 설정.
            setOutgoingResultDisabled(true);   
            setSequenceNumber(tempData.sequence_number+1);
            //버튼 설정.
            setReservationShouldShowApply(false);
            setReservationShouldShowAdd(true);
            setReservationShouldShowDelete(true);

            setTextType('미실행');
        },onError: (data) => {      
          if (data.message.split('||')[0] === '5') {
            setAlertState({
              ...errorMessage,
              isOpen: true,
              message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
              type: '2',
              onClose: () => goLogin(),
            });
          }
        }
    });
    
    // 캠페인 재발신 정보 삭제 api 호출
    const { mutate: fetchAutoRedialDelete } = useApiForAutoRedialDelete({
        onSuccess: (data) => {            
            const updatedList = rebroadcastList.filter(item => item.id !== selectedRebroadcastId);
            setRebroadcastList(updatedList);
            setSelectedRebroadcastId(null);

            if (updatedList.length === 0) {
                resetAllStates();
            }
        },onError: (data) => {      
          if (data.message.split('||')[0] === '5') {
            setAlertState({
              ...errorMessage,
              isOpen: true,
              message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
              type: '2',
              onClose: () => goLogin(),
            });
          }
        }
    });

    //캠페인 재발신 추출 api 호출.
    const { mutate: fetchCampaignCurrentRedial } = useApiForCampaignCurrentRedial({
        onSuccess: (data) => {  
            if( data.result_code != 0){
                let _message = '';
                if( data.reason_code === -2){
                    _message = '[-2]재발신 추출 에러';
                }else if( data.reason_code === -1){
                    _message = '[-1]실시간 재발신 요청을 실패 하였습니다. \n서버의 상태를 확인 후 다시 시도하여 주십시오.';
                }else if( data.reason_code === -3){
                    _message = '[-3]상담사과 고객이 통화 중이라 캠페인 통계가 완료되지 않았습니다. \n잠시만 기다려주세요.';
                }
                setFailCount(prevFailCount => prevFailCount + 1);
                setRebroadcastRunIndex(rebroadcastRunIndex + 1);
            }else{        
                //4-4. 실시간 재발신 적용 -  캠페인 상태 시작으로 변경한다.               
                fetchCampaignStatusUpdate({
                    campaign_id: Number(tempCampaigns[rebroadcastRunIndex].campaign_id)
                    , campaign_status: 1
                });
            }
        },
        onError: (data) => {  
            setFailCount(prevFailCount => prevFailCount + 1);
            setRebroadcastRunIndex(rebroadcastRunIndex + 1);
        }
    });

    // 캠페인 재발신 미리보기 api 호출
    const { mutate: fetchCampaignRedialPreviewSearch } = useApiForCampaignRedialPreviewSearch({
        onSuccess: (data) => {  
            if( caseType === 1 ){            
                setAlertState({
                    isOpen: true,
                    message: `선택된 재발신 조건에 해당되는 리스트 수 : ${data.result_data.redial_count}`,
                    title: '리스트 건수 확인',
                    type: '2',
                    onClose: () => setAlertState(prev => ({ ...prev, isOpen: false })),
                    onCancel: () => setAlertState(prev => ({ ...prev, isOpen: false }))
                });
            }else if( caseType === 2 ){
                if( data.result_data.redial_count > 0){       
                    if( data.result_data.redial_count > 0){           
                        //4-2. 실시간 재발신 적용 -  리스트 건수가 있는 경우 캠페인 진행 정보 API 호출 호출하여 대기리스트건수확인
                        const campaignId = data.result_data.campaign_id;
                        fetchCampaignProgressInformation({
                            tenantId: campaigns.find(data=>data.campaign_id === campaignId)?.tenant_id||0,
                            campaignId: campaignId
                        });                         
                    }else{        
                        setFailCount(prevFailCount => prevFailCount + 1);
                        setRebroadcastRunIndex(rebroadcastRunIndex + 1);
                    }
                }else{    
                    setFailCount(prevFailCount => prevFailCount + 1);
                    setRebroadcastRunIndex(rebroadcastRunIndex + 1);
                }
            }
        },
        onError: (data) => {  
            if (data.message.split('||')[0] === '5') {
              setAlertState({
                ...errorMessage,
                isOpen: true,
                message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
                type: '2',
                onClose: () => goLogin(),
              });
            }else{
                if( caseType === 1 ){     
                    setAlertState({
                        isOpen: true,
                        message: '선택된 재발신 조건에 해당되는 리스트 수 : 0',
                        title: '리스트 건수 확인',
                        type: '2',
                        onClose: () => setAlertState(prev => ({ ...prev, isOpen: false })),
                        onCancel: () => setAlertState(prev => ({ ...prev, isOpen: false }))
                    });
                }else if( caseType === 2 ){    
                    setFailCount(prevFailCount => prevFailCount + 1);
                    setRebroadcastRunIndex(rebroadcastRunIndex + 1);
                }
            }
        }
    });

    //캠페인 정보 수정 api 호출
    const { mutate: fetchCampaignManagerUpdate } = useApiForCampaignManagerUpdate({
        onSuccess: (data) => {
            
        }
    });

    // 캠페인 진행 정보 API 호출 (useMutation 사용)
    const { mutate: fetchCampaignProgressInformation } = useApiForCampaignProgressInformation({
        onSuccess: (data) => {      
            if (data && data.progressInfoList && data.progressInfoList.length > 0 ) {
                console.log(data.progressInfoList.length);
                const tempList = data.progressInfoList.sort((a, b) => a.reuseCnt - b.reuseCnt);
                const campaignProgressInfo = tempList[tempList.length-1];
                const waitlist = campaignProgressInfo.totLstCnt - campaignProgressInfo.scct
                    - campaignProgressInfo.buct 
                    - campaignProgressInfo.fact
                    - campaignProgressInfo.tect
                    - campaignProgressInfo.customerOnHookCnt
                    - campaignProgressInfo.dialToneSilence
                    - campaignProgressInfo.nact
                    - campaignProgressInfo.etct
                    - campaignProgressInfo.lineStopCnt
                    - campaignProgressInfo.detectSilenceCnt
                    - campaignProgressInfo.acct
                    - campaignProgressInfo.recallCnt;
                 if( waitlist > 0){
                    //4-3. 실시간 재발신 적용 -  대기리스트 건수가 있는 경우 캠페인 재발신 추출 api 호출 실행하여 재발신 추출한다.  
                    fetchCampaignCurrentRedial({
                        campaign_id: Number(campaignProgressInfo.campId),
                        condition: MakeRedialPacket()
                    });      
                 }else{ 
                    //4-3. 실시간 재발신 적용 -  대기리스트 건수가 있는 경우 캠페인 재발신 추출 api 호출 실행하여 재발신 추출한다.  
                    fetchCampaignCurrentRedial({
                        campaign_id: Number(campaignProgressInfo.campId),
                        condition: MakeRedialPacket()
                    });      
                 }
            }else{
                setFailCount(prevFailCount => prevFailCount + 1);
                setRebroadcastRunIndex(rebroadcastRunIndex + 1);
            }
        },onError: (data) => {      
            if (data.message.split('||')[0] === '5') {
                setAlertState({
                    ...errorMessage,
                    isOpen: true,
                    message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.',
                    type: '2',
                    onClose: () => goLogin(),
                });
            }else{                
                setFailCount(prevFailCount => prevFailCount + 1);
                setRebroadcastRunIndex(rebroadcastRunIndex + 1);
            }
        }
    });

    //캠페인 상태 변경 api 호출
    const { mutate: fetchCampaignStatusUpdate } = useApiForCampaignStatusUpdate({
        onSuccess: (data) => {
            if (data.result_code === 0 || data.result_code === -13) {      
                setSuccessCount(prevSuccessCount => prevSuccessCount + 1);
                setRebroadcastRunIndex(rebroadcastRunIndex + 1);
            } else { 
                const selectedCampaign = tempCampaigns[rebroadcastRunIndex];
                const imsiData = {
                    ...CampaignManagerInfo,
                    campaign_id: selectedCampaign.campaign_id,
                    campaign_name: selectedCampaign.campaign_name,
                    campaign_desc: selectedCampaign.campaign_desc,
                    site_code: selectedCampaign.site_code,
                    service_code: selectedCampaign.service_code,
                    start_flag: 2,    //멈춤으로.
                    end_flag: selectedCampaign.end_flag,
                    dial_mode: selectedCampaign.dial_mode,
                    callback_kind: selectedCampaign.callback_kind,
                    delete_flag: selectedCampaign.delete_flag,
                    list_count: selectedCampaign.list_count,
                    list_redial_query: selectedCampaign.list_redial_query,
                    next_campaign: selectedCampaign.next_campaign,
                    token_id: selectedCampaign.token_id,
                    phone_order: selectedCampaign.phone_order,
                    phone_dial_try1: (selectedCampaign.phone_dial_try !== undefined) ? Number(selectedCampaign.phone_dial_try.slice(0, 1)[0]) : 0,
                    phone_dial_try2: (selectedCampaign.phone_dial_try !== undefined) ? Number(selectedCampaign.phone_dial_try.slice(1, 2)[0]) : 0,
                    phone_dial_try3: (selectedCampaign.phone_dial_try !== undefined) ? Number(selectedCampaign.phone_dial_try.slice(2, 3)[0]) : 0,
                    phone_dial_try4: (selectedCampaign.phone_dial_try !== undefined) ? Number(selectedCampaign.phone_dial_try.slice(3, 4)[0]) : 0,
                    phone_dial_try5: (selectedCampaign.phone_dial_try !== undefined) ? Number(selectedCampaign.phone_dial_try.slice(4, 5)[0]) : 0,
                    dial_try_interval: selectedCampaign.dial_try_interval,
                    trunk_access_code: selectedCampaign.trunk_access_code,
                    DDD_code: selectedCampaign.DDD_code,
                    power_divert_queue: selectedCampaign.power_divert_queue + '',
                    max_ring: selectedCampaign.max_ring,
                    detect_mode: selectedCampaign.detect_mode,
                    auto_dial_interval: selectedCampaign.auto_dial_interval,
                    creation_user: selectedCampaign.creation_user + '',
                    creation_time: selectedCampaign.creation_time,
                    creation_ip: selectedCampaign.creation_ip,
                    update_user: selectedCampaign.update_user + '',
                    update_time: selectedCampaign.update_time,
                    update_ip: selectedCampaign.update_ip,
                    dial_phone_id: selectedCampaign.dial_phone_id,
                    tenant_id: selectedCampaign.tenant_id,
                    alarm_answer_count: selectedCampaign.alarm_answer_count,
                    dial_speed: selectedCampaign.dial_speed,
                    parent_campaign: selectedCampaign.parent_campaign,
                    overdial_abandon_time: selectedCampaign.overdial_abandon_time,
                    list_alarm_count: selectedCampaign.list_alarm_count,
                    supervisor_phone: selectedCampaign.supervisor_phone,
                    reuse_count: selectedCampaign.reuse_count,
                    use_counsel_result: selectedCampaign.use_counsel_result,
                    use_list_alarm: selectedCampaign.use_list_alarm,
                    redial_strategy1: (selectedCampaign.redial_strategy !== undefined) ? selectedCampaign.redial_strategy.slice(0, 1)[0] + '' : '',
                    redial_strategy2: (selectedCampaign.redial_strategy !== undefined) ? selectedCampaign.redial_strategy.slice(1, 2)[0] + '' : '',
                    redial_strategy3: (selectedCampaign.redial_strategy !== undefined) ? selectedCampaign.redial_strategy.slice(2, 3)[0] + '' : '',
                    redial_strategy4: (selectedCampaign.redial_strategy !== undefined) ? selectedCampaign.redial_strategy.slice(3, 4)[0] + '' : '',
                    redial_strategy5: (selectedCampaign.redial_strategy !== undefined) ? selectedCampaign.redial_strategy.slice(4, 5)[0] + '' : '',
                    dial_mode_option: selectedCampaign.dial_mode_option,
                    user_option: selectedCampaign.user_option,
                    customer_char_id: 1,
                    counsel_script_id: 1,
                    announcement_id: 1,
                    campaign_level: 0,
                    outbound_sequence: ''
                };
                fetchCampaignManagerUpdate(imsiData);
                setFailCount(prevFailCount => prevFailCount + 1);
                setRebroadcastRunIndex(rebroadcastRunIndex + 1);
            }
        },onError: (data) => {   
            const selectedCampaign = tempCampaigns[rebroadcastRunIndex];
            const imsiData = {
                ...CampaignManagerInfo,
                campaign_id: selectedCampaign.campaign_id,
                campaign_name: selectedCampaign.campaign_name,
                campaign_desc: selectedCampaign.campaign_desc,
                site_code: selectedCampaign.site_code,
                service_code: selectedCampaign.service_code,
                start_flag: 2,    //멈춤으로.
                end_flag: selectedCampaign.end_flag,
                dial_mode: selectedCampaign.dial_mode,
                callback_kind: selectedCampaign.callback_kind,
                delete_flag: selectedCampaign.delete_flag,
                list_count: selectedCampaign.list_count,
                list_redial_query: selectedCampaign.list_redial_query,
                next_campaign: selectedCampaign.next_campaign,
                token_id: selectedCampaign.token_id,
                phone_order: selectedCampaign.phone_order,
                phone_dial_try1: (selectedCampaign.phone_dial_try !== undefined) ? Number(selectedCampaign.phone_dial_try.slice(0, 1)[0]) : 0,
                phone_dial_try2: (selectedCampaign.phone_dial_try !== undefined) ? Number(selectedCampaign.phone_dial_try.slice(1, 2)[0]) : 0,
                phone_dial_try3: (selectedCampaign.phone_dial_try !== undefined) ? Number(selectedCampaign.phone_dial_try.slice(2, 3)[0]) : 0,
                phone_dial_try4: (selectedCampaign.phone_dial_try !== undefined) ? Number(selectedCampaign.phone_dial_try.slice(3, 4)[0]) : 0,
                phone_dial_try5: (selectedCampaign.phone_dial_try !== undefined) ? Number(selectedCampaign.phone_dial_try.slice(4, 5)[0]) : 0,
                dial_try_interval: selectedCampaign.dial_try_interval,
                trunk_access_code: selectedCampaign.trunk_access_code,
                DDD_code: selectedCampaign.DDD_code,
                power_divert_queue: selectedCampaign.power_divert_queue + '',
                max_ring: selectedCampaign.max_ring,
                detect_mode: selectedCampaign.detect_mode,
                auto_dial_interval: selectedCampaign.auto_dial_interval,
                creation_user: selectedCampaign.creation_user + '',
                creation_time: selectedCampaign.creation_time,
                creation_ip: selectedCampaign.creation_ip,
                update_user: selectedCampaign.update_user + '',
                update_time: selectedCampaign.update_time,
                update_ip: selectedCampaign.update_ip,
                dial_phone_id: selectedCampaign.dial_phone_id,
                tenant_id: selectedCampaign.tenant_id,
                alarm_answer_count: selectedCampaign.alarm_answer_count,
                dial_speed: selectedCampaign.dial_speed,
                parent_campaign: selectedCampaign.parent_campaign,
                overdial_abandon_time: selectedCampaign.overdial_abandon_time,
                list_alarm_count: selectedCampaign.list_alarm_count,
                supervisor_phone: selectedCampaign.supervisor_phone,
                reuse_count: selectedCampaign.reuse_count,
                use_counsel_result: selectedCampaign.use_counsel_result,
                use_list_alarm: selectedCampaign.use_list_alarm,
                redial_strategy1: (selectedCampaign.redial_strategy !== undefined) ? selectedCampaign.redial_strategy.slice(0, 1)[0] + '' : '',
                redial_strategy2: (selectedCampaign.redial_strategy !== undefined) ? selectedCampaign.redial_strategy.slice(1, 2)[0] + '' : '',
                redial_strategy3: (selectedCampaign.redial_strategy !== undefined) ? selectedCampaign.redial_strategy.slice(2, 3)[0] + '' : '',
                redial_strategy4: (selectedCampaign.redial_strategy !== undefined) ? selectedCampaign.redial_strategy.slice(3, 4)[0] + '' : '',
                redial_strategy5: (selectedCampaign.redial_strategy !== undefined) ? selectedCampaign.redial_strategy.slice(4, 5)[0] + '' : '',
                dial_mode_option: selectedCampaign.dial_mode_option,
                user_option: selectedCampaign.user_option,
                customer_char_id: 1,
                counsel_script_id: 1,
                announcement_id: 1,
                campaign_level: 0,
                outbound_sequence: ''
            };
            fetchCampaignManagerUpdate(imsiData);
            setFailCount(prevFailCount => prevFailCount + 1);
            setRebroadcastRunIndex(rebroadcastRunIndex + 1);
        }
    });

    // 캠페인 그룹 소속 캠페인 데이터 로드 시 
    const { mutate: fetchCampaignGroupCampaignList } = useApiForCampaignGroupCampaignList({
        onSuccess: (data) => {      
            setCampaignGroupCampaignListData(data.result_data || []);
        }
    });
    
    //실시간 리스트 건수 확인 버튼 클릭 이벤트.
    const handleCheckListCount = async () => {
        setCaseType(1);
        fetchCampaignRedialPreviewSearch({
            campaign_id: Number(campaignIdForUpdateFromSideMenu),
            condition: MakeRedialPacket()
        });
    };
    
    useEffect(() => {
        if( campaigns && campaignGroupCampaignListData.length > 0 && campaignGroupId !== '' ){
            const list = campaignGroupCampaignListData.filter(data => data.group_id === Number(campaignGroupId));
            const data = campaigns.filter(campaign => list.some(item => item.campaign_id === campaign.campaign_id));
            setTempCampaigns(data);            
            setTempCampaignsCount(data.length);
        }
    }, [campaignGroupId,campaignGroupCampaignListData,campaigns]);

    useEffect(() => {
        if (activeTabId === 24) {
            handleBroadcastTypeChange('realtime');
            const tempData = openedTabs.filter(tab => tab.id === 24);
            if( tempData.length > 0 && tempData[0].campaignId && tempData[0].campaignName) {
                setCampaignGroupId(tempData[0].campaignId);
                setCampaignGroupName(tempData[0].campaignName);
            }
            if( campaignGroupCampaignListData.length === 0 ){
                fetchCampaignGroupCampaignList(null);
            }
        }
    }, [activeTabId, openedTabs,campaignGroupCampaignListData]);
    
    return (
        <div className="limit-width">
            <div className="flex flex-col gap-6">
                <RebroadcastSettingsGroupPanelHeader campaignGroupId={campaignGroupId} campaignGroupName={campaignGroupName}
                    reservationShouldShowApply={reservationShouldShowApply}
                    reservationShouldShowAdd={reservationShouldShowAdd}
                    reservationShouldShowDelete={reservationShouldShowDelete}
                    handleBroadcastTypeChange={handleBroadcastTypeChange} 
                    handleAddRebroadcast={handleAddRebroadcast}
                    handleRemoveRebroadcast={handleRemoveRebroadcast}
                    handleApplyRebroadcast={handleApplyRebroadcast}
                    handleCheckListCount={handleCheckListCount}
                />

                <div className="flex gap-5 h-[580px]">
                    <div className={`flex-1 w-1/3 flex flex-col gap-5 ${broadcastType === "realtime" ? "opacity-50 pointer-events-none" : ""}`}>
                        <div>
                            <TitleWrap title="스케줄 재발신 설정" />
                            <div className="border p-2 rounded flex flex-col gap-2 py-[20px] px-[30px]">
                                <div className="flex items-center gap-2">
                                    <Label className="w-20 min-w-20">시작날짜</Label>
                                    <DatePicker
                                        onChange={handleDateChange}
                                        value={startDate}
                                        format="yyyy-MM-dd"
                                        className="w-full custom-calendar"
                                        calendarIcon={<CalendarIcon className="mr-2 h-4 w-4" color="#989898" />}
                                        clearIcon={null}
                                        dayPlaceholder="dd"
                                        monthPlaceholder="mm"
                                        yearPlaceholder="yyyy"
                                        disabled={broadcastType === "realtime"}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label className="w-20 min-w-20">시작시간</Label>
                                    <CustomInput
                                        className="w-full"
                                        type="text"
                                        value={startTime}
                                        onChange={handleTimeChange}
                                        maxLength={4}
                                        placeholder="0000"
                                        disabled={broadcastType === "realtime"}                                        
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <TitleWrap title="예약 재발신 목록" />
                            <div className="border p-2 rounded h-[400px] py-[20px] px-[20px]">
                                <ul className="flex flex-col gap-2">
                                    { broadcastType === 'reservation'?
                                        rebroadcastList.map((item, index) => (
                                            <li
                                                key={item.id}
                                                onClick={() => handleSelectRebroadcast(item.id)}
                                                className={`text-sm cursor-pointer p-[5px] ${selectedRebroadcastId === item.id
                                                        ? 'bg-[#FFFAEE]'
                                                        : item.isDummy
                                                            ? 'bg-[#F0F0F0]'
                                                            : 'hover:bg-[#FFFAEE]'
                                                    }`}
                                            >
                                                {`${index + 1}번째 재발신`}
                                                {item.isDummy && <span className="text-xs text-gray-500 ml-2">(추가 중)</span>}
                                            </li>
                                        )):null
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-1/3 flex flex-col gap-2">
                        <div className="flex gap-2 items-center">
                            <CustomCheckbox
                                id="outgoing-result"
                                checked={outgoingResultChecked}
                                onCheckedChange={(checked: boolean) => setOutgoingResultChecked(checked)}
                                disabled={outgoingResultDisabled}
                            />
                            <Label htmlFor="outgoing-result" className="text-sm">
                                발신결과
                            </Label>
                        </div>
                        <div className={`border p-2 rounded py-[20px] px-[20px] flex flex-col gap-2 ${!outgoingResultChecked ? "opacity-50 pointer-events-none" : ""}`} style={{ height: "calc(100% - 29px)" }}>
                            {Object.keys(selectedOutgoingResults).map((key) => (
                                <div key={key} className="flex gap-2 items-center">
                                    <CustomCheckbox
                                        id={key}
                                        checked={selectedOutgoingResults[key]}
                                        onCheckedChange={(checked: boolean) => handleOutgoingResultChange(key, checked)}
                                        disabled={!outgoingResultChecked}
                                    />
                                    <Label htmlFor={key} className="text-sm">
                                        {getOutgoingResultLabel(key)}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 w-1/3 flex flex-col gap-5">
                        <div className="flex flex-col gap-2 h-[40%]">
                            <div className="flex gap-2 items-center">
                                <CustomCheckbox
                                    id="outgoing-type"
                                    checked={outgoingTypeChecked}
                                    onCheckedChange={(checked: boolean) => setOutgoingTypeChecked(checked)}
                                    disabled={outgoingResultDisabled}
                                />
                                <Label htmlFor="outgoing-type" className="text-sm">
                                    발신구분
                                </Label>
                                <Label className="text-sm">
                                    {textType}
                                </Label>
                            </div>
                            <div className={`border p-2 rounded py-[20px] px-[20px] flex flex-col gap-6 ${!outgoingTypeChecked ? "opacity-50 pointer-events-none" : ""}`} style={{ height: "calc(100% - 29px)" }}>
                                <div className="text-sm">재콜 구분을 선택합니다.</div>
                                <CommonRadio
                                    defaultValue="not-sent"
                                    className="flex gap-5 flex-col"
                                    disabled={!outgoingTypeChecked}
                                    value={callType}
                                    onValueChange={setCallType}
                                >
                                    <div className="flex items-center space-x-2">
                                        <CommonRadioItem value="not-sent" id="not-sent" disabled={!outgoingTypeChecked} />
                                        <Label htmlFor="not-sent">발신되지 않은 예약콜</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CommonRadioItem value="sent" id="sent" disabled={!outgoingTypeChecked} />
                                        <Label htmlFor="sent">발신되어진 예약콜</Label>
                                    </div>
                                </CommonRadio>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 h-[60%]">
                            <div className="flex gap-2 items-center">
                                <CustomCheckbox
                                    id="outgoing-time"
                                    checked={outgoingTimeChecked}
                                    onCheckedChange={(checked: boolean) => setOutgoingTimeChecked(checked)}
                                    disabled={outgoingResultDisabled}
                                />
                                <Label htmlFor="outgoing-time" className="text-sm">
                                    발신시간
                                </Label>
                            </div>
                            <div className={`border p-2 rounded py-[20px] px-[20px] flex flex-col gap-6 ${!outgoingTimeChecked ? "opacity-50 pointer-events-none" : ""}`} style={{ height: "calc(100% - 29px)" }}>
                                <CommonRadio
                                    defaultValue="final-call-date"
                                    className="flex gap-5"
                                    disabled={!outgoingTimeChecked}
                                    value={timeType}
                                    onValueChange={setTimeType}
                                >
                                    <div className="flex items-center space-x-2">
                                        <CommonRadioItem value="final-call-date" id="final-call-date" disabled={!outgoingTimeChecked} />
                                        <Label htmlFor="final-call-date">최종 발신 날짜</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CommonRadioItem value="recall-date" id="recall-date" disabled={!outgoingTimeChecked} />
                                        <Label htmlFor="recall-date">재콜 예약 날짜</Label>
                                    </div>
                                </CommonRadio>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <Label className="w-20 min-w-20">시작날짜</Label>
                                        <DatePicker
                                            onChange={handleDateChange}
                                            disabled={!outgoingTimeChecked}
                                            value={startDate}
                                            format="yyyy-MM-dd"
                                            className="w-full custom-calendar"
                                            calendarIcon={<CalendarIcon className="mr-2 h-4 w-4" color="#989898" />}
                                            clearIcon={null}
                                            dayPlaceholder="dd"
                                            monthPlaceholder="mm"
                                            yearPlaceholder="yyyy"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label className="w-20 min-w-20">종료날짜</Label>
                                        <DatePicker
                                            onChange={handleEndDateChange}
                                            disabled={!outgoingTimeChecked}
                                            value={endDate}
                                            format="yyyy-MM-dd"
                                            className="w-full custom-calendar"
                                            calendarIcon={<CalendarIcon className="mr-2 h-4 w-4" color="#989898" />}
                                            clearIcon={null}
                                            dayPlaceholder="dd"
                                            monthPlaceholder="mm"
                                            yearPlaceholder="yyyy"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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

export default RebroadcastSettingsGroupPanel;