"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { faker } from '@faker-js/faker';
import { SelectColumn, TreeDataGrid } from 'react-data-grid';
import type { Column, RenderCellProps, RenderGroupCellProps } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
// 아이콘 import 추가
import { ChevronRight, ChevronDown, MoreVertical } from 'lucide-react';

// Row 인터페이스 (동일)
interface Row {
  id: number;
  country: string;
  year: number;
  sport: string;
  athlete: string;
  gold: number;
  silver: number;
  bronze: number;
}

// 스포츠 목록 (동일)
const sports = [
  'Swimming', 'Gymnastics', 'Speed Skating', 'Cross Country Skiing',
  'Short-Track Speed Skating', 'Diving', 'Cycling', 'Biathlon',
  'Alpine Skiing', 'Ski Jumping', 'Nordic Combined', 'Athletics',
  'Table Tennis', 'Tennis', 'Synchronized Swimming', 'Shooting',
  'Rowing', 'Fencing', 'Equestrian', 'Canoeing', 'Bobsleigh',
  'Badminton', 'Archery', 'Wrestling', 'Weightlifting', 'Waterpolo'
];

// 데이터 생성 함수 (동일)
function createRows(count: number): readonly Row[] {
  const rows: Row[] = [];
  for (let i = 1; i <= count; i++) {
    rows.push({
      id: i,
      year: 2015 + faker.number.int(8),
      country: faker.location.country(),
      sport: sports[faker.number.int(sports.length - 1)],
      athlete: faker.person.fullName(),
      gold: faker.number.int(5),
      silver: faker.number.int(5),
      bronze: faker.number.int(5)
    });
  }
  return rows.sort((r1, r2) => r1.country.localeCompare(r2.country));
}

// 그룹핑 옵션 정의 (동일)
const groupingOptions = ['country', 'year', 'sport', 'athlete'] as const;
type GroupingOption = typeof groupingOptions[number];

// rowKeyGetter 함수 (동일)
function rowKeyGetter(row: Row) {
  // TreeDataGrid는 그룹 행에 대해 자체 ID를 사용하므로 데이터 행의 ID만 반환
  return row.id;
}

// 그룹핑 함수 구현
function groupBy<T, K extends string | number>(array: readonly T[], keyGetter: (item: T) => K): Record<K, readonly T[]> {
  return array.reduce((acc, item) => {
    const key = keyGetter(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    (acc[key] as T[]).push(item);
    return acc;
  }, {} as Record<K, readonly T[]>);
}

// rowGrouper 함수 (수정됨)
function rowGrouper(rows: readonly Row[], columnKey: string): Record<string, readonly Row[]> {
  // columnKey를 기준으로 행들을 그룹핑
  return groupBy(rows, (r) => r[columnKey as keyof Row]);
}

// isGroupRow 타입 가드 함수 추가
function isGroupRow(row: any): row is { id: unknown; childRows: readonly Row[]; groupKey: unknown; level: number; isExpanded: boolean } {
  // TreeDataGrid가 생성하는 그룹 행 객체의 특징 확인 (예: groupKey, childRows 존재 여부)
  return row.groupKey !== undefined && row.childRows !== undefined;
}

// --- 메인 컴포넌트 ---
export default function OfficialRowGroupingExample() {
  const [rows] = useState(() => createRows(10000));
  const [selectedRows, setSelectedRows] = useState((): ReadonlySet<number> => new Set());
  const [selectedOptions, setSelectedOptions] = useState<readonly GroupingOption[]>([
    groupingOptions[0], // country
    groupingOptions[1]  // year
  ]);
  const [expandedGroupIds, setExpandedGroupIds] = useState<ReadonlySet<unknown>>(
    () => new Set<unknown>(['United States of America', 'United States of America__2015'])
  );

  const toggleOption = useCallback((option: GroupingOption, checked: boolean) => {
    setSelectedOptions(currentOptions => {
      const newOptions = checked
        ? [...currentOptions, option]
        : currentOptions.filter(op => op !== option);
      return groupingOptions.filter(opt => newOptions.includes(opt));
    });
    setExpandedGroupIds(new Set());
  }, []);

  // 아이콘 클릭 핸들러 추가
  const handleIconClick = (groupKey: unknown, e: React.MouseEvent) => {
    e.stopPropagation(); // 그룹 토글/행 선택 방지
    alert(`Icon clicked for group: ${groupKey}`);
    // 필요한 액션 추가
  };

  // 컬럼 정의 수정: country 컬럼에 renderGroupCell 추가
  const columns = useMemo((): readonly Column<Row>[] => [
    SelectColumn,
    {
      key: 'country',
      name: 'Country',
      width: 250, // 너비 지정
      frozen: true, // 그룹핑 기준 컬럼은 고정하는 것이 좋음
      // *** renderGroupCell 수정 ***
      renderGroupCell({ groupKey, isExpanded, childRows, toggleGroup }: RenderGroupCellProps<Row>) { // 수정된 파라미터
        return (
          // 들여쓰기를 위한 스타일 수정
          <div className="flex items-center gap-1 h-full">
            <button
              // 스타일 약간 수정 (패딩 제거, 크기 고정 등)
              className="inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-100 flex-shrink-0 p-0"
              // *** 수정된 onClick 로직 ***
              onClick={(e) => {
                e.stopPropagation(); // 이벤트 버블링 방지
                if (toggleGroup) {
                  toggleGroup();
                }
              }}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {/* 그룹 키와 자식 행 개수 표시 (truncate 추가) */}
            <span className="truncate font-semibold">{String(groupKey)}</span>
            <span className="text-gray-600">({childRows.length})</span>
          </div>
        );
      }
    },
    // --- 나머지 컬럼 정의 (이전과 동일) ---
    { key: 'year', name: 'Year' },
    { key: 'sport', name: 'Sport' },
    { key: 'athlete', name: 'Athlete', width: 180 },
    {
      key: 'gold', name: 'Gold',
      renderGroupCell({ childRows }: RenderGroupCellProps<Row>) { return childRows.reduce((prev, { gold }) => prev + gold, 0); }
    },
    {
      key: 'silver', name: 'Silver',
      renderGroupCell({ childRows }: RenderGroupCellProps<Row>) { return childRows.reduce((prev, { silver }) => prev + silver, 0); }
    },
    {
      key: 'bronze', name: 'Bronze',
      renderGroupCell({ childRows }: RenderGroupCellProps<Row>) { return childRows.reduce((prev, { bronze }) => prev + bronze, 0); }
    },
    {
      key: 'total', name: 'Total',
      renderCell({ row }: RenderCellProps<Row>) { return row.gold + row.silver + row.bronze; },
      renderGroupCell({ childRows }: RenderGroupCellProps<Row>) { return childRows.reduce((prev, row) => prev + row.gold + row.silver + row.bronze, 0); }
    }
  ], [setExpandedGroupIds]); // setExpandedGroupIds를 의존성 배열에 추가

  // JSX 부분 (동일)
  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-2 p-4">
      <div>
        <b className="mr-2">Group by columns:</b>
        <div className="inline-flex flex-wrap gap-x-4 gap-y-1">
          {groupingOptions.map((option) => (
            <label key={option} className="capitalize flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedOptions.includes(option)}
                onChange={(event) => toggleOption(option, event.target.checked)}
              />
              {option}
            </label>
          ))}
        </div>
      </div>
      <div className="flex-1 border border-gray-300">
        <TreeDataGrid
          columns={columns}
          rows={rows}
          rowKeyGetter={rowKeyGetter}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          groupBy={selectedOptions}
          rowGrouper={rowGrouper}
          expandedGroupIds={expandedGroupIds}
          onExpandedGroupIdsChange={setExpandedGroupIds}
          defaultColumnOptions={{ resizable: true }}
          className="rdg-light h-full w-full"
        />
      </div>
    </div>
  );
}
