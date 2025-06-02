import React, { useState, useEffect } from 'react';
import TitleWrap from "@/components/shared/TitleWrap";
import { CommonButton } from "@/components/shared/CommonButton";
import DataGrid from 'react-data-grid';
import type { Column } from 'react-data-grid';
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import { OutgoingStrategyTabParam } from './CampaignManagerDetail';

interface MaxCallsRow {
  call1: number;
  call2: number;
  call3: number;
  call4: number;
  call5: number;
}

interface MainRow {
  id: string;
  count1: number;
  duration1: number;
  count2: number;
  duration2: number;
  count3: number;
  duration3: number;
  count4: number;
  duration4: number;
  count5: number;
  duration5: number;
  count6: number;
  duration6: number;
  count7: number;
  duration7: number;
}

// Column 타입을 확장하여 children 속성 추가
interface CustomColumn<R> extends Column<R> {
  children?: CustomColumn<R>[];
}

const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  const currentValue = e.target.value;
  if (currentValue.startsWith("0") && currentValue.length > 1) {
    e.target.value = currentValue.replace(/^0+/, "");
  }
};

const EditableCell = ({ row, column, onRowChange }: any) => {
  return (
    <input
      className="w-full h-full text-center bg-white border-none outline-none"
      type="number"
      value={row[column.key]}
      onChange={(e) => {
        const newValue = parseInt(e.target.value) || 0;
        onRowChange({ ...row, [column.key]: newValue });
      }}
      onBlur={handleBlur}
    />
  );
};

const CampaignOutgoingOrderTab:OutgoingStrategyTabParam = {
  changeYn: false,
  campaignInfoChangeYn: false,
  onSave: false,
  onClosed: false,
  onInit: false,
  redial_strategy: []
};

type Props = {
  callCampaignMenu: string;
  campaignInfo: MainDataResponse;
  onCampaignOutgoingStrategyChange: (param:OutgoingStrategyTabParam) => void;
};

const OutgoingStrategyTab: React.FC<Props> = ({ callCampaignMenu,campaignInfo, onCampaignOutgoingStrategyChange }) => {
  const [tempOutgoingStrategyTab, setTempOutgoingStrategyTab] = useState<OutgoingStrategyTabParam>(CampaignOutgoingOrderTab);
  const [maxCallsRows, setMaxCallsRows] = useState<MaxCallsRow[]>([
    {
      call1: 7,
      call2: 7,
      call3: 7,
      call4: 7,
      call5: 7,
    }
  ]);

  const [rows, setRows] = useState<MainRow[]>([
    { id: '전화번호 1', count1: 2, duration1: 0, count2: 1, duration2: 0, count3: 1, duration3: 0, count4: 1, duration4: 0, count5: 1, duration5: 0, count6: 1, duration6: 0, count7: 1, duration7: 0 },
    { id: '전화번호 2', count1: 1, duration1: 0, count2: 1, duration2: 0, count3: 1, duration3: 0, count4: 1, duration4: 0, count5: 1, duration5: 0, count6: 1, duration6: 0, count7: 1, duration7: 0 },
    { id: '전화번호 3', count1: 1, duration1: 0, count2: 1, duration2: 0, count3: 1, duration3: 0, count4: 1, duration4: 0, count5: 1, duration5: 0, count6: 1, duration6: 0, count7: 1, duration7: 0 },
    { id: '전화번호 4', count1: 1, duration1: 0, count2: 1, duration2: 0, count3: 1, duration3: 0, count4: 1, duration4: 0, count5: 1, duration5: 0, count6: 1, duration6: 0, count7: 1, duration7: 0 },
    { id: '전화번호 5', count1: 1, duration1: 0, count2: 1, duration2: 0, count3: 1, duration3: 0, count4: 1, duration4: 0, count5: 1, duration5: 0, count6: 1, duration6: 0, count7: 1, duration7: 0 }
  ]);

  const maxCallsColumns: Column<MaxCallsRow>[] = [
    { key: 'call1', name: '고객 전화번호(1)', renderCell: EditableCell },
    { key: 'call2', name: '고객 전화번호(2)', renderCell: EditableCell },
    { key: 'call3', name: '고객 전화번호(3)', renderCell: EditableCell },
    { key: 'call4', name: '고객 전화번호(4)', renderCell: EditableCell },
    { key: 'call5', name: '고객 전화번호(5)', renderCell: EditableCell },
  ];

  const mainColumns: CustomColumn<MainRow>[] = [
    { 
      key: 'id', 
      name: '전화번호', 
      frozen: true,
      cellClass: 'bg-[#f8f8f8]',
      headerCellClass: '!p-0'
    },
    { 
      key: 'section1',
      name: '통화 중 실패',
      children: [
        { key: 'count1', name: '횟수',  renderCell: EditableCell },
        { key: 'duration1', name: '간격',  renderCell: EditableCell },
      ],
    },
    {
      key: 'section2',
      name: '무응답 실패',
      width: 120,
      children: [
        { key: 'count2', name: '횟수',  renderCell: EditableCell },
        { key: 'duration2', name: '간격',  renderCell: EditableCell },
      ],
    },
    {
      key: 'section3',
      name: '팩스/전화번호 오류',
      children: [
        { key: 'count3', name: '횟수',  renderCell: EditableCell },
        { key: 'duration3', name: '간격',  renderCell: EditableCell },
      ],
    },
    {
      key: 'section4',
      name: '기계음 실패',
      children: [
        { key: 'count4', name: '횟수', renderCell: EditableCell },
        { key: 'duration4', name: '간격', renderCell: EditableCell },
      ],
    },
    {
      key: 'section5',
      name: '기타 실패',
      children: [
        { key: 'count5', name: '횟수', renderCell: EditableCell },
        { key: 'duration5', name: '간격',  renderCell: EditableCell },
      ],
    },
    {
      key: 'section6',
      name: '고객 바로 끊음',
      children: [
        { key: 'count6', name: '횟수', renderCell: EditableCell },
        { key: 'duration6', name: '간격',  renderCell: EditableCell },
      ],
    },
    {
      key: 'section7',
      name: '채널 오류',
      children: [
        { key: 'count7', name: '횟수', renderCell: EditableCell },
        { key: 'duration7', name: '간격',  renderCell: EditableCell },
      ],
    },
  ];

  const handleMaxCallsRowsChange = (newRows: MaxCallsRow[]) => {
    let check = true;
    if( newRows[0].call1 > 29 ){
      newRows[0].call1 = 29;
      check = false;
    }else if( newRows[0].call2 > 29 ){
      newRows[0].call2 = 29;
      check = false;
    }else if( newRows[0].call3 > 29 ){
      newRows[0].call3 = 29;
      check = false;
    }else if( newRows[0].call4 > 29 ){
      newRows[0].call4 = 29;
      check = false;
    }else if( newRows[0].call5 > 29 ){
      newRows[0].call5 = 29;
      check = false;
    }
    if(check){
      const tempdata = newRows[0].call1+','+newRows[0].call2+','+newRows[0].call3+','+newRows[0].call4+','+newRows[0].call5;
      setMaxCallsRows(newRows);
      onCampaignOutgoingStrategyChange({...tempOutgoingStrategyTab      
          , changeYn: true
          , campaignInfoChangeYn: true
          , redial_strategy: tempOutgoingStrategyTab.redial_strategy.map((val,index) => tempdata.split(',')[index]+val.substring(val.indexOf(':')))
      });
    }
  };

  const changeRedialStrategyData = (row: MainRow,value:string) => {
    const tempRedialStrategy = value.substring(0,value.indexOf(':')+1)+'2.' + row.count1+'.'+row.duration1+'\/3.' 
    + row.count2+'.'+row.duration2 + '\/4.'
    + row.count3+'.'+row.duration3 + '\/5.'
    + row.count4+'.'+row.duration4 + '\/6.'
    + row.count5+'.'+row.duration5 + '\/10.'
    + row.count6+'.'+row.duration6 + '\/99.'
    + row.count7+'.'+row.duration7 + value.substring(value.indexOf('/2501'))
    ;
    return tempRedialStrategy;
  }

  const handleMainRowsChange = (newRows: MainRow[]) => {
    let check = true;
    for( let i=0;i<newRows.length;i++){
      if( newRows[i].count1 < 1 ){
        newRows[i].count1 = 1;
        check = false;
      }else if( newRows[i].count2 < 1 ){
        newRows[i].count2 = 1;
        check = false;
      }else if( newRows[i].count3 < 1 ){
        newRows[i].count3 = 1;
        check = false;
      }else if( newRows[i].count4 < 1 ){
        newRows[i].count4 = 1;
        check = false;
      }else if( newRows[i].count5 < 1 ){
        newRows[i].count5 = 1;
        check = false;
      }else if( newRows[i].count6 < 1 ){
        newRows[i].count6 = 1;
        check = false;
      }else if( newRows[i].count7 < 1 ){
        newRows[i].count7 = 1;
        check = false;
      }else if( newRows[i].duration1 < 0 ){
        newRows[i].duration1 = 0;
        check = false;
      }else if( newRows[i].duration2 < 0 ){
        newRows[i].duration2 = 0;
        check = false;
      }else if( newRows[i].duration3 < 0 ){
        newRows[i].duration3 = 0;
        check = false;
      }else if( newRows[i].duration4 < 0 ){
        newRows[i].duration4 = 0;
        check = false;
      }else if( newRows[i].duration5 < 0 ){
        newRows[i].duration5 = 0;
        check = false;
      }else if( newRows[i].duration6 < 0 ){
        newRows[i].duration6 = 0;
        check = false;
      }else if( newRows[i].duration7 < 0 ){
        newRows[i].duration7 = 0;
        check = false;
      }else if( newRows[i].count1 > 5 ){
        newRows[i].count1 = 5;
        check = false;
      }else if( newRows[i].count2 > 5 ){
        newRows[i].count2 = 5;
        check = false;
      }else if( newRows[i].count3 > 5 ){
        newRows[i].count3 = 5;
        check = false;
      }else if( newRows[i].count4 > 5 ){
        newRows[i].count4 = 5;
        check = false;
      }else if( newRows[i].count5 > 5 ){
        newRows[i].count5 = 5;
        check = false;
      }else if( newRows[i].count6 > 5 ){
        newRows[i].count6 = 5;
        check = false;
      }else if( newRows[i].count7 > 5 ){
        newRows[i].count7 = 5;
        check = false;
      }else if( newRows[i].duration1 > 100 ){
        newRows[i].duration1 = 100;
        check = false;
      }else if( newRows[i].duration2 > 100 ){
        newRows[i].duration2 = 100;
        check = false;
      }else if( newRows[i].duration3 > 100 ){
        newRows[i].duration3 = 100;
        check = false;
      }else if( newRows[i].duration4 > 100 ){
        newRows[i].duration4 = 100;
        check = false;
      }else if( newRows[i].duration5 > 100 ){
        newRows[i].duration5 = 100;
        check = false;
      }else if( newRows[i].duration6 > 100 ){
        newRows[i].duration6 = 100;
        check = false;
      }else if( newRows[i].duration7 > 100 ){
        newRows[i].duration7 = 100;
        check = false;
      }else if( newRows[i].count1+newRows[i].count2+newRows[i].count3+newRows[i].count4+newRows[i].count5+newRows[i].count6+newRows[i].count7 > 15 ){
        check = false;
      }
    }
    if(check){
      setRows(newRows);
      onCampaignOutgoingStrategyChange({...tempOutgoingStrategyTab      
          , changeYn: true
          , campaignInfoChangeYn: true
          , redial_strategy: tempOutgoingStrategyTab.redial_strategy.map((val,index) => changeRedialStrategyData(newRows[index],val))
      });
    }
  };

  useEffect(() => {
    if (campaignInfo.redial_strategy && campaignInfo.redial_strategy.length > 0) {  
      setTempOutgoingStrategyTab({...tempOutgoingStrategyTab
        ,redial_strategy : campaignInfo.redial_strategy
      }); 
      setMaxCallsRows(maxCallsRows.map(row => ({
        ...row,
        call1: Number(campaignInfo.redial_strategy[0].split(':')[0]),
        call2: Number(campaignInfo.redial_strategy[1].split(':')[0]),
        call3: Number(campaignInfo.redial_strategy[2].split(':')[0]),
        call4: Number(campaignInfo.redial_strategy[3].split(':')[0]),
        call5: Number(campaignInfo.redial_strategy[4].split(':')[0])
      })));
      setRows(rows.map((row, index) => ({
        ...row,
        id: '전화번호'+(index+1),
        count1: Number(campaignInfo.redial_strategy[index].split('\/')[0].split('.')[1]),
        duration1: Number(campaignInfo.redial_strategy[index].split('\/')[0].split('.')[2]),
        count2: Number(campaignInfo.redial_strategy[index].split('\/')[1].split('.')[1]),
        duration2: Number(campaignInfo.redial_strategy[index].split('\/')[1].split('.')[2]),
        count3: Number(campaignInfo.redial_strategy[index].split('\/')[2].split('.')[1]),
        duration3: Number(campaignInfo.redial_strategy[index].split('\/')[2].split('.')[2]),
        count4: Number(campaignInfo.redial_strategy[index].split('\/')[3].split('.')[1]),
        duration4: Number(campaignInfo.redial_strategy[index].split('\/')[3].split('.')[2]),
        count5: Number(campaignInfo.redial_strategy[index].split('\/')[4].split('.')[1]),
        duration5: Number(campaignInfo.redial_strategy[index].split('\/')[4].split('.')[2]),
        count6: Number(campaignInfo.redial_strategy[index].split('\/')[5].split('.')[1]),
        duration6: Number(campaignInfo.redial_strategy[index].split('\/')[5].split('.')[2]),
        count7: Number(campaignInfo.redial_strategy[index].split('\/')[6].split('.')[1]),
        duration7: Number(campaignInfo.redial_strategy[index].split('\/')[6].split('.')[2]),
      })));
    }
  }, [campaignInfo]);

  return (
    <div className="py-5">
      <div className="flex flex-col gap-4">
        <div>
          <TitleWrap
            className="pb-1"
            title="전화 번호별 최대 링 횟수"
          />
          <div className="grid-custom-wrap w-full">
            <DataGrid
              columns={maxCallsColumns}
              rows={maxCallsRows}
              onRowsChange={handleMaxCallsRowsChange}
              className="grid-custom row-none"
              rowHeight={26}
            />
          </div>
        </div>
        <div>
          <TitleWrap
            className="pb-1"
            title="재시도 전략 설정"
            buttons={[
              { label: "초기화", onClick: () => onCampaignOutgoingStrategyChange({...tempOutgoingStrategyTab
                , onInit: true
              }), variant: "secondary" },
          ]}
          />
          <div className="grid-custom-wrap w-full">
          {/* <div className="grid-custom-wrap w-full "> */}
            <DataGrid
              columns={mainColumns}
              rows={rows}
              onRowsChange={handleMainRowsChange}
              className="grid-custom row-none h-[300px]"
              rowHeight={26}
            />
          </div>
        </div>
      </div>
      {!(callCampaignMenu == 'NewCampaignManager' || callCampaignMenu == 'CampaignGroupManager' || callCampaignMenu == 'CampaignClone')  &&
      <div className="flex justify-end gap-2 mt-5">
        <CommonButton variant="secondary" onClick={()=> 
          onCampaignOutgoingStrategyChange({...tempOutgoingStrategyTab
            , onSave: true
          })
        }>확인</CommonButton>
        <CommonButton variant="secondary" onClick={()=> 
          onCampaignOutgoingStrategyChange({...tempOutgoingStrategyTab
            , onClosed: true
          })
        }>취소</CommonButton>
      </div>
      }
    </div>
  );
};

export default OutgoingStrategyTab;