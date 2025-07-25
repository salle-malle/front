"use client";

import { useState, useEffect, useMemo } from "react";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import { DualSelector } from "@/src/components/ui/DualSelector";
import { SelectedDateDisplay } from "@/src/components/ui/SelectedDateDisplay";
import { CardViewer } from "@/src/components/ui/CardViewer";
import { SnapshotCard } from "@/src/types/SnapshotCard";
import { preloadImage } from "@/src/lib/image-preloader";
import React from "react";
import { useRouter } from "next/navigation";
import { UnifiedStockItem } from "@/src/types/SnapshotCard";
import { Toaster } from "@/src/components/ui/Sonner";

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

export default function CardsPage() {
  const [activeView, setActiveView] = useState<"date" | "stock">("date");
  // const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [snapshotsByDate, setSnapshotsByDate] = useState<{
    [date: string]: SnapshotCard[];
  }>({});
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<{
    [stockCode: string]: UnifiedStockItem;
  }>({});

  const [availableDates, setAvailableDates] = useState<string[]>([]);

  const allowedDates = useMemo(
    () => {
      const allDates = new Set<string>([
        ...Object.keys(snapshotsByDate),
        ...availableDates
      ]);
      return Array.from(allDates).sort();
    },
    [snapshotsByDate, availableDates]
  );

  const currentSnapshots = snapshotsByDate[selectedDate] || [];
  const currentSnapshot = currentSnapshots[currentSnapshotIndex];

  const viewOrder = ["date", "stock"] as const;
  const currentViewIndex = viewOrder.indexOf(activeView);

  useEffect(() => {
    const fetchAllSnapshots = async () => {
      setIsLoading(true);
      try {
        const [snapshotsResponse, portfolioResponse] = await Promise.all([
          fetchWithAuthCheck(
            `${process.env.NEXT_PUBLIC_BACK_API_URL}/member-stock-snapshots`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            },
            router
          ),
          fetchWithAuthCheck(
            `${process.env.NEXT_PUBLIC_BACK_API_URL}/kis/unified-stocks`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            },
            router
          ),
        ]);

        // portfolioResponse 구조 수정
        if (portfolioResponse.status && portfolioResponse.data?.stocks) {
          const portfolioItems: UnifiedStockItem[] =
            portfolioResponse.data.stocks;
          const portfolioMap = portfolioItems.reduce((acc, item) => {
            acc[item.pdno] = item;
            return acc;
          }, {} as { [stockCode: string]: UnifiedStockItem });
          setPortfolio(portfolioMap);
        }

        // 2. 스냅샷(카드) 데이터 처리
        // 응답 구조 확인: data.data.content 또는 data.content
        let fetchedData: SnapshotCard[] = [];
        
        if (
          snapshotsResponse &&
          snapshotsResponse.status &&
          snapshotsResponse.data
        ) {
          // API 응답 구조에 따라 데이터 추출
          if (Array.isArray(snapshotsResponse.data)) {
            // 직접 배열인 경우
            fetchedData = snapshotsResponse.data;
          } else if (snapshotsResponse.data.content && Array.isArray(snapshotsResponse.data.content)) {
            // content 필드에 배열이 있는 경우
            fetchedData = snapshotsResponse.data.content;
          }
        }
        
        if (fetchedData.length > 0) {

          // 날짜별로 그룹화
          const byDate: { [date: string]: SnapshotCard[] } = {};
          const datesFromAPI: string[] = [];
          
          fetchedData.forEach((snap) => {
            const date = snap.snapshotCreatedAt.split("T")[0];
            if (!byDate[date]) byDate[date] = [];
            byDate[date].push(snap);
            
            // API에서 받은 날짜들을 저장
            if (!datesFromAPI.includes(date)) {
              datesFromAPI.push(date);
            }
          });
          
          setSnapshotsByDate(byDate);
          setAvailableDates(datesFromAPI);

          // 기본 선택 날짜 설정 및 이미지 사전 로딩
          const dates = Object.keys(byDate).sort();
          if (dates.length > 0) {
            const latestDate = dates[dates.length - 1];
            setSelectedDate(latestDate);
            setCurrentSnapshotIndex(0);
            setActiveView("stock");

            byDate[latestDate].forEach((snap) => {
              preloadImage(snap.newsImage);
              if (snap.stockCode) {
                preloadImage(`/ticker-icon/${snap.stockCode}.png`);
              }
            });
          }
        } else {
          setSnapshotsByDate({});
          setAvailableDates([]);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        setSnapshotsByDate({});
        setPortfolio({});
        setAvailableDates([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllSnapshots();
  }, [router]); // router를 의존성 배열에 추가

  const fetchSnapshotsByDate = async (date: string) => {
    if (snapshotsByDate[date]) return;
    setIsLoading(true);
    try {
      const data = await fetchWithAuthCheck(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/member-stock-snapshots/by-date?date=${date}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
        router
      );
      if (data && data.status && Array.isArray(data.data)) {
        setSnapshotsByDate((prev) => ({ ...prev, [date]: data.data }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = async (date: string) => {
    // 이미 선택된 날짜라면 무시 (선택적)
    if (date === selectedDate) return;

    if (!snapshotsByDate[date]) {
      await fetchSnapshotsByDate(date);
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
      await fetchSnapshotsByDate(nextDate);
    }
    await handleDateChange(nextDate);
    setSelectedDate(nextDate);
    setActiveView("date");
    setCurrentSnapshotIndex(0);
  };

  // 뷰 전환 함수들 (scrap 페이지와 유사하게)
  const handleNextView = () => {
    const nextIndex = (currentViewIndex + 1) % viewOrder.length;
    setActiveView(viewOrder[nextIndex]);
  };

  const handlePrevView = () => {
    const prevIndex =
      (currentViewIndex - 1 + viewOrder.length) % viewOrder.length;
    setActiveView(viewOrder[prevIndex]);
  };

  const handleScrap = async (snapshotId: number): Promise<number | null> => {
    console.log("=== Cards Page handleScrap Debug ===");
    console.log("handleScrap called with snapshotId:", snapshotId);

    try {
      console.log("Making API request to /scrap");
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
        console.log("스크랩에 추가되었습니다.");
        // 스크랩 ID 반환 (실제 응답 구조에 따라 조정 필요)
        return response.data?.id || response.data?.scrapId || null;
      } else {
        console.error(response.message || "스크랩 추가에 실패했습니다.");
        throw new Error(response.message || "스크랩 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("Scrap request failed:", error);
      throw error;
    }
  };

  const handleUnscrap = async (snapshotId: number): Promise<void> => {
    console.log("=== Cards Page handleUnscrap Debug ===");
    console.log("handleUnscrap called with snapshotId:", snapshotId);

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
      if (statusResponse.data?.scrapped && statusResponse.data?.scrapId) {
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
        } else {
          throw new Error(
            deleteResponse.message || "스크랩 제거에 실패했습니다."
          );
        }
      } else {
        console.log("Snapshot is not scraped, no need to delete");
      }
    } catch (error) {
      console.error("Unscrap request failed:", error);
      throw error;
    }
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

  return (
    <div className="flex flex-col h-screen mx-auto bg-white overflow-hidden">
      <Toaster />

      <TopNavigation />
      <SelectedDateDisplay date={selectedDate} />
      <div className="relative flex-1">
        <main className="absolute inset-0 top-[5px] flex items-center justify-center">
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
            disabled={isLoading}>
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className="text-gray-600">
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
          ) : currentSnapshot ? (
            <CardViewer
              cards={currentSnapshots}
              currentIndex={currentSnapshotIndex}
              onSwipe={handleSwipe}
              onScrap={handleScrap}
              onUnscrap={handleUnscrap}
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
            disabled={isLoading}>
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className="text-gray-600">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          {activeView === "stock" && !currentSnapshot && !isLoading && (
            <div className="h-full flex items-center justify-center">
              <p>뉴스가 없습니다.</p>
            </div>
          )}
        </main>
        <div className="relative z-20">
          <DualSelector
            activeView={activeView}
            onViewChange={setActiveView}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            snapshotsForDate={currentSnapshots}
            selectedSnapshotId={currentSnapshot?.snapshotId}
            onStockChange={handleStockChange}
            allowedDates={allowedDates}
            onStockEdge={handleStockEdge}
            portfolio={portfolio}
            onScrap={handleScrap}
            onNextView={handleNextView}
            onPrevView={handlePrevView}
          />
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
