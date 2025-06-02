"use client";
import React from "react";
import { Column } from "react-data-grid";

// 헤더용 체크박스 포맷터
export const CheckBoxFormatterForHeader: React.FC<any> = (props) => {
  // props에서 allSelected, onSelectAll 를 받습니다.
  const { allSelected, onSelectAll } = props;
  return (
    <div
      className="cursor-pointer"
      onClick={() => {
        if (typeof onSelectAll === "function") {
          onSelectAll(!allSelected);
        }
      }}
    >
      <input
        type="checkbox"
        checked={allSelected}
        readOnly
        className="cursor-pointer"
      />
    </div>
  );
};

// 행용 체크박스 포맷터
export const CheckBoxFormatterForRow: React.FC<any> = (props) => {
  // props에서 isCellSelected, onRowClick 을 받습니다.
  const { isCellSelected, onRowClick } = props;
  return (
    <div className="cursor-pointer" onClick={onRowClick}>
      <input
        type="checkbox"
        checked={isCellSelected}
        readOnly
        className="cursor-pointer"
      />
    </div>
  );
};

// 최신 react-data-grid에 맞춘 커스텀 체크박스 컬럼
// row.type 이 "DETAIL"인 경우 체크박스 미표시
export const CustomCheckBoxForGrid: Column<any, any> = {
  key: "select-row",
  name: "",
  width: 35,
  minWidth: 35,
  maxWidth: 35,
  resizable: false,
  sortable: false,
  frozen: true,
  renderHeaderCell(props) {
    return <CheckBoxFormatterForHeader {...props} />;
  },
  renderCell(props) {
    if (props.row.type !== "DETAIL") {
      return <CheckBoxFormatterForRow {...props} />;
    }
    return null;
  },
};

export default CustomCheckBoxForGrid;
