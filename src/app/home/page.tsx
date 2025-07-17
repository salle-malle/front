"use client";

import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useRouter } from "next/navigation";

const newsItems = [
  {
    id: 1,
    title: "애플, 3분기 실적 발표 예정",
    time: "2시간 전",
    category: "실적",
  },
  {
    id: 2,
    title: "엔비디아 메모리 반도체 수요 증가",
    time: "4시간 전",
    category: "산업",
  },
  {
    id: 3,
    title: "테슬라 클라우드 사업 확장",
    time: "6시간 전",
    category: "기업",
  },
];

const stocks = [
  {
    id: 1,
    name: "애플",
    code: "005930",
    price: 71500,
    change: 1200,
    changePercent: 1.71,
  },
  {
    id: 2,
    name: "SK하이닉스",
    code: "000660",
    price: 89400,
    change: -800,
    changePercent: -0.89,
  },
  {
    id: 3,
    name: "NAVER",
    code: "035420",
    price: 185000,
    change: 2500,
    changePercent: 1.37,
  },
];

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="flex flex-col h-screen">
      <TopNavigation />

      <main className="flex-1 overflow-y-auto p-4 pb-20">
        {/* 총자산 추이 */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">총자산</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₩12,450,000</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +2.3% (+280,000)
            </div>
          </CardContent>
        </Card>

        {/* 오늘의 뉴스 */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">오늘의 뉴스</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {newsItems.map((news) => (
              <div key={news.id} className="border-b pb-2 last:border-b-0">
                <div className="font-medium text-sm">{news.title}</div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{news.category}</span>
                  <span>{news.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 내 포트폴리오 */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">내 포트폴리오</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">평가손익</div>
                <div className="text-lg font-bold text-green-600">
                  +₩280,000
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">수익률</div>
                <div className="text-lg font-bold text-green-600">+2.3%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 내 종목 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">내 종목</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stocks.map((stock) => (
              <div
                key={stock.id}
                className="flex justify-between items-center p-2 rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/stock/${stock.code}`)}
              >
                <div>
                  <div className="font-medium">{stock.name}</div>
                  <div className="text-xs text-gray-500">{stock.code}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ₩{stock.price.toLocaleString()}
                  </div>
                  <div
                    className={`text-xs flex items-center ${
                      stock.change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {stock.changePercent > 0 ? "+" : ""}
                    {stock.changePercent}%
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}
