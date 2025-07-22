"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { BarChart3, TrendingUp } from "lucide-react";

interface StockChartProps {
  stockCode: string;
}

type ChartPeriod = "1D" | "1W" | "1M" | "6M" | "1Y" | "ALL";

export function StockChart({ stockCode }: StockChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>("1M");
  const [loading, setLoading] = useState(true);

  const periods: { value: ChartPeriod; label: string }[] = [
    { value: "1D", label: "1일" },
    { value: "1W", label: "1주" },
    { value: "1M", label: "1개월" },
    { value: "6M", label: "6개월" },
    { value: "1Y", label: "1년" },
    { value: "ALL", label: "전체" },
  ];

  // 임시 차트 데이터 생성
  const generateMockData = (period: ChartPeriod) => {
    const data = [];
    const now = new Date();
    const days =
      period === "1D"
        ? 24
        : period === "1W"
        ? 7
        : period === "1M"
        ? 30
        : period === "6M"
        ? 180
        : period === "1Y"
        ? 365
        : 730;

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const basePrice = 150 + Math.random() * 50;
      const open = basePrice + (Math.random() - 0.5) * 10;
      const high = open + Math.random() * 5;
      const low = open - Math.random() * 5;
      const close = open + (Math.random() - 0.5) * 8;

      data.push({
        time: date.getTime() / 1000,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
      });
    }
    return data;
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      generateMockData(selectedPeriod);
      setLoading(false);
    }, 500);
  }, [selectedPeriod]);

  return (
    <Card className="mx-4 mt-4 shadow-sm border-0 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center text-gray-900">
          <BarChart3 className="h-5 w-5 mr-2" />
          주가 차트
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 기간 선택 버튼 */}
        <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
          {periods.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "default" : "ghost"}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </Button>
          ))}
        </div>

        {/* 차트 영역 */}
        <div className="h-80 bg-white rounded-lg border border-gray-200">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-500">차트 로딩 중...</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {stockCode} 차트 ({selectedPeriod})
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  TradingView 차트가 여기에 표시됩니다
                </p>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">캔들스틱 차트</p>
                  <div className="flex items-center justify-center space-x-1">
                    <div className="w-2 h-8 bg-green-500"></div>
                    <div className="w-2 h-4 bg-red-500"></div>
                    <div className="w-2 h-6 bg-green-500"></div>
                    <div className="w-2 h-10 bg-red-500"></div>
                    <div className="w-2 h-5 bg-green-500"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 차트 정보 */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-1">시가</p>
            <p className="font-semibold text-gray-900">$152.30</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">고가</p>
            <p className="font-semibold text-red-500">$158.45</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">저가</p>
            <p className="font-semibold text-blue-500">$149.80</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
