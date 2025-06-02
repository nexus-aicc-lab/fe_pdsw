import React, { useState, useEffect } from "react";
import TitleWrap from "@/components/shared/TitleWrap";
import { Label } from "@/components/ui/label";
import { CustomInput } from "@/components/shared/CustomInput";
import { CommonButton } from "@/components/shared/CommonButton";
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import { AdditionalInfoTabParam } from './CampaignManagerDetail';

const tempAdditionalInfoTab:AdditionalInfoTabParam = {
  changeYn: false,
  campaignInfoChangeYn: false,
  onSave: false,
  onClosed: false
};

type Props = {
  callCampaignMenu: string;
  campaignInfo: MainDataResponse;
  onHandleAdditionalInfoTabChange: (param:AdditionalInfoTabParam) => void;
};

const AdditionalInfoTab: React.FC<Props> = ({ callCampaignMenu, campaignInfo, onHandleAdditionalInfoTabChange }) => {
  // 캠페인 생성 정보 상태
  const [creator, setCreator] = useState(''); // 생성 인
  const [creationDate, setCreationDate] = useState(""); // 생성 날짜
  const [creationPlace, setCreationPlace] = useState(""); // 생성 장소

  // 캠페인 수정 정보 상태
  const [editor, setEditor] = useState(''); // 수정 인
  const [editDate, setEditDate] = useState(""); // 수정 날짜
  const [editPlace, setEditPlace] = useState(""); // 수정 장소

  useEffect(() => {
    if (campaignInfo && campaignInfo.campaign_id !== 0) {  
      setCreator(campaignInfo.creation_user);
      setCreationDate(campaignInfo.creation_time);
      setCreationPlace(campaignInfo.creation_ip);
      setEditor(campaignInfo.update_user+'');
      setEditDate(campaignInfo.update_time);
      setEditPlace(campaignInfo.update_ip);
    }
  }, [campaignInfo]);

  return (
    <div className="py-5">
      <div className="flex gap-5">
        {/* 캠페인 생성 정보 */}
        <div className="flex-1">
          <TitleWrap
            className="border-b border-gray-300 pb-1"
            title="캠페인 생성 정보"
          />
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-2">
              <Label className="w-[5rem] min-w-[5rem]">생성자</Label>
              <CustomInput
                className="w-[14rem]"
                type="text"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                disabled
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="w-[5rem] min-w-[5rem]">생성 날짜</Label>
              <CustomInput
                className="w-[14rem]"
                type="text"
                value={creationDate}
                onChange={(e) => setCreationDate(e.target.value)}
                disabled
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="w-[5rem] min-w-[5rem]">생성 장소</Label>
              <CustomInput
                className="w-[14rem]"
                type="text"
                value={creationPlace}
                onChange={(e) => setCreationPlace(e.target.value)}
                disabled
              />
            </div>
          </div>
        </div>

        {/* 캠페인 수정 정보 */}
        <div className="flex-1">
          <TitleWrap
            className="border-b border-gray-300 pb-1"
            title="캠페인 수정 정보"
          />
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-2">
              <Label className="w-[5rem] min-w-[5rem]">수정자</Label>
              <CustomInput
                className="w-[14rem]"
                type="text"
                value={editor}
                onChange={(e) => setEditor(e.target.value)}
                disabled
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="w-[5rem] min-w-[5rem]">수정 날짜</Label>
              <CustomInput
                className="w-[14rem]"
                type="text"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                disabled
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="w-[5rem] min-w-[5rem]">수정 장소</Label>
              <CustomInput
                className="w-[14rem]"
                type="text"
                value={editPlace}
                onChange={(e) => setEditPlace(e.target.value)}
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {/* 확인/취소 버튼 */}
      {!(callCampaignMenu == 'NewCampaignManager' || callCampaignMenu == 'CampaignGroupManager' || callCampaignMenu == 'CampaignClone')  &&
      <div className="flex justify-end gap-2 mt-5">
        <CommonButton variant="secondary" onClick={()=> 
          onHandleAdditionalInfoTabChange({...tempAdditionalInfoTab
            , onSave: true
          })
        }>확인</CommonButton>
        <CommonButton variant="secondary" onClick={()=> 
          onHandleAdditionalInfoTabChange({...tempAdditionalInfoTab
            , onClosed: true
          })
        }>취소</CommonButton>
      </div>
      }
    </div>
  );
};

export default AdditionalInfoTab;