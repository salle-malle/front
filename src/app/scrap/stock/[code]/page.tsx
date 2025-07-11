"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const scrapCards = [
  {
    id: 1,
    title: "삼성전자 3분기 실적 분석",
    content:
      "매출 76조원으로 전년 동기 대비 12% 증가하며 시장 예상치를 상회했습니다.",
    image: "/placeholder.svg?height=200&width=300",
    tags: ["실적", "반도체"],
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "메모리 반도체 시장 전망",
    content:
      "2024년 하반기부터 메모리 반도체 시장이 회복세를 보일 것으로 전망됩니다.",
    image: "/placeholder.svg?height=200&width=300",
    tags: ["시장분석", "반도체"],
    date: "2024-01-14",
  },
  {
    id: 3,
    title: "삼성전자 신제품 발표",
    content: "차세대 스마트폰과 반도체 기술을 공개했습니다.",
    image: "/placeholder.svg?height=200&width=300",
    tags: ["신제품", "기술"],
    date: "2024-01-13",
  },
];

export default function StockScrapPage() {
  const params = useParams();
  const router = useRouter();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const stockCode = params.code as string;

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % scrapCards.length);
  };

  const prevCard = () => {
    setCurrentCardIndex(
      (prev) => (prev - 1 + scrapCards.length) % scrapCards.length
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <TopNavigation />

      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="ml-2">
          <h1 className="font-bold">삼성전자 스크랩</h1>
          <p className="text-sm text-gray-600">{scrapCards.length}개의 카드</p>
        </div>
      </div>

      <main className="flex-1 overflow-hidden pb-20">
        <div className="h-full flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm">
            <Card className="h-96">
              <CardContent className="p-0 h-full">
                <div className="relative h-full">
                  <img
                    src={
                      scrapCards[currentCardIndex].image || "/placeholder.svg"
                    }
                    alt={scrapCards[currentCardIndex].title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-2">
                      {scrapCards[currentCardIndex].date}
                    </div>
                    <h3 className="font-bold text-lg mb-2">
                      {scrapCards[currentCardIndex].title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {scrapCards[currentCardIndex].content}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {scrapCards[currentCardIndex].tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 슬라이드 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={prevCard}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextCard}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* 인디케이터 */}
            <div className="flex justify-center mt-4 space-x-2">
              {scrapCards.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentCardIndex ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
