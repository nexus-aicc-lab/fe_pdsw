import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { CommonButton } from "@/components/shared/CommonButton";
import { CustomInput } from "@/components/shared/CustomInput";
import { CustomCheckbox } from "@/components/shared/CustomCheckbox";
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import { NotificationTabParam } from './CampaignManagerDetail';

const tempNotificationTab:NotificationTabParam = {
  changeYn: false,
  campaignInfoChangeYn: false,
  onSave: false,
  onClosed: false,
  list_alarm_count: 0,
  supervisor_phone: '',
  use_list_alarm:0
};

type Props = {
  callCampaignMenu: string;
  campaignInfo: MainDataResponse;
  onHandleNotificationTabChange: (param:NotificationTabParam) => void;
};

const NotificationTab: React.FC<Props> = ({ callCampaignMenu, campaignInfo, onHandleNotificationTabChange }) => {
  const [isChecked, setIsChecked] = useState(false); // 잔량 부족 알람 사용 상태
  const [alertMessage, setAlertMessage] = useState(false);  // 메시지로 알림
  const [alertSound, setAlertSound] = useState(false);      // 소리로 알림
  const [alertCall, setAlertCall] = useState(false);        // 관리자에게 전화로 알림
  const [tempNotificationTabParam, setTempNotificationTabParam] = useState<NotificationTabParam>(tempNotificationTab);
  const [tempCampaignInfoChangeYn, setTempCampaignInfoChangeYn] = useState<boolean>(false);

  // 숫자 입력만 허용하는 핸들러
  const handleNumericInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setTempCampaignInfoChangeYn(true);
    if (/^\d*$/.test(value)) {
      onHandleNotificationTabChange({...tempNotificationTabParam
        , campaignInfoChangeYn : true
        , list_alarm_count: Number(value)
      });
    }
  };

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setTempCampaignInfoChangeYn(true);
    onHandleNotificationTabChange({...tempNotificationTabParam
      , campaignInfoChangeYn : true
      , supervisor_phone: value
    });
  };

  const handleCheckbox = (checked:boolean, type:string) => {
    let tempData = 0;
    if( type === 'alertMessage'){
      if( checked ){
        if( alertSound && alertCall ){
          tempData = 7;
        }else if( alertSound && !alertCall ){
          tempData = 4;
        }else if( !alertSound && alertCall ){
          tempData = 5;
        }else if( !alertSound && !alertCall ){
          tempData = 1;
        }
      }else{
        if( alertSound && alertCall ){
          tempData = 6;
        }else if( alertSound && !alertCall ){
          tempData = 2;
        }else if( !alertSound && alertCall ){
          tempData = 3;
        }else if( !alertSound && !alertCall ){
          tempData = 0;
        }
      }
    }else if( type === 'alertSound'){
      if( checked ){
        if( alertMessage && alertCall ){
          tempData = 7;
        }else if( alertMessage && !alertCall ){
          tempData = 4;
        }else if( !alertMessage && alertCall ){
          tempData = 6;
        }else if( !alertMessage && !alertCall ){
          tempData = 2;
        }
      }else{
        if( alertMessage && alertCall ){
          tempData = 5;
        }else if( alertMessage && !alertCall ){
          tempData = 1;
        }else if( !alertMessage && alertCall ){
          tempData = 3;
        }else if( !alertMessage && !alertCall ){
          tempData = 0;
        }
      }
    }else if( type === 'alertCall'){
      if( checked ){
        if( alertMessage && alertSound ){
          tempData = 7;
        }else if( alertMessage && !alertSound ){
          tempData = 5;
        }else if( !alertMessage && alertSound ){
          tempData = 6;
        }else if( !alertMessage && !alertSound ){
          tempData = 3;
        }
      }else{
        if( alertMessage && alertSound ){
          tempData = 4;
        }else if( alertMessage && !alertSound ){
          tempData = 1;
        }else if( !alertMessage && alertSound ){
          tempData = 2;
        }else if( !alertMessage && !alertSound ){
          tempData = 0;
        }
      }
    }
    onHandleNotificationTabChange({...tempNotificationTabParam
      , campaignInfoChangeYn: true
      , use_list_alarm: tempData
    });
  };

  useEffect(() => {
    if (campaignInfo ) {  
      setTempNotificationTabParam({...tempNotificationTabParam
        , list_alarm_count: campaignInfo.list_alarm_count
        , use_list_alarm: campaignInfo.use_list_alarm
        , supervisor_phone: campaignInfo.supervisor_phone
      });
      if( campaignInfo.use_list_alarm === 0 && !tempCampaignInfoChangeYn ){
        setIsChecked( false );
        setAlertMessage(true);
        setAlertSound(false);
        setAlertCall(false);
      }else{
        setIsChecked( true );
        if( campaignInfo.use_list_alarm === 1 ){
          setAlertMessage(true);
          setAlertSound(false);
          setAlertCall(false);
        }else if( campaignInfo.use_list_alarm === 2 ){
          setAlertMessage(false);
          setAlertSound(true);
          setAlertCall(false);
        }else if( campaignInfo.use_list_alarm === 3 ){
          setAlertMessage(false);
          setAlertSound(false);
          setAlertCall(true);
        }else if( campaignInfo.use_list_alarm === 4 ){
          setAlertMessage(true);
          setAlertSound(true);
          setAlertCall(false);
        }else if( campaignInfo.use_list_alarm === 5 ){
          setAlertMessage(true);
          setAlertSound(false);
          setAlertCall(true);
        }else if( campaignInfo.use_list_alarm === 6 ){
          setAlertMessage(false);
          setAlertSound(true);
          setAlertCall(true);
        }else if( campaignInfo.use_list_alarm === 7 ){
          setAlertMessage(true);
          setAlertSound(true);
          setAlertCall(true);
        }
      }
    }
  }, [campaignInfo,tempCampaignInfoChangeYn]);

  return (
    <div className="pt-[50px]">
      <div className="flex flex-col gap-[12px] w-[460px] m-auto">
        {/* 잔량 부족 알림 체크박스 */}
        <div className="flex gap-1 items-center">
          <CustomCheckbox
            id="lowStockAlert"
            checked={isChecked}
            onCheckedChange={(checked) => setIsChecked(checked === true)} // 체크박스 상태 업데이트
          />
          <Label htmlFor="lowStockAlert">잔량 부족 알람 사용</Label>
        </div>

        {/* 알림 세부 설정 */}
        <div className="p-[30px] flex flex-col gap-[12px] border-[#ebebeb] border">
          <div className="flex items-center gap-2">
            <CustomInput
              type="text"
              value={tempNotificationTabParam.list_alarm_count}
              onChange={(e) => handleNumericInput(e)}
              disabled={!isChecked} // 체크박스 상태에 따라 비활성화
            />
            <Label className="w-[8.3rem] min-w-[8.3rem]">잔량 부족 알람 갯수</Label>
          </div>
          <div className="flex gap-1 items-center">
            <CustomCheckbox id="alertMessage" disabled={!isChecked} checked={alertMessage}
             onCheckedChange={(checked) => handleCheckbox(checked === true, 'alertMessage')} />
            <Label htmlFor="alertMessage">메시지로 알림</Label>
          </div>
          <div className="flex gap-1 items-center">
            <CustomCheckbox id="alertSound" disabled={!isChecked} checked={alertSound}
             onCheckedChange={(checked) => handleCheckbox(checked === true, 'alertSound')} />
            <Label htmlFor="alertSound">소리로 알림</Label>
          </div>
          <div className="flex gap-1 items-center">
            <CustomCheckbox id="alertCall" disabled={!isChecked} checked={alertCall}
             onCheckedChange={(checked) => handleCheckbox(checked === true, 'alertCall')} />
            <Label htmlFor="alertCall">관리자에게 전화로 알림</Label>
          </div>
          <div className="flex gap-1 items-center">
            <Label className="w-[6rem] min-w-[6rem]">관리자 전화번호</Label>
            <CustomInput
              type="text"
              value={tempNotificationTabParam.supervisor_phone}
              onChange={(e) => handleInput(e)}
              disabled={!isChecked} // 체크박스 상태에 따라 비활성화
              isPhoneNumber={true}
            />
          </div>
          <div className="flex justify-end text-sm text-gray-500">
            (외부 회선을 사용할 경우 국선 번호를 포함해 주십시오.)
          </div>
        </div>

        {/* 확인 / 취소 버튼 */}
      {!(callCampaignMenu == 'NewCampaignManager' || callCampaignMenu == 'CampaignGroupManager' || callCampaignMenu == 'CampaignClone')  &&
        <div className="flex justify-end gap-2 mt-5">
          <CommonButton variant="secondary" onClick={()=> 
            onHandleNotificationTabChange({...tempNotificationTabParam
              , onSave: true
            })
          }>확인</CommonButton>
          <CommonButton variant="secondary" onClick={()=> 
            onHandleNotificationTabChange({...tempNotificationTabParam
              , onClosed: true
            })
          }>취소</CommonButton>
        </div>
        }
      </div>
    </div>
  );
};

export default NotificationTab;