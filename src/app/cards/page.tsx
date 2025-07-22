"use client";

import { useState, useEffect, useMemo } from "react";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import { DualSelector } from "@/src/components/ui/DualSelector";
import { SelectedDateDisplay } from "@/src/components/ui/SelectedDateDisplay";
import { CardViewer } from "@/src/components/ui/CardViewer";
import { SnapshotCard } from "@/src/types/SnapshotCard";
import React from "react";
import { useRouter } from "next/navigation";

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

  // 날짜 목록
  const allDates = useMemo(
    () => Object.keys(snapshotsByDate).sort(),
    [snapshotsByDate]
  );
  // 현재 날짜의 카드 목록
  const currentSnapshots = snapshotsByDate[selectedDate] || [];
  // 현재 카드
  const currentSnapshot = currentSnapshots[currentSnapshotIndex];

  // 최초 진입 시 전체 카드 목록 패칭
  useEffect(() => {
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
          // 날짜별로 그룹화
          const byDate: { [date: string]: SnapshotCard[] } = {};
          fetchedData.forEach((snap) => {
            const date = snap.snapshotCreatedAt.split("T")[0];
            if (!byDate[date]) byDate[date] = [];
            byDate[date].push(snap);
          });
          setSnapshotsByDate(byDate);
          // 기본 선택 날짜: 가장 최근 날짜
          const dates = Object.keys(byDate).sort();
          if (dates.length > 0) {
            setSelectedDate(dates[dates.length - 1]);
            setCurrentSnapshotIndex(0);
            setActiveView("date");
          }
        } else {
          setSnapshotsByDate({});
        }
      } catch (error) {
        setSnapshotsByDate({});
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllSnapshots();
  }, [router]);

  // 날짜별 카드 조회 (필요시 서버에서 받아와 캐싱)
  const fetchSnapshotsByDate = async (date: string) => {
    if (snapshotsByDate[date]) return; // 이미 있으면 패스
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
    } catch (error) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  // DualSelector 드래그로 뷰 전환
  const handleViewChange = (view: "date" | "stock") => {
    setActiveView(view);
  };

  // 날짜 선택 시
  const handleDateChange = async (date: string) => {
    if (!snapshotsByDate[date]) {
      await fetchSnapshotsByDate(date);
    }
    setSelectedDate(date);
    setCurrentSnapshotIndex(0);
    setActiveView("stock");
  };

  // StockSelector에서 카드 선택
  const handleStockChange = (snapshotId: number) => {
    const idx = currentSnapshots.findIndex((s) => s.snapshotId === snapshotId);
    if (idx !== -1) setCurrentSnapshotIndex(idx);
  };

  // StockSelector에서 끝에 도달
  const handleStockEdge = (direction: "left" | "right") => {
    const idx = allDates.indexOf(selectedDate);
    const nextDate =
      direction === "left" ? allDates[idx - 1] : allDates[idx + 1];
    if (nextDate) {
      setSelectedDate(nextDate);
      setCurrentSnapshotIndex(0);
      setActiveView("date");
      if (!snapshotsByDate[nextDate]) fetchSnapshotsByDate(nextDate);
    }
  };

  // CardViewer에서 좌/우 드래그
  const handleSwipe = (direction: number) => {
    const newIndex = currentSnapshotIndex + direction;
    if (newIndex >= 0 && newIndex < currentSnapshots.length) {
      setCurrentSnapshotIndex(newIndex);
    } else {
      // 끝에 도달: 날짜 이동
      handleStockEdge(direction < 0 ? "left" : "right");
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-[480px] mx-auto bg-white overflow-hidden">
      <TopNavigation />
      <SelectedDateDisplay date={selectedDate} />
      <div className="relative flex-1">
        {/* CardViewer는 항상 아래에 깔림 */}
        <main className="absolute inset-0 top-[90px] flex items-center justify-center">
          {/* 왼쪽 카드 넘기기 버튼 */}
          <button
            onClick={() => handleSwipe(-1)}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors z-20 mx-2"
            aria-label="이전 카드"
            style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}
            disabled={isLoading || currentSnapshotIndex === 0}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          {/* 카드 뷰어 */}
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p>Loading...</p>
            </div>
          ) : currentSnapshot ? (
            <CardViewer
              key={currentSnapshot.snapshotId}
              card={currentSnapshot}
              onSwipe={handleSwipe}
            />
          ) : null}
          {/* 오른쪽 카드 넘기기 버튼 */}
          <button
            onClick={() => handleSwipe(1)}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors z-20 mx-2"
            aria-label="다음 카드"
            style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}
            disabled={isLoading || currentSnapshotIndex === currentSnapshots.length - 1 || currentSnapshots.length === 0}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
          {activeView === "stock" && !currentSnapshot && !isLoading && (
            <div className="h-full flex items-center justify-center">
              <p>뉴스가 없습니다.</p>
            </div>
          )}
        </main>
        {/* DualSelector 드래그 바는 항상 위에 떠 있음 */}
        <div className="absolute left-0 right-0 top-0 z-10">
          <DualSelector
            activeView={activeView}
            onViewChange={handleViewChange}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            snapshotsForDate={currentSnapshots}
            selectedSnapshotId={currentSnapshot?.snapshotId}
            onStockChange={handleStockChange}
            allowedDates={allDates}
            onStockEdge={handleStockEdge}
          />
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
