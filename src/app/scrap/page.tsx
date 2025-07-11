"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Bookmark, Folder, Plus, ChevronRight } from "lucide-react";

const stockList = [
  { id: 1, name: "삼성전자", code: "005930", cardCount: 12 },
  { id: 2, name: "SK하이닉스", code: "000660", cardCount: 8 },
  { id: 3, name: "NAVER", code: "035420", cardCount: 15 },
  { id: 4, name: "카카오", code: "035720", cardCount: 6 },
];

const groupList = [
  {
    id: 1,
    name: "반도체 그룹",
    cardCount: 25,
    stocks: ["삼성전자", "SK하이닉스"],
  },
  { id: 2, name: "IT 그룹", cardCount: 18, stocks: ["NAVER", "카카오"] },
  { id: 3, name: "관심 종목", cardCount: 10, stocks: ["LG전자", "현대차"] },
];

export default function ScrapPage() {
  const [activeTab, setActiveTab] = useState<"stocks" | "groups">("stocks");
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen">
      <TopNavigation />

      <div className="p-4 border-b">
        <h1 className="text-xl font-bold flex items-center mb-4">
          <Bookmark className="h-5 w-5 mr-2" />
          스크랩
        </h1>

        {/* 토글 버튼 */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            variant={activeTab === "stocks" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("stocks")}
          >
            종목
          </Button>
          <Button
            variant={activeTab === "groups" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("groups")}
          >
            그룹
          </Button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === "stocks" ? (
          <div className="p-4 space-y-3">
            {stockList.map((stock) => (
              <Card
                key={stock.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/scrap/stock/${stock.code}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{stock.name}</h3>
                      <p className="text-sm text-gray-600">{stock.code}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {stock.cardCount}개
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {/* 그룹 추가 버튼 */}
            <Button
              variant="outline"
              className="w-full justify-center bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" />
              그룹 추가
            </Button>

            {groupList.map((group) => (
              <Card
                key={group.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/scrap/group/${group.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center mb-1">
                        <Folder className="h-4 w-4 mr-2 text-blue-600" />
                        <h3 className="font-medium">{group.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        {group.stocks.join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {group.cardCount}개
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
