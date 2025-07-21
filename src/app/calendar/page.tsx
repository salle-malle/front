"use client";

import { useState, useEffect } from "react";
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
import { EarningCall, EarningCallResponse } from "@/src/types/ApiResponse";

export default function CalendarPage() {
  const today = new Date();
  const todayString = today.toISOString().split("T")[0]; // YYYY-MM-DD 형식

  const [selectedDate, setSelectedDate] = useState(todayString);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [earningCalls, setEarningCalls] = useState<EarningCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState<
    Record<string, Array<{ time: string; event: string }>>
  >({});

  // API에서 어닝콜 데이터 가져오기
  useEffect(() => {
    const fetchEarningCalls = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_API_URL}/earning-calls/member`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // 쿠키 기반 인증 사용
          }
        );

        if (response.ok) {
          const data: EarningCallResponse = await response.json();
          setEarningCalls(data.data);

          // 어닝콜 데이터를 scheduleData 형식으로 변환
          const newScheduleData: Record<
            string,
            Array<{ time: string; event: string }>
          > = {};
          data.data.forEach((call) => {
            const dateKey = call.earningCallDate;
            if (!newScheduleData[dateKey]) {
              newScheduleData[dateKey] = [];
            }
            newScheduleData[dateKey].push({
              time: "어닝콜",
              event: `${call.ovrsItemName} (${call.stockId}) 실적 발표`,
            });
          });
          setScheduleData(newScheduleData);
        } else {
          console.error("API 응답 오류:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("어닝콜 데이터 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningCalls();
  }, []);

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
    return scheduleData[dateStr];
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
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">데이터를 불러오는 중...</div>
          </div>
        ) : (
          <>
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
                            selectedDate === formatDate(day)
                              ? "default"
                              : "ghost"
                          }
                          size="sm"
                          className={`w-full h-full text-sm relative ${
                            hasSchedule(day)
                              ? selectedDate === formatDate(day)
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-blue-50 hover:bg-blue-100"
                              : ""
                          }`}
                          onClick={() => setSelectedDate(formatDate(day))}
                        >
                          {day}
                          {hasSchedule(day) && (
                            <div
                              className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                                selectedDate === formatDate(day)
                                  ? "bg-white"
                                  : "bg-blue-600"
                              }`}
                            ></div>
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
                {scheduleData[selectedDate] ? (
                  <div className="space-y-3">
                    {scheduleData[selectedDate].map((schedule, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-2 bg-gray-50 rounded"
                      >
                        <div className="text-sm font-medium text-blue-600 min-w-[60px]">
                          {schedule.time}
                        </div>
                        <div className="text-sm">{schedule.event}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    일정이 없습니다.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
