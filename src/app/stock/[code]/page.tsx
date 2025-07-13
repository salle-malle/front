"use client";

import { useParams, useRouter } from "next/navigation";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, TrendingUp, Calendar, BarChart3 } from "lucide-react";

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const stockCode = params.code as string;

  // 임시 데이터
  const stockData = {
    name: "삼성전자",
    code: stockCode,
    price: 71500,
    change: 1200,
    changePercent: 1.71,
  };

  const events = [
    { date: "2024-01-15", event: "3분기 실적 발표" },
    { date: "2024-01-20", event: "주주총회" },
    { date: "2024-01-25", event: "배당금 지급" },
  ];

  const indicators = [
    { name: "PER", value: "12.5" },
    { name: "PBR", value: "1.2" },
    { name: "ROE", value: "8.5%" },
    { name: "배당수익률", value: "2.1%" },
  ];

  return (
    <div className="flex flex-col h-screen">
      <TopNavigation />

      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="ml-2">
          <h1 className="font-bold">{stockData.name}</h1>
          <p className="text-sm text-gray-600">{stockData.code}</p>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 pb-20">
        {/* 현재 주가 */}
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">
              ₩{stockData.price.toLocaleString()}
            </div>
            <div
              className={`flex items-center text-lg ${
                stockData.change >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              <TrendingUp className="h-5 w-5 mr-1" />+{stockData.changePercent}%
              (+₩{stockData.change.toLocaleString()})
            </div>
          </CardContent>
        </Card>

        {/* 보유손익 */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">보유손익</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">보유수량</div>
                <div className="text-lg font-bold">10주</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">평가손익</div>
                <div className="text-lg font-bold text-green-600">+₩12,000</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 주가 차트 */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              주가 차트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-500">차트 영역</p>
            </div>
          </CardContent>
        </Card>

        {/* 다가올 주요 이벤트 */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              다가올 주요 이벤트
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.map((event, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="font-medium">{event.event}</div>
                <div className="text-sm text-gray-600">{event.date}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 주요 지표 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">주요 지표</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {indicators.map((indicator, index) => (
                <div key={index} className="text-center">
                  <div className="text-sm text-gray-600">{indicator.name}</div>
                  <div className="text-lg font-bold">{indicator.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}
