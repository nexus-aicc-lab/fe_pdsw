"use client";

import { Search } from 'lucide-react';
import { KeyboardEvent, useState, useEffect, useRef, MouseEvent as ReactMouseEvent } from 'react';

interface Counselor {
  counselorId: string;
  counselorName: string;
  tenantId: string;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  counselors?: Counselor[]; // 전체 상담사 목록 받기
  onSelectCounselor?: (counselorId: string, counselorName: string, tenantId: string) => void;
}

export function SearchBarForSideMenuForCounselorTab({ 
  value, 
  onChange, 
  onSearch,
  placeholder = "상담사",
  counselors = [],
  onSelectCounselor
}: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<Counselor[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // 검색 완료 또는 항목 선택 완료 후 상태를 추적하는 변수 추가
  const [recentlySelected, setRecentlySelected] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showSuggestions && suggestions.length > 0) {
        setShowSuggestions(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) => {
          const nextIndex = prev + 1 >= suggestions.length ? 0 : prev + 1;
          return nextIndex;
        });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const nextIndex = prev - 1 < 0 ? suggestions.length - 1 : prev - 1;
        return nextIndex;
      });
    } else if (e.key === 'Enter') {
      if (showSuggestions && highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        e.stopPropagation();
        handleSuggestionClick(suggestions[highlightedIndex]);
      } else {
        e.preventDefault();
        e.stopPropagation();
        onSearch();
        setShowSuggestions(false);
        setRecentlySelected(true);
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // 입력값이 변경될 때마다 자동완성 목록 업데이트
  useEffect(() => {
    if (recentlySelected) {
      setRecentlySelected(false);
      return;
    }
    
    if (value.length >= 2 && counselors.length > 0) {
      const filtered = counselors.filter(counselor => 
        counselor.counselorName.toLowerCase().includes(value.toLowerCase()) && 
        counselor.counselorName.toLowerCase() !== value.toLowerCase() // 정확히 일치하는 항목은 제외
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setHighlightedIndex(filtered.length > 0 ? 0 : -1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  }, [value, counselors, recentlySelected]);

  // 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        suggestionRef.current && 
        !suggestionRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = (counselor: Counselor) => {
    onChange(counselor.counselorName);
    setShowSuggestions(false);
    setRecentlySelected(true);
    if (onSelectCounselor) {
      onSelectCounselor(counselor.counselorId, counselor.counselorName, counselor.tenantId);
    }
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  return (
    <div className="w-full py-1 px-1">
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!recentlySelected && value.length >= 2 && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-2 pr-7 py-1 text-sm border rounded focus:outline-none focus:border-[#5BC2C1]"
        />
        <button 
          onClick={() => {
            onSearch();
            setShowSuggestions(false);
            setRecentlySelected(true);
            if (inputRef.current) {
              inputRef.current.blur();
            }
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <Search size={14} />
        </button>
        
        {/* 자동완성 드롭다운 */}
        {showSuggestions && (
          <div 
            ref={suggestionRef}
            className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-40 overflow-y-auto"
          >
            {suggestions.map((counselor, index) => (
              <div
                key={counselor.counselorId}
                className={`px-2 py-1 text-xs cursor-pointer ${
                  index === highlightedIndex ? "bg-gray-200" : "hover:bg-gray-100"
                }`}
                onClick={() => handleSuggestionClick(counselor)}
              >
                {counselor.counselorName}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
