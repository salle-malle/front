"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Calendar } from "lucide-react";
import { EarningCall } from "@/src/types/ApiResponse";

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  daysUntil: number;
  type: "earnings";
}

interface UpcomingEventsProps {
  stockCode: string;
}

export function UpcomingEvents({ stockCode }: UpcomingEventsProps) {
  const router = useRouter();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarningCalls = async () => {
      try {
        setLoading(true);
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

        if (response.ok) {
          const data = await response.json();
          const earningCalls: EarningCall[] = data.data || [];

          // 현재 종목의 어닝콜만 필터링
          const currentStockCalls = earningCalls.filter(
            (call) => call.stockId === stockCode
          );

          // 날짜별로 정렬하고 가장 가까운 2개만 선택
          const sortedCalls = currentStockCalls
            .sort(
              (a, b) =>
                new Date(a.earningCallDate).getTime() -
                new Date(b.earningCallDate).getTime()
            )
            .slice(0, 2);

          // UpcomingEvent 형태로 변환
          const upcomingEvents: UpcomingEvent[] = sortedCalls.map((call) => {
            const eventDate = new Date(call.earningCallDate);
            const today = new Date();
            const timeDiff = eventDate.getTime() - today.getTime();
            const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));

            return {
              id: call.id.toString(),
              title: `${call.ovrsItemName} 실적 발표`,
              date: call.earningCallDate,
              daysUntil: daysUntil > 0 ? daysUntil : 0,
              type: "earnings" as const,
            };
          });

          setEvents(upcomingEvents);
        } else {
          console.error("어닝콜 데이터 가져오기 실패:", response.status);
        }
      } catch (error) {
        console.error("어닝콜 데이터 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    if (stockCode) {
      fetchEarningCalls();
    }
  }, [stockCode]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "earnings":
        return "📊";
      default:
        return "📅";
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "earnings":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card className="mx-4 mt-4 shadow-sm border-0 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-gray-900">
            <Calendar className="h-5 w-5 mr-2" />
            다가올 주요 이벤트
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-500">
              이벤트 로딩 중...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="mx-4 mt-4 shadow-sm border-0 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-gray-900">
            <Calendar className="h-5 w-5 mr-2" />
            다가올 주요 이벤트
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm">가까운 이벤트가 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-4 mt-4 shadow-sm border-0 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center text-gray-900">
          <Calendar className="h-5 w-5 mr-2" />
          다가올 주요 이벤트
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${getEventColor(
                event.type
              )} cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={() => router.push("/calendar")}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getEventIcon(event.type)}</span>
                <div>
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs opacity-75">{event.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">D-{event.daysUntil}</p>
                <p className="text-xs opacity-75">남음</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
