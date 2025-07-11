"use client";

import { useState } from "react";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const cardData = {
  "2024-01-15": [
    {
      id: 1,
      title: "삼성전자 3분기 실적 분석",
      content: "매출 76조원으로 전년 동기 대비 12% 증가",
      image: "/placeholder.svg?height=200&width=300",
      tags: ["실적", "반도체"],
    },
    {
      id: 2,
      title: "메모리 반도체 시장 전망",
      content: "2024년 하반기 회복세 전망",
      image: "/placeholder.svg?height=200&width=300",
      tags: ["시장분석", "반도체"],
    },
  ],
  "2024-01-16": [
    {
      id: 3,
      title: "AI 반도체 수요 급증",
      content: "ChatGPT 열풍으로 AI 칩 수요 폭증",
      image: "/placeholder.svg?height=200&width=300",
      tags: ["AI", "반도체"],
    },
  ],
};

export default function CardsPage() {
  const [selectedDate, setSelectedDate] = useState("2024-01-15");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const currentCards = cardData[selectedDate as keyof typeof cardData] || [];

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % currentCards.length);
  };

  const prevCard = () => {
    setCurrentCardIndex(
      (prev) => (prev - 1 + currentCards.length) % currentCards.length
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <TopNavigation />

      {/* 날짜 선택 바 */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const currentDate = new Date(selectedDate);
              currentDate.setDate(currentDate.getDate() - 1);
              const newDate = currentDate.toISOString().split("T")[0];
              setSelectedDate(newDate);
              setCurrentCardIndex(0);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{selectedDate}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const currentDate = new Date(selectedDate);
              currentDate.setDate(currentDate.getDate() + 1);
              const newDate = currentDate.toISOString().split("T")[0];
              setSelectedDate(newDate);
              setCurrentCardIndex(0);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <main className="flex-1 overflow-hidden pb-20">
        {currentCards.length > 0 ? (
          <div className="h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm">
              <Card className="h-96">
                <CardContent className="p-0 h-full">
                  <div className="relative h-full">
                    <img
                      src={
                        currentCards[currentCardIndex].image ||
                        "/placeholder.svg"
                      }
                      alt={currentCards[currentCardIndex].title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">
                        {currentCards[currentCardIndex].title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {currentCards[currentCardIndex].content}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {currentCards[currentCardIndex].tags.map(
                          (tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 슬라이드 버튼 */}
              {currentCards.length > 1 && (
                <>
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
                </>
              )}

              {/* 인디케이터 */}
              {currentCards.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {currentCards.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentCardIndex
                          ? "bg-blue-600"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">해당 날짜에 카드가 없습니다.</p>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
