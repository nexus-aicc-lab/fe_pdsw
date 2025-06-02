
// src/components/ui/calendar-headless.tsx

"use client";

import { useState } from "react";
import { Popover } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useCampaignDateStore } from "@/store/useCampaignDateStore";

interface CalendarHeadlessProps {
    date: Date | null;
    setDate: (date: Date | null) => void;
    className?: string;
    label?: string;
    dateType?: 'start' | 'end';
}

export const CalendarForSettingCampaignStartAndEndDate = ({
    date,
    setDate,
    className = "",
    label,
    dateType = 'start',
}: CalendarHeadlessProps) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간 정보 제거

    const [selectedYear, setSelectedYear] = useState(
        date ? date.getFullYear() : today.getFullYear()
    );
    const [selectedMonth, setSelectedMonth] = useState(
        date ? date.getMonth() : today.getMonth()
    );

    const { startDate, isDateDisabled } = useCampaignDateStore();

    // selectedYear와 selectedMonth가 변경될 때마다 날짜 배열 재생성
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const currentMonthDates = Array.from({ length: daysInMonth }, (_, i) =>
        new Date(selectedYear, selectedMonth, i + 1)
    );

    const handleSelect = (day: Date) => {
        // 날짜 선택 가능 여부 확인
        if (isDateDisabled(day, dateType)) {
            return; // 선택 불가능한 날짜는 무시
        }

        setDate(day);
    };

    const handlePrevYear = () => {
        const newYear = selectedYear - 1;
        setSelectedYear(newYear);
    };

    const handleNextYear = () => {
        const newYear = selectedYear + 1;
        setSelectedYear(newYear);
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
    };

    const handleToday = () => {
        const newToday = new Date();
        setSelectedYear(newToday.getFullYear());
        setSelectedMonth(newToday.getMonth());
        setDate(newToday);
    };

    const handleLastWeek = () => {
        const current = date ? new Date(date) : new Date();
        current.setDate(current.getDate() - 7);

        // 선택 가능한 날짜인지 확인
        if (!isDateDisabled(current, dateType)) {
            setDate(current);
            setSelectedYear(current.getFullYear());
            setSelectedMonth(current.getMonth());
        }
    };

    const handleNextWeek = () => {
        const current = date ? new Date(date) : new Date();
        current.setDate(current.getDate() + 7);

        // 선택 가능한 날짜인지 확인
        if (!isDateDisabled(current, dateType)) {
            setDate(current);
            setSelectedYear(current.getFullYear());
            setSelectedMonth(current.getMonth());
        }
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
                    className="absolute z-[9999] bottom-[-50px] left-1/2 transform -translate-x-1/2 mb-2 w-[320px] p-4 bg-background shadow-lg rounded-md border border-border"
                >
                    {({ close }) => (
                        <>
                            {/* 헤더 영역 */}
                            <div className="bg-gray-50 p-3 rounded mb-4 border-b border-border">
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
                                            className="border rounded px-2 py-1 text-sm appearance-none text-center"
                                            style={{ minWidth: '70px' }}
                                        >
                                            {Array.from({ length: 11 }).map((_, i) => {
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
                                            className="border rounded px-2 py-1 text-sm appearance-none text-center"
                                            style={{ minWidth: '60px' }}
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
                                    <span className="text-sm font-medium text-gray-700">
                                        {date ? format(date, "yyyy년 MM월 dd일", { locale: ko }) : "날짜 미선택"}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="px-2 py-1 text-xs"
                                            onClick={handleLastWeek}
                                            disabled={date ? isDateDisabled(new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000), dateType) : true}
                                        >
                                            저번주
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="px-2 py-1 text-xs"
                                            onClick={() => {
                                                if (!isDateDisabled(today, dateType)) {
                                                    handleToday();
                                                    close();
                                                }
                                            }}
                                            disabled={isDateDisabled(today, dateType)}
                                        >
                                            오늘
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="px-2 py-1 text-xs"
                                            onClick={handleNextWeek}
                                            disabled={date ? isDateDisabled(new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000), dateType) : false}
                                        >
                                            다음주
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* 날짜 선택 영역 */}
                            <div className="bg-gray-50 p-2 rounded">
                                <div className="grid grid-cols-7 gap-1 text-center mb-2">
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
                                        <div key={`empty-${index}`} className="w-9 h-9"></div>
                                    ))}
                                    {currentMonthDates.map((day) => {
                                        const isSelected = date?.toDateString() === day.toDateString();
                                        const isToday = today.toDateString() === day.toDateString();
                                        const isDisabled = isDateDisabled(day, dateType);

                                        return (
                                            <button
                                                key={day.toISOString()}
                                                onClick={() => {
                                                    if (!isDisabled) {
                                                        handleSelect(day);
                                                        close();
                                                    }
                                                }}
                                                disabled={isDisabled}
                                                className={cn(
                                                    "text-sm w-9 h-9 rounded flex items-center justify-center transition-colors duration-200 relative",
                                                    // 기본 스타일 (비활성화되지 않은 경우)
                                                    !isDisabled && "hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring",

                                                    // 선택된 날짜 스타일 (활성화된 경우)
                                                    isSelected && !isDisabled && "bg-primary text-primary-foreground hover:bg-primary/90 ring-2 ring-primary/20",

                                                    // 선택된 날짜 스타일 (비활성화된 경우) - 부각되게 처리
                                                    isSelected && isDisabled && "bg-orange-200 text-orange-800 ring-2 ring-orange-400 font-semibold shadow-sm",

                                                    // 오늘 날짜 스타일 (선택되지 않았을 때)
                                                    !isSelected && isToday && !isDisabled && "bg-accent text-accent-foreground border border-primary",

                                                    // 기본 호버 스타일
                                                    !isSelected && !isToday && !isDisabled && "hover:bg-gray-200",

                                                    // 일요일/토요일 텍스트 색상 (선택/비활성화 안 됐을 때)
                                                    day.getDay() === 0 && !isSelected && !isDisabled && "text-red-600",
                                                    day.getDay() === 6 && !isSelected && !isDisabled && "text-blue-600",

                                                    // 비활성화된 날짜 스타일 (선택되지 않은 경우)
                                                    !isSelected && isDisabled && "bg-red-100 text-red-400 cursor-not-allowed opacity-60",
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