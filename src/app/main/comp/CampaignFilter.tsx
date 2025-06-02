// src/app/main/components/CampaignFilter.tsx
import React, { useState, useCallback, ChangeEvent } from 'react';
import { debounce } from 'lodash';
import { Search } from 'lucide-react';

interface FilterProps {
  onSearch: (term: string) => void;
  onFilterChange: (filter: string) => void;
  initialSearchTerm?: string;
  initialFilter?: string;
}

const filterOptions = [
  { value: 'all', label: '전체' },
  { value: 'running', label: '진행중' },
  { value: 'waiting', label: '대기' },
];

export function CampaignFilter({ 
  onSearch, 
  onFilterChange, 
  initialSearchTerm = '', 
  initialFilter = 'all' 
}: FilterProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  // // 디바운스된 검색 함수
  // const debouncedSearch = useCallback(
  //   debounce((term: string) => {
  //     onSearch(term);
  //   }, 300),
  //   [onSearch]
  // );

  // 디바운스된 검색 함수
  const debouncedSearch = useCallback((term: string) => {
    const handler = debounce(() => {
      onSearch(term);
    }, 300);
    handler();
    return () => handler.cancel();
  }, [onSearch]);

  // 검색어 변경 핸들러
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  // 필터 변경 핸들러
  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onFilterChange(e.target.value);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="filter-select" className="block text-sm font-medium text-gray-700 mb-1">
            상태 필터
          </label>
          <select
            id="filter-select"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={handleFilterChange}
            defaultValue={initialFilter}
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-1">
            캠페인 검색
          </label>
          <div className="relative">
            <input
              id="search-input"
              type="text"
              placeholder="캠페인명을 입력하세요"
              className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}