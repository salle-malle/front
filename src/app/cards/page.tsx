"use client";

import { useState, useEffect, useMemo } from "react";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import { DualSelector } from "@/src/components/ui/DualSelector";
import { SelectedDateDisplay } from "@/src/components/ui/SelectedDateDisplay";
import { CardViewer } from "@/src/components/ui/CardViewer";
import { SnapshotCard, UnifiedStockItem } from "@/src/types/SnapshotCard";
import { preloadImage } from "@/src/lib/image-preloader";
import React from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "@/src/components/ui/Sonner";
import { toast } from "sonner";

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

export default function CardsPage() {
  const [activeView, setActiveView] = useState<"date" | "stock">("date");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [snapshotsByDate, setSnapshotsByDate] = useState<{
    [date: string]: SnapshotCard[];
  }>({});
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const allowedDates = useMemo(
    () => Object.keys(snapshotsByDate).sort(),
    [snapshotsByDate]
  );

  const currentSnapshots = snapshotsByDate[selectedDate] || [];
  const currentSnapshot = currentSnapshots[currentSnapshotIndex];
  const [portfolio, setPortfolio] = useState<
    { [stockCode: string]: UnifiedStockItem } | undefined
  >(undefined);

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

      if (portfolioResponse?.status && portfolioResponse.data?.stocks) {
        const portfolioItems: UnifiedStockItem[] =
          portfolioResponse.data.stocks;
        const portfolioMap = portfolioItems.reduce((acc, item) => {
          acc[item.pdno] = item; // pdno (상품번호/종목코드)를 key로 사용
          return acc;
        }, {} as { [stockCode: string]: UnifiedStockItem });

        console.log("Portfolio fetched:", portfolioMap);
        setPortfolio(portfolioMap);
      } else {
        setPortfolio({}); // 데이터가 없는 경우 빈 객체로 초기화
      }
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
      setPortfolio({}); // 에러 발생 시 빈 객체로 초기화
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);

      // 스냅샷과 포트폴리오를 동시에 요청하여 병렬로 처리
      await Promise.all([fetchAllSnapshots(), fetchAllPortfolio()]);

      setIsLoading(false);
    };

    const fetchAllSnapshots = async () => {
      setIsLoading(true);
      try {
        const data = await fetchWithAuthCheck(
          `${process.env.NEXT_PUBLIC_BACK_API_URL}/member-stock-snapshots?sort=createdAt,asc`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          },
          router
        );

        if (
          data &&
          data.status &&
          data.data &&
          Array.isArray(data.data.content)
        ) {
          const fetchedData: SnapshotCard[] = data.data.content;
          fetchedData.forEach((snap) => {
            preloadImage(snap.newsImage);
            if (snap.stockCode) {
              preloadImage(`/ticker-icon/${snap.stockCode}.png`);
            }
          });

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
        } else {
          setSnapshotsByDate({});
        }
      } catch {
        setSnapshotsByDate({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [router]);

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

  const handleSwipe = async (direction: number) => {
    const newIndex = currentSnapshotIndex + direction;
    if (newIndex >= 0 && newIndex < currentSnapshots.length) {
      setCurrentSnapshotIndex(newIndex);
      if (activeView === "date") setActiveView("stock");
    } else {
      await handleStockEdge(direction < 0 ? "left" : "right");
    }
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

  const handleScrapClick = async (snapshotId: number) => {
    try {
      const response = await fetchWithAuthCheck(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/scraps`, // API 엔드포인트 확인
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ memberStockSnapshotId: snapshotId }),
        },
        router
      );

      if (response.success) {
        // 성공 시 toast.success()를 호출합니다.
        toast.success("스크랩에 추가되었습니다.");
      } else {
        // 실패 시 toast.error()를 호출합니다.
        toast.error(response.message || "스크랩 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("Scrap request failed:", error);
      toast.error("스크랩 추가 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-[480px] mx-auto bg-white overflow-hidden">
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
            disabled={isLoading}
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
          ) : currentSnapshot ? (
            <CardViewer
              cards={currentSnapshots}
              currentIndex={currentSnapshotIndex}
              onSwipe={handleSwipe}
              onScrap={handleScrapClick}
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
            disabled={isLoading}
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
            onScrap={handleScrapClick}
          />
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
