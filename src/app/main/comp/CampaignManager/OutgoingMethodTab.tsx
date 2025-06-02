import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { CustomInput } from "@/components/shared/CustomInput";
import { CommonButton } from "@/components/shared/CommonButton";
import { CustomCheckbox } from "@/components/shared/CustomCheckbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/CustomSelect";
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import { OutgoingMethodTabParam } from './CampaignManagerDetail';
import { useMainStore, useCampainManagerStore } from '@/store';

const useCounselResultList = [
  { useCounselResultId: 0, useCounselResultName: '미사용' },
  { useCounselResultId: 1, useCounselResultName: '사용' }
];

const useMachineHandling = [
  { id: 1, name: '컬러링 판별 후 사람만 연결' },
  { id: 2, name: '컬러링 판별 후 사람 / 기계음 연결' },
  { id: 3, name: '기계음 / 사람 무조건 연결' },
];

const CampaignOutgoingMethodTab: OutgoingMethodTabParam = {
  changeYn: false,
  campaignInfoChangeYn: false,
  onSave: false,
  onClosed: false,
  trunk_access_code: '',          //Trunk Access Code
  dial_try_interval: 0,           //재시도 간격(초)
  alarm_answer_count: 0,          //콜 목표량
  overdial_abandon_time: 0,       //포기호 처리시간(초)
  detect_mode: 1,                 //기계음 처리 - 자동응답기 처리 1 : 컬러링 판별 후 사람만 연결, 2 : 컬러링 판별 후 사람/기계음 연결, 3 : 기계음/사람 무조건 연결
  auto_dial_interval: 0,          //자동 다이얼 시
  power_divert_queue: 0,          //연결 IVR NO 및 다이얼 모드
  next_campaign: 0,               //연결 캠페인
  DDD_code: '',                   //DDD Number - 지역 번호
  callback_kind: 0,               //연결구분 - 콜백구분 0 : 일반 캠페인(Default), 1 : 무한 콜백, 2 : 일반 콜백
  max_ring: 0,                    //최대 링 횟수
  token_id: 0,                    //토큰 ID
  use_counsel_result: 0,          //상담결과 등록 여부 - 0 : 미사용, 1 : 사용
  dial_mode_option: 0,            //다이얼 모드 옵션 - 발신 모드별 옵션 설정(system preview 에서만 사용)
  user_option: '',                //제한 호수 비율
  channel_group_id: 0,
};

type Props = {
  callCampaignMenu: string;
  campaignInfo: MainDataResponse;
  onCampaignOutgoingMethodChange: (param: OutgoingMethodTabParam) => void;
};

const OutgoingMethodTab: React.FC<Props> = ({ callCampaignMenu, campaignInfo, onCampaignOutgoingMethodChange }) => {
  const { campaigns } = useMainStore();
  const { channelGroupList } = useCampainManagerStore();
  const [maxRings] = useState<string>("10");
  const [dialModeOption, setDialModeOption] = useState<string>("default");
  const [limitRateRateEnabled, setLimitRateRateEnabled] = useState<boolean>(false);
  const [limitRateEnabled, setLimitRateEnabled] = useState<boolean>(false);
  const [limitExitInit, setLimitExitInit] = useState<boolean>(false);
  const [limitInit, setLimitInit] = useState<boolean>(false);
  const [limitRate, setLimitRate] = useState<string>("");
  const [tempOutgoingMethodTab, setTempOutgoingMethodTab] = useState<OutgoingMethodTabParam>(CampaignOutgoingMethodTab);
  const [tempCampaignId, setTempCampaignId] = useState<number>(0);

  // 숫자만 입력되도록 제어하는 함수
  const handleNumericInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      if (type === 'setTrunkAccessCode') {
        onCampaignOutgoingMethodChange({
          ...tempOutgoingMethodTab
          , changeYn: true
          , campaignInfoChangeYn: true
          , trunk_access_code: value
        });
      } else if (type === 'setCallGoal') {
        onCampaignOutgoingMethodChange({
          ...tempOutgoingMethodTab
          , changeYn: true
          , campaignInfoChangeYn: true
          , alarm_answer_count: Number(value)
        });
      } else if (type === 'setAutoDial') {
        onCampaignOutgoingMethodChange({
          ...tempOutgoingMethodTab
          , changeYn: true
          , campaignInfoChangeYn: true
          , auto_dial_interval: Number(value)
        });
      } else if (type === 'setDddNumber') {
        onCampaignOutgoingMethodChange({
          ...tempOutgoingMethodTab
          , changeYn: true
          , campaignInfoChangeYn: true
          , DDD_code: value
        });
      } else if (type === 'setTokenId') {
        onCampaignOutgoingMethodChange({
          ...tempOutgoingMethodTab
          , changeYn: true
          , campaignInfoChangeYn: true
          , token_id: Number(value)
        });
      } else if (type === 'setIvrNo') {
        onCampaignOutgoingMethodChange({
          ...tempOutgoingMethodTab
          , changeYn: true
          , campaignInfoChangeYn: true
          , power_divert_queue: Number(value)
        });
      } else if (type === 'setLimitRate') {
        onCampaignOutgoingMethodChange({
          ...tempOutgoingMethodTab
          , changeYn: true
          , campaignInfoChangeYn: true
          , user_option: value === '' ? '' : 'limit=' + value
        });
        setLimitRate(value);
      }
    }
  };
  const handleAbandonmentTime = (value: string) => {
    onCampaignOutgoingMethodChange({
      ...tempOutgoingMethodTab
      , changeYn: true
      , campaignInfoChangeYn: true
      , overdial_abandon_time: Number(value)
    });
  };
  const handleLinkedCampaign = (value: string) => {
    onCampaignOutgoingMethodChange({
      ...tempOutgoingMethodTab
      , changeYn: true
      , campaignInfoChangeYn: true
      , next_campaign: Number(value)
    });
  };
  const handleUseCounselResult = (value: string) => {
    onCampaignOutgoingMethodChange({
      ...tempOutgoingMethodTab
      , changeYn: true
      , campaignInfoChangeYn: true
      , use_counsel_result: Number(value)
    });
  };
  const handleMachineHandling = (value: string) => {
    onCampaignOutgoingMethodChange({
      ...tempOutgoingMethodTab
      , changeYn: true
      , campaignInfoChangeYn: true
      , detect_mode: Number(value)
    });
  };
  const handleLinkedChannelGroupList = (value: string) => {
    onCampaignOutgoingMethodChange({
      ...tempOutgoingMethodTab
      , changeYn: true
      , campaignInfoChangeYn: true
      , channel_group_id: Number(value)
    });
  };

  useEffect(() => {
    if (campaignInfo) {
      // 서버에서 값이 0이거나 없는 경우, 기본값 1로 설정
      const detectMode = campaignInfo.detect_mode === 0 ? 1 : campaignInfo.detect_mode;

      setTempOutgoingMethodTab({
        ...tempOutgoingMethodTab
        , trunk_access_code: campaignInfo.trunk_access_code
        , dial_try_interval: campaignInfo.dial_try_interval
        , alarm_answer_count: campaignInfo.alarm_answer_count
        , overdial_abandon_time: campaignInfo.overdial_abandon_time
        , detect_mode: detectMode  // 기본값 1로 설정
        , auto_dial_interval: campaignInfo.auto_dial_interval
        , power_divert_queue: Number(campaignInfo.power_divert_queue)
        , next_campaign: campaignInfo.next_campaign
        , DDD_code: campaignInfo.DDD_code
        , callback_kind: campaignInfo.callback_kind
        , max_ring: campaignInfo.max_ring
        , token_id: campaignInfo.token_id
        , use_counsel_result: campaignInfo.use_counsel_result
        , dial_mode_option: campaignInfo.dial_mode_option
        , user_option: campaignInfo.user_option
        , channel_group_id: campaignInfo.channel_group_id
      });
      if (tempCampaignId !== campaignInfo.campaign_id) {
        setTempCampaignId(campaignInfo.campaign_id);
        setLimitRate(campaignInfo.user_option === '' ? '' : campaignInfo.user_option.split(',')[0].indexOf('limit') > -1 ? campaignInfo.user_option.split(',')[0].split('=')[1] : '');
        setLimitInit(campaignInfo.user_option === '' ? false : campaignInfo.user_option.split(',')[0].indexOf('limit') > -1 && campaignInfo.user_option.split(',')[1] === '0' ? true : false);
        setLimitRateEnabled(campaignInfo.user_option === '' ? false : campaignInfo.user_option.split(',')[0].indexOf('limit') > -1 ? true : false);
      }
    }
  }, [campaignInfo]);

  // 초기 생성시에 기본값으로 1 설정하기
  useEffect(() => {
    if (callCampaignMenu === 'NewCampaignManager' || callCampaignMenu === 'CampaignClone') {
      onCampaignOutgoingMethodChange({
        ...tempOutgoingMethodTab,
        detect_mode: 1  // 컬러링 판별후 사람만 연결
      });
    }
  }, [callCampaignMenu]);

  return (
    <div className="py-5 pr-10">
      <div className="flex gap-[60px]">
        <div className="w-[50%] flex flex-col gap-y-2">
          {/* Trunk Access Code */}
          <div className="flex items-center gap-2">
            <Label className="w-[8.3rem] min-w-[8.3rem]">
              Trunk Access Code
            </Label>
            <CustomInput
              type="text"
              value={tempOutgoingMethodTab.trunk_access_code}
              onChange={(e) => handleNumericInput(e, 'setTrunkAccessCode')}
              // maxLength={10}
              isFullWidth={true}
            />
          </div>

          {/* 재시도 간격(초) */}
          <div className="flex items-center gap-2 justify-between">
            <Label className="w-[8.3rem] min-w-[8.3rem]">재시도 간격(초)</Label>
            <Select value={tempOutgoingMethodTab.dial_try_interval + ''} disabled>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={tempOutgoingMethodTab.dial_try_interval} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 콜 목표량 */}
          <div className="flex items-center gap-2 ">
            <Label className="w-[8.3rem] min-w-[8.3rem]">콜 목표량</Label>
            <CustomInput
              type="text"
              value={tempOutgoingMethodTab.alarm_answer_count}
              onChange={(e) => handleNumericInput(e, 'setCallGoal')}
              maxLength={3}
              isFullWidth={true}
            />
          </div>

          {/* 포기호 처리시간 */}
          <div className="flex items-center gap-2 justify-between">
            <Label className="w-[8.3rem] min-w-[8.3rem]">
              포기호 처리 시간(초)
            </Label>
            <Select value={tempOutgoingMethodTab.overdial_abandon_time + ''} onValueChange={handleAbandonmentTime}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={tempOutgoingMethodTab.overdial_abandon_time} />
              </SelectTrigger>
              <SelectContent>
                {["0", "2", "3", "4", "5", "6", "7", "10", "15", "20", "30", "60"].map(
                  (time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* 기계음 처리 */}
          <div className="flex items-center gap-2 justify-between">
            <Label className="w-[8.3rem] min-w-[8.3rem]">기계음 처리</Label>
            <Select
              value={tempOutgoingMethodTab.detect_mode + ''}
              onValueChange={handleMachineHandling}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="컬러링 판별 후 사람만 연결" />
              </SelectTrigger>
              <SelectContent>
                {useMachineHandling.map((option) => (
                  <SelectItem key={option.id} value={option.id + ''}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 자동 다이얼 시 */}
          <div className="flex items-center gap-2">
            <Label className="w-[8.3rem] min-w-[8.3rem]">자동 다이얼 시</Label>
            <CustomInput
              type="text"
              value={tempOutgoingMethodTab.auto_dial_interval}
              onChange={(e) => handleNumericInput(e, 'setAutoDial')}
              // maxLength={5}
              isFullWidth={true}
            />
          </div>

          {/* 다이얼 모드 옵션 */}
          <div className="flex items-center gap-2">
            <Label className="w-[8.3rem] min-w-[8.3rem]">다이얼 모드 옵션</Label>
            <Select value={dialModeOption} disabled>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={dialModeOption} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">default</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 채널그룹 옵션 */}
          <div className="flex items-center gap-2 justify-between">
            <Label className="w-[8.3rem] min-w-[8.3rem]">채널 그룹 옵션</Label>
            <Select value={tempOutgoingMethodTab.channel_group_id + ''} onValueChange={handleLinkedChannelGroupList}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={''} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key={0} value={'0'}>
                  없음
                </SelectItem>
                {channelGroupList.map((data) => (
                  <SelectItem key={data.group_id} value={data.group_id + ''}>
                    [{data.group_id}]{data.group_name}
                  </SelectItem>
                ))
                }
              </SelectContent>
            </Select>
          </div>

        </div>

        <div className="w-[50%] flex flex-col gap-y-2">
          {/* 연결 캠페인 */}
          <div className="flex items-center gap-2 justify-between">
            <Label className="w-[8.3rem] min-w-[8.3rem]">연결 캠페인</Label>
            <Select value={tempOutgoingMethodTab.next_campaign + ''} onValueChange={handleLinkedCampaign}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={''} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key={0} value={'0'}>
                  없음
                </SelectItem>
                {isNaN(campaignInfo.tenant_id) ?
                  campaigns.filter((data) => data.campaign_id !== Number(campaignInfo.campaign_id))
                    .map((campaign) => (
                      <SelectItem key={campaign.campaign_id} value={campaign.campaign_id + ''}>
                        [{campaign.campaign_id}]{campaign.campaign_name}
                      </SelectItem>
                    ))
                  : campaigns.filter(({ campaign_id, tenant_id }) =>
                    campaign_id !== +campaignInfo.campaign_id &&
                    tenant_id === +campaignInfo.tenant_id
                  )
                    .map((campaign) => (
                      <SelectItem key={campaign.campaign_id} value={campaign.campaign_id + ''}>
                        [{campaign.campaign_id}]{campaign.campaign_name}
                      </SelectItem>
                    ))
                }
              </SelectContent>
            </Select>
          </div>

          {/* DDD Number */}
          <div className="flex items-center gap-2">
            <Label className="w-[8.3rem] min-w-[8.3rem]">DDD Number</Label>
            <CustomInput
              type="text"
              value={tempOutgoingMethodTab.DDD_code}
              onChange={(e) => handleNumericInput(e, 'setDddNumber')}
              maxLength={3}
              isFullWidth={true}
            />
          </div>

          {/* 최대 링 횟수 */}
          <div className="flex items-center gap-2">
            <Label className="w-[8.3rem] min-w-[8.3rem]">최대 링 횟수</Label>
            <Select value={maxRings} disabled>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={maxRings} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Token ID */}
          <div className="flex items-center gap-2 ">
            <Label className="w-[8.3rem] min-w-[8.3rem]">Token ID</Label>
            <CustomInput
              type="text"
              value={tempOutgoingMethodTab.token_id}
              onChange={(e) => handleNumericInput(e, 'setTokenId')}
              // maxLength={1}
              isFullWidth={true}
            />
          </div>

          {/* 상담결과 등록 */}
          <div className="flex items-center gap-2 ">
            <Label className="w-[8.3rem] min-w-[8.3rem]">상담 결과 등록</Label>
            <Select
              value={tempOutgoingMethodTab.use_counsel_result + ''}
              onValueChange={handleUseCounselResult}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={'미사용'} />
              </SelectTrigger>
              <SelectContent>
                {useCounselResultList.map((status) => (
                  <SelectItem key={status.useCounselResultId} value={status.useCounselResultId + ''}>
                    {status.useCounselResultName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 연결 IVR NO  */}
          <div className="flex items-center gap-2 ">
            <Label className="w-[8.3rem] min-w-[8.3rem]">연결 IVR NO</Label>
            <CustomInput
              type="text"
              value={tempOutgoingMethodTab.power_divert_queue}
              onChange={(e) => handleNumericInput(e, 'setIvrNo')}
              maxLength={16}
            />
          </div>


          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-2 justify-between">
              <CustomCheckbox
                id="limit-rate"
                checked={limitRateEnabled} // 상태를 기반으로 체크 여부 결정
                onCheckedChange={(checked) => {
                  setLimitRateEnabled(checked as boolean);
                  setLimitRateRateEnabled(checked as boolean);
                  if (!checked) {
                    // setLimitRate(""); // 비활성화 시 입력 값 초기화
                    setLimitInit(checked as boolean);
                    setLimitExitInit(checked as boolean);
                  }
                }}
              />
              <Label htmlFor="limit-rate" className="w-[108px] min-w-[108px]">
                제한 호수 비율
              </Label>
              <CustomInput
                type="text"
                value={limitRate}
                onChange={(e) => handleNumericInput(e, 'setLimitRate')}
                disabled={!limitRateEnabled}
                isPercent={true}
                resetKey={campaignInfo.campaign_id} // key 대신 resetKey 사용
              />
            </div>
            <div className="flex items-center gap-2 justify-between">
              <CustomCheckbox
                id="limit-init"
                checked={limitInit} // 상태를 기반으로 체크 여부 결정
                onCheckedChange={(checked) => {
                  setLimitInit(checked as boolean);
                  setLimitRateRateEnabled(!checked as boolean);
                  if (checked) {
                    setLimitRate("0"); // 비활성화 시 입력 값 초기화
                    onCampaignOutgoingMethodChange({
                      ...tempOutgoingMethodTab
                      , changeYn: true
                      , campaignInfoChangeYn: true
                      , user_option: 'limit=0'
                    });
                    setLimitExitInit(!checked as boolean);
                  }
                }}
                disabled={!limitRateEnabled} // 체크박스 상태에 따라 활성화/비활성화
              />
              <Label htmlFor="limit-init" className="">
                분배 제한 고정 포함 초기화
              </Label>
            </div>
            <div className="flex items-center gap-2 justify-between">
              <CustomCheckbox
                id="limit-exit-init"
                checked={limitExitInit} // 상태를 기반으로 체크 여부 결정
                onCheckedChange={(checked) => {
                  setLimitExitInit(checked as boolean);
                  setLimitRateRateEnabled(!checked as boolean);
                  if (checked) {
                    setLimitRate(""); // 비활성화 시 입력 값 초기화
                    onCampaignOutgoingMethodChange({
                      ...tempOutgoingMethodTab
                      , changeYn: true
                      , campaignInfoChangeYn: true
                      , user_option: ''
                    });
                    setLimitInit(!checked as boolean);
                  }
                }}
                disabled={!limitRateEnabled} // 체크박스 상태에 따라 활성화/비활성화
              />
              <Label htmlFor="limit-exit-init" className="">
                분배 제한 고정 제외 초기화
              </Label>
            </div>
          </div>

        </div>
      </div>

      {!(callCampaignMenu == 'NewCampaignManager' || callCampaignMenu == 'CampaignGroupManager' || callCampaignMenu == 'CampaignClone') &&
        <div className="flex justify-end gap-2 mt-5">
          <CommonButton variant="secondary" onClick={() =>
            onCampaignOutgoingMethodChange({
              ...tempOutgoingMethodTab
              , onSave: true
            })
          }>확인</CommonButton>
          <CommonButton variant="secondary" onClick={() =>
            onCampaignOutgoingMethodChange({
              ...tempOutgoingMethodTab
              , onClosed: true
            })
          }>취소</CommonButton>
        </div>
      }
    </div>
  );
};

export default OutgoingMethodTab;