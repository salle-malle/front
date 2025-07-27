"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { MdOutlineEventAvailable } from "react-icons/md";
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

          const currentStockCalls = earningCalls.filter(
            (call) => call.stockId === stockCode
          );

          const sortedCalls = currentStockCalls
            .sort(
              (a, b) =>
                new Date(a.earningCallDate).getTime() -
                new Date(b.earningCallDate).getTime()
            )
            .slice(0, 2);

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

  if (loading) {
    return (
      <Card className="mx-4 mt-4 shadow-sm border-0 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-gray-900">
            {/* <MdOutlineEventAvailable className="h-5 w-5 mr-2" /> */}
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
            {/* <MdOutlineEventAvailable className="h-5 w-5 mr-2" /> */}
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
          {/* <MdOutlineEventAvailable className="h-5 w-5 mr-2" /> */}
          다가올 주요 이벤트
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
            onClick={() => router.push(`/calendar?date=${event.date}`)}>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-gray-900">
                {event.title}
              </p>
              <p className="text-xs text-gray-500">{event.date}</p>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-blue-600">
                D-{event.daysUntil}
              </span>
              <span className="text-xs text-gray-400">남음</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
