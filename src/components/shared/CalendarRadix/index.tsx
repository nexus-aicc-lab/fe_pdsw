// src/components/ui/calendar-headless.tsx

"use client";

import { useState } from "react";
import { Popover } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react"; // Check 아이콘은 사용되지 않으므로 제거했습니다.
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface CalendarHeadlessProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
  label?: string;
}

export const CalendarHeadless = ({
  date,
  setDate,
  className = "",
  label,
}: CalendarHeadlessProps) => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(
    date ? date.getFullYear() : today.getFullYear() // 초기 연도를 선택된 날짜나 오늘 날짜로 설정
  );
  const [selectedMonth, setSelectedMonth] = useState(
    date ? date.getMonth() : today.getMonth() // 초기 월을 선택된 날짜나 오늘 날짜로 설정
  );

  // selectedYear와 selectedMonth가 변경될 때마다 날짜 배열 재생성
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay(); // 해당 월의 첫 번째 날짜 요일 (0: 일요일, 6: 토요일)
  const currentMonthDates = Array.from({ length: daysInMonth }, (_, i) =>
    new Date(selectedYear, selectedMonth, i + 1)
  );

  const handleSelect = (day: Date) => {
    setDate(day);
    // 날짜를 선택하면 해당 날짜의 연도와 월로 상태 업데이트 (선택사항)
    // setSelectedYear(day.getFullYear());
    // setSelectedMonth(day.getMonth());
  };

  // 연도/월 변경 시 setDate 호출 제거 (선택 시에만 setDate 호출)
  const handlePrevYear = () => {
    const newYear = selectedYear - 1;
    setSelectedYear(newYear);
    // setDate(new Date(newYear, selectedMonth, 1)); // 제거
  };

  const handleNextYear = () => {
    const newYear = selectedYear + 1;
    setSelectedYear(newYear);
    // setDate(new Date(newYear, selectedMonth, 1)); // 제거
  };

  const handlePrevMonth = () => {
    let newYear = selectedYear;
    let newMonth = selectedMonth - 1;
    if (newMonth < 0) {
      newMonth = 11;
      newYear = selectedYear - 1;
      setSelectedYear(newYear);
    }
    setSelectedMonth(newMonth);
    // setDate(new Date(newYear, newMonth, 1)); // 제거
  };

  const handleNextMonth = () => {
    let newYear = selectedYear;
    let newMonth = selectedMonth + 1;
    if (newMonth > 11) {
      newMonth = 0;
      newYear = selectedYear + 1;
      setSelectedYear(newYear);
    }
    setSelectedMonth(newMonth);
    // setDate(new Date(newYear, newMonth, 1)); // 제거
  };

  const handleToday = () => {
    const newToday = new Date();
    setSelectedYear(newToday.getFullYear());
    setSelectedMonth(newToday.getMonth());
    setDate(newToday); // 오늘 날짜로 설정
  };

  const handleLastWeek = () => {
    const current = date ? new Date(date) : new Date();
    current.setDate(current.getDate() - 7);
    setDate(current); // 변경된 날짜로 설정
    setSelectedYear(current.getFullYear()); // 달력 표시 연/월도 업데이트
    setSelectedMonth(current.getMonth());
  };

  const handleNextWeek = () => {
    const current = date ? new Date(date) : new Date();
    current.setDate(current.getDate() + 7);
    setDate(current); // 변경된 날짜로 설정
    setSelectedYear(current.getFullYear()); // 달력 표시 연/월도 업데이트
    setSelectedMonth(current.getMonth());
  };

  return (
    <div className={cn("w-full font-sans text-gray-800", className)}>
      {label && <label className="text-sm font-medium mb-1 block">{label}</label>}
      <Popover className="relative">
        <Popover.Button as="div">
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between px-3 text-left font-medium h-10 border border-input bg-background shadow-sm rounded-md",
              !date && "text-muted-foreground"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <span>
                {date ? format(date, "yyyy-MM-dd", { locale: ko }) : <span>날짜 선택</span>}
              </span>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </Button>
        </Popover.Button>
        <Popover.Panel
          // z-index 값을 매우 높게 설정하여 다른 요소 위에 표시되도록 함 (예: z-[9999])
          // Tailwind CSS 기본값(z-50)보다 훨씬 높은 임의의 값을 사용
          className="absolute z-[9999] bottom-[-50px] left-1/2 transform -translate-x-1/2 mb-2 w-[320px] p-4 bg-background shadow-lg rounded-md border border-border" // 테두리 추가 (선택사항)
        >
          {({ close }) => (
            <>
              {/* 헤더 영역 */}
              <div className="bg-gray-50 p-3 rounded mb-4 border-b border-border"> {/* 헤더 배경 및 구분선 */}
                {/* 헤더의 1행: 연도 및 월 선택 영역 */}
                <div className="flex items-center gap-2 justify-center mb-3">
                  {/* 연도 선택 */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevYear}
                      className="px-2 py-1 border rounded text-sm hover:bg-accent transition-colors duration-200"
                      aria-label="Previous year"
                    >
                      {"<<"}
                    </button>
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        const newYear = Number(e.target.value);
                        setSelectedYear(newYear);
                      }}
                      className="border rounded px-2 py-1 text-sm appearance-none text-center" // appearance-none 추가 및 중앙 정렬
                      style={{ minWidth: '70px' }} // 너비 고정 (선택사항)
                    >
                      {Array.from({ length: 11 }).map((_, i) => { // 11개로 늘려 현재년도 +- 5년 표시
                        const year = today.getFullYear() - 5 + i;
                        return (
                          <option key={year} value={year}>
                            {year}년
                          </option>
                        );
                      })}
                    </select>
                    <button
                      onClick={handleNextYear}
                      className="px-2 py-1 border rounded text-sm hover:bg-accent transition-colors duration-200"
                      aria-label="Next year"
                    >
                      {">>"}
                    </button>
                  </div>
                  {/* 월 선택 */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevMonth}
                      className="px-2 py-1 border rounded text-sm hover:bg-accent transition-colors duration-200"
                      aria-label="Previous month"
                    >
                      {"<"}
                    </button>
                     <select
                      value={selectedMonth}
                      onChange={(e) => {
                        const newMonth = Number(e.target.value);
                        setSelectedMonth(newMonth);
                      }}
                      className="border rounded px-2 py-1 text-sm appearance-none text-center" // appearance-none 추가 및 중앙 정렬
                      style={{ minWidth: '60px' }} // 너비 고정 (선택사항)
                    >
                      {Array.from({ length: 12 }).map((_, i) => (
                        <option key={i} value={i}>
                          {i + 1}월
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleNextMonth}
                      className="px-2 py-1 border rounded text-sm hover:bg-accent transition-colors duration-200"
                      aria-label="Next month"
                    >
                      {">"}
                    </button>
                  </div>
                </div>
                {/* 헤더의 2행: 선택된 날짜 및 유틸 버튼 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700"> {/* 크기 및 색상 조정 */}
                    {date ? format(date, "yyyy년 MM월 dd일", { locale: ko }) : "날짜 미선택"}
                  </span>
                  <div className="flex items-center gap-1"> {/* 버튼 간격 조정 */}
                    <Button
                      variant="outline"
                      size="sm" // 작은 버튼 크기
                      className="px-2 py-1 text-xs" // 패딩 및 텍스트 크기 조정
                      onClick={handleLastWeek}
                    >
                      저번주
                    </Button>
                    <Button
                       variant="outline"
                       size="sm"
                       className="px-2 py-1 text-xs"
                       onClick={() => { handleToday(); close(); }} // 오늘 버튼 클릭 시 팝오버 닫기
                    >
                      오늘
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-2 py-1 text-xs"
                      onClick={handleNextWeek}
                    >
                      다음주
                    </Button>
                  </div>
                </div>
              </div>

              {/* 날짜 선택 영역 */}
              {/* 달력 바디(요일 + 날짜) 전체에 연한 배경색과 패딩 적용 */}
              <div className="bg-gray-50 p-2 rounded"> {/* 연한 회색 배경 및 패딩 추가 */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2"> {/* 요일 아래 간격 추가 */}
                  {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
                    <div key={day} className={cn(
                      "text-xs text-muted-foreground font-medium",
                      index === 0 && "text-red-600", // 일요일 빨간색
                      index === 6 && "text-blue-600" // 토요일 파란색
                    )}>
                      {day}
                    </div>
                  ))}
                </div>
                {/* 날짜 그리드 */}
                <div className="grid grid-cols-7 gap-1 text-center">
                   {/* 해당 월의 1일 시작 위치에 맞게 빈 공간 추가 */}
                   {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                    <div key={`empty-${index}`} className="w-9 h-9"></div> // 크기 고정된 빈 div
                  ))}
                  {currentMonthDates.map((day) => {
                     const isSelected = date?.toDateString() === day.toDateString();
                     const isToday = today.toDateString() === day.toDateString();

                     return (
                        <button
                          key={day.toISOString()}
                          onClick={() => {
                            handleSelect(day);
                            close(); // 날짜 선택 시 팝오버 닫기
                          }}
                          className={cn(
                            "text-sm w-9 h-9 rounded flex items-center justify-center", // 크기 고정 및 중앙 정렬
                            "hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring transition-colors duration-200", // 호버 및 포커스 스타일
                            isSelected && "bg-primary text-primary-foreground hover:bg-primary/90", // 선택된 날짜 스타일
                            !isSelected && isToday && "bg-accent text-accent-foreground border border-primary", // 오늘 날짜 스타일 (선택되지 않았을 때)
                             !isSelected && !isToday && "hover:bg-gray-200", // 기본 호버 스타일
                             day.getDay() === 0 && !isSelected && "text-red-600", // 일요일 텍스트 색상 (선택 안 됐을 때)
                             day.getDay() === 6 && !isSelected && "text-blue-600", // 토요일 텍스트 색상 (선택 안 됐을 때)
                          )}
                        >
                          {day.getDate()}
                        </button>
                     )
                  })}
                </div>
              </div>
            </>
          )}
        </Popover.Panel>
      </Popover>
    </div>
  );
};