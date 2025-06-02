import React, { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { CustomCheckbox } from "@/components/shared/CustomCheckbox";
import CustomAlert, { CustomAlertRequest } from "@/components/shared/layout/CustomAlert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";

interface FormatItem {
  id: string;
  name: string;
  field: string;
}

export interface FormatRow {
  id?: string;
  name: string;
  start: number;
  length: number;
  field: string;
}

export const initData: FormatRow[] = [{  id: '1',  name: '고객키[1]',  start: 1,  length: 1,  field: 'CSKE'}
  ,{  id: '4',  name: '고객 이름',  start: 1,  length: 1,  field: 'CSNA'}
  ,{  id: '5',  name: '고객 전화번호[1]', start: 1, length: 1, field: 'TNO1'}
  ,{  id: '17', name: '토큰데이터', start: 1, length: 1, field: 'TKDA'}
];

const delimiterList: { id: string; name: string; }[] = [
  {id:',',name:','}
  ,{id:';',name:';'}
  ,{id:'!',name:'!'}
  ,{id:'\\',name:'\\'}
  ,{id:'@',name:'@'}
];

export interface FormatRowData {
  delimiter: string;
  originDataSaveYn: boolean;
  datalist: FormatRow[];
}

const errorMessage: CustomAlertRequest = {
  isOpen: false,
  message: '',
  title: '캠페인',
  type: '1',
  onClose: () => {},
  onCancel: () => {},
};

interface FileFormatProps {
  isOpen: boolean;
  _formatRows: FormatRow[];
  _listManagerDelimiter: string;
  onConfirm: (data: FormatRowData) => void;
  onClose: () => void;
}

const FileFormat: React.FC<FileFormatProps> = ({ isOpen,onConfirm, onClose, _formatRows,_listManagerDelimiter }) => {
  const [delimiter, setDelimiter] = useState<string>(',');
  const [originaldataYn, setOriginaldataYn] = useState<boolean>(true);
  const [tabValue, setTabValue] = useState("format-field");
  const [alertState, setAlertState] = useState<CustomAlertRequest>(errorMessage);

  //필드항목
  const [formatRows, setFormatRows] = useState<FormatRow[]>(initData);

   // 선택된 행의 인덱스를 추적하는 상태 추가
   const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

   //탭변경함수.
   const handleTabChange = (value:string) => {
    setTabValue(value);
  };

   // 행 선택 핸들러
   const handleRowSelect = (index: number) => {
     setSelectedRowIndex(index);
   };
   // 그리드 행 삭제 keyUp 이벤트.
   const handleKeyUp = (e:any, index: number) => {
    if( e.key === 'Delete'){
      const newRows = [...formatRows];
      if( newRows[index].id === '1' ){
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: "고객키[1]은 필수 항목입니다. 다시 확인하시고 설정해주세요.",
          type: '2',
          onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
        });
      } else {
        newRows.splice(index, 1);
        const cnt = newRows.length;
        for( let i=0;i<cnt;i++){
          if (i === 0) {
            newRows[i]['start'] = 1;
          } else {
            newRows[i]['start'] = newRows[i - 1]['start'] + newRows[i - 1]['length'];
          }
        }
        setFormatRows(newRows);
      }
    }
   };

  // 그리드 길이 항목 수정 이벤트.
  const handleEditChange = (event: any, rowIndex: number, column: string) => {
    const newRows = [...formatRows];
    let tempLength = Number(event.target.value);
    let _message = '';
    if( newRows[rowIndex].field === 'CSKE' &&  tempLength > 30 ){
      _message = '고객키[1] 사이즈는 최대 30byte 입니다.';
      tempLength = 30;
    }else if( newRows[rowIndex].field === 'CSK2' &&  tempLength > 30 ){
      _message = '고객키[2] 사이즈는 최대 30byte 입니다.';
      tempLength = 30;
    }else if( newRows[rowIndex].field === 'CSK3' &&  tempLength > 30 ){
      _message = '고객키[3] 사이즈는 최대 30byte 입니다.';
      tempLength = 30;
    }else if( newRows[rowIndex].field === 'CSNA' &&  tempLength > 50 ){
      _message = '고객 이름 사이즈는 최대 50byte 입니다.';
      tempLength = 50;
    }else if( newRows[rowIndex].field === 'TNO1' &&  tempLength > 20 ){
      _message = '고객 전화번호[1] 사이즈는 최대 20byte 입니다.';
      tempLength = 20;
    }else if( newRows[rowIndex].field === 'TNO2' &&  tempLength > 20 ){
      _message = '고객 전화번호[2] 사이즈는 최대 20byte 입니다.';
      tempLength = 20;
    }else if( newRows[rowIndex].field === 'TNO3' &&  tempLength > 20 ){
      _message = '고객 전화번호[3] 사이즈는 최대 20byte 입니다.';
      tempLength = 20;
    }else if( newRows[rowIndex].field === 'TNO4' &&  tempLength > 20 ){
      _message = '고객 전화번호[4] 사이즈는 최대 20byte 입니다.';
      tempLength = 20;
    }else if( newRows[rowIndex].field === 'TNO5' &&  tempLength > 20 ){
      _message = '고객 전화번호[5] 사이즈는 최대 20byte 입니다.';
      tempLength = 20;
    }else if( newRows[rowIndex].field === 'CSC1' &&  tempLength > 20 ){
      _message = '고객 성향[1] 사이즈는 최대 20byte 입니다.';
      tempLength = 20;
    }else if( newRows[rowIndex].field === 'CSC2' &&  tempLength > 20 ){
      _message = '고객 성향[2] 사이즈는 최대 20byte 입니다.';
      tempLength = 20;
    }else if( newRows[rowIndex].field === 'CSC3' &&  tempLength > 20 ){
      _message = '고객 성향[3] 사이즈는 최대 20byte 입니다.';
      tempLength = 20;
    }else if( newRows[rowIndex].field === 'CSC4' &&  tempLength > 20 ){
      _message = '고객 성향[4] 사이즈는 최대 20byte 입니다.';
      tempLength = 20;
    }else if( newRows[rowIndex].field === 'CSC5' &&  tempLength > 20 ){
      _message = '고객 성향[5] 사이즈는 최대 20byte 입니다.';
      tempLength = 20;
    }else if( newRows[rowIndex].field === 'EMPLOYEEID' &&  tempLength > 10 ){
      _message = '상담사 ID 사이즈는 최대 20byte 입니다.';
      tempLength = 10;
    }else if( newRows[rowIndex].field === 'TKDA' &&  tempLength > 1024 ){
      _message = '토큰데이터 사이즈는 최대 1024byte 입니다.';
      tempLength = 1024;
    }
    if( _message !== ''){
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: _message,
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }
    (newRows[rowIndex] as any)[column] = tempLength;
    if( rowIndex < newRows.length-1){
      for( let i=rowIndex;i<newRows.length-1;i++){
        (newRows[i+1] as any)['start'] = newRows[i]['start'] + newRows[i]['length'];
      }
    }
    setFormatRows(newRows);
  };


   // 위로 이동 핸들러
  const handleMoveUp = () => {
    if (selectedRowIndex === null || selectedRowIndex <= 0) return;

    const newRows = [...formatRows];
    // 선택된 행과 그 위의 행을 교환
    [newRows[selectedRowIndex], newRows[selectedRowIndex - 1]] = 
    [newRows[selectedRowIndex - 1], newRows[selectedRowIndex]];

    newRows[selectedRowIndex - 1]['start'] = newRows[selectedRowIndex]['start'];
    newRows[selectedRowIndex]['start'] = newRows[selectedRowIndex - 1]['start'] + newRows[selectedRowIndex - 1]['length'];

    // 선택된 행 인덱스도 함께 이동
    setFormatRows(newRows);
    setSelectedRowIndex(selectedRowIndex - 1);
  };

  // 아래로 이동 핸들러
  const handleMoveDown = () => {
    if (selectedRowIndex === null || selectedRowIndex >= formatRows.length - 1) return;

    const newRows = [...formatRows];
    // 선택된 행과 그 아래 행을 교환
    [newRows[selectedRowIndex], newRows[selectedRowIndex + 1]] = 
    [newRows[selectedRowIndex + 1], newRows[selectedRowIndex]];

    newRows[selectedRowIndex]['start'] = newRows[selectedRowIndex+1]['start']
    newRows[selectedRowIndex+1]['start'] = newRows[selectedRowIndex]['start'] + newRows[selectedRowIndex]['length']

    // 선택된 행 인덱스도 함께 이동
    setFormatRows(newRows);
    setSelectedRowIndex(selectedRowIndex + 1);
  };


  const leftItems = useMemo(() => [
    { id: '1', name: '고객키[1]', field: 'CSKE' },
    { id: '2', name: '고객키[2]', field: 'CSK2' },
    { id: '3', name: '고객키[3]', field: 'CSK3' },
    { id: '4', name: '고객 이름', field: 'CSNA' },
    { id: '5', name: '고객 전화번호[1]', field: 'TNO1' },
    { id: '6', name: '고객 전화번호[2]', field: 'TNO2' },
    { id: '7', name: '고객 전화번호[3]', field: 'TNO3' },
    { id: '8', name: '고객 전화번호[4]', field: 'TNO4' },
    { id: '9', name: '고객 전화번호[5]', field: 'TNO5' },
  ], []);

  const rightItems = useMemo(() => [
    { id: '10', name: '고객성향[1]', field: 'CSC1' },
    { id: '11', name: '고객성향[2]', field: 'CSC2' },
    { id: '12', name: '고객성향[3]', field: 'CSC3' },
    { id: '13', name: '고객성향[4]', field: 'CSC4' },
    { id: '14', name: '고객성향[5]', field: 'CSC5' },
    { id: '15', name: '고객성향[6]', field: 'CSC6' },
    { id: '16', name: '상담사 아이디', field: 'EMPLOYEEID' },
    { id: '17', name: '토큰데이터', field: 'TKDA' },
  ], []);

  // 더블 클릭 핸들러 추가
  const handleItemDoubleClick = (item: FormatItem) => {
    // 이미 추가된 항목인지 확인
    const isAlreadyAdded = formatRows.some(row => row.name === item.name);
    
    if (!isAlreadyAdded) {
      const newRow: FormatRow = {
        id: item.id,
        name: item.name,
        start: formatRows.length > 0 
          ? formatRows[formatRows.length - 1].start + formatRows[formatRows.length - 1].length 
          : 1,
        length: 1, // 기본 길이, 필요에 따라 조정 가능
        field: item.field, // 필드 값은 비워둠
      };

      setFormatRows([...formatRows, newRow]);
    }
  };




  // 필드항목 구분자
  const [positionRows, setPositionRows] = useState<FormatRow[]>(initData);
  const [selectedPositionRowIndex, setSelectedPositionRowIndex] = useState<number | null>(null);


  const positionLeftItems = useMemo(() => [
    { id: '1', name: '고객키[1]', field: 'CSKE' },
    { id: '2', name: '고객키[2]', field: 'CSK2' },
    { id: '3', name: '고객키[3]', field: 'CSK3' },
    { id: '4', name: '고객 이름', field: 'CSNA' },
    { id: '5', name: '고객 전화번호[1]', field: 'TNO1' },
    { id: '6', name: '고객 전화번호[2]', field: 'TNO2' },
    { id: '7', name: '고객 전화번호[3]', field: 'TNO3' },
    { id: '8', name: '고객 전화번호[4]', field: 'TNO4' },
    { id: '9', name: '고객 전화번호[5]', field: 'TNO5' },
  ], []);

  const positionRightItems = useMemo(() => [
    { id: '10', name: '고객성향[1]', field: 'CSC1' },
    { id: '11', name: '고객성향[2]', field: 'CSC2' },
    { id: '12', name: '고객성향[3]', field: 'CSC3' },
    { id: '13', name: '고객성향[4]', field: 'CSC4' },
    { id: '14', name: '고객성향[5]', field: 'CSC5' },
    { id: '15', name: '고객성향[6]', field: 'CSC6' },
    { id: '16', name: '상담사 아이디', field: 'EMPLOYEEID' },
    { id: '17', name: '토큰데이터', field: 'TKDA' },
  ], []);

  const handlePositionItemDoubleClick = (item: FormatItem) => {
    const isAlreadyAdded = positionRows.some(row => row.name === item.name);
    
    if (!isAlreadyAdded) {
      const newRow: FormatRow = {
        id: item.id,
        name: item.name,
        start: positionRows.length + 1,
        length: 1,
        field: item.field, 
      };
  
      setPositionRows([...positionRows, newRow]);
    }
  };

  const handlePositionRowSelect = (index: number) => {
    setSelectedPositionRowIndex(index);
  };
  
  const handlePositionMoveUp = () => {
    if (selectedPositionRowIndex === null || selectedPositionRowIndex <= 0) return;
  
    const newRows = [...positionRows];
    [newRows[selectedPositionRowIndex], newRows[selectedPositionRowIndex - 1]] = 
    [newRows[selectedPositionRowIndex - 1], newRows[selectedPositionRowIndex]];
  
    setPositionRows(newRows);
    setSelectedPositionRowIndex(selectedPositionRowIndex - 1);
  };
  
  const handlePositionMoveDown = () => {
    if (selectedPositionRowIndex === null || selectedPositionRowIndex >= positionRows.length - 1) return;
  
    const newRows = [...positionRows];
    [newRows[selectedPositionRowIndex], newRows[selectedPositionRowIndex + 1]] = 
    [newRows[selectedPositionRowIndex + 1], newRows[selectedPositionRowIndex]];
  
    setPositionRows(newRows);
    setSelectedPositionRowIndex(selectedPositionRowIndex + 1);
  };

   // 그리드 행 삭제 keyUp 이벤트.
  const handlePositionKeyUp = (e:any, index: number) => {
    if( e.key === 'Delete'){
      const newRows = [...positionRows];
      if( newRows[index].id === '1' ){
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: "고객키[1]은 필수 항목입니다. 다시 확인하시고 설정해 주세요.",
          type: '2',
          onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
        });
      }else{
        newRows.splice(index, 1);
        const cnt = newRows.length;
        for( let i=0;i<cnt;i++){
          if (i === 0) {
            newRows[i]['start'] = 1;
          } else {
            newRows[i]['start'] = newRows[i - 1]['start'] + newRows[i - 1]['length'];
          }
        }
        setPositionRows(newRows);
      }
    }
   };





  const handleConfirm = () => {
    // 상태 초기화
    // setFormatRows([]);
    setSelectedRowIndex(null);
    setSelectedPositionRowIndex(null);
    const data: FormatRowData = {
      delimiter: '',
      originDataSaveYn:originaldataYn,
      datalist: []
    };
    let check = true;
    if (tabValue === 'format-field') {
      if( formatRows.length > 0 && formatRows.filter((temp) => temp.id === '1').length > 0 ){
        data.datalist = formatRows;
      }else{
        check = false;
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: "고객키[1]은 필수 항목입니다. 다시 확인하시고 설정해 주세요.",
          type: '2',
          onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
        });
      }
    } else {
      if( positionRows.length > 0 && positionRows.filter((temp) => temp.id === '1').length > 0 ){
        data.datalist = positionRows;
      }else{
        check = false;
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: "고객키[1]은 필수 항목입니다. 다시 확인하시고 설정해 주세요.",
          type: '2',
          onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
        });
      }
      data.delimiter = delimiter;
    }
    if( check ){
      onConfirm(data);
    }
  };

  const handleCancle = () => {
    // 상태 초기화
    // setFormatRows([]);
    setSelectedRowIndex(null);
    setSelectedPositionRowIndex(null);
    onClose();
  };
  
  useEffect(() => {
    if ( _formatRows.length > 0 ) {
      if( _listManagerDelimiter === ''){
        setFormatRows(_formatRows);
        setTabValue('format-field');
      }else{
        setPositionRows(_formatRows);
        setTabValue('format-position');
        setDelimiter(_listManagerDelimiter);
      }
    }
  }, [_formatRows,_listManagerDelimiter]);   
 
  const modalContent = (
    <div className="w-full">
      <div className="mb-4">
        <p className="text-sm">* 블랙리스트의 경우 고객키[1], 고객 이름 항목만 사용 합니다.</p>
        <p className="text-sm">* 필드 항목은 키보드 Delete 키로 삭제가 가능합니다.</p>
      </div>

      <Tabs  value={tabValue} onValueChange={handleTabChange}>
        <div className="tab-custom-wrap">
          <TabsList>
            <TabsTrigger value="format-field">필드항목 길이로 구분</TabsTrigger>
            <TabsTrigger value="format-position">필드항목 구분자로 구분</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="format-field" className="mt-3">
          <div className='mb-2'>원하는 항목을 더블 클릭 하세요</div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <div className="border p-2 rounded h-40 overflow-y-auto">
                {leftItems.map(item => (
                  <div 
                    key={item.id} 
                    className={`py-1 px-2 hover:bg-[#FFFAEE] cursor-pointer ${
                      formatRows.some(row => row.name === item.name) 
                        ? 'text-gray-300 hover:bg-transparent cursor-not-allowed' 
                        : ''
                    }`}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-1/2">
              <div className="border p-2 rounded h-40 overflow-y-auto">
                {rightItems.map(item => (
                  <div 
                    key={item.id} 
                    className={`py-1 px-2 hover:bg-[#FFFAEE] cursor-pointer ${
                      formatRows.some(row => row.name === item.name) 
                        ? 'text-gray-300 hover:bg-transparent cursor-not-allowed' 
                        : ''
                    }`}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-5 mt-5">
              <div className="border rounded h-[200px] overflow-y-auto w-full">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="border-r border-b p-1 font-normal text-sm bg-[#F8F8F8]">순서</th>
                      <th className="border-r border-b p-1 font-normal text-sm bg-[#F8F8F8]">항목</th>
                      <th className="border-r border-b p-1 font-normal text-sm bg-[#F8F8F8]">시작</th>
                      <th className="border-r border-b p-1 font-normal text-sm bg-[#F8F8F8]">길이</th>
                      <th className="border-b p-1 font-normal text-sm bg-[#F8F8F8]">필드</th>
                    </tr>
                  </thead>
                  <tbody>
                      {formatRows.map((row, index) => (
                        <tr 
                          key={row.id || index}
                          onClick={() => handleRowSelect(index)}
                          className={`cursor-pointer ${
                            selectedRowIndex === index ? 'bg-[#FFFAEE]' : ''
                          }`}
                          onKeyUp={(e) => handleKeyUp(e,index)}
                          tabIndex={0}
                        >
                        <td className="border-b border-r p-1 text-center h-[26px]">                          
                          <input
                            type="number"
                            value={index + 1}
                            className="w-full p-1 text-center"
                            readOnly
                          />
                        </td>
                        <td className="border-b border-r p-1 text-center h-[26px]">              
                          <input
                            type="text"
                            value={row.name}  
                            className="w-full p-1 text-center"
                            readOnly
                          />
                        </td>
                        <td className="border-b border-r p-1 text-center h-[26px]">                                 
                          <input
                            type="text"
                            value={row.start}  
                            className="w-full p-1 text-center"
                            readOnly
                          />
                        </td>
                        <td className="border-b border-r p-1 text-center h-[26px]">
                          <input
                            type="number"
                            value={row.length}
                            onChange={(e) => handleEditChange(e, index, 'length')}
                            className="w-full p-1 text-center"
                          />
                        </td>
                        <td className="border-b p-1 text-center h-[26px]">                                                      
                          <input
                            type="text"
                            value={row.field}  
                            className="w-full p-1 text-center"
                            readOnly
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col items-center gap-2 min-w-[22px] justify-center">
                    <button
                      className="w-[22px] h-[22px] bg-[#60C3CD] text-white rounded-full flex items-center justify-center disabled:opacity-50"
                      onClick={handleMoveUp}
                      disabled={selectedRowIndex === null || selectedRowIndex <= 0}
                    >
                    ↑
                  </button>
                  <button
                      className="w-[22px] h-[22px] bg-[#60C3CD] text-white rounded-full flex items-center justify-center disabled:opacity-50"
                      onClick={handleMoveDown}
                      disabled={selectedRowIndex === null || selectedRowIndex >= formatRows.length - 1}
                    >
                    ↓
                  </button>
                </div>
          </div>
        </TabsContent>

        <TabsContent value="format-position" className="mt-3">
          <div className='mb-2'>원하는 구분자를 더블 클릭 하세요</div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <div className="border p-2 rounded h-40 overflow-y-auto">
                {positionLeftItems.map(item => (
                  <div 
                    key={item.id} 
                    className={`py-1 px-2 hover:bg-[#FFFAEE] cursor-pointer ${
                      positionRows.some(row => row.name === item.name) 
                        ? 'text-gray-300 hover:bg-transparent cursor-not-allowed' 
                        : ''
                    }`}
                    onDoubleClick={() => handlePositionItemDoubleClick(item)}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-1/2">
              <div className="border p-2 rounded h-40 overflow-y-auto">
                {positionRightItems.map(item => (
                  <div 
                    key={item.id} 
                    className={`py-1 px-2 hover:bg-[#FFFAEE] cursor-pointer ${
                      positionRows.some(row => row.name === item.name) 
                        ? 'text-gray-300 hover:bg-transparent cursor-not-allowed' 
                        : ''
                    }`}
                    onDoubleClick={() => handlePositionItemDoubleClick(item)}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-5 mt-5">
            <div className="border rounded h-[190px] overflow-y-auto w-full">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border-r border-b p-1 font-normal text-sm bg-[#F8F8F8]">순서</th>
                    <th className="border-r border-b p-1 font-normal text-sm bg-[#F8F8F8]">항목</th>
                    <th className="border-b p-1 font-normal text-sm bg-[#F8F8F8]">필드</th>
                  </tr>
                </thead>
                <tbody>
                  {positionRows.map((row, index) => (
                    <tr 
                      key={row.id || index}
                      onClick={() => handlePositionRowSelect(index)}
                      className={`cursor-pointer ${
                        selectedPositionRowIndex === index ? 'bg-[#FFFAEE]' : ''
                      }`}
                      onKeyUp={(e) => handlePositionKeyUp(e, index)}
                    >
                      <td className="border-b border-r p-1 text-center h-[26px]">
                               
                        <input
                          type="text"
                          value={index + 1}
                          className="w-full p-1 text-center"
                          readOnly
                        />
                      </td>
                      <td className="border-b border-r p-1 text-center h-[26px]">
                        <input
                          type="text"
                          value={row.name}  
                          className="w-full p-1 text-center"
                          readOnly
                        />
                      </td>
                      <td className="border-b p-1 text-center h-[26px]">
                        <input
                          type="text"
                          value={row.field}  
                          className="w-full p-1 text-center"
                          readOnly
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col items-center gap-2 min-w-[50px] justify-center">
              <button
                className="w-[22px] h-[22px] bg-[#60C3CD] text-white rounded-full flex items-center justify-center disabled:opacity-50"
                onClick={handlePositionMoveUp}
                disabled={selectedPositionRowIndex === null || selectedPositionRowIndex <= 0}
              >
                ↑
              </button>
              <button
                className="w-[22px] h-[22px] bg-[#60C3CD] text-white rounded-full flex items-center justify-center disabled:opacity-50"
                onClick={handlePositionMoveDown}
                disabled={selectedPositionRowIndex === null || selectedPositionRowIndex >= positionRows.length - 1}
              >
                ↓
              </button>
              <div>
                구분자
              </div>
              <div>
                <Select
                  onValueChange={(value) => setDelimiter(value)}
                  value={delimiter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder=" " />
                  </SelectTrigger>
                  <SelectContent>
                    {delimiterList.map(option => (
                      <SelectItem key={option.id} value={option.id.toString()}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <CustomAlert
        message={alertState.message}
        title={alertState.title}
        type={alertState.type}
        isOpen={alertState.isOpen}
        onClose={() => {
          alertState.onClose()
        }}/>
    </div>
  );

  return (
    <CustomAlert
      isOpen={isOpen}
      title="파일포맷설정"
      message={modalContent}
      type="1"
      onClose={handleConfirm}
      onCancel={handleCancle}
      width="max-w-modal"
    />
  );
};

export default FileFormat;