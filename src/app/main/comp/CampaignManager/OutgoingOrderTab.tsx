import React, { useState, useEffect } from "react";
import TitleWrap from "@/components/shared/TitleWrap";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import DataGrid from "react-data-grid";
import { CommonButton } from "@/components/shared/CommonButton";
import { useCampainManagerStore } from "@/store";
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import { OutgoingOrderTabParam } from './CampaignManagerDetail';
import { CampaignInfo } from "../CreateCampaignFormPanel/variables/variablesForCreateCampaignForm";

const columns = [
  { key: "phone1", name: "고객 전화번호(1)" },
  { key: "phone2", name: "고객 전화번호(2)" },
  { key: "phone3", name: "고객 전화번호(3)" },
  { key: "phone4", name: "고객 전화번호(4)" },
  { key: "phone5", name: "고객 전화번호(5)" },
];

interface DataProps {
  phone1: string;
  phone2: string;
  phone3: string;
  phone4: string;
  phone5: string;
}

const rows = [
  {
    phone1: "01012345678",
    phone2: "01012345678",
    phone3: "01012345678",
    phone4: "01012345678",
    phone5: "01012345678",
  },
];

interface RightDataProps {
  id: number;
  label: string;
}

const CampaignOutgoingOrderTab:OutgoingOrderTabParam = {
  changeYn: false,
  campaignInfoChangeYn: false,
  onSave: false,
  onClosed: false,
  dial_phone_id: 0,
  phone_order: '',
  phone_dial_try: []
};

type Props = {
  callCampaignMenu: string;
  campaignInfo: MainDataResponse;
  onCampaignOutgoingOrderChange: (param:OutgoingOrderTabParam) => void;
};

const OutgoingOrderTab: React.FC<Props> = ({ callCampaignMenu, campaignInfo, onCampaignOutgoingOrderChange }) => {
  const { phoneDescriptions } = useCampainManagerStore();
  const [tempData, setTempData] = useState<DataProps[]>([]);
  const [tempRightData, setTempRightData] = useState<RightDataProps[]>([]);
  const [tempCampaignInfo, setTempCampaignsInfo] = useState<MainDataResponse>(CampaignInfo);
  const [tempCampaignOutgoingOrderTab, setTempCampaignOutgoingOrderTab] = useState<OutgoingOrderTabParam>(CampaignOutgoingOrderTab);

  const [leftList, setLeftList] = useState([
    "고객 전화번호(3)",
    "고객 전화번호(4)",
    "고객 전화번호(5)",
  ]);

  const [rightList, setRightList] = useState([
    { id: 1, label: "고객 전화번호(1)" },
    { id: 2, label: "고객 전화번호(2)" },
  ]);

  useEffect(() => {
    if( phoneDescriptions.length > 0 && campaignInfo) {    
      setTempCampaignOutgoingOrderTab({...tempCampaignOutgoingOrderTab
        , dial_phone_id: campaignInfo.dial_phone_id
        , phone_order: campaignInfo.phone_order
        , phone_dial_try: campaignInfo.phone_dial_try
      });

      setLeftList([]);
      const tempLeftData:string[] = [];
      campaignInfo.phone_dial_try.map((data,index) => data === 0 && tempLeftData.push('고객 전화번호('+(index+1)+')'));
      setLeftList(tempLeftData);

      setRightList([]);
      const tempRigntData:RightDataProps[] = [];
      if( tempLeftData.length < 5 ){
        const cnt = Number(campaignInfo.phone_order.substring(0,1));
        for(let i=0;i<cnt;i++){
          tempRigntData.push({
            id: i + 1,
            label: '고객 전화번호('+campaignInfo.phone_order[i+1]+')'
          });
        }
      }
      setRightList(tempRigntData);

      setTempCampaignsInfo(campaignInfo);
      setTempData([]);  
      const tempDialPhoneId = phoneDescriptions.filter((dialPhoneId) => dialPhoneId.description_id === campaignInfo.dial_phone_id);
      if( tempDialPhoneId.length > 0 ){
        setTempData((prev) => [
          ...prev,
          {
            phone1: tempDialPhoneId[0].description[0]+'',
            phone2: tempDialPhoneId[0].description[1]+'',
            phone3: tempDialPhoneId[0].description[2]+'',
            phone4: tempDialPhoneId[0].description[3]+'',
            phone5: tempDialPhoneId[0].description[4]+''
          },
        ]);
      }else{
        setTempData((prev) => [
          ...prev,
          {
            phone1: phoneDescriptions[0].description[0]+'',
            phone2: phoneDescriptions[0].description[1]+'',
            phone3: phoneDescriptions[0].description[2]+'',
            phone4: phoneDescriptions[0].description[3]+'',
            phone5: phoneDescriptions[0].description[4]+''
          },
        ]);
      }
    }
  }, [campaignInfo,phoneDescriptions]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);

  const moveToRight = () => {
    if (selectedLeft) {
      setRightList([...rightList, { id: rightList.length + 1, label: selectedLeft }]);
      setLeftList(leftList.filter((item) => item !== selectedLeft));
      setSelectedLeft(null);
      const index = Number(selectedLeft.substring(8,9));
      onCampaignOutgoingOrderChange({...tempCampaignOutgoingOrderTab
        , changeYn: true
        , campaignInfoChangeYn: true
        , phone_dial_try: tempCampaignOutgoingOrderTab.phone_dial_try.map((val, idx) => idx === index - 1 ? 1 : val)
        , phone_order: rightList.length == 0?'1'+index:(rightList.length+1) + tempCampaignOutgoingOrderTab.phone_order.substring(1) + index
      });
      setSelectedRight(rightList.length+1);
    }
  };

  const moveToLeft = () => {
    if (selectedRight !== null) {
      const removedItem = rightList.find((item) => item.id === selectedRight);
      if (removedItem) {
        setLeftList([...leftList, removedItem.label]);
        setRightList(
          rightList
            .filter((item) => item.id !== selectedRight)
            .map((item, index) => ({
              id: index + 1, // 순서 재정렬
              label: item.label,
            }))
        );
        setSelectedRight(null);
        const index = Number(removedItem.label.substring(8,9));
        const idx = tempCampaignOutgoingOrderTab.phone_order.lastIndexOf(index+'');
        onCampaignOutgoingOrderChange({...tempCampaignOutgoingOrderTab
          , changeYn: true
          , campaignInfoChangeYn: true
          , phone_dial_try: tempCampaignOutgoingOrderTab.phone_dial_try.map((val, idx) => idx === index - 1 ? 0 : val)
          , phone_order: rightList.length == 1?'':(rightList.length-1) + tempCampaignOutgoingOrderTab.phone_order.substring(1,idx) + tempCampaignOutgoingOrderTab.phone_order.substring(idx+1)
        });
        setSelectedLeft(removedItem.label);
      }
    }
  };

  const moveUp = () => {
    if (selectedRight !== null) {
      const index = rightList.findIndex((item) => item.id === selectedRight);
      if (index > 0 && rightList.length > 1) {
        const updatedList = [...rightList];
        [updatedList[index - 1], updatedList[index]] = [updatedList[index], updatedList[index - 1]];
        setRightList(
          updatedList.map((item, index) => ({
            id: index + 1, // 순서 재정렬
            label: item.label,
          }))
        );
        if( rightList.length > 2){
          const upItem = rightList.find((item) => item.id === selectedRight);
          const cnt = Number(upItem?.label.substring(8,9));
          const idx = tempCampaignOutgoingOrderTab.phone_order.lastIndexOf(cnt+'');
          onCampaignOutgoingOrderChange({...tempCampaignOutgoingOrderTab
            , changeYn: true
            , campaignInfoChangeYn: true
            , phone_order: tempCampaignOutgoingOrderTab.phone_order.substring(0,idx-1) + tempCampaignOutgoingOrderTab.phone_order.substring(idx,idx+1) + tempCampaignOutgoingOrderTab.phone_order.substring(idx-1,idx) + tempCampaignOutgoingOrderTab.phone_order.substring(idx+1)
          });
        }
        setSelectedLeft(null);
        setSelectedRight(index); // 선택된 항목을 이동된 순서에 맞게 업데이트
      }
    }
  };

  const moveDown = () => {
    if (selectedRight !== null) {
      const index = rightList.findIndex((item) => item.id === selectedRight);
      if (index < rightList.length - 1 && rightList.length > 1) {
        const updatedList = [...rightList];
        [updatedList[index], updatedList[index + 1]] = [updatedList[index + 1], updatedList[index]];
        setRightList(
          updatedList.map((item, index) => ({
            id: index + 1, // 순서 재정렬
            label: item.label,
          }))
        );
        if( rightList.length > 2){
          // setSelectedRight(index); // 선택된 항목을 이동된 순서에 맞게 업데이트
          const upItem = rightList.find((item) => item.id === selectedRight);
          const cnt = Number(upItem?.label.substring(8,9));
          const idx = tempCampaignOutgoingOrderTab.phone_order.lastIndexOf(cnt+'');
          onCampaignOutgoingOrderChange({...tempCampaignOutgoingOrderTab
            , changeYn: true
            , campaignInfoChangeYn: true
            , phone_order: tempCampaignOutgoingOrderTab.phone_order.substring(0,idx) + tempCampaignOutgoingOrderTab.phone_order.substring(idx+1,idx+2) + tempCampaignOutgoingOrderTab.phone_order.substring(idx,idx+1) + tempCampaignOutgoingOrderTab.phone_order.substring(idx+2)
          });
        }
        setSelectedLeft(null);
        setSelectedRight(index + 2); // 선택된 항목을 이동된 순서에 맞게 업데이트
      }
    }
  };

  const handleSelectChange = (value:any, col:string) => {
    onCampaignOutgoingOrderChange({...tempCampaignOutgoingOrderTab
      , changeYn: true
      , campaignInfoChangeYn: true
      , dial_phone_id: Number(value)
    });
  };

  useEffect(() => {
    if (selectedRight != null) {
      // console.log(selectedRight);
    }
  }, [selectedRight]);
   

  return (
    <div className="py-5">
      <div className="flex flex-col gap-5">
        <div className="flex gap-5 justify-between items-start">
          <div className="flex items-center gap-2 justify-between w-[25%]">
            <Label className="w-[5rem] min-w-[5rem]">전화번호별<br/>템플릿 아이디</Label>
            <Select 
              onValueChange={(value) => handleSelectChange(value, 'dialMode')}
              value={tempCampaignOutgoingOrderTab.dial_phone_id > 0 ?tempCampaignOutgoingOrderTab.dial_phone_id+'': phoneDescriptions.length > 0? phoneDescriptions[0].description_id+'':''}
            >
              <SelectTrigger className="">
                <SelectValue placeholder=" " />
              </SelectTrigger>
              <SelectContent>
                {tempCampaignOutgoingOrderTab.dial_phone_id > 0 ?
                  phoneDescriptions//.filter((dialPhoneId) => dialPhoneId.description_id === tempCampaignOutgoingOrderTab.dial_phone_id)
                  .map((item) => (
                    <SelectItem key={item.description_id} value={item.description_id+''}>{item.description_id}</SelectItem>
                  ))
                  :
                  phoneDescriptions.map((item) => (
                    <SelectItem key={item.description_id} value={item.description_id+''}>{item.description_id}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
          <div className="grid-custom-wrap w-[75%]">
            <DataGrid
              columns={columns}
              rows={tempData}
              className="grid-custom h-auto"
              rowHeight={26}
              headerRowHeight={26}
            />
          </div>
        </div>
        <div>
          <TitleWrap
            className="border-b border-gray-300 pb-1"
            title="전화 번호별 발신 순서 편집"
          />
           <div className="">
            <div className="flex gap-5">
              {/* 왼쪽 리스트 */}
              <div className="flex gap-5 flex-1">
                <div className="border p-2 rounded h-40 overflow-y-auto w-[calc(100%-22px)]">
                  {leftList.map((item) => (
                    <div
                      key={item}
                      onClick={() => setSelectedLeft(item)}
                      className={`cursor-pointer p-1 rounded text-sm ${
                        selectedLeft === item ? "bg-[#FFFAEE]" : ""
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-center gap-2 min-w-[22px] justify-center">
                  <button
                    onClick={moveToRight}
                    className="w-[22px] h-[22px] bg-[#60C3CD] text-white rounded-full flex items-center justify-center disabled:opacity-50"
                    disabled={!selectedLeft}
                  >
                    →
                  </button>
                  <button
                    onClick={moveToLeft}
                    className="w-[22px] h-[22px] bg-[#60C3CD] text-white rounded-full flex items-center justify-center disabled:opacity-50"
                    disabled={!selectedRight}
                  >
                    ←
                  </button>
                </div>
              </div>

              {/* 오른쪽 테이블 */}
              <div className="flex gap-5 flex-1">
                <div className="border rounded h-40 overflow-y-auto  w-[calc(100%-22px)]">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr>
                        <th className="border-r border-b p-1 font-normal text-sm bg-[#F8F8F8]">순서</th>
                        <th className="border-b p-1 font-normal text-sm bg-[#F8F8F8]">전화번호 구분</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rightList.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedRight(item.id)}
                          className={`cursor-pointer ${
                            selectedRight === item.id ? "bg-[#FFFAEE]" : ""
                          }`}
                        >
                          <td className="border-b border-r p-1 text-center">{item.id}</td>
                          <td className="border-b p-1">{item.label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col items-center gap-2 min-w-[22px] justify-center">
                  <button
                    onClick={moveUp}
                    className="w-[22px] h-[22px] bg-[#60C3CD] text-white rounded-full flex items-center justify-center disabled:opacity-50"
                    disabled={!selectedRight}
                  >
                    ↑
                  </button>
                  <button
                    onClick={moveDown}
                    className="w-[22px] h-[22px] bg-[#60C3CD] text-white rounded-full flex items-center justify-center disabled:opacity-50"
                    disabled={!selectedRight}
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          </div>
          {!(callCampaignMenu == 'NewCampaignManager' || callCampaignMenu == 'CampaignGroupManager' || callCampaignMenu == 'CampaignClone')  &&
          <div className="flex justify-end gap-2 mt-5">
            <CommonButton variant="secondary" onClick={()=> 
              onCampaignOutgoingOrderChange({...tempCampaignOutgoingOrderTab
                , onSave: true
              })
            }>확인</CommonButton>
            <CommonButton variant="secondary" onClick={()=> 
              onCampaignOutgoingOrderChange({...tempCampaignOutgoingOrderTab
                , onClosed: true
              })
            }>취소</CommonButton>
          </div>
          }
        </div>
      </div>
    </div>
  );
};

export default OutgoingOrderTab;