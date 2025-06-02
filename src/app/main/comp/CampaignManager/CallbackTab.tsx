import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import { CommonButton } from "@/components/shared/CommonButton";
import { CustomInput } from "@/components/shared/CustomInput";
import { CustomCheckbox } from "@/components/shared/CustomCheckbox";
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import { CallbackTabParam } from './CampaignManagerDetail';

type Props = {
  callCampaignMenu: string;
  campaignInfo: MainDataResponse;
  onHandleCallbackTabChange: (param:CallbackTabParam) => void;
};

const tempCallbackTab:CallbackTabParam = {
  changeYn: false,
  campaignInfoChangeYn: false,
  onSave: false,
  onClosed: false,
  callback_kind: 0,
  service_code: 0
};

const CallbackTab: React.FC<Props> = ({ callCampaignMenu, campaignInfo, onHandleCallbackTabChange }) => {
  const [isChecked, setIsChecked] = useState(false); // 체크박스 상태 관리
  const [tempCallbackTabParam, setTempCallbackTabParam] = useState<CallbackTabParam>(tempCallbackTab);

  // 숫자 입력만 허용하는 핸들러
  const handleServiceCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      onHandleCallbackTabChange({...tempCallbackTabParam
        , campaignInfoChangeYn: true
        , service_code: Number(value)
      });
    }
  };
  const handleChecked = (checked:boolean) => {
    setIsChecked( checked );
    if( checked ){
      onHandleCallbackTabChange({...tempCallbackTabParam
        , campaignInfoChangeYn: true
        , callback_kind: 1
        , service_code: 0
      });
    }else{
      onHandleCallbackTabChange({...tempCallbackTabParam
        , campaignInfoChangeYn: true
        , callback_kind: 0
        , service_code: 0
      });
    }
  };

  const handleSelectChange = (value:any, col:string) => {
    onHandleCallbackTabChange({...tempCallbackTabParam
      , campaignInfoChangeYn: true
      , callback_kind: Number(value)
    });
  };

  useEffect(() => {
    if (campaignInfo ) {  
      if( campaignInfo.callback_kind === 0 ){
        setIsChecked(false);
      }else{
        setIsChecked(true);
      }
      setTempCallbackTabParam({...tempCallbackTabParam
        , callback_kind: campaignInfo.callback_kind
        , service_code: campaignInfo.service_code
      });
    }
  }, [campaignInfo]);

  return (
    <div className="pt-[50px]">
      <div className="flex flex-col gap-[12px] w-[400px] m-auto">
        {/* Call back Campaign 체크박스 */}
        <div className="flex gap-1 items-center">
          <CustomCheckbox
            id="callbackCampaign"
            checked={isChecked}
            onCheckedChange={(checked) => handleChecked(checked === true)}
          />
          <Label htmlFor="callbackCampaign">Callback Campaign</Label>
        </div>

        {/* Call back 구분 */}
        <div className="flex items-center gap-2">
          <Label className="w-[8.3rem] min-w-[8.3rem]">Callback 구분</Label>
          <Select disabled={!isChecked} value={campaignInfo?.callback_kind === 0?'1':campaignInfo?.callback_kind+''} onValueChange={(value) => handleSelectChange(value, 'callback_kind')}> {/* 체크 여부로 활성화/비활성화 */}
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">무한 Callback</SelectItem>
              <SelectItem value="2">일반 Callback</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Service Code */}
        <div className="flex items-center gap-2">
          <Label className="w-[8.3rem] min-w-[8.3rem]">Service Code</Label>
          <CustomInput
            type="text"
            value={campaignInfo?.service_code+''}
            onChange={handleServiceCodeChange}
            disabled={!isChecked} // 체크 여부에 따라 활성화/비활성화
          />
        </div>
        {/* 확인 / 취소 버튼 */}
      {!(callCampaignMenu == 'NewCampaignManager' || callCampaignMenu == 'CampaignGroupManager' || callCampaignMenu == 'CampaignClone')  &&
        <div className="flex justify-end gap-2 mt-5">
          <CommonButton variant="secondary" onClick={()=> 
            onHandleCallbackTabChange({...tempCallbackTabParam
              , onSave: true
            })
          }>확인</CommonButton>
          <CommonButton variant="secondary" onClick={()=> 
            onHandleCallbackTabChange({...tempCallbackTabParam
              , onClosed: true
            })
          }>취소</CommonButton>
        </div>
        }
      </div>

    </div>
  );
};

export default CallbackTab;