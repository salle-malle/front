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

export default function CardsPage() {
  const [activeView, setActiveView] = useState<"date" | "stock">("date");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [snapshotsByDate, setSnapshotsByDate] = useState<{
    [date: string]: SnapshotCard[];
  }>({});
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const allowedDates = useMemo(
    () => Object.keys(snapshotsByDate).sort(),
    [snapshotsByDate]
  );

  const currentSnapshots = snapshotsByDate[selectedDate] || [];
  const currentSnapshot = currentSnapshots[currentSnapshotIndex];

  useEffect(() => {
    const fetchAllSnapshots = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_API_URL}/member-stock-snapshots?sort=createdAt,asc`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const data = await response.json();
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
    fetchAllSnapshots();
  }, []);

  const fetchSnapshotsByDate = async (date: string) => {
    if (snapshotsByDate[date]) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/member-stock-snapshots/by-date?date=${date}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data && data.status && Array.isArray(data.data)) {
        setSnapshotsByDate((prev) => ({ ...prev, [date]: data.data }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // const handleDateChange = async (date: string) => {
  //   if (!snapshotsByDate[date]) {
  //     await fetchSnapshotsByDate(date);
  //   }
  //   const snapshotsForSelectedDate = snapshotsByDate[date] || [];
  //   snapshotsForSelectedDate.forEach((snap) => {
  //     preloadImage(snap.newsImage);
  //     if (snap.stockCode) {
  //       preloadImage(`/ticker-icon/${snap.stockCode}.png`);
  //     }
  //   });
  //   setSelectedDate(date);
  //   setCurrentSnapshotIndex(date === selectedDate ? currentSnapshotIndex : 0);
  //   setActiveView("stock");
  // };

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
    setActiveView("stock"); // ✅ 꼭 필요!
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

  return (
    <div className="flex flex-col h-screen max-w-[480px] mx-auto bg-white overflow-hidden">
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
          />
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}

// "use client";

// import { useState, useEffect, useMemo } from "react";
// import { TopNavigation } from "@/src/components/top-navigation";
// import { BottomNavigation } from "@/src/components/bottom-navigation";
// import { DualSelector } from "@/src/components/ui/DualSelector";
// import { SelectedDateDisplay } from "@/src/components/ui/SelectedDateDisplay";
// import { CardViewer } from "@/src/components/ui/CardViewer";
// import { SnapshotCard } from "@/src/types/SnapshotCard"; // 이전에 만든 타입 import
// import { preloadImage } from "@/src/lib/image-preloader";
// import React from "react"; // React import 추가

// export default function CardsPage() {
//   const [activeView, setActiveView] = useState<"date" | "stock">("date");
//   const [selectedDate, setSelectedDate] = useState<string>("");
//   const [snapshotsByDate, setSnapshotsByDate] = useState<{
//     [date: string]: SnapshotCard[];
//   }>({});
//   const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);

//   // 날짜 목록
//   const allowedDates = useMemo(
//     () => Object.keys(snapshotsByDate).sort(),
//     [snapshotsByDate]
//   );
//   // 현재 날짜의 카드 목록
//   const currentSnapshots = snapshotsByDate[selectedDate] || [];
//   // 현재 카드
//   const currentSnapshot = currentSnapshots[currentSnapshotIndex];

//   // 최초 진입 시 전체 카드 목록 패칭
//   useEffect(() => {
//     const fetchAllSnapshots = async () => {
//       setIsLoading(true);
//       try {
//         const response = await fetch(
//           `${process.env.NEXT_PUBLIC_BACK_API_URL}/member-stock-snapshots?sort=createdAt,asc`,
//           {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//             credentials: "include",
//           }
//         );
//         const data = await response.json();
//         if (
//           data &&
//           data.status &&
//           data.data &&
//           Array.isArray(data.data.content)
//         ) {
//           const fetchedData: SnapshotCard[] = data.data.content;

//           fetchedData.forEach((snap) => {
//             preloadImage(snap.newsImage);
//             if (snap.stockCode) {
//               preloadImage(`/ticker-icon/${snap.stockCode}.png`);
//             }
//           });

//           const byDate: { [date: string]: SnapshotCard[] } = {};
//           fetchedData.forEach((snap) => {
//             const date = snap.snapshotCreatedAt.split("T")[0];
//             if (!byDate[date]) byDate[date] = [];
//             byDate[date].push(snap);
//           });
//           setSnapshotsByDate(byDate);

//           const dates = Object.keys(byDate).sort();
//           if (dates.length > 0) {
//             setSelectedDate(dates[dates.length - 1]);

//             setCurrentSnapshotIndex(0);
//             setActiveView("date");
//           }
//         } else {
//           setSnapshotsByDate({});
//         }
//       } catch (error) {
//         setSnapshotsByDate({});
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchAllSnapshots();
//   }, []);

//   // 날짜별 카드 조회 (필요시 서버에서 받아와 캐싱)
//   const fetchSnapshotsByDate = async (date: string) => {
//     if (snapshotsByDate[date]) return; // 이미 있으면 패스
//     setIsLoading(true);
//     try {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_BACK_API_URL}/member-stock-snapshots/by-date?date=${date}`,
//         {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//         }
//       );
//       const data = await response.json();
//       if (data && data.status && Array.isArray(data.data)) {
//         setSnapshotsByDate((prev) => ({ ...prev, [date]: data.data }));
//       }
//     } catch (error) {
//       // ignore
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // DualSelector 드래그로 뷰 전환
//   const handleViewChange = (view: "date" | "stock") => {
//     setActiveView(view);
//   };

//   // 날짜 선택 시
//   const handleDateChange = async (date: string) => {
//     if (!snapshotsByDate[date]) {
//       await fetchSnapshotsByDate(date);
//     }

//     const snapshotsForSelectedDate = snapshotsByDate[date] || [];
//     // snapshotsForSelectedDate.forEach((snap) => preloadImage(snap.newsImage));

//     snapshotsForSelectedDate.forEach((snap) => {
//       preloadImage(snap.newsImage);
//       if (snap.stockCode) {
//         preloadImage(`/ticker-icon/${snap.stockCode}.png`); // ticker-icons -> ticker-icon
//       }
//     });

//     setSelectedDate(date);
//     // 같은 날짜를 선택하면 인덱스 리셋하지 않음
//     setCurrentSnapshotIndex((prevIdx) => {
//       if (date === selectedDate) return prevIdx;
//       return 0;
//     });
//     setActiveView("stock");
//   };

//   // 날짜나 currentSnapshots가 바뀔 때 인덱스 보정
//   React.useEffect(() => {
//     if (!currentSnapshots.length) return;
//     setCurrentSnapshotIndex((prevIdx) => {
//       if (prevIdx >= currentSnapshots.length) {
//         return currentSnapshots.length - 1;
//       }
//       return prevIdx;
//     });
//   }, [selectedDate, currentSnapshots.length]);

//   // selectedDate가 바뀔 때마다 currentSnapshotIndex를 0으로 명확히 세팅 (최초 진입 포함)
//   React.useEffect(() => {
//     setCurrentSnapshotIndex(0);
//   }, [selectedDate]);

//   // activeView가 'stock'으로 바뀔 때마다 currentSnapshotIndex를 보정
//   React.useEffect(() => {
//     if (activeView === "stock" && currentSnapshots.length > 0) {
//       setCurrentSnapshotIndex((prevIdx) => {
//         if (prevIdx >= currentSnapshots.length) return 0;
//         return prevIdx;
//       });
//     }
//   }, [activeView, currentSnapshots.length]);

//   // activeView가 'date'로 바뀔 때마다 currentSnapshotIndex를 0으로 세팅
//   React.useEffect(() => {
//     if (activeView === "date" && currentSnapshots.length > 0) {
//       setCurrentSnapshotIndex(0);
//     }
//   }, [activeView, currentSnapshots.length]);

//   // StockSelector에서 카드 선택
//   const handleStockChange = (snapshotId: number) => {
//     const idx = currentSnapshots.findIndex((s) => s.snapshotId === snapshotId);
//     if (idx !== -1) setCurrentSnapshotIndex(idx);
//   };

//   // // StockSelector에서 끝에 도달
//   // const handleStockEdge = (direction: "left" | "right") => {
//   //   const idx = allowedDates.indexOf(selectedDate);
//   //   const nextDate =
//   //     direction === "left" ? allowedDates[idx - 1] : allowedDates[idx + 1];
//   //   if (nextDate) {
//   //     setSelectedDate(nextDate);
//   //     setActiveView("date");
//   //     // 새 날짜의 카드 개수보다 인덱스가 크면 마지막 카드로 보정
//   //     const nextSnapshots = snapshotsByDate[nextDate] || [];
//   //     setCurrentSnapshotIndex((prevIdx) => {
//   //       if (nextSnapshots.length === 0) return 0;
//   //       return Math.min(prevIdx, nextSnapshots.length - 1);
//   //     });
//   //     if (!snapshotsByDate[nextDate]) fetchSnapshotsByDate(nextDate);
//   //   }
//   // };

//   const handleStockEdge = async (direction: "left" | "right") => {
//     const idx = allowedDates.indexOf(selectedDate);
//     const nextDate =
//       direction === "left" ? allowedDates[idx - 1] : allowedDates[idx + 1];

//     if (!nextDate) return;

//     if (!snapshotsByDate[nextDate]) {
//       await fetchSnapshotsByDate(nextDate);
//     }

//     const newSnapshots = snapshotsByDate[nextDate] || [];

//     setSelectedDate(nextDate);
//     setActiveView("date");
//     setCurrentSnapshotIndex(0); // ✅ 항상 새 날짜의 첫 번째 카드부터 보여줌
//   };

//   // // CardViewer에서 좌/우 드래그
//   // const handleSwipe = (direction: number) => {
//   //   const newIndex = currentSnapshotIndex + direction;
//   //   if (newIndex >= 0 && newIndex < currentSnapshots.length) {
//   //     setCurrentSnapshotIndex(newIndex);
//   //     if (activeView === "date") setActiveView("stock"); // 카드 넘기면 종목바로 전환
//   //   } else {
//   //     // 끝에 도달: 날짜 이동
//   //     handleStockEdge(direction < 0 ? "left" : "right");
//   //   }
//   // };

//   const handleSwipe = async (direction: number) => {
//     const newIndex = currentSnapshotIndex + direction;

//     if (newIndex >= 0 && newIndex < currentSnapshots.length) {
//       setCurrentSnapshotIndex(newIndex);
//       if (activeView === "date") setActiveView("stock");
//     } else {
//       await handleStockEdge(direction < 0 ? "left" : "right");
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen max-w-[480px] mx-auto bg-white overflow-hidden">
//       <TopNavigation />
//       <SelectedDateDisplay date={selectedDate} />
//       <div className="relative flex-1">
//         {/* CardViewer는 항상 아래에 깔림 */}
//         <main className="absolute inset-0 top-[5px] flex items-center justify-center">
//           {/* 왼쪽 카드 넘기기 버튼 */}
//           <button
//             onClick={async () => await handleSwipe(-1)}
//             className="p-1 rounded-full hover:bg-gray-200 transition-colors z-20 mx-2"
//             aria-label="이전 카드"
//             style={{
//               position: "absolute",
//               left: 0,
//               top: "50%",
//               transform: "translateY(-50%)",
//             }}
//             disabled={isLoading || currentSnapshotIndex === 0}
//           >
//             <svg
//               width="20"
//               height="20"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               viewBox="0 0 24 24"
//               className="text-gray-600"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M15 19l-7-7 7-7"
//               />
//             </svg>
//           </button>
//           {/* 카드 뷰어 */}
//           {isLoading ? (
//             <div className="h-full flex items-center justify-center">
//               <p>Loading...</p>
//             </div>
//           ) : currentSnapshot ? (
//             <CardViewer
//               cards={currentSnapshots}
//               currentIndex={currentSnapshotIndex}
//               onSwipe={handleSwipe}
//             />
//           ) : null}
//           {/* 오른쪽 카드 넘기기 버튼 */}
//           <button
//             onClick={async () => await handleSwipe(1)}
//             className="p-1 rounded-full hover:bg-gray-200 transition-colors z-20 mx-2"
//             aria-label="다음 카드"
//             style={{
//               position: "absolute",
//               right: 0,
//               top: "50%",
//               transform: "translateY(-50%)",
//             }}
//             disabled={
//               isLoading ||
//               currentSnapshotIndex === currentSnapshots.length - 1 ||
//               currentSnapshots.length === 0
//             }
//           >
//             <svg
//               width="20"
//               height="20"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               viewBox="0 0 24 24"
//               className="text-gray-600"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M9 5l7 7-7 7"
//               />
//             </svg>
//           </button>
//           {activeView === "stock" && !currentSnapshot && !isLoading && (
//             <div className="h-full flex items-center justify-center">
//               <p>뉴스가 없습니다.</p>
//             </div>
//           )}
//         </main>
//         {/* DualSelector 드래그 바는 항상 위에 떠 있음 */}
//         <div className="relative z-20">
//           <DualSelector
//             activeView={activeView}
//             onViewChange={handleViewChange}
//             selectedDate={selectedDate}
//             onDateChange={handleDateChange}
//             snapshotsForDate={currentSnapshots}
//             selectedSnapshotId={currentSnapshot?.snapshotId}
//             onStockChange={handleStockChange}
//             allowedDates={allowedDates}
//             onStockEdge={handleStockEdge}
//           />
//         </div>
//       </div>
//       <BottomNavigation />
//     </div>
//   );
// }
