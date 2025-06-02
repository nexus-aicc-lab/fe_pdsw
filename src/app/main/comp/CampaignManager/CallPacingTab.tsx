
import React, { useState, useEffect } from 'react';
import { CommonButton } from "@/components/shared/CommonButton";
import TitleWrap from "@/components/shared/TitleWrap";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import { CallPacingTabParam } from './CampaignManagerDetail';

const tempCallPacingTab: CallPacingTabParam = {
  changeYn: false,
  campaignDialSpeedChangeYn: false,
  onSave: false,
  onClosed: false,
  dial_mode: 0,
  progressive_dial_speed: 0,
  predictive_dial_speed: 0,
};

type Props = {
  callCampaignMenu: string;
  campaignDialSpeedInfo: CallPacingTabParam;
  onHandleCallPacingTabChange: (param:CallPacingTabParam) => void;
};

const CallPacingTab: React.FC<Props> = ({ callCampaignMenu,campaignDialSpeedInfo, onHandleCallPacingTabChange }) => {
  const [predictiveValue, setPredictiveValue] = useState(50);
  const [progressiveValue, setProgressiveValue] = useState(500);
  const [predictiveUnit, setPredictiveUnit] = useState(1);
  const [progressiveUnit, setProgressiveUnit] = useState(100);
  const [predictiveDisabled, setPredictiveDisabled] = useState(true);
  const [progressiveValueeDisabled, setProgressiveValueDisabled] = useState(true);
  const [tempCallPacingTabParam, setTempCallPacingTabParam] = useState<CallPacingTabParam>(campaignDialSpeedInfo);

  const predictiveUnits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const progressiveUnits = [1, 5, 10, 50, 100];

  const handleDecrement = (type: 'predictive' | 'progressive') => {
    if (type === 'predictive') {
      const tempValue = Math.max(50, predictiveValue - predictiveUnit);
      setPredictiveValue(tempValue);
      onHandleCallPacingTabChange({...tempCallPacingTabParam
        , campaignDialSpeedChangeYn: true
        , predictive_dial_speed: tempValue
      });
    } else {
      setProgressiveValue(Math.max(25, progressiveValue - progressiveUnit));
      onHandleCallPacingTabChange({...tempCallPacingTabParam
        , campaignDialSpeedChangeYn: true
        , progressive_dial_speed: Math.max(12.5, (progressiveValue - progressiveUnit)/2)
      });
    }
  };

  const handleIncrement = (type: 'predictive' | 'progressive') => {
    if (type === 'predictive') {
      const tempValue = Math.min(100, predictiveValue + predictiveUnit);
      setPredictiveValue(tempValue);
      onHandleCallPacingTabChange({...tempCallPacingTabParam
        , campaignDialSpeedChangeYn: true
        , predictive_dial_speed: tempValue
      });
    } else {
      setProgressiveValue(Math.min(500, progressiveValue + progressiveUnit));
      onHandleCallPacingTabChange({...tempCallPacingTabParam
        , campaignDialSpeedChangeYn: true
        , progressive_dial_speed: Math.min(250, (progressiveValue + progressiveUnit)/2)
      });
    }
  };

  useEffect(() => {
    if (campaignDialSpeedInfo ) {  
      if( campaignDialSpeedInfo.dial_mode === 2 ){
        setPredictiveDisabled(true);
        setProgressiveValueDisabled(false);
      }else if( campaignDialSpeedInfo.dial_mode === 3 ){
        setPredictiveDisabled(false);
        setProgressiveValueDisabled(true);
      }else{
        setPredictiveDisabled(true);
        setProgressiveValueDisabled(true);
      }
      setTempCallPacingTabParam(campaignDialSpeedInfo);
      setProgressiveValue( campaignDialSpeedInfo.progressive_dial_speed * 2 < 25 ?25:campaignDialSpeedInfo.progressive_dial_speed * 2 );
      setPredictiveValue( campaignDialSpeedInfo.predictive_dial_speed < 50?50:campaignDialSpeedInfo.predictive_dial_speed );
    }
  }, [campaignDialSpeedInfo]);

  return (
    <div className="py-5">
      <div className="flex flex-col gap-[20px]">
        <div>
         <TitleWrap
            className=""
            title="Predictive"
          />
          <div className="border border-[#ebebeb] rounded-[3px] px-[40px] py-[20px] flex flex-col gap-[14px]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">발신 속도 조절</span>
              <span className="flex items-center"><span className="text-sm font-medium min-w-[25px] text-center">{predictiveValue}</span><span className="text-sm font-medium">({predictiveValue === 50?0:'+'+(predictiveValue-50)})</span></span>
              <div className="flex items-center gap-[5px]">
                <span className="text-sm font-medium">변경 단위 :</span>
                <Select value={predictiveUnit.toString()} onValueChange={(value) => setPredictiveUnit(Number(value))} disabled={predictiveDisabled}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {predictiveUnits.map((unit) => (
                      <SelectItem key={unit} value={unit.toString()}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
               </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <div className="h-[20px] w-full rounded-full bg-[#ddd]">
                  <div
                    className="h-full rounded-full bg-[#4EE781]"
                    style={{ width: `${((predictiveValue-50)*2 / 100) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDecrement('predictive')}
                  className="w-[22px] h-[22px] bg-[#60C3CD] text-white rounded-full flex items-center justify-center disabled:opacity-50"
                  disabled={predictiveDisabled}
                >
                  ←
                </button>
                <button
                  onClick={() => handleIncrement('predictive')}
                  className="w-[22px] h-[22px] bg-[#60C3CD] text-white rounded-full flex items-center justify-center disabled:opacity-50"
                  disabled={predictiveDisabled}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progressive Section */}
        <div>
          <TitleWrap
            className=""
            title="Progressive"
          />
          <div className="border border-[#ebebeb] rounded-[3px] px-[40px] py-[20px] flex flex-col gap-[14px]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">발신 비율(%):범위</span>
              <span className="flex items-center"><span className="text-sm font-medium min-w-[25px] text-center">{progressiveValue}</span><span className="text-sm font-medium">(%)</span></span>
              <div className="flex items-center gap-[5px]">
                <span className="text-sm font-medium">변경 단위 :</span>
                <Select value={progressiveUnit.toString()} onValueChange={(value) => setProgressiveUnit(Number(value))} disabled={progressiveValueeDisabled} >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {progressiveUnits.map((unit) => (
                      <SelectItem key={unit} value={unit.toString()}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                  </Select>
                </div>
            </div>
          <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <div className="h-[20px] w-full rounded-full bg-[#ddd]">
                  <div
                    className="h-full rounded-full bg-green-400"
                    style={{ width: `${((progressiveValue - 25) / (500 - 25)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDecrement('progressive')}
                  className="w-[22px] h-[22px] bg-[#60C3CD] text-white rounded-full flex items-center justify-center disabled:opacity-50"
                  disabled={progressiveValueeDisabled}
                >
                  ←
                </button>
                <button
                  onClick={() => handleIncrement('progressive')}
                  className="w-[22px] h-[22px] bg-[#60C3CD] text-white rounded-full flex items-center justify-center disabled:opacity-50"
                  disabled={progressiveValueeDisabled}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
      {!(callCampaignMenu == 'NewCampaignManager' || callCampaignMenu == 'CampaignGroupManager' || callCampaignMenu == 'CampaignClone')  &&
      <div className="flex justify-end gap-2 mt-5">
        <CommonButton variant="secondary" onClick={()=> 
          onHandleCallPacingTabChange({...tempCallPacingTabParam
            , onSave: true
          })
        }>확인</CommonButton>
        <CommonButton variant="secondary" onClick={()=> 
          onHandleCallPacingTabChange({...tempCallPacingTabParam
            , onClosed: true
          })
        }>취소</CommonButton>
      </div>
      }
    </div>
  );
};

export default CallPacingTab;




