"use client";

import { useState, useEffect, useMemo } from "react";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import { TrebleSelector } from "@/src/components/scrap/TrebleSelector";
import { ScrapGroupSelector } from "@/src/components/scrap/ScrapGroupSelector";
import { SelectedDateDisplay } from "@/src/components/ui/SelectedDateDisplay";
import { CardViewer } from "@/src/components/ui/CardViewer";
import { SnapshotCard, UnifiedStockItem } from "@/src/types/SnapshotCard";
import { ScrapGroup } from "@/src/types/ScrapGroup";
import { preloadImage } from "@/src/lib/image-preloader";
import React from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "@/src/components/ui/Sonner";
import { toast } from "sonner";
import {
  MemberStockResponseDto,
  MemberStockSnapshotDetailResponseDto,
} from "@/src/types/MemberStock";
import { ApiResponse, UnifiedStockResponse } from "@/src/types/ApiResponse";
import { ScrapGroupedResponseDto } from "@/src/types/ScrapGroup";

// 중복 로그인 리다이렉트 방지 ref
let hasRedirectedToLogin = false;

async function fetchWithAuthCheck(
  input: RequestInfo,
  init: RequestInit = {},
  router: ReturnType<typeof useRouter>
) {
  const res = await fetch(input, init);
  let jsonResponse: any;
  try {
    jsonResponse = await res.json();
  } catch (e) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }
  if (jsonResponse.code === "AUTH-002") {
    if (!hasRedirectedToLogin) {
      hasRedirectedToLogin = true;
      router.replace("/login");
    }
    throw new Error("인증 오류");
  }
  return jsonResponse;
}

export default function ScrapPage() {
  const [activeView, setActiveView] = useState<"date" | "stock" | "group">(
    "date"
  );
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD 형식
  });
  const [snapshotsByDate, setSnapshotsByDate] = useState<{
    [date: string]: SnapshotCard[];
  }>({});
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<ScrapGroup[]>([]);
  const router = useRouter();

  const allowedDates = useMemo(
    () => Object.keys(snapshotsByDate).sort(),
    [snapshotsByDate]
  );

  const [portfolio, setPortfolio] = useState<
    { [stockCode: string]: UnifiedStockItem } | undefined
  >(undefined);
  const [unifiedStocks, setUnifiedStocks] =
    useState<UnifiedStockResponse | null>(null);

  const [isStocksLoading, setIsStocksLoading] = useState(true);
  const [stocksError, setStocksError] = useState<string | null>(null);
  const [memberStocks, setMemberStocks] = useState<MemberStockResponseDto[]>(
    []
  );
  const [selectedStockSnapshots, setSelectedStockSnapshots] = useState<
    MemberStockSnapshotDetailResponseDto[]
  >([]);
  const [isStockSnapshotsLoading, setIsStockSnapshotsLoading] = useState(false);
  const [currentStockSnapshotIndex, setCurrentStockSnapshotIndex] = useState(0);
  const [groupedSnapshots, setGroupedSnapshots] = useState<
    ScrapGroupedResponseDto[]
  >([]);
  const [isGroupedSnapshotsLoading, setIsGroupedSnapshotsLoading] =
    useState(false);
  const [currentGroupedSnapshotIndex, setCurrentGroupedSnapshotIndex] =
    useState(0);

  const currentSnapshots = snapshotsByDate[selectedDate] || [];
  const currentSnapshot = currentSnapshots[currentSnapshotIndex];
  const currentStockSnapshot =
    selectedStockSnapshots[currentStockSnapshotIndex];
  const currentGroupedSnapshot = groupedSnapshots[currentGroupedSnapshotIndex];

  const fetchAllPortfolio = async () => {
    try {
      const portfolioResponse = await fetchWithAuthCheck(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/kis/unified-stocks`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
        router
      );

      if (portfolioResponse?.status && portfolioResponse.data) {
        const unifiedStockData: UnifiedStockResponse = portfolioResponse.data;
        console.log("Unified stocks data:", unifiedStockData);
        setUnifiedStocks(unifiedStockData);

        if (unifiedStockData.stocks) {
          const portfolioItems: UnifiedStockItem[] = unifiedStockData.stocks;
          const portfolioMap = portfolioItems.reduce((acc, item) => {
            acc[item.pdno] = item;
            return acc;
          }, {} as { [stockCode: string]: UnifiedStockItem });

          console.log("Portfolio fetched:", portfolioMap);
          setPortfolio(portfolioMap);
        } else {
          console.log("No stocks data in unified response");
          setPortfolio({});
        }
      } else {
        console.log("Portfolio response not successful:", portfolioResponse);
        setUnifiedStocks(null);
        setPortfolio({});
      }
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
      setUnifiedStocks(null);
      setPortfolio({});
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetchWithAuthCheck(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrapgroup`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
        router
      );

      if (response?.status && response.data) {
        setGroups(response.data);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      setGroups([]);
    }
  };

  const fetchMemberStocks = async () => {
    setIsStocksLoading(true);
    setStocksError(null);
    try {
      let hasRedirectedToLogin = false;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/kis/member-stocks`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      let result: ApiResponse<MemberStockResponseDto[]>;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error("서버 응답이 올바르지 않습니다.");
      }
      if (result && (result as any).code === "AUTH-002") {
        if (!hasRedirectedToLogin) {
          hasRedirectedToLogin = true;
          router.replace("/login");
        }
        throw new Error("인증 오류");
      }
      if (!response.ok) {
        throw new Error(
          (result as any).message ||
            "보유 주식 목록을 불러오는 데 실패했습니다."
        );
      }
      if (result.data) {
        setMemberStocks(result.data);
      }
    } catch (err: any) {
      setStocksError(err.message);
    } finally {
      setIsStocksLoading(false);
    }
  };

  const fetchStockSnapshots = async (stockCode: string) => {
    setIsStockSnapshotsLoading(true);
    try {
      const response = await fetchWithAuthCheck(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/member-stock-snapshots/scraps?stockCode=${stockCode}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
        router
      );

      if (response?.status && response.data) {
        const snapshots: MemberStockSnapshotDetailResponseDto[] = response.data;
        setSelectedStockSnapshots(snapshots);
        setCurrentStockSnapshotIndex(0);

        // 이미지 프리로드
        snapshots.forEach((snapshot) => {
          preloadImage(snapshot.newsImage);
          if (snapshot.stockCode) {
            preloadImage(`/ticker-icon/${snapshot.stockCode}.png`);
          }
        });
      } else {
        setSelectedStockSnapshots([]);
      }
    } catch (error) {
      console.error("Failed to fetch stock snapshots:", error);
      setSelectedStockSnapshots([]);
    } finally {
      setIsStockSnapshotsLoading(false);
    }
  };

  const handleStockClick = async (stockCode: string) => {
    console.log("=== handleStockClick ===");
    console.log("stockCode:", stockCode);
    console.log("current selectedGroupId:", selectedGroupId);

    console.log("current activeView:", activeView);

    // 이전 종목 스냅샷과 그룹 스냅샷 초기화
    setSelectedStockSnapshots([]);
    setCurrentStockSnapshotIndex(0);
    setGroupedSnapshots([]);
    setCurrentGroupedSnapshotIndex(0);

    // 종목별 스크랩 조회
    await fetchStockSnapshots(stockCode);

    // activeView를 "stock"으로 변경하여 CardViewer가 표시되도록 함
    console.log("Setting activeView to stock");
    setActiveView("stock");
  };

  const fetchGroupedSnapshots = async (groupId: number) => {
    setIsGroupedSnapshotsLoading(true);
    try {
      const response = await fetchWithAuthCheck(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrapgroup/${groupId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
        router
      );

      if (response?.status && response.data) {
        const snapshots: ScrapGroupedResponseDto[] = response.data;
        setGroupedSnapshots(snapshots);
        setCurrentGroupedSnapshotIndex(0);
      } else {
        setGroupedSnapshots([]);
      }
    } catch (error) {
      console.error("Failed to fetch grouped snapshots:", error);
      setGroupedSnapshots([]);
    } finally {
      setIsGroupedSnapshotsLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      console.log("=== Scrap Page Initial Load ===");
      setIsLoading(true);

      // 스크랩 그룹과 포트폴리오를 동시에 요청하여 병렬로 처리
      await Promise.all([
        fetchGroups(),
        fetchAllPortfolio(),
        fetchMemberStocks(),
      ]);

      // 페이지 접근 시 '전체'가 클릭 상태가 되도록 설정
      console.log("Setting selectedGroupId to null");
      setSelectedGroupId(null);
      console.log("Setting activeView to date");
      setActiveView("date");

      setIsLoading(false);
      console.log("Initial data fetch completed");
    };

    fetchInitialData();
  }, [router]);

  const fetchScrapSnapshots = async (groupId: number | null, date?: string) => {
    setIsLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_BACK_API_URL}/member-stock-snapshots/scraps`;
      const params = new URLSearchParams();

      if (groupId !== null) {
        params.append("groupId", groupId.toString());
      }
      if (date) {
        params.append("date", date);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const data = await fetchWithAuthCheck(
        url,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
        router
      );

      if (data && data.status && data.data && Array.isArray(data.data)) {
        const fetchedData: SnapshotCard[] = data.data;
        fetchedData.forEach((snap) => {
          preloadImage(snap.newsImage);
          if (snap.stockCode) {
            preloadImage(`/ticker-icon/${snap.stockCode}.png`);
          }
        });

        if (date) {
          setSnapshotsByDate((prev) => ({ ...prev, [date]: fetchedData }));
        } else {
          const byDate: { [date: string]: SnapshotCard[] } = {};
          fetchedData.forEach((snap) => {
            const date = snap.snapshotCreatedAt.split("T")[0];
            if (!byDate[date]) byDate[date] = [];
            byDate[date].push(snap);
          });
          setSnapshotsByDate(byDate);
          const dates = Object.keys(byDate).sort();
          if (dates.length > 0) {
            setSelectedDate(dates[dates.length - 1]);
            setCurrentSnapshotIndex(0);
            setActiveView("date");
          }
        }
      } else {
        setSnapshotsByDate({});
      }
    } catch (error) {
      console.error("Failed to fetch scrap snapshots:", error);
      setSnapshotsByDate({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupChange = async (groupId: number | null) => {
    console.log("=== handleGroupChange ===");
    console.log("groupId:", groupId);
    console.log("current selectedGroupId:", selectedGroupId);
    console.log("current activeView:", activeView);

    setSelectedGroupId(groupId);

    if (groupId !== null) {
      // 특정 그룹이 선택된 경우 해당 그룹의 스크랩 조회
      console.log("Fetching grouped snapshots for groupId:", groupId);
      await fetchGroupedSnapshots(groupId);
    } else {
      // 전체가 선택된 경우 오늘 날짜 유지
      console.log("Setting today's date for '전체' selection");
      const today = new Date();
      setSelectedDate(today.toISOString().split("T")[0]);
      console.log("Clearing stock snapshots and grouped snapshots");
      setSelectedStockSnapshots([]);
      setGroupedSnapshots([]);
      console.log("Setting activeView to date");
      setActiveView("date");
    }
  };

  const handleDateChange = async (date: string) => {
    if (date === selectedDate) return;

    if (!snapshotsByDate[date]) {
      await fetchScrapSnapshots(selectedGroupId, date);
    }

    const newSnapshots = snapshotsByDate[date] || [];
    newSnapshots.forEach((snap) => {
      preloadImage(snap.newsImage);
      if (snap.stockCode) {
        preloadImage(`/ticker-icon/${snap.stockCode}.png`);
      }
    });

    setSelectedDate(date);
    setCurrentSnapshotIndex(0);
    setActiveView("stock");
  };

  useEffect(() => {
    if (currentSnapshotIndex >= currentSnapshots.length) {
      setCurrentSnapshotIndex(currentSnapshots.length - 1);
    }
  }, [selectedDate, currentSnapshots.length]);

  useEffect(() => {
    setCurrentSnapshotIndex(0);
  }, [selectedDate]);

  useEffect(() => {
    if (activeView === "stock" && currentSnapshots.length > 0) {
      setCurrentSnapshotIndex((prev) =>
        prev >= currentSnapshots.length ? 0 : prev
      );
    }
  }, [activeView, currentSnapshots.length]);

  useEffect(() => {
    if (activeView === "date") {
      setCurrentSnapshotIndex(0);
    }
  }, [activeView, currentSnapshots.length]);

  const handleStockChange = (snapshotId: number) => {
    const idx = currentSnapshots.findIndex((s) => s.snapshotId === snapshotId);
    if (idx !== -1) setCurrentSnapshotIndex(idx);
  };

  const handleStockEdge = async (direction: "left" | "right") => {
    const idx = allowedDates.indexOf(selectedDate);
    const nextDate =
      direction === "left" ? allowedDates[idx - 1] : allowedDates[idx + 1];
    if (!nextDate) return;
    if (!snapshotsByDate[nextDate]) {
      await fetchScrapSnapshots(selectedGroupId, nextDate);
    }
    await handleDateChange(nextDate);
    setSelectedDate(nextDate);
    setActiveView("date");
    setCurrentSnapshotIndex(0);
  };

  const handleSwipe = async (direction: number) => {
    const newIndex = currentSnapshotIndex + direction;
    if (newIndex >= 0 && newIndex < currentSnapshots.length) {
      setCurrentSnapshotIndex(newIndex);
      if (activeView === "date") setActiveView("stock");
    } else {
      await handleStockEdge(direction < 0 ? "left" : "right");
    }
  };

  const handleStockSnapshotSwipe = (direction: number) => {
    const newIndex = currentStockSnapshotIndex + direction;
    if (newIndex >= 0 && newIndex < selectedStockSnapshots.length) {
      setCurrentStockSnapshotIndex(newIndex);
    }
  };

  const handleGroupedSnapshotSwipe = (direction: number) => {
    const newIndex = currentGroupedSnapshotIndex + direction;
    if (newIndex >= 0 && newIndex < groupedSnapshots.length) {
      setCurrentGroupedSnapshotIndex(newIndex);
    }
  };

  // MemberStockSnapshotDetailResponseDto를 SnapshotCard 형식으로 변환
  const convertToSnapshotCard = (
    snapshot: MemberStockSnapshotDetailResponseDto
  ): SnapshotCard => {
    return {
      snapshotId: snapshot.snapshotId,
      snapshotCreatedAt: snapshot.snapshotCreatedAt,
      personalizedComment: snapshot.personalizedComment,
      stockCode: snapshot.stockCode,
      stockName: snapshot.stockName,
      newsContent: snapshot.newsContent,
      newsImage: snapshot.newsImage,
    };
  };

  // ScrapGroupedResponseDto를 SnapshotCard 형식으로 변환
  const convertGroupedToSnapshotCard = (
    groupedSnapshot: ScrapGroupedResponseDto
  ): SnapshotCard => {
    return {
      snapshotId: groupedSnapshot.memberStockSnapshotId,
      snapshotCreatedAt: groupedSnapshot.createdAt,
      personalizedComment: `${groupedSnapshot.scrapGroupName} 그룹의 스크랩`,
      stockCode: "", // API에서 제공되지 않으므로 빈 문자열
      stockName: groupedSnapshot.stockName,
      newsContent: `${groupedSnapshot.stockName} 관련 뉴스`,
      newsImage: "/placeholder.jpg", // 기본 이미지 사용
    };
  };

  const handleAddGroup = () => {
    // 그룹 추가 로직 (나중에 구현)
    toast.info("그룹 추가 기능은 추후 구현 예정입니다.");
  };

  if (isLoading || !portfolio) {
    return (
      <div className="flex flex-col h-screen max-w-[480px] mx-auto bg-white">
        <TopNavigation />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const handleScrapClick = async (
    snapshotId: number
  ): Promise<number | null> => {
    console.log("=== Scrap Page handleScrapClick Debug ===");
    console.log("handleScrapClick called with snapshotId:", snapshotId);

    try {
      console.log("Making API request to /api/v1/scrap");
      const response = await fetchWithAuthCheck(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrap`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ memberStockSnapshotId: snapshotId }),
        },
        router
      );

      console.log("API response:", response);

      if (response.status) {
        console.log("Scrap successful, showing toast");
        toast.success("스크랩에 추가되었습니다.");
        // 스크랩 ID 반환 (실제 응답 구조에 따라 조정 필요)
        return response.data?.id || response.data?.scrapId || null;
      } else {
        console.error(response.message || "스크랩 추가에 실패했습니다.");
        toast.error(response.message || "스크랩 추가에 실패했습니다.");
        throw new Error(response.message || "스크랩 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("Scrap request failed:", error);
      toast.error("스크랩 추가 중 오류가 발생했습니다.");
      throw error;
    }
  };

  const handleUnscrapClick = async (snapshotId: number): Promise<void> => {
    console.log("=== Scrap Page handleUnscrapClick Debug ===");
    console.log("handleUnscrapClick called with snapshotId:", snapshotId);

    try {
      // 먼저 스크랩 상태를 확인
      console.log("Checking scrap status for snapshotId:", snapshotId);
      const statusResponse = await fetchWithAuthCheck(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrap/status/${snapshotId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
        router
      );

      console.log("Status response:", statusResponse);

      if (!statusResponse.status) {
        throw new Error("스크랩 상태를 확인할 수 없습니다.");
      }

      // 스크랩 상태가 true이고 scrapId가 있는 경우에만 삭제 시도
      if (statusResponse.data?.isScrap && statusResponse.data?.scrapId) {
        console.log(
          "Snapshot is scraped, attempting to delete scrap with ID:",
          statusResponse.data.scrapId
        );

        // scrapId로 스크랩 삭제
        const deleteResponse = await fetchWithAuthCheck(
          `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrap/${statusResponse.data.scrapId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          },
          router
        );

        if (deleteResponse.status) {
          console.log("스크랩에서 제거되었습니다.");
          toast.success("스크랩에서 제거되었습니다.");
        } else {
          throw new Error(
            deleteResponse.message || "스크랩 제거에 실패했습니다."
          );
        }
      } else {
        console.log("Snapshot is not scraped, no need to delete");
        toast.info("이미 스크랩되지 않은 항목입니다.");
      }
    } catch (error) {
      console.error("Unscrap request failed:", error);
      toast.error("스크랩 삭제 중 오류가 발생했습니다.");
      throw error;
    }
  };

  return (
    <div className="flex flex-col h-screen mx-auto bg-white overflow-hidden">
      <Toaster />
      <TopNavigation />

      {/* ScrapGroupSelector 고정 배치 */}
      <div className="px-4 py-2">
        <ScrapGroupSelector
          groups={groups}
          selectedGroupId={selectedGroupId}
          onGroupSelect={handleGroupChange}
          onAddGroup={handleAddGroup}
          unifiedStocks={unifiedStocks}
          onStockClick={handleStockClick}
        />
      </div>

      <div className="relative flex-1">
        <main className="absolute inset-0 top-[5px] flex items-center justify-center">
          {/* 보유 종목 리스트 표시 */}
          {(() => {
            console.log("=== Rendering stock list condition ===");
            console.log("selectedGroupId:", selectedGroupId);
            console.log("activeView:", activeView);
            console.log(
              "selectedStockSnapshots.length:",
              selectedStockSnapshots.length
            );
            console.log("groupedSnapshots.length:", groupedSnapshots.length);
            console.log("unifiedStocks:", unifiedStocks);
            console.log("unifiedStocks.stocks:", unifiedStocks?.stocks);
            console.log(
              "Should show stock list:",
              selectedGroupId === null &&
                activeView === "date" &&
                unifiedStocks &&
                unifiedStocks?.stocks
            );
            return (
              selectedGroupId === null &&
              activeView === "date" &&
              unifiedStocks &&
              unifiedStocks?.stocks
            );
          })() && (
            <div className="w-full h-[80%] overflow-y-auto px-4 py-2">
              <div className="mb-4">
                {/* <h2 className="text-lg font-semibold text-gray-800 mb-2">보유 종목</h2>
              <div className="text-sm text-gray-600 mb-4">
                총 {unifiedStocks.summary?.total_stock_count || 0}개 종목
              </div> */}
              </div>
              <div className="space-y-3">
                {unifiedStocks?.stocks?.map((stock) => (
                  <div
                    key={stock.pdno}
                    className="bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleStockClick(stock.pdno)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {stock.pdno.slice(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-sm truncate">
                              {stock.prdt_name}
                            </h3>
                            {/* <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {stock.stock_type === "REGULAR" ? "일반" : "소수점"}
                          </span> */}
                          </div>
                          <p className="text-xs text-gray-500">
                            {stock.pdno} • {stock.exchange}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {parseFloat(stock.current_price).toLocaleString()}
                        </div>
                        <div
                          className={`text-xs ${
                            parseFloat(stock.profit_loss_rate) > 0
                              ? "text-red-500"
                              : parseFloat(stock.profit_loss_rate) < 0
                              ? "text-blue-500"
                              : "text-gray-500"
                          }`}
                        >
                          {parseFloat(stock.profit_loss_rate) > 0 ? "+" : ""}
                          {parseFloat(stock.profit_loss_rate).toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div>
                        <div className="text-gray-400">보유수량</div>
                        <div className="font-medium">
                          {parseFloat(stock.quantity).toLocaleString()}주
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">평균단가</div>
                        <div className="font-medium">
                          {parseFloat(stock.avg_price).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">평가금액</div>
                        <div className="font-medium">
                          {parseFloat(stock.evaluation_amount).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 좌우 스와이프 버튼 - 항상 표시 */}
          {
            <>
              <button
                onClick={async () => await handleSwipe(-1)}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors z-20 mx-2"
                aria-label="이전 카드"
                style={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
                disabled={
                  isLoading ||
                  isStockSnapshotsLoading ||
                  isGroupedSnapshotsLoading
                }
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  className="text-gray-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p>Loading...</p>
                </div>
              ) : isStockSnapshotsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p>종목 스크랩 로딩 중...</p>
                </div>
              ) : isGroupedSnapshotsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p>그룹 스크랩 로딩 중...</p>
                </div>
              ) : selectedStockSnapshots.length > 0 ? (
                <CardViewer
                  cards={selectedStockSnapshots.map(convertToSnapshotCard)}
                  currentIndex={currentStockSnapshotIndex}
                  onSwipe={handleStockSnapshotSwipe}
                  onScrap={handleScrapClick}
                  onUnscrap={handleUnscrapClick}
                />
              ) : groupedSnapshots.length > 0 ? (
                <CardViewer
                  cards={groupedSnapshots.map(convertGroupedToSnapshotCard)}
                  currentIndex={currentGroupedSnapshotIndex}
                  onSwipe={handleGroupedSnapshotSwipe}
                  onScrap={handleScrapClick}
                  onUnscrap={handleUnscrapClick}
                />
              ) : currentSnapshot ? (
                <CardViewer
                  cards={currentSnapshots}
                  currentIndex={currentSnapshotIndex}
                  onSwipe={handleSwipe}
                  onScrap={handleScrapClick}
                  onUnscrap={handleUnscrapClick}
                />
              ) : null}
              <button
                onClick={async () => await handleSwipe(1)}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors z-20 mx-2"
                aria-label="다음 카드"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
                disabled={
                  isLoading ||
                  isStockSnapshotsLoading ||
                  isGroupedSnapshotsLoading
                }
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  className="text-gray-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          }
          {activeView === "stock" &&
            !currentSnapshot &&
            !isLoading &&
            selectedStockSnapshots.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <p>스크랩이 없습니다.</p>
              </div>
            )}
          {selectedStockSnapshots.length === 0 &&
            !isStockSnapshotsLoading &&
            !isLoading &&
            selectedGroupId !== null && (
              <div className="h-full flex items-center justify-center">
                <p>해당 종목의 스크랩이 없습니다.</p>
              </div>
            )}
          {groupedSnapshots.length === 0 &&
            !isGroupedSnapshotsLoading &&
            !isLoading &&
            selectedGroupId !== null && (
              <div className="h-full flex items-center justify-center">
                <p>해당 그룹의 스크랩이 없습니다.</p>
              </div>
            )}
          {(!unifiedStocks ||
            !unifiedStocks.stocks ||
            unifiedStocks.stocks.length === 0) &&
            !isLoading && (
              <div className="h-full flex items-center justify-center">
                <p>보유 종목이 없습니다.</p>
              </div>
            )}
        </main>
        <div className="relative z-20">
          <TrebleSelector
            activeView={activeView as "date" | "stock"}
            onViewChange={setActiveView}
            selectedGroupId={selectedGroupId}
            onGroupSelect={handleGroupChange}
            groups={groups}
            onAddGroup={handleAddGroup}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            snapshotsForDate={currentSnapshots}
            selectedSnapshotId={currentSnapshot?.snapshotId}
            onStockChange={handleStockChange}
            allowedDates={allowedDates}
            onStockEdge={handleStockEdge}
            portfolio={portfolio}
            onScrap={handleScrapClick}
            onStockClick={handleStockClick}
            unifiedStocks={unifiedStocks}
          />
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
