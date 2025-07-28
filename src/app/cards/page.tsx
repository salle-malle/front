"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);
  const [isFromStockEdge, setIsFromStockEdge] = useState(false);
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<{
    [stockCode: string]: UnifiedStockItem;
  }>({});

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  
  // 이전 selectedDate를 추적하기 위한 ref
  const prevSelectedDateRef = useRef(selectedDate);
  // 이전 activeView를 추적하기 위한 ref
  const prevActiveViewRef = useRef(activeView);

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

  const currentSnapshots = useMemo(() => snapshotsByDate[selectedDate] || [], [snapshotsByDate, selectedDate]);
  const currentSnapshot = useMemo(() => currentSnapshots[currentSnapshotIndex], [currentSnapshots, currentSnapshotIndex]) ;
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
    // 날짜 변경 시 카드 인덱스를 즉시 설정
    setCurrentSnapshotIndex(0);
    setActiveView("stock");
  };

  useEffect(() => {
    if (currentSnapshotIndex >= currentSnapshots.length) {
      setCurrentSnapshotIndex(currentSnapshots.length - 1);
    }
  }, [selectedDate, currentSnapshots.length]);

  useEffect(() => {
    if (selectedDate !== prevSelectedDateRef.current && !isViewTransitioning && !isFromStockEdge) {
      setCurrentSnapshotIndex(0);
    } else if (selectedDate !== prevSelectedDateRef.current && isViewTransitioning) {
      // 뷰 전환 중이므로 첫 번째 카드로 이동하지 않음
    } else {
      // selectedDate가 변경되지 않았거나 뷰 전환 중이므로 첫 번째 카드로 이동하지 않음
    }
    
    // 현재 selectedDate를 이전 값으로 저장
    prevSelectedDateRef.current = selectedDate;
  }, [selectedDate, isViewTransitioning, isFromStockEdge]);

  useEffect(() => {
    if (activeView === "stock" && currentSnapshots.length > 0) {
      // currentIndex가 유효한 범위를 벗어났을 때만 조정
      if (currentSnapshotIndex >= currentSnapshots.length) {
        setCurrentSnapshotIndex(0);
      }
    }
  }, [activeView, currentSnapshots.length, currentSnapshotIndex]);

  useEffect(() => {
    if (activeView === "date" && activeView !== prevActiveViewRef.current && !isViewTransitioning) {
      setCurrentSnapshotIndex(0);
    } else if (activeView === "date" && activeView !== prevActiveViewRef.current && isViewTransitioning) {
      // 뷰 전환 중이므로 첫 번째 카드로 이동하지 않음
    } else {
    }
    
    prevActiveViewRef.current = activeView;
  }, [activeView, isViewTransitioning]);

  const handleStockChange = (snapshotId: number) => {
    const idx = currentSnapshots.findIndex((s) => s.snapshotId === snapshotId);
    if (idx !== -1) setCurrentSnapshotIndex(idx);
  };

  const handleStockEdge = async (direction: "left" | "right") => {
    const idx = allowedDates.indexOf(selectedDate);
    
    const nextDate =
      direction === "left" ? allowedDates[idx - 1] : allowedDates[idx + 1];
    
    if (!nextDate) {
      return;
    }
    
    if (!snapshotsByDate[nextDate]) {
      await fetchSnapshotsByDate(nextDate);
    }
    
    // 다음 날짜의 카드 배열 가져오기
    const nextDateSnapshots = snapshotsByDate[nextDate] || [];
    
    // 왼쪽으로 이동할 때는 이전 날짜의 마지막 카드, 오른쪽으로 이동할 때는 다음 날짜의 첫 번째 카드
    const targetIndex = direction === "left" ? nextDateSnapshots.length - 1 : 0;

    // 먼저 플래그를 설정하고, 그 다음에 상태를 변경
    setIsFromStockEdge(true);
    setCurrentSnapshotIndex(Math.max(0, targetIndex));
    
    // 약간의 지연 후 날짜 변경 (useEffect가 실행되지 않도록)
    setTimeout(() => {
      setSelectedDate(nextDate);
      // 플래그 리셋을 지연시킴
      setTimeout(() => {
        setIsFromStockEdge(false);
      }, 100);
    }, 50);
  };

  // 뷰 전환 함수들 (scrap 페이지와 유사하게)
  const handleNextView = () => {
    setIsViewTransitioning(true);
    const nextIndex = (currentViewIndex + 1) % viewOrder.length;
    setActiveView(viewOrder[nextIndex]);
    // 뷰 전환 완료 후 상태 리셋
    setTimeout(() => {
      setIsViewTransitioning(false);
    }, 500);
  };

  const handlePrevView = () => {
    setIsViewTransitioning(true);
    const prevIndex =
      (currentViewIndex - 1 + viewOrder.length) % viewOrder.length;
    setActiveView(viewOrder[prevIndex]);
    // 뷰 전환 완료 후 상태 리셋
    setTimeout(() => {
      setIsViewTransitioning(false);
    }, 500);
  };

  const handleScrap = useCallback(async (snapshotId: number): Promise<number | null> => {

    try {
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

      if (response.status) {
        // 스크랩 ID 반환 (실제 응답 구조에 따라 조정 필요)
        return response.data?.id || response.data?.scrapId || null;
      } else {
        throw new Error(response.message || "스크랩 추가에 실패했습니다.");
      }
    } catch (error) {
      throw error;
    }
  }, [router]);

  const handleUnscrap = useCallback(async (snapshotId: number): Promise<void> => {

    try {
      // 먼저 스크랩 상태를 확인
      const statusResponse = await fetchWithAuthCheck(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrap/status/${snapshotId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
        router
      );

      if (!statusResponse.status) {
        throw new Error("스크랩 상태를 확인할 수 없습니다.");
      }

      // 스크랩 상태가 true이고 scrapId가 있는 경우에만 삭제 시도
      if (statusResponse.data?.scrapped && statusResponse.data?.scrapId) {

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
        } else {
          throw new Error(
            deleteResponse.message || "스크랩 제거에 실패했습니다."
          );
        }
      } else {
      }
    } catch (error) {
      throw error;
    }
  }, [router]);

  // 스크랩 삭제 성공 시 로컬 상태 업데이트
  const handleUnscrapSuccess = useCallback((snapshotId: number) => {
    setSnapshotsByDate(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(date => {
        updated[date] = updated[date].map(card => {
          if (card.snapshotId === snapshotId) {
            return { ...card, isScrap: false };
          }
          return card;
        });
      });
      return updated;
    });
  }, []);

  const handleSwipe = useCallback(async (direction: number) => {
    
    const newIndex = currentSnapshotIndex + direction;
    
    if (newIndex >= 0 && newIndex < currentSnapshots.length) {
      setCurrentSnapshotIndex(newIndex);
      if (activeView === "date") setActiveView("stock");
    } else {
      await handleStockEdge(direction < 0 ? "left" : "right");
    }
  }, [currentSnapshotIndex, currentSnapshots.length, activeView, handleStockEdge]);

  const onCardClick = useCallback((index: number) => {
    setCurrentSnapshotIndex(index);
    setActiveView("stock");
  }, []);

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
              onCardClick={onCardClick}
              onScrap={handleScrap}
              onUnscrap={handleUnscrap}
              onUnscrapSuccess={handleUnscrapSuccess}
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
            isViewTransitioning={isViewTransitioning}
          />
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
