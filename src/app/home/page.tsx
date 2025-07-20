"use client";

import { useEffect, useRef, useState } from "react";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import { Card } from "@/src/components/ui/card";
import AssetChart from "@/src/components/ui/asset-chart";
import NewsSlider from "@/src/components/ui/news-slider";
import StockList from "@/src/components/ui/stock-list";
import InfoTabs from "@/src/components/ui/info-tabs";
import AssetSummary from "@/src/components/ui/asset-summary";

export type NewsItem = {
  id: number;
  title: string;
  time: string;
};

export type StockItem = {
  id: number;
  name: string;
  code: string;
  price: number;
  change: number;
  changePercent: number;
};

export type AssetTrendPoint = number;
export type AssetTrendData = {
  series: { name: string; data: AssetTrendPoint[] }[];
  options: any;
};

export type DisclosureItem = {
  id: number;
  title: string;
  date: string;
  content: string;
};

export type EarningCallItem = {
  id: number;
  title: string;
  date: string;
  content: string;
};

// --- 백엔드 통신용 데이터 포맷 예시 ---
export type NewsListResponse = {
  news: NewsItem[];
};

export type StockListResponse = {
  stocks: StockItem[];
  companyLogos: Record<string, string>;
};

export type AssetTrendResponse = {
  assetTrendData: AssetTrendData;
};

export type DisclosureListResponse = {
  disclosures: DisclosureItem[];
};

export type EarningCallListResponse = {
  earningCalls: EarningCallItem[];
};

// --- API 함수 목킹 ---
export async function fetchNewsList(): Promise<NewsListResponse> {
  const res = await fetch("/api/news");
  if (!res.ok) throw new Error("뉴스 데이터를 불러오지 못했습니다.");
  return res.json();
}

export async function fetchStockList(): Promise<StockListResponse> {
  const res = await fetch("/api/stocks");
  if (!res.ok) throw new Error("종목 데이터를 불러오지 못했습니다.");
  return res.json();
}

export async function fetchAssetTrend(): Promise<AssetTrendResponse> {
  const res = await fetch("/api/asset-trend");
  if (!res.ok) throw new Error("자산 추이 데이터를 불러오지 못했습니다.");
  return res.json();
}

export async function fetchDisclosureList(): Promise<DisclosureListResponse> {
  const res = await fetch("/api/disclosures");
  if (!res.ok) throw new Error("공시 데이터를 불러오지 못했습니다.");
  return res.json();
}

export async function fetchEarningCallList(): Promise<EarningCallListResponse> {
  const res = await fetch("/api/earning-calls");
  if (!res.ok) throw new Error("어닝콜 데이터를 불러오지 못했습니다.");
  return res.json();
}

// --- 색상 상수 ---
const BLUE_MAIN = "#5B9DF9";
const BLUE_GRADIENT_FROM = "#5B9DF9";
const BLUE_GRADIENT_TO = "#B3D8FD";
const BLUE_LINE = "#3B82F6";

// --- 더미 데이터 (초기값) ---
const companyLogos: Record<string, string> = {
  AAPL: "/ticker-icon/APPL.png",
  META: "/ticker-icon/META.png",
  TSLA: "/ticker-icon/TSLA.png",
  WMT: "/ticker-icon/WMT.png",
};

const initialNews: NewsItem[] = [];
const initialStocks: StockItem[] = [];
const initialAssetTrend: AssetTrendData = {
  series: [{ name: "자산", data: [] }],
  options: {},
};
const initialDisclosures: DisclosureItem[] = [];
const initialEarningCalls: EarningCallItem[] = [];

export default function HomePage() {
  // 상태 정의
  const [newsItems, setNewsItems] = useState<NewsItem[]>(initialNews);
  const [stocks, setStocks] = useState<StockItem[]>(initialStocks);
  const [logos, setLogos] = useState<Record<string, string>>(companyLogos);
  const [assetTrendData, setAssetTrendData] = useState<AssetTrendData>(initialAssetTrend);
  const [disclosureData, setDisclosureData] = useState<DisclosureItem[]>(initialDisclosures);
  const [earningCallData, setEarningCallData] = useState<EarningCallItem[]>(initialEarningCalls);

  // 뉴스 슬라이더 상태
  const [newsIndex, setNewsIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 탭 상태
  const [tab, setTab] = useState<"공시" | "어닝콜">("공시");

  useEffect(() => {
    // 뉴스
    fetchNewsList()
      .then((res) => {
        // newsItems의 각 item이 title을 가지고 있는지 확인
        if (Array.isArray(res.news)) {
          const validNews = res.news.filter(
            (item) => typeof item === "object" && typeof item.title === "string"
          );
          setNewsItems(validNews);
        } else {
          setNewsItems([]);
        }
      })
      .catch(() =>
        setNewsItems([
          { id: 1, title: "애플, 3분기 실적 발표 예정", time: "2시간 전" },
          { id: 2, title: "엔비디아 메모리 반도체 수요 증가", time: "4시간 전" },
          { id: 3, title: "메타 클라우드 사업 확장", time: "6시간 전" },
        ])
      );

    // 종목
    fetchStockList()
      .then((res) => {
        setStocks(res.stocks);
        setLogos(res.companyLogos);
      })
      .catch(() => {
        setStocks([
          { id: 1, name: "애플", code: "AAPL", price: 71500, change: 1200, changePercent: 1.71 },
          { id: 2, name: "META", code: "META", price: 89400, change: -800, changePercent: -0.89 },
          { id: 3, name: "TESLA", code: "TSLA", price: 185000, change: 2500, changePercent: 1.37 },
          { id: 4, name: "WMT", code: "WMT", price: 185000, change: 2500, changePercent: 1.37 },
        ]);
        setLogos(companyLogos);
      });

    // 자산 추이
    fetchAssetTrend()
      .then((res) => setAssetTrendData(res.assetTrendData))
      .catch(() =>
        setAssetTrendData({
          series: [{ name: "자산", data: [1000, 1200, 1300, 1250, 1400, 1500, 1600] }],
          options: {
            chart: { type: "line", height: 120, toolbar: { show: false }, sparkline: { enabled: true } },
            stroke: { curve: "smooth", width: 3, colors: [BLUE_LINE] },
            xaxis: {
              categories: ["월", "화", "수", "목", "금", "토", "일"],
              labels: { show: false },
              axisBorder: { show: false },
              axisTicks: { show: false },
            },
            yaxis: { show: false },
            grid: { show: false },
            dataLabels: { enabled: false },
            tooltip: { enabled: false },
            fill: {
              type: "gradient",
              gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.3,
                opacityTo: 0.07,
                stops: [0, 100],
                colorStops: [
                  [
                    { offset: 0, color: BLUE_GRADIENT_FROM, opacity: 0.3 },
                    { offset: 100, color: BLUE_GRADIENT_TO, opacity: 0.07 },
                  ],
                ],
              },
            },
            colors: [BLUE_MAIN],
          },
        })
      );

    // 공시
    fetchDisclosureList()
      .then((res) => setDisclosureData(res.disclosures))
      .catch(() =>
        setDisclosureData([
          { id: 1, title: "애플, 자사주 매입 공시", date: "2025-06-01", content: "애플이 100억 달러 규모의 자사주 매입을 공시했습니다." },
          { id: 2, title: "테슬라, 신차 출시 공시", date: "2025-05-28", content: "테슬라가 새로운 전기차 모델을 출시한다고 공시했습니다." },
        ])
      );

    // 어닝콜
    fetchEarningCallList()
      .then((res) => setEarningCallData(res.earningCalls))
      .catch(() =>
        setEarningCallData([
          { id: 1, title: "애플 2분기 어닝콜", date: "2024-05-15", content: "애플의 2분기 실적 발표 어닝콜이 진행되었습니다." },
          { id: 2, title: "메타 1분기 어닝콜", date: "2024-04-20", content: "메타의 1분기 실적 발표 어닝콜이 진행되었습니다." },
        ])
      );
  }, []);

  useEffect(() => {
    if (newsItems.length === 0) return;
    timeoutRef.current = setTimeout(() => {
      handleSlide("up");
    }, 2000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [newsIndex, newsItems.length]);

  const handleSlide = (dir: "up" | "down" | "left" | "right") => {
    if (newsItems.length === 0) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      if (dir === "up" || dir === "right") {
        setNewsIndex((prev) => (prev === newsItems.length - 1 ? 0 : prev + 1));
      } else {
        setNewsIndex((prev) => (prev === 0 ? newsItems.length - 1 : prev - 1));
      }
    }, 300);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <TopNavigation showBackButton title="" />
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="flex items-center justify-between mb-1 px-2"></div>
        <NewsSlider
          newsItems={newsItems}
          newsIndex={newsIndex}
          isAnimating={isAnimating}
          onClick={() => handleSlide("up")}
        />
        <AssetSummary />
        <StockList stocks={stocks} companyLogos={logos} />
        <AssetChart assetTrendData={assetTrendData} />
        <Card
          className="mb-2 rounded-xl border-0 w-full"
          style={{
            maxWidth: "800px",
            width: "100%",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
        <InfoTabs
          tab={tab}
          setTab={setTab}
          disclosureData={disclosureData}
          earningCallData={earningCallData}
        />
        <Card
          className="mb-2 rounded-xl border-0 w-full"
          style={{
            maxWidth: "800px",
            width: "100%",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      </main>
      <BottomNavigation />
    </div>
  );
}
