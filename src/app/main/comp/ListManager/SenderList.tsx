import React, { useState, useEffect } from "react";

// 공통 컴포넌트
import TitleWrap from "@/components/shared/TitleWrap";
// 데이터그리드
import DataGrid, { Column, CellClickArgs } from "react-data-grid";

interface SendRow {
  id: string;    
  fileId: number;
  CSKE: string;
  CSK2: string;
  CSK3: string;
  CSNA: string;
  TNO1: string;
  TNO2: string;
  TNO3: string;
  TNO4: string;
  TNO5: string;
  CSC1: string;
  CSC2: string;
  CSC3: string;
  CSC4: string;
  CSC5: string;
  CSC6: string;
  EMPLOYEEID: string;
  TKDA: string;
}

const HeaderColumn : Column<SendRow>[] = [
  { key: 'CSKE', name: '고객키[1]', width: 120 },
  { key: 'CSK2', name: '고객키[2]', width: 120 },
  { key: 'CSK3', name: '고객키[3]', width: 120 },
  { key: 'CSNA', name: '고객 이름', width: 150 },
  { key: 'TNO1', name: '고객 전화번호[1]', width: 140 },
  { key: 'TNO2', name: '고객 전화번호[2]', width: 140 },
  { key: 'TNO3', name: '고객 전화번호[3]', width: 140 },
  { key: 'TNO4', name: '고객 전화번호[4]', width: 140 },
  { key: 'TNO5', name: '고객 전화번호[5]', width: 140 },
  { key: 'CSC1', name: '고객 성향[1]', width: 120 },
  { key: 'CSC2', name: '고객 성향[2]', width: 120 },
  { key: 'CSC3', name: '고객 성향[3]', width: 120 },
  { key: 'CSC4', name: '고객 성향[4]', width: 120 },
  { key: 'CSC5', name: '고객 성향[5]', width: 120 },
  { key: 'CSC6', name: '고객 성향[6]', width: 120 },
  { key: 'EMPLOYEEID', name: '상담사 ID', width: 140 },
  { key: 'TKDA', name: '토큰 데이터', width: 160 },
];

interface DataProps {
  no: number;
  division: number;
  startTime: string;
  endTime: string;
}

interface SenderListProps {
  headerData: Column<SendRow>[];
  _sendList: SendRow[];
  totalCount: number;
}

const SenderList: React.FC<SenderListProps> = ({ headerData, _sendList, totalCount }) => {
  
  // 그리드 선택 상태
  const [selectedSendRow, setSelectedSendRow] = useState<SendRow | null>(null);

  // 목록 데이터 상태
  const [sendList, setSendList] = useState<SendRow[]>([]);

  const [sendColumns, setSendColumns] = useState<Column<SendRow>[]>(HeaderColumn);
  
  // 행 클릭 핸들러
  const handleSendRowClick = ({ row }: CellClickArgs<SendRow>) => {
    setSelectedSendRow(row);
  };

  const getSendRowClass = (row: SendRow) => {
    return selectedSendRow?.id === row.id ? 'bg-[#FFFAEE]' : '';
  };
  
  useEffect(() => {
    if( headerData.length > 1 ) {     
      setSendColumns(headerData);   
    }else{
      setSendColumns(HeaderColumn);
    }
    setSendList(_sendList);
  }, [headerData, _sendList]);
  
  return (
        <div className="w-1/2">
          {/* 제목과 총 건수 */}
          <div className="flex items-center">
            <h2 className="text-sm">발신 목록</h2>
            {totalCount !== undefined && (
              <span className="text-sm text-[#777] pl-2">
                (전체 : <span className="text-[#F01E29]">{totalCount}</span> 건 해당파일 <span className="text-[#F01E29]">{_sendList.length}</span> 건)
              </span>
            )}
          </div>
          <div className="h-[300px] grid-custom-wrap">
            <DataGrid<SendRow>
              columns={sendColumns}
              rows={sendList}
              className="grid-custom cursor-pointer"
              rowHeight={30}
              headerRowHeight={30}
              rowKeyGetter={(row) => row.id}
              rowClass={getSendRowClass}
              onCellClick={handleSendRowClick}
              selectedRows={selectedSendRow ? new Set([selectedSendRow.id]) : new Set()}
            />
          </div>
        </div>

  );
};

export default SenderList;