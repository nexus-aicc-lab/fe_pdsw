import React, { useState, useMemo } from 'react';
import DataGrid from "react-data-grid";
import { CommonButton } from "@/components/shared/CommonButton";
import { CustomInput } from "@/components/shared/CustomInput";
import { Label } from "@/components/ui/label";

import CustomAlert from '@/components/shared/layout/CustomAlert';

interface Row {
  id: string;
  result_code: string;
  result_desc: string;
}

const ConsultResultSetting = () => {
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [id, setId] = useState('');
  const [resultCode, setResultCode] = useState('');
  const [resultDesc, setResultDesc] = useState('');
  
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: '',
    title: '알림',
    type: '1',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const columns = useMemo(() => [
    { key: 'id', name: '아이디' },
    { key: 'result_code', name: '상담결과코드' },
    { key: 'result_desc', name: '상담결과코드 설명' }
  ], []);

  const rows = [
    { id: '1', result_code: 'dd', result_desc: 'test' },
    { id: '1214', result_code: 'web_only', result_desc: '20' }
  ];

  const showAlert = (message: string) => {
    setAlertState({
      isOpen: true,
      message,
      title: '알림',
      type: '1',
      onConfirm: closeAlert,
      onCancel: () => {}
    });
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setAlertState({
      isOpen: true,
      message,
      title: '확인',
      type: '2',
      onConfirm: () => {
        onConfirm();
        closeAlert();
      },
      onCancel: closeAlert
    });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const handleDelete = () => {
    if (!selectedRow) {
      showAlert('삭제할 행을 선택해주세요.');
      return;
    }
    
    showConfirm(
      '선택된 열을 삭제 하시겠습니까?\n※ 주의 : 삭제 시 데이터베이스에서 완전 삭제됩니다.\n다시 한번 확인해 주시고 삭제해 주세요.', 
      () => {
        console.log('Delete:', selectedRow);
      }
    );
  };

  const handleSave = () => {
    if (!id || !resultCode || !resultDesc) {
      showAlert('모든 필드를 입력해주세요.');
      return;
    }

    const saveData = {
      id,
      result_code: resultCode,
      result_desc: resultDesc
    };

    if (selectedRow) {
      showConfirm('수정하시겠습니까?', () => {
        console.log('Update:', saveData);
      });
    } else {
      showConfirm('저장하시겠습니까?', () => {
        console.log('Create:', saveData);
      });
    }
  };

  const handleCellClick = ({ row }: { row: Row }) => {
    setSelectedRow(row);
    setId(row.id);
    setResultCode(row.result_code);
    setResultDesc(row.result_desc);
  };

  const handleNew = () => {
    setSelectedRow(null);
    setId('');
    setResultCode('');
    setResultDesc('');
  };

  const getRowClass = (row: Row) => {
    return selectedRow?.id === row.id ? 'bg-[#FFFAEE]' : '';
  };

  return (
    <div className="flex gap-8">
      <div className="w-[580px]">
        <div className='grid-custom-wrap h-[230px]'>
          <DataGrid
            columns={columns}
            rows={rows}
            className="grid-custom"
            onCellClick={handleCellClick}
            rowKeyGetter={(row) => row.id.toString()}
            selectedRows={selectedRow ? new Set<string>([selectedRow.id.toString()]) : new Set<string>()}
            rowHeight={26}
            headerRowHeight={26}
            rowClass={getRowClass} 
          />
        </div>
      </div>

      <div className="w-[513px]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label className="w-[8rem] min-w-[8rem]">아이디</Label>
            <CustomInput 
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full"
              disabled={true}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="w-[8rem] min-w-[8rem]">상담결과코드</Label>
            <CustomInput 
              value={resultCode}
              onChange={(e) => setResultCode(e.target.value)}
              className="w-full"
              disabled={true}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="w-[8rem] min-w-[8rem]">상담결과코드 설명</Label>
            <CustomInput 
              value={resultDesc}
              onChange={(e) => setResultDesc(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <CommonButton onClick={handleNew}>신규</CommonButton>
            <CommonButton onClick={handleDelete}>삭제</CommonButton>
            <CommonButton onClick={handleSave}>적용</CommonButton>
          </div>

          <div className="mt-[20px] text-sm">
            <ul className='space-y-1'>
              <li>• 상담 결과코드를 설정할 수 있습니다.</li>
              <li>• 키보드 방향키를 통해서 추가, 수정이 가능하고 Delete키로 삭제가 가능합니다.</li>
            </ul>
          </div>
        </div>
      </div>

      <CustomAlert
        isOpen={alertState.isOpen}
        message={alertState.message}
        title={alertState.title}
        type={alertState.type}
        onClose={alertState.onConfirm}
        onCancel={alertState.onCancel}
      />
    </div>
  );
};

export default ConsultResultSetting;