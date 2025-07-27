"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EarningCall, EarningCallResponse } from "@/src/types/ApiResponse";

type Disclosure = {
  id: number;
  disclosureTitle: string;
  disclosureSummary: string;
  disclosureDate: string;
  stockName: string;
  stockId: string;
};
type DisclosureResponse = {
  code: string;
  data: Disclosure[];
};

type MergedScheduleItem = {
  type: "earning" | "disclosure" | "both";
  time: string;
  event: string;
  summary?: string;
  id?: number;
  stockId?: string;
  stockName?: string;
  earningCall?: EarningCall;
  disclosure?: Disclosure;
};

// 날짜를 "YYYY-MM-DD" -> "YYYY년 MM월 DD일"로 변환하는 함수
function formatDateToKorean(dateStr: string) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  return `${year}년 ${parseInt(month, 10)}월 ${parseInt(day, 10)}일`;
}

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dateParam = searchParams.get("date");

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(dateParam || todayString);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (dateParam) {
      const targetDate = new Date(dateParam);
      return new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [earningCalls, setEarningCalls] = useState<EarningCall[]>([]);
  const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState<
    Record<string, Array<MergedScheduleItem>>
  >({});

  useEffect(() => {
    if (dateParam) {
      setSelectedDate(dateParam);
      const targetDate = new Date(dateParam);
      setCurrentMonth(
        new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
      );
    }
  }, [dateParam]);

  useEffect(() => {
    let hasRedirectedToLogin = false;

    const fetchEarningCalls = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_API_URL}/earning-calls/member`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        let data: EarningCallResponse | any;
        try {
          data = await response.json();
        } catch (e) {
          throw new Error("서버 응답이 올바르지 않습니다.");
        }

        if (data && data.code === "AUTH-002") {
          if (!hasRedirectedToLogin) {
            hasRedirectedToLogin = true;
            router.replace("/login");
          }
          throw new Error("인증 오류");
        }

        if (response.ok) {
          setEarningCalls(data.data);
          return data.data;
        } else {
          console.error("API 응답 오류:", response.status, response.statusText);
          return [];
        }
      } catch (error) {
        console.error("어닝콜 데이터 가져오기 실패:", error);
        return [];
      }
    };

    const fetchDisclosures = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_API_URL}/disclosure/my-disclosures`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        let data: DisclosureResponse | any;
        try {
          data = await response.json();
        } catch (e) {
          throw new Error("서버 응답이 올바르지 않습니다.");
        }

        if (data && data.code === "AUTH-002") {
          if (!hasRedirectedToLogin) {
            hasRedirectedToLogin = true;
            router.replace("/login");
          }
          throw new Error("인증 오류");
        }

        if (response.ok) {
          setDisclosures(data.data);
          return data.data;
        } else {
          console.error(
            "공시 API 응답 오류:",
            response.status,
            response.statusText
          );
          return [];
        }
      } catch (error) {
        console.error("공시 데이터 가져오기 실패:", error);
        return [];
      }
    };

    // Merge earning calls and disclosures by date and stockId
    const fetchAll = async () => {
      setLoading(true);
      const [earningData, disclosureData] = await Promise.all([
        fetchEarningCalls(),
        fetchDisclosures(),
      ]);

      const newScheduleData: Record<string, Array<MergedScheduleItem>> = {};

      // Group earning calls by date and stockId
      const earningMap: Record<string, Record<string, EarningCall>> = {};
      earningData.forEach((call: EarningCall) => {
        const dateKey = call.earningCallDate;
        if (!earningMap[dateKey]) earningMap[dateKey] = {};
        earningMap[dateKey][call.stockId] = call;
      });

      // Group disclosures by date and stockId
      const disclosureMap: Record<string, Record<string, Disclosure>> = {};
      disclosureData.forEach((disclosure: Disclosure) => {
        const dateKey = disclosure.disclosureDate;
        if (!disclosureMap[dateKey]) disclosureMap[dateKey] = {};
        disclosureMap[dateKey][disclosure.stockId] = disclosure;
      });

      // Collect all dates
      const allDates = new Set([
        ...Object.keys(earningMap),
        ...Object.keys(disclosureMap),
      ]);

      allDates.forEach((dateKey) => {
        const earningStocks = earningMap[dateKey] || {};
        const disclosureStocks = disclosureMap[dateKey] || {};
        const merged: Array<MergedScheduleItem> = [];

        // Find stocks that have both earning and disclosure
        const bothStockIds = Object.keys(earningStocks).filter(
          (stockId) => disclosureStocks[stockId]
        );

        // Add merged items for stocks with both
        bothStockIds.forEach((stockId) => {
          const earning = earningStocks[stockId];
          const disclosure = disclosureStocks[stockId];
          merged.push({
            type: "both",
            time: "어닝콜+공시",
            event: `${earning.ovrsItemName} (${stockId}) 실적 발표 & ${disclosure.disclosureTitle}`,
            summary: disclosure.disclosureSummary,
            id: disclosure.id,
            stockId,
            stockName: earning.ovrsItemName,
            earningCall: earning,
            disclosure: disclosure,
          });
        });

        // Add only earning
        Object.keys(earningStocks).forEach((stockId) => {
          if (!disclosureStocks[stockId]) {
            const earning = earningStocks[stockId];
            merged.push({
              type: "earning",
              time: "어닝콜",
              event: `${earning.ovrsItemName} (${stockId}) 실적 발표`,
              stockId,
              stockName: earning.ovrsItemName,
              earningCall: earning,
            });
          }
        });

        // Add only disclosure
        Object.keys(disclosureStocks).forEach((stockId) => {
          if (!earningStocks[stockId]) {
            const disclosure = disclosureStocks[stockId];
            merged.push({
              type: "disclosure",
              time: "공시",
              event: disclosure.disclosureTitle,
              summary: disclosure.disclosureSummary,
              id: disclosure.id,
              stockId,
              stockName: disclosure.stockName,
              disclosure: disclosure,
            });
          }
        });

        newScheduleData[dateKey] = merged;
      });

      setScheduleData(newScheduleData);
      setLoading(false);
    };

    fetchAll();
  }, [router]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
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

  // Helper for dot rendering
  const getDayTypes = (day: number) => {
    const dateStr = formatDate(day);
    const schedules = scheduleData[dateStr];
    if (!schedules)
      return { hasEarning: false, hasDisclosure: false, hasBoth: false };
    let hasEarning = false;
    let hasDisclosure = false;
    let hasBoth = false;
    for (const item of schedules) {
      if (item.type === "earning") hasEarning = true;
      if (item.type === "disclosure") hasDisclosure = true;
      if (item.type === "both") hasBoth = true;
    }
    return { hasEarning, hasDisclosure, hasBoth };
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

  const handleDisclosureClick = (id: number) => {
    router.push(`/disclosure/${id}`);
  };

  // 색상 정의
  const LIGHT_BLUE = "#bae6fd"; // 연파랑
  const DARK_BLUE = "#2563eb"; // 진파랑
  const MIDDLE_BLUE = "#60a5fa"; // 연파랑과 진파랑의 중간색

  const getDayButtonStyle = (day: number) => {
    if (selectedDate === formatDate(day)) {
      return {
        backgroundColor: "#f3f4f6",
        color: "#111",
        fontWeight: 600,
        border: `2px solid ${MIDDLE_BLUE}`,
        boxShadow: `0 0 0 2px ${MIDDLE_BLUE}33`,
        transition: "box-shadow 0.3s, background 0.3s",
        // minHeight: 80,
        // maxHeight: 80,
        // height: 80,
        padding: 0,
      };
    } else {
      return {
        backgroundColor: "#fff",
        color: "#222",
        fontWeight: 500,
        border: "1px solid #e5e7eb",
        transition: "box-shadow 0.3s, background 0.3s",
        // minHeight: 80,
        // maxHeight: 80,
        // height: 80,
        padding: 0,
      };
    }
  };

  // 달력 날짜 아래 점 표시 (연파랑, 진파랑, 둘 다 분리)
  const renderDayDots = (day: number) => {
    if (!hasSchedule(day)) return null;
    const { hasEarning, hasDisclosure, hasBoth } = getDayTypes(day);

    const dotSize = 6;
    const dotGap = 2;

    const dotContainerStyle: React.CSSProperties = {
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      bottom: 6,
      marginTop: 0,
      marginBottom: 0,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: dotGap,
      pointerEvents: "none",
    };

    // 점을 분리해서 표시: 어닝콜 있으면 연파랑, 공시 있으면 진파랑, 둘 다 있으면 두 점
    const dots = [];
    if (hasEarning || hasBoth) {
      dots.push(
        <span
          key="earning"
          style={{
            display: "inline-block",
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background: LIGHT_BLUE,
            boxShadow: "0 1px 4px 0 rgba(186,230,253,0.18)",
            border: `1.5px solid ${LIGHT_BLUE}`,
          }}
        />
      );
    }
    if (hasDisclosure || hasBoth) {
      dots.push(
        <span
          key="disclosure"
          style={{
            display: "inline-block",
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background: DARK_BLUE,
            boxShadow: "0 1px 4px 0 rgba(37,99,235,0.18)",
            border: `1.5px solid ${DARK_BLUE}`,
          }}
        />
      );
    }
    if (dots.length === 0) return null;
    return <div style={dotContainerStyle}>{dots}</div>;
  };

  // 날짜 숫자와 점을 위아래로 분리해서 렌더링
  const renderDayContent = (day: number) => {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-start relative"
        style={{
          height: "100%",
          width: "100%",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            marginTop: 4,
            marginBottom: 10,
            fontSize: "1.02rem",
            fontWeight: 500,
            pointerEvents: "none",
            display: "block",
            lineHeight: 1.1,
            letterSpacing: "0.01em",
          }}
        >
          {day}
        </span>
        {renderDayDots(day)}
      </div>
    );
  };

  const renderStockIcon = (stockId?: string, stockName?: string) => {
    if (!stockId) return null;
    return (
      <img
        src={`/ticker-icon/${stockId}.png`}
        alt={stockName || stockId}
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          objectFit: "cover",
          marginRight: 6,
          background: "#f3f4f6",
          border: "1px solid #e5e7eb",
        }}
        onError={(e) => {
          // fallback: hide image if not found
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  };

  // 새로운: 같은 회사의 어닝콜+공시를 묶어서 보여주기 위한 그룹핑 함수
  function groupSchedulesByStock(schedules: MergedScheduleItem[]) {
    // key: stockId, value: { stockName, stockId, earningCall, disclosures: Disclosure[] }
    const grouped: Record<
      string,
      {
        stockName: string;
        stockId: string;
        earningCall?: EarningCall;
        disclosures: Disclosure[];
      }
    > = {};

    schedules.forEach((item) => {
      if (!item.stockId) return;
      if (!grouped[item.stockId]) {
        grouped[item.stockId] = {
          stockName: item.stockName || "",
          stockId: item.stockId,
          earningCall: undefined,
          disclosures: [],
        };
      }
      if (item.type === "earning") {
        grouped[item.stockId].earningCall = item.earningCall;
      } else if (item.type === "disclosure") {
        if (item.disclosure)
          grouped[item.stockId].disclosures.push(item.disclosure);
      } else if (item.type === "both") {
        // both는 earningCall, disclosure 둘 다 있음
        if (item.earningCall)
          grouped[item.stockId].earningCall = item.earningCall;
        if (item.disclosure)
          grouped[item.stockId].disclosures.push(item.disclosure);
      }
    });
    return Object.values(grouped);
  }

  const ArrowRight = ({
    size = 16,
    color = "#2563eb",
  }: {
    size?: number;
    color?: string;
  }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      style={{ display: "inline-block", verticalAlign: "middle" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 4l4 4-4 4"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // 날짜를 "YYYY-MM-DD" -> "YYYY년 MM월 DD일"로 변환하는 함수 (0000-00-00 -> 0000년 00월 00일)
  function formatDateToKoreanDisplay(dateStr: string) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    if (!year || !month || !day) return dateStr;
    return `${year}년 ${parseInt(month, 10)}월 ${parseInt(day, 10)}일`;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <TopNavigation showBackButton={true} />
      <main className="flex-1 overflow-y-auto pb-20">
        <div
          className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto w-full px-2"
          style={{
            maxWidth: "600px",
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">데이터를 불러오는 중...</div>
            </div>
          ) : (
            <>
              {/* 달력 */}
              <Card
                className="m-2 border-none"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  boxShadow: "0 2px 16px 0 rgba(220,194,249,0.12)",
                }}
              >
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
                    <CardTitle className="text-lg">
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
                <CardContent className="p-2">
                  <div className="grid grid-cols-7 gap-[2px] mb-1">
                    {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-gray-600 p-1 aspect-square flex items-center justify-center"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-[2px]">
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
                            className={`w-full h-full text-xs relative`}
                            style={getDayButtonStyle(day)}
                            onClick={() => setSelectedDate(formatDate(day))}
                          >
                            {renderDayContent(day)}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card
                className="m-2 border-none"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  boxShadow: "0 2px 16px 0 rgba(220,194,249,0.12)",
                }}
              >
                <CardHeader>
                  <CardTitle className="text-md">
                    {formatDateToKoreanDisplay(selectedDate)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {scheduleData[selectedDate] &&
                  scheduleData[selectedDate].length > 0 ? (
                    <div className="space-y-3">
                      {groupSchedulesByStock(scheduleData[selectedDate]).map(
                        (group, idx) => (
                          <div
                            key={group.stockId + idx}
                            className="bg-white rounded-lg shadow-sm border border-gray-100 p-3"
                          >
                            <div className="flex items-center mb-2">
                              {renderStockIcon(group.stockId, group.stockName)}
                              <span className="font-semibold text-base mr-2">
                                {group.stockName}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({group.stockId})
                              </span>
                            </div>
                            <div className="flex flex-col gap-2 pl-2">
                              {group.earningCall && (
                                <div
                                  className="flex items-center bg-blue-50 rounded px-2 py-1"
                                  style={{
                                    borderLeft: `4px solid ${LIGHT_BLUE}`,
                                  }}
                                >
                                  <span
                                    className="text-xs font-medium min-w-[48px] mr-2"
                                    style={{ color: "#38bdf8" }}
                                  >
                                    어닝콜
                                  </span>
                                  <span className="text-xs">
                                    {group.earningCall.ovrsItemName} (
                                    {group.earningCall.stockId}) 실적 발표
                                  </span>
                                </div>
                              )}
                              {group.disclosures.map((disclosure) => (
                                <div
                                  key={disclosure.id}
                                  className="flex items-center bg-blue-100/30 rounded px-2 py-1 cursor-pointer hover:bg-blue-100/60 transition"
                                  style={{
                                    borderLeft: `4px solid ${DARK_BLUE}`,
                                  }}
                                  onClick={() =>
                                    handleDisclosureClick(disclosure.id)
                                  }
                                >
                                  <span
                                    className="text-xs font-medium min-w-[48px] mr-2"
                                    style={{ color: "#2563eb" }}
                                  >
                                    공시
                                  </span>
                                  <span className="text-xs font-medium">
                                    {disclosure.disclosureTitle}
                                  </span>
                                  <span
                                    className="ml-2 flex items-center"
                                    style={{ whiteSpace: "nowrap" }}
                                  >
                                    <ArrowRight size={16} color="#2563eb" />
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-3">
                      일정이 없습니다.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
