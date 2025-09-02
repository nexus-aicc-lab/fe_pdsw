"use client";

import React, { useState, useEffect } from 'react';
import CustomAlert from '@/components/shared/layout/CustomAlert';
import DataGrid from 'react-data-grid';
import { SelectColumn } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { useApiForGetSkills2 } from '@/features/campaignManager/hooks/useApiForGetSkills2';
import { Loader2 } from "lucide-react";

interface Skill {
  tenant_id: number | string;
  skill_id: number;
  skill_name: string;
  skill_description: string;
}

export interface SkillListPopupProps {
  param: number[];
  tenantId: number;
  isOpen?: boolean;
  type: string;
  onConfirm: (param: string, updatedTenantId?: number) => void;
onCancel?: () => void;
}

// API 대체 함수 - 실제 환경에서는 제거
const useFakeSkillsData = (tenantId: number) => {
  const fakeData = {
    result_code: 0,
    result_msg: "Success",
    result_count: 5,
    total_count: 5,
    result_data: [
      { tenant_id: 1, skill_id: 1, skill_name: "스킬1", skill_description: "스킬1설명" },
      { tenant_id: 1, skill_id: 2, skill_name: "스킬2", skill_description: "스킬2설명" },
      { tenant_id: 1, skill_id: 3, skill_name: "스킬3", skill_description: "스킬3설명" },
      { tenant_id: 1, skill_id: 4, skill_name: "스킬4", skill_description: "스킬4설명" },
      { tenant_id: 1, skill_id: 5, skill_name: "스킬5", skill_description: "스킬5설명" }
    ]
  };
  
  return { data: fakeData, isLoading: false, isError: false };
};

const SkillListPopupForNewCampaign = ({
  param = [],
  tenantId,
  type,
  isOpen = true,
  onConfirm,
  onCancel
}: SkillListPopupProps) => {
  // 실제 API 사용 (프로덕션에서 사용)
  const { data: skillsData, isLoading, isError } = useApiForGetSkills2({
    tenant_id_array: [tenantId],
  });

  // console.log("API Data for skillist popup:", skillsData);
  

  // 테스트용 가짜 데이터 (개발 중 사용)
//   const { data: skillsData, isLoading, isError } = useFakeSkillsData(tenantId);
  
  // Set 대신 셀렉션 관리
  const [selectedRows, setSelectedRows] = useState(() => {
    const initialSelection = new Set<number>();
    param.forEach(id => {
      if (id !== 0) initialSelection.add(id);
    });
    return initialSelection;
  });
  
  // 디버깅용 로그
  // useEffect(() => {
  //   console.log("Initial param:", param);
  //   console.log("Selected rows:", Array.from(selectedRows));
  // }, [param, selectedRows]);
  
  // 확인 버튼 클릭 처리
  const handleConfirm = () => {
    const selectedArray = Array.from(selectedRows);
    const resultString = selectedArray.sort((a, b) => a - b).join(',') + (selectedArray.length > 0 ? ',' : '');
    // console.log("Confirm selection:", resultString);
    
    // 현재 tenantId가 초기값과 다르면 updatedTenantId도 함께 전달
    onConfirm(resultString);
  };

  // 그리드에 표시할 데이터 필터링
  const rows = skillsData?.result_data
    ? skillsData.result_data.filter((skill: Skill) => 
        skill.tenant_id === tenantId && skill.skill_id !== 0
      )
    : [];

  // 선택 변경 핸들러
  const handleSelectedRowsChange = (newSelection: Set<number>) => {
    // console.log("Selection changed:", Array.from(newSelection));
    setSelectedRows(newSelection);
  };

  // 컬럼 정의
  const columns = [
    SelectColumn,
    {
      key: 'skill_id',
      name: '아이디',
      width: 80
    },
    {
      key: 'skill_name',
      name: '이름',
      width: 240
    },
    // {
    //   key: 'skill_description',
    //   name: '설명',
    //   width: 240
    // }
  ];

  // 로딩 상태
  if (isLoading) {
    return (
      <CustomAlert
        isOpen={isOpen}
        title="캠페인 스킬 선택"
        message={
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">스킬 정보를 불러오는 중입니다.</span>
          </div>
        }
        onClose={onCancel || (() => {})}
        type={type}
      />
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <CustomAlert
        isOpen={isOpen}
        title="캠페인 스킬 선택"
        message={
          <div className="flex justify-center items-center h-40 text-red-500">
            스킬 정보를 불러오는 중에 오류가 발생했습니다.
          </div>
        }
        onClose={onCancel || (() => {})}
        type={type}
      />
    );
  }

  // 그리드 컴포넌트
  const gridContent = (
    <div className="w-full">
      <div className="text-sm mb-2">
        총 {rows.length}개 중 {selectedRows.size}개가 선택되었습니다.
      </div>
      
      <div className="w-full" style={{ height: '400px' }}>
        <DataGrid
          columns={columns}
          rows={rows}
          rowKeyGetter={(row) => row.skill_id}
          selectedRows={selectedRows}
          onSelectedRowsChange={handleSelectedRowsChange}
          className="h-full"
          rowHeight={40}
          headerRowHeight={40}
          style={{ width: "100%" }} // ✅ 진짜 이렇게 해야 함!
        />
      </div>
    </div>
  );

  return (
    <CustomAlert
      isOpen={isOpen}
      title="캠페인 스킬 선택"
      message={gridContent}
      onClose={handleConfirm}
      onCancel={onCancel}
      type="1"
      width={1000}  // px 단위
      height={500}
    />
  );
};

export default SkillListPopupForNewCampaign;
