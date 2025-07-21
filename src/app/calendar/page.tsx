"use client";

import { useState } from "react";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const scheduleData = {
  "2025-07-17": [
    { time: "09:00", event: "애플 3분기 실적 발표" },
    { time: "14:00", event: "엔비디아 컨퍼런스 콜" },
  ],
  "2024-01-20": [{ time: "10:00", event: "NAVER 주주총회" }],
  "2024-01-25": [{ time: "전일", event: "배당금 지급일" }],
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState("2024-01-15");
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 0, 1));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // 이전 달의 빈 칸들
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const formatDate = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${year}-${month}-${dayStr}`;
  };

  const hasSchedule = (day: number) => {
    const dateStr = formatDate(day);
    return scheduleData[dateStr as keyof typeof scheduleData];
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  return (
    <div className="flex flex-col h-screen">
      <TopNavigation />

      <div className="p-4 border-b">
        <h1 className="text-xl font-bold flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          일정
        </h1>
      </div>

      <main className="flex-1 overflow-y-auto pb-20">
        {/* 달력 */}
        <Card className="m-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                      1
                    )
                  )
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle>
                {currentMonth.getFullYear()}년{" "}
                {monthNames[currentMonth.getMonth()]}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                      1
                    )
                  )
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-600 p-2"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <div key={index} className="aspect-square">
                  {day && (
                    <Button
                      variant={
                        selectedDate === formatDate(day) ? "default" : "ghost"
                      }
                      size="sm"
                      className={`w-full h-full text-sm relative ${
                        hasSchedule(day) ? "bg-blue-50 hover:bg-blue-100" : ""
                      }`}
                      onClick={() => setSelectedDate(formatDate(day))}
                    >
                      {day}
                      {hasSchedule(day) && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 선택된 날짜의 일정 */}
        <Card className="m-4">
          <CardHeader>
            <CardTitle className="text-lg">{selectedDate} 일정</CardTitle>
          </CardHeader>
          <CardContent>
            {scheduleData[selectedDate as keyof typeof scheduleData] ? (
              <div className="space-y-3">
                {scheduleData[selectedDate as keyof typeof scheduleData].map(
                  (schedule, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 bg-gray-50 rounded"
                    >
                      <div className="text-sm font-medium text-blue-600 min-w-[60px]">
                        {schedule.time}
                      </div>
                      <div className="text-sm">{schedule.event}</div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">일정이 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}
