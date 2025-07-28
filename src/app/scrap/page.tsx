"use client";

import { useState, useEffect, useMemo } from "react";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import { TrebleSelector } from "@/src/components/scrap/TrebleSelector";
import { ScrapGroupSelector } from "@/src/components/scrap/ScrapGroupSelector";
import { SelectedDateDisplay } from "@/src/components/ui/SelectedDateDisplay";
import { ScrapCardViewer } from "@/src/components/scrap/ScrapCardViewer";
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

// 그룹 상세 정보를 위한 새로운 타입
interface GroupDetailResponseDto {
  snapshotId: number;
  snapshotCreatedAt: string;
  personalizedComment: string;
  stockCode: string;
  stockName: string;
  newsContent: string;
  newsImage: string;
  scrapGroupId: number;
  scrapGroupName: string;
  scrap: boolean;
  scrapGroupedId?: number; // 그룹에서 삭제할 때 사용하는 ID
}
import { StockLogo } from "@/src/components/ui/StockLogo";
import { AddGroupDialog } from "@/src/components/ui/AddGroupDialog";
import { ScrapStockList } from "@/src/components/scrap/ScrapStockList";

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
  const [activeView, setActiveView] = useState<"date" | "stock" | "stocklist">(
    "stocklist"
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

  const [stockAllowedDates, setStockAllowedDates] = useState<string[]>([]);

  const allowedDates = useMemo(() => {
    const baseDates = Object.keys(snapshotsByDate).sort();
    const combinedDates = [...new Set([...baseDates, ...stockAllowedDates])];
    return combinedDates.sort();
  }, [snapshotsByDate, stockAllowedDates]);

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

  // 그룹 상세 정보 관련 상태
  const [groupDetailSnapshots, setGroupDetailSnapshots] = useState<GroupDetailResponseDto[]>([]);
  const [isGroupDetailLoading, setIsGroupDetailLoading] = useState(false);
  const [currentGroupDetailIndex, setCurrentGroupDetailIndex] = useState(0);

  // 그룹 추가 관련 상태
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [isAddingGroup, setIsAddingGroup] = useState(false);

  // 종목 선택 상태 (그룹 선택과 별도로 관리)
  const [selectedStockCode, setSelectedStockCode] = useState<string | null>(
    null
  );

  // 종목별 스크랩을 선택된 날짜로 필터링 (종목별 카드에서는 필터링 제거)
  const filteredStockSnapshots = selectedStockSnapshots; // 모든 카드 표시
  
  // 날짜별 분류 확인
  const stockDates = selectedStockSnapshots.map(s => s.snapshotCreatedAt.split("T")[0]);

  // 그룹 상세 정보에서 날짜별로 스냅샷 분류
  const groupDetailSnapshotsByDate = useMemo(() => {
    const snapshotsByDate: { [date: string]: GroupDetailResponseDto[] } = {};
    
    groupDetailSnapshots.forEach((snapshot) => {
      const date = snapshot.snapshotCreatedAt.split("T")[0];
      if (!snapshotsByDate[date]) {
        snapshotsByDate[date] = [];
      }
      snapshotsByDate[date].push(snapshot);
    });
    
    return snapshotsByDate;
  }, [groupDetailSnapshots]);

  // 그룹 상세 정보의 날짜 목록
  const groupDetailAllowedDates = useMemo(() => {
    return Object.keys(groupDetailSnapshotsByDate).sort();
  }, [groupDetailSnapshotsByDate]);

  // 현재 선택된 날짜의 그룹 상세 스냅샷
  const currentGroupDetailSnapshots = useMemo(() => {
    const snapshots = groupDetailSnapshotsByDate[selectedDate] || [];
    return snapshots;
  }, [groupDetailSnapshotsByDate, selectedDate]);

  const currentSnapshots = snapshotsByDate[selectedDate] || [];
  const currentSnapshot = currentSnapshots[currentSnapshotIndex];
  const currentStockSnapshot =
    filteredStockSnapshots[currentStockSnapshotIndex];
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
        setUnifiedStocks(unifiedStockData);

        if (unifiedStockData.stocks) {
          const portfolioItems: UnifiedStockItem[] = unifiedStockData.stocks;
          const portfolioMap = portfolioItems.reduce((acc, item) => {
            acc[item.pdno] = item;
            return acc;
          }, {} as { [stockCode: string]: UnifiedStockItem });

          setPortfolio(portfolioMap);
        } else {
          setPortfolio({});
        }
      } else {
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
        
        // 날짜순으로 정렬 (오래된 날짜가 먼저)
        const sortedSnapshots = snapshots.sort((a, b) => 
          new Date(a.snapshotCreatedAt).getTime() - new Date(b.snapshotCreatedAt).getTime()
        );
        
        setSelectedStockSnapshots(sortedSnapshots);
        setCurrentStockSnapshotIndex(0);

        // 종목별 스크랩 데이터에서 날짜 추출
        const stockDates = sortedSnapshots
          .map((snapshot) => snapshot.snapshotCreatedAt.split("T")[0])
          .sort();

        // 이미지 프리로드
        sortedSnapshots.forEach((snapshot) => {
          preloadImage(snapshot.newsImage);
          if (snapshot.stockCode) {
            preloadImage(`/ticker-icon/${snapshot.stockCode}.png`);
          }
        });

        // 종목별 스크랩 날짜를 stockAllowedDates에 추가
        setStockAllowedDates(stockDates);
        
        return sortedSnapshots;
      } else {
        setSelectedStockSnapshots([]);
        return [];
      }
    } catch (error) {
      console.error("Failed to fetch stock snapshots:", error);
      setSelectedStockSnapshots([]);
      return [];
    } finally {
      setIsStockSnapshotsLoading(false);
    }
  };

  const handleStockClick = async (stockCode: string) => {
    // 이전 종목 스냅샷과 그룹 스냅샷 초기화
    setSelectedStockSnapshots([]);
    setCurrentStockSnapshotIndex(0);
    setGroupedSnapshots([]);
    setCurrentGroupedSnapshotIndex(0);

    // 종목 선택 상태 업데이트 (그룹 선택은 유지)
    setSelectedStockCode(stockCode);

    // 그룹이 선택된 상태인지 확인
    if (selectedGroupId !== null) {
      // 그룹이 선택된 상태에서는 종목별 스크랩을 조회하지 않음
      // 대신 그룹 상세 정보에서 해당 종목만 필터링하여 표시
      
      // 그룹 상세 정보에서 해당 종목만 필터링
      const filteredSnapshots = groupDetailSnapshots.filter(
        snapshot => snapshot.stockCode === stockCode
      );
      
      if (filteredSnapshots.length > 0) {
        // GroupDetailResponseDto를 MemberStockSnapshotDetailResponseDto로 변환
        const convertedSnapshots: MemberStockSnapshotDetailResponseDto[] = filteredSnapshots.map(snapshot => ({
          ...snapshot,
          isScrap: snapshot.scrap // scrap 필드를 isScrap으로 매핑
        }));
        
        // 필터링된 스냅샷을 selectedStockSnapshots에 설정
        setSelectedStockSnapshots(convertedSnapshots);
        setCurrentStockSnapshotIndex(0);
        
        // 날짜별로 그룹화
        const snapshotsByDate: { [date: string]: GroupDetailResponseDto[] } = {};
        filteredSnapshots.forEach(snapshot => {
          const date = snapshot.snapshotCreatedAt.split("T")[0];
          if (!snapshotsByDate[date]) {
            snapshotsByDate[date] = [];
          }
          snapshotsByDate[date].push(snapshot);
        });
        
        // 날짜 목록 (오름차순 정렬)
        const dates = Object.keys(snapshotsByDate).sort();
        
        if (dates.length > 0) {
          // 가장 최근 날짜 선택
          const targetDate = dates[dates.length - 1];
          setSelectedDate(targetDate);
        }
      } else {
        setSelectedStockSnapshots([]);
        setCurrentStockSnapshotIndex(0);
      }
      
      setActiveView("stock");
      return;
    }

    // 전체 모드에서만 종목별 스크랩 조회
    const snapshots = await fetchStockSnapshots(stockCode);

    // 종목별 카드가 있는 가장 가까운 날짜로 이동하고 마지막 카드가 가운데에 위치하도록 설정
    if (snapshots && snapshots.length > 0) {
      // 날짜별로 그룹화
      const snapshotsByDate: { [date: string]: MemberStockSnapshotDetailResponseDto[] } = {};
      snapshots.forEach(snapshot => {
        const date = snapshot.snapshotCreatedAt.split("T")[0];
        if (!snapshotsByDate[date]) {
          snapshotsByDate[date] = [];
        }
        snapshotsByDate[date].push(snapshot);
      });
      
      // 날짜 목록 (오름차순 정렬)
      const dates = Object.keys(snapshotsByDate).sort();
      
      if (dates.length > 0) {
        // 가장 최근 날짜 선택
        const targetDate = dates[dates.length - 1];
        
        // 해당 날짜의 마지막 카드 인덱스 찾기
        const targetDateSnapshots = snapshotsByDate[targetDate];
        const targetIndex = snapshots.findIndex(s => s.snapshotId === targetDateSnapshots[targetDateSnapshots.length - 1].snapshotId);
        
        // 날짜와 인덱스 설정
        setSelectedDate(targetDate);
        setCurrentStockSnapshotIndex(targetIndex);
      }
    }

    // activeView를 "stock"으로 변경하여 CardViewer가 표시되도록 함
    setActiveView("stock");
  };

  const fetchGroupedSnapshots = async (groupId: number) => {
    setIsGroupedSnapshotsLoading(true);
    try {
      const response = await fetchWithAuthCheck(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrapgrouped/${groupId}`,
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

  // 그룹 상세 정보 가져오기
  const fetchGroupDetail = async (groupId: number) => {
    setIsGroupDetailLoading(true);
    try {
      const response = await fetchWithAuthCheck(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrapgrouped/detail/${groupId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
        router
      );

      if (response?.status && response.data) {
        const snapshots: GroupDetailResponseDto[] = response.data;
        
        setGroupDetailSnapshots(snapshots);
        setCurrentGroupDetailIndex(0);

        // 그룹 상세 정보가 로드되면 첫 번째 스냅샷의 날짜로 selectedDate 설정
        if (snapshots.length > 0) {
          const firstSnapshotDate = snapshots[0].snapshotCreatedAt.split("T")[0];
          setSelectedDate(firstSnapshotDate);
        }

        // 이미지 프리로드
        snapshots.forEach((snapshot) => {
          preloadImage(snapshot.newsImage);
          if (snapshot.stockCode) {
            preloadImage(`/ticker-icon/${snapshot.stockCode}.png`);
          }
        });
      } else {
        setGroupDetailSnapshots([]);
      }
    } catch (error) {
      console.error("Failed to fetch group detail:", error);
      setGroupDetailSnapshots([]);
    } finally {
      setIsGroupDetailLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);

      // 스크랩 그룹과 포트폴리오를 동시에 요청하여 병렬로 처리
      await Promise.all([
        fetchGroups(),
        fetchAllPortfolio(),
        fetchMemberStocks(),
      ]);

      // 페이지 접근 시 '전체'가 클릭 상태가 되도록 설정
      setSelectedGroupId(null);
      setActiveView("stocklist");

      setIsLoading(false);
    };

    fetchInitialData();
  }, [router]);

  const handleGroupChange = async (groupId: number | null) => {
    // 종목 선택 해제
    setSelectedStockCode(null);
    setStockAllowedDates([]); // 종목별 날짜 초기화

    // 그룹 선택 시 종목별 스크랩 데이터 초기화
    setSelectedStockSnapshots([]);
    setCurrentStockSnapshotIndex(0);

    setSelectedGroupId(groupId);

    if (groupId !== null) {
      // 특정 그룹이 선택된 경우 해당 그룹의 상세 정보 조회
      await fetchGroupDetail(groupId);
      setActiveView("stock");
    } else {
      // 전체가 선택된 경우 오늘 날짜 유지
      const today = new Date();
      setSelectedDate(today.toISOString().split("T")[0]);
      setSelectedStockSnapshots([]);
      setGroupedSnapshots([]);
      setGroupDetailSnapshots([]);
      setActiveView("stocklist");
    }
  };

  const handleDateChange = async (date: string) => {
    if (date === selectedDate) {
      return;
    }

    // 선택하려는 날짜에 카드가 있는지 확인
    const snapshotsForNewDate = groupDetailSnapshotsByDate[date] || [];

    setSelectedDate(date);
    setCurrentSnapshotIndex(0);
    setCurrentStockSnapshotIndex(0); // 종목 스크랩 인덱스도 초기화
    setCurrentGroupDetailIndex(0); // 그룹 상세 정보 인덱스도 초기화
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

  // 종목별 스크랩 데이터가 로드되면 가장 최근 날짜로 이동
  useEffect(() => {
    if (selectedStockSnapshots.length > 0 && selectedStockCode) {
      const dates = selectedStockSnapshots
        .map((snapshot) => snapshot.snapshotCreatedAt.split("T")[0])
        .sort();
      
      if (dates.length > 0) {
        const mostRecentDate = dates[dates.length - 1]; // 가장 최근 날짜
        setSelectedDate(mostRecentDate);
      }
    }
  }, [selectedStockSnapshots, selectedStockCode]);

  // 그룹 상세 정보가 로드되면 가장 최근 날짜로 이동 (처음 로드 시에만)
  useEffect(() => {
    if (groupDetailSnapshots.length > 0 && selectedGroupId !== null) {
      const dates = groupDetailSnapshots
        .map((snapshot) => snapshot.snapshotCreatedAt.split("T")[0])
        .sort();
      
      if (dates.length > 0) {
        const mostRecentDate = dates[dates.length - 1]; // 가장 최근 날짜
        
        // 그룹이 처음 로드되었을 때만 최근 날짜로 이동
        // selectedDate가 오늘 날짜이거나 그룹 상세 정보의 날짜 범위에 없을 때만 이동
        const today = new Date().toISOString().split("T")[0];
        const isTodayOrInvalidDate = selectedDate === today || !dates.includes(selectedDate);
        
        if (isTodayOrInvalidDate && mostRecentDate !== selectedDate) {
          setSelectedDate(mostRecentDate);
          setCurrentGroupDetailIndex(0); // 인덱스도 초기화
        }
      }
    }
  }, [groupDetailSnapshots, selectedGroupId]); // selectedDate 의존성 제거

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
    // 그룹 상세 정보가 활성화된 경우
    if (groupDetailSnapshots.length > 0) {
      handleGroupDetailDateChange(direction === "left" ? "prev" : "next");
      return;
    }
    
    // 종목별 스크랩의 경우 단순 인덱스 기반 전환
    if (selectedStockSnapshots.length > 0) {
      const newIndex = direction === "left"
        ? Math.max(0, currentStockSnapshotIndex - 1)
        : Math.min(selectedStockSnapshots.length - 1, currentStockSnapshotIndex + 1);
      
      if (newIndex !== currentStockSnapshotIndex) {
        // 인덱스 변경 시 날짜도 함께 업데이트
        const targetCard = selectedStockSnapshots[newIndex];
        const targetDate = targetCard.snapshotCreatedAt.split("T")[0];
        
        setCurrentStockSnapshotIndex(newIndex);
        setSelectedDate(targetDate);
      }
      return;
    }
    
    // 일반 종목 스크랩의 경우 (기존 로직 유지)
    const idx = allowedDates.indexOf(selectedDate);
    const nextDate =
      direction === "left" ? allowedDates[idx - 1] : allowedDates[idx + 1];
    if (!nextDate) return;
    await handleDateChange(nextDate);
    setSelectedDate(nextDate);
    setActiveView("stocklist");
    setCurrentSnapshotIndex(0);
  };

  const handleStockSnapshotIndexChange = (newIndex: number) => {
    setCurrentStockSnapshotIndex(newIndex);
    
    // 종목별 카드에서 인덱스가 변경될 때 해당 카드의 날짜를 추적
    if (selectedStockSnapshots.length > 0 && newIndex < selectedStockSnapshots.length) {
      const currentCard = selectedStockSnapshots[newIndex];
      const cardDate = currentCard.snapshotCreatedAt.split("T")[0];
      
      // 카드의 날짜가 현재 선택된 날짜와 다르면 업데이트
      if (cardDate !== selectedDate) {
        setSelectedDate(cardDate);
      }
    }
  };

  const handleGroupedSnapshotIndexChange = (newIndex: number) => {
    setCurrentGroupedSnapshotIndex(newIndex);
  };

  const handleGroupDetailIndexChange = (newIndex: number) => {
    setCurrentGroupDetailIndex(newIndex);
  };

  const handleGroupDetailDelete = async (snapshotId: number) => {
    try {
      // 해당 스냅샷의 scrapGroupedId 찾기
      const snapshot = groupDetailSnapshots.find(s => s.snapshotId === snapshotId);
      if (!snapshot || !snapshot.scrapGroupedId) {
        console.error("scrapGroupedId not found for snapshotId:", snapshotId);
        toast.error("삭제할 수 없습니다.");
        return;
      }

      // 그룹에서 스크랩 삭제 API 호출
      const response = await fetchWithAuthCheck(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrapgrouped/delete`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ scrapGroupedId: snapshot.scrapGroupedId }),
        },
        router
      );

      if (response.status) {
        toast.success("그룹에서 제거되었습니다.");
        
        // 삭제된 카드를 목록에서 제거
        setGroupDetailSnapshots((prev) => {
          const filteredSnapshots = prev.filter((snapshot) => snapshot.snapshotId !== snapshotId);
          
          // 현재 인덱스 조정 - 자연스럽게 다음 카드로 이동
          setCurrentGroupDetailIndex((currentIndex) => {
            const deletedIndex = prev.findIndex(s => s.snapshotId === snapshotId);
            
            if (filteredSnapshots.length === 0) {
              // 모든 카드가 삭제된 경우
              return 0;
            } else if (deletedIndex === currentIndex) {
              // 현재 카드가 삭제된 경우
              // 현재 인덱스가 필터링된 배열의 범위를 벗어나면 마지막 카드로 이동
              if (currentIndex >= filteredSnapshots.length) {
                const newIndex = Math.max(0, filteredSnapshots.length - 1);
                return newIndex;
              } else {
                return currentIndex; // 같은 위치의 다음 카드
              }
            } else if (deletedIndex < currentIndex) {
              // 삭제된 카드가 현재 카드보다 앞에 있는 경우
              // 현재 인덱스를 1 감소 (삭제된 카드 때문에 앞으로 당겨짐)
              const newIndex = currentIndex - 1;
              return newIndex;
            } else {
              // 삭제된 카드가 현재 카드보다 뒤에 있는 경우
              // 현재 인덱스 유지
              return currentIndex;
            }
          });
          
          return filteredSnapshots;
        });
      } else {
        console.error("Group scrap delete failed:", response.message);
        toast.error(response.message || "그룹에서 제거에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to delete from group:", error);
      toast.error("그룹에서 제거 중 오류가 발생했습니다.");
    }
  };

  const handleStockSnapshotDelete = (snapshotId: number) => {
    // 삭제된 카드를 목록에서 제거
    setSelectedStockSnapshots((prev) => {
      const filteredSnapshots = prev.filter((snapshot) => snapshot.snapshotId !== snapshotId);
      
      // 현재 인덱스 조정 - 자연스럽게 다음 카드로 이동
      setCurrentStockSnapshotIndex((currentIndex) => {
        const deletedIndex = prev.findIndex(s => s.snapshotId === snapshotId);
        
        if (filteredSnapshots.length === 0) {
          // 모든 카드가 삭제된 경우
          return 0;
        } else if (deletedIndex === currentIndex) {
          // 현재 카드가 삭제된 경우
          // 현재 인덱스가 필터링된 배열의 범위를 벗어나면 마지막 카드로 이동
          if (currentIndex >= filteredSnapshots.length) {
            return Math.max(0, filteredSnapshots.length - 1);
          } else {
            return currentIndex; // 같은 위치의 다음 카드
          }
        } else if (deletedIndex < currentIndex) {
          // 삭제된 카드가 현재 카드보다 앞에 있는 경우
          // 현재 인덱스를 1 감소 (삭제된 카드 때문에 앞으로 당겨짐)
          return currentIndex - 1;
        } else {
          // 삭제된 카드가 현재 카드보다 뒤에 있는 경우
          // 현재 인덱스 유지
          return currentIndex;
        }
      });
      
      return filteredSnapshots;
    });
  };

  const handleStockSnapshotDateChange = (direction: "prev" | "next") => {
    // 종목별 카드는 단순 인덱스 기반 전환
    const newIndex = direction === "prev" 
      ? Math.max(0, currentStockSnapshotIndex - 1)
      : Math.min(selectedStockSnapshots.length - 1, currentStockSnapshotIndex + 1);
    
    if (newIndex !== currentStockSnapshotIndex) {
      // 인덱스 변경 시 날짜도 함께 업데이트
      const targetCard = selectedStockSnapshots[newIndex];
      const targetDate = targetCard.snapshotCreatedAt.split("T")[0];
      
      setCurrentStockSnapshotIndex(newIndex);
      setSelectedDate(targetDate);
    }
  };

  // 그룹 상세 정보용 날짜 변경 함수
  const handleGroupDetailDateChange = (direction: "prev" | "next") => {
    const currentDateIndex = groupDetailAllowedDates.indexOf(selectedDate);
    if (direction === "prev" && currentDateIndex > 0) {
      const prevDate = groupDetailAllowedDates[currentDateIndex - 1];
      handleDateChange(prevDate);
      // 이전 날짜의 마지막 카드로 이동
      const prevDateSnapshots = groupDetailSnapshotsByDate[prevDate] || [];
      if (prevDateSnapshots.length > 0) {
        setCurrentGroupDetailIndex(prevDateSnapshots.length - 1);
      }
    } else if (
      direction === "next" &&
      currentDateIndex < groupDetailAllowedDates.length - 1
    ) {
      const nextDate = groupDetailAllowedDates[currentDateIndex + 1];
      handleDateChange(nextDate);
      // 다음 날짜의 첫 번째 카드로 이동
      setCurrentGroupDetailIndex(0);
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

  // GroupDetailResponseDto를 SnapshotCard 형식으로 변환
  const convertGroupDetailToSnapshotCard = (
    groupDetail: GroupDetailResponseDto
  ): SnapshotCard => {
    return {
      snapshotId: groupDetail.snapshotId,
      snapshotCreatedAt: groupDetail.snapshotCreatedAt,
      personalizedComment: groupDetail.personalizedComment,
      stockCode: groupDetail.stockCode,
      stockName: groupDetail.stockName,
      newsContent: groupDetail.newsContent,
      newsImage: groupDetail.newsImage,
    };
  };

  const handleAddGroup = () => {
    setIsAddGroupDialogOpen(true);
  };

  const handleCreateGroup = async (groupName: string) => {
    setIsAddingGroup(true);
    try {
      const response = await fetchWithAuthCheck(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrapgroup/push`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ scrapGroupName: groupName }),
        },
        router
      );

      if (response.status) {
        toast.success("그룹이 성공적으로 추가되었습니다.");
        setIsAddGroupDialogOpen(false);

        // 그룹 목록 새로고침
        await fetchGroups();
      } else {
        toast.error(response.message || "그룹 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to create group:", error);
      toast.error("그룹 추가 중 오류가 발생했습니다.");
    } finally {
      setIsAddingGroup(false);
    }
  };

  const handleUpdateGroupName = async (groupId: number, newName: string) => {
    try {
      const response = await fetchWithAuthCheck(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrapgroup/groupnameupdate`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ 
            scrapGroupId: groupId, 
            scrapGroupName: newName 
          }),
        },
        router
      );

      if (response.status) {
        // 그룹 목록 새로고침
        await fetchGroups();
      } else {
        throw new Error(response.message || "그룹 이름 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to update group name:", error);
      throw error;
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    try {
      const response = await fetchWithAuthCheck(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrapgroup/delete`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ scrapGroupId: groupId }),
        },
        router
      );

      if (response.status) {
        // 그룹 목록 새로고침
        await fetchGroups();
        
        // 삭제된 그룹이 현재 선택된 그룹이면 /scrap으로 리다이렉팅
        if (selectedGroupId === groupId) {
          setSelectedGroupId(null);
          setSelectedStockCode(null);
          setSelectedStockSnapshots([]);
          setGroupDetailSnapshots([]);
          setActiveView("stocklist");
          router.push("/scrap");
        }
      } else {
        throw new Error(response.message || "그룹 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to delete group:", error);
      throw error;
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

  const handleScrapClick = async (
    snapshotId: number
  ): Promise<number | null> => {
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
      if (statusResponse.data?.isScrap && statusResponse.data?.scrapId) {
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
          toast.success("스크랩에서 제거되었습니다.");
        } else {
          throw new Error(
            deleteResponse.message || "스크랩 제거에 실패했습니다."
          );
        }
      } else {
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
          selectedStockCode={selectedStockCode}
          onGroupNameUpdate={handleUpdateGroupName}
          onGroupDelete={handleDeleteGroup}
        />
      </div>

      <div className="relative flex-1">
        <main 
          className={`absolute inset-0 flex items-center justify-center ${
            selectedGroupId === null && activeView === "stocklist" && unifiedStocks && unifiedStocks?.stocks 
              ? "top-0" 
              : "top-[5px]"
          }`}
        >
          {/* 보유 종목 리스트 표시 */}
          {selectedGroupId === null &&
          activeView === "stocklist" &&
          unifiedStocks &&
          unifiedStocks?.stocks ? (
            <ScrapStockList
              unifiedStocks={unifiedStocks}
              onStockClick={handleStockClick}
              selectedStockCode={selectedStockCode}
            />
          ) : (
            <>
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
              ) : isGroupDetailLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p>그룹 상세 정보 로딩 중...</p>
                </div>
              ) : selectedGroupId !== null && groupDetailSnapshots.length > 0 ? (
                <ScrapCardViewer
                  cards={currentGroupDetailSnapshots.map(convertGroupDetailToSnapshotCard)}
                  currentIndex={currentGroupDetailIndex}
                  onScrap={handleScrapClick}
                  onUnscrap={handleGroupDetailDelete}
                  onDateChange={handleGroupDetailDateChange}
                  onIndexChange={handleGroupDetailIndexChange}
                  onCardDelete={handleGroupDetailDelete}
                  isGroupDetail={true}
                  onViewChange={setActiveView}
                />
              ) : filteredStockSnapshots.length > 0 ? (
                <ScrapCardViewer
                  cards={filteredStockSnapshots.map(convertToSnapshotCard)}
                  currentIndex={currentStockSnapshotIndex}
                  onScrap={handleScrapClick}
                  onUnscrap={handleUnscrapClick}
                  onDateChange={handleStockSnapshotDateChange}
                  onIndexChange={handleStockSnapshotIndexChange}
                  onCardDelete={handleStockSnapshotDelete}
                  isStockDetail={true}
                  onViewChange={setActiveView}
                />
              ) : groupedSnapshots.length > 0 ? (
                <ScrapCardViewer
                  cards={groupedSnapshots.map(convertGroupedToSnapshotCard)}
                  currentIndex={currentGroupedSnapshotIndex}
                  onScrap={handleScrapClick}
                  onUnscrap={handleUnscrapClick}
                  onIndexChange={handleGroupedSnapshotIndexChange}
                  onViewChange={setActiveView}
                />
              ) : currentSnapshot ? (
                <ScrapCardViewer
                  cards={currentSnapshots}
                  currentIndex={currentSnapshotIndex}
                  onScrap={handleScrapClick}
                  onUnscrap={handleUnscrapClick}
                  onIndexChange={handleGroupedSnapshotIndexChange}
                  onViewChange={setActiveView}
                />
              ) : activeView === "stock" &&
                selectedStockCode &&
                filteredStockSnapshots.length === 0 &&
                !isStockSnapshotsLoading &&
                !isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p>해당 날짜의 스크랩이 없습니다.</p>
                </div>
              ) : selectedGroupId !== null &&
                groupDetailSnapshots.length > 0 &&
                currentGroupDetailSnapshots.length === 0 &&
                !isGroupDetailLoading &&
                !isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p>해당 날짜의 그룹 스크랩이 없습니다.</p>
                </div>
              ) : selectedGroupId !== null &&
                !isGroupDetailLoading &&
                !isGroupedSnapshotsLoading &&
                !isLoading &&
                groupDetailSnapshots.length === 0 &&
                groupedSnapshots.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p>해당 그룹의 스크랩이 없습니다.</p>
                </div>
              ) : activeView === "stock" &&
                !currentSnapshot &&
                !isLoading &&
                selectedStockSnapshots.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p>스크랩이 없습니다.</p>
                </div>
              ) : (!unifiedStocks ||
                !unifiedStocks.stocks ||
                unifiedStocks.stocks.length === 0) &&
                !isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p>보유 종목이 없습니다.</p>
                </div>
              ) : null}
            </>
          )}
        </main>
        {/* TrebleSelector - 보유 종목이 보일 때는 숨김 */}
        <div
          className="relative z-40"
          style={{
            display:
              activeView === "stocklist" && !selectedStockCode
                ? "none"
                : "block",
          }}
        >
          <TrebleSelector
            activeView={activeView as "date" | "stock"}
            onViewChange={setActiveView}
            selectedGroupId={selectedGroupId}
            onGroupSelect={handleGroupChange}
            groups={groups}
            onAddGroup={handleAddGroup}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            snapshotsForDate={
              groupDetailSnapshots.length > 0
                ? currentGroupDetailSnapshots.map(convertGroupDetailToSnapshotCard)
                : selectedStockSnapshots.length > 0
                ? filteredStockSnapshots.map(convertToSnapshotCard)
                : groupedSnapshots.length > 0
                ? groupedSnapshots.map(convertGroupedToSnapshotCard)
                : currentSnapshots
            }
            selectedSnapshotId={
              groupDetailSnapshots.length > 0
                ? currentGroupDetailSnapshots[currentGroupDetailIndex]?.snapshotId
                : selectedStockSnapshots.length > 0
                ? filteredStockSnapshots[currentStockSnapshotIndex]?.snapshotId
                : groupedSnapshots.length > 0
                ? groupedSnapshots[currentGroupedSnapshotIndex]?.memberStockSnapshotId
                : currentSnapshot?.snapshotId
            }
            onStockChange={handleStockChange}
            allowedDates={
              groupDetailSnapshots.length > 0
                ? groupDetailAllowedDates
                : allowedDates
            }
            onStockEdge={handleStockEdge}
            portfolio={portfolio}
            onScrap={handleScrapClick}
            onStockClick={handleStockClick}
            unifiedStocks={unifiedStocks}
            hasStockSnapshots={
              groupDetailSnapshots.length > 0
                ? groupDetailSnapshots.length > 0
                : selectedStockSnapshots.length > 0
            }
            selectedStockCode={selectedStockCode}
            onIndexChange={
              groupDetailSnapshots.length > 0
                ? handleGroupDetailIndexChange
                : selectedStockSnapshots.length > 0
                ? handleStockSnapshotIndexChange
                : handleGroupedSnapshotIndexChange
            }
            isStockDetail={selectedStockSnapshots.length > 0}
          />
        </div>
      </div>
      <BottomNavigation />

      {/* 그룹 추가 다이얼로그 */}
      <AddGroupDialog
        isOpen={isAddGroupDialogOpen}
        onClose={() => setIsAddGroupDialogOpen(false)}
        onSubmit={handleCreateGroup}
        isLoading={isAddingGroup}
      />
    </div>
  );
}