"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateSelectorProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  allowedDates?: string[]; // 추가: 선택 가능한 날짜 목록
}

export const DateSelector = ({
  selectedDate,
  onDateSelect,
  allowedDates = [], // 기본값 빈 배열
}: DateSelectorProps) => {
  const [displayDate, setDisplayDate] = useState(new Date(selectedDate));
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];



  useEffect(() => {
    const startOfWeek = new Date(displayDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const dates = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return date;
    });
    setWeekDates(dates);
  }, [displayDate]);

  useEffect(() => {
    // selectedDate가 유효한 날짜 문자열일 때만 Date 객체 생성
    if (selectedDate && !isNaN(new Date(selectedDate).getTime())) {
      setDisplayDate(new Date(selectedDate));
    }
  }, [selectedDate]);

  const changeWeek = (amount: number) => {
    setDisplayDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7 * amount);
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };
  const isToday = (date: Date) => formatDate(date) === formatDate(new Date());
  const isAllowed = (date: Date) =>
    allowedDates.length === 0 || allowedDates.includes(formatDate(date));

  return (
    <div className="bg-gray-100 p-2.5 flex items-center space-x-2 h-full rounded-xl shadow-sm select-none">
      <div
        className="flex-1 bg-white p-1 rounded-xl shadow-sm"
        // onClick={() => changeStock("right")}
      >
        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => changeWeek(-1)}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex flex-1 justify-between items-center space-x-2">
            {weekDates.map((date, i) => {
              const dateStr = formatDate(date);
              const allowed = isAllowed(date);
              return (
                <div
                  key={i}
                  className="text-center flex flex-col items-center flex-1"
                >
                  <p className={`text-xs mb-1 ${
                    weekDays[i] === "SUN" ? "text-red-500" : 
                    weekDays[i] === "SAT" ? "text-blue-500" : 
                    "text-gray-400"
                  }`}>{weekDays[i]}</p>
                  <button
                    onClick={() => allowed && onDateSelect(dateStr)}
                    disabled={!allowed}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold transition-colors text-base
                    ${
                      selectedDate === dateStr && isToday(date)
                        ? "bg-black text-white shadow"
                        : selectedDate === dateStr
                        ? "bg-blue-600 text-white"
                        : isToday(date)
                        ? "bg-black text-white"
                        : allowed
                        ? "bg-white text-gray-700 hover:bg-gray-100"
                        : "bg-gray-100 text-gray-300 opacity-50"
                    }
                  `}
                  >
                    {date.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => changeWeek(1)}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
