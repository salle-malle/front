"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Bookmark, Folder, Plus, ChevronRight, Loader2 } from "lucide-react";
import { ScrapGroup, ScrapGroupList } from "@/src/types/ScrapGroup";
import { ApiResponse } from "@/src/types/ApiResponse";

const StockList = [
  { id: 1, name: "애플", code: "AAPL", cardCount: 12 },
  { id: 2, name: "엔비디아", code: "NVDA", cardCount: 8 },
  { id: 3, name: "테슬라", code: "TSLA", cardCount: 15 },
  { id: 4, name: "구글", code: "GOOGL", cardCount: 6 },
];

// const groupList = [
//   {
//     id: 1,
//     name: "반도체 그룹",
//     cardCount: 25,
//     stocks: ["삼성전자", "SK하이닉스"],
//   },
//   { id: 2, name: "IT 그룹", cardCount: 18, stocks: ["NAVER", "카카오"] },
//   { id: 3, name: "관심 종목", cardCount: 10, stocks: ["LG전자", "현대차"] },
// ];

export default function ScrapPage() {
  const [activeTab, setActiveTab] = useState<"stocks" | "groups">("stocks");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockListLoading, setStockListLoading] = useState(false);
  const [scrapGroupListLoading, setScrapGroupListLoading] = useState(false);
  const [stockList, setStockList] = useState([]);
  const [scrapGroupList, setScrapGroupList] = useState<ScrapGroup[]>([]);
  const API = process.env.BACK_API_URL;

  useEffect(() => {
    const fetchScrapGroups = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrapgroup`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "스크랩 그룹을 불러오는 데 실패했습니다."
          );
        }

        const result: ApiResponse<ScrapGroup[]> = await response.json();

        if (result.data) {
          setScrapGroupList(result.data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScrapGroups();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <TopNavigation />

      <div className="p-4 border-b">
        <h1 className="text-xl font-bold flex items-center mb-4">
          <Bookmark className="h-5 w-5 mr-2" />
          스크랩
        </h1>

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
            {StockList.map((stock) => (
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
            <Button
              variant="outline"
              className="w-full justify-center bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" />
              그룹 추가
            </Button>

            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                <span className="ml-2">그룹 목록을 불러오는 중...</span>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-8">
                오류가 발생했습니다: {error}
              </div>
            ) : (
              scrapGroupList.map((group) => (
                <Card
                  key={String(group.id)}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/scrap/group/${group.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center mb-1">
                          <Folder className="h-4 w-4 mr-2 text-blue-600" />
                          <h3 className="font-medium">
                            {group.scrapGroupName}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                <span className="ml-2">그룹 목록을 불러오는 중...</span>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-8">
                오류가 발생했습니다: {error}
              </div>
            ) : (
              // ✅ 5. API로 받아온 scrapGroupList를 렌더링합니다.
              scrapGroupList.map((group) => (
                <Card
                  key={String(group.id)}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/scrap/group/${group.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center mb-1">
                          <Folder className="h-4 w-4 mr-2 text-blue-600" />
                          {/* ✅ 6. API 데이터에 맞는 필드 이름을 사용합니다. */}
                          <h3 className="font-medium">
                            {group.scrapGroupName}
                          </h3>
                        </div>
                        {/* API 응답에 주식 목록 정보가 없으므로 해당 부분은 제거하거나, 
                            나중에 별도 API로 가져와 표시할 수 있습니다. */}
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* API 응답에 카드 개수 정보가 없으므로 일단 제거합니다. */}
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* {groupList.map((group) => (
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
            ))} */}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
