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

// 타입 정의 생략 없이 포함
export type NewsItem = { id: number; title: string; time: string; };
export type StockItem = { id: number; name: string; code: string; price: number; change: number; changePercent: number; };
export type AssetTrendPoint = number;
export type AssetTrendData = { series: { name: string; data: AssetTrendPoint[] }[]; options: any; };
export type DisclosureItem = { disclosureId: number; disclosureTitle: string; disclosureDate: string; };
export type EarningCallItem = { id: number; title: string; date: string; content: string; };

export type NewsListResponse = { news: NewsItem[]; };
export type StockListResponse = { stocks: StockItem[]; companyLogos: Record<string, string>; };
export type AssetTrendResponse = { assetTrendData: AssetTrendData; };
export type DisclosureListResponse = { data: DisclosureItem[]; };
export type EarningCallListResponse = { earningCalls: EarningCallItem[]; };

// API 호출 함수
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

const fetchDisclosureList = async (): Promise<DisclosureListResponse> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACK_API_URL}/disclosure/my-current-disclosure`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("공시 데이터를 불러오지 못했습니다.");
  const jsonResponse = await res.json();
  if (jsonResponse.code !== "DISCLOSURE-001") throw new Error("공시 데이터를 불러오지 못했습니다.");
  return jsonResponse;
}

export async function fetchEarningCallList(): Promise<EarningCallListResponse> {
  const res = await fetch("/api/earning-calls");
  if (!res.ok) throw new Error("어닝콜 데이터를 불러오지 못했습니다.");
  return res.json();
}

// 색상 상수
const BLUE_MAIN = "#5B9DF9";
const BLUE_GRADIENT_FROM = "#5B9DF9";
const BLUE_GRADIENT_TO = "#B3D8FD";
const BLUE_LINE = "#3B82F6";

// 초기값
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
  const [newsItems, setNewsItems] = useState(initialNews);
  const [stocks, setStocks] = useState(initialStocks);
  const [logos, setLogos] = useState(companyLogos);
  const [assetTrendData, setAssetTrendData] = useState(initialAssetTrend);
  const [disclosureData, setDisclosureData] = useState(initialDisclosures);
  const [earningCallData, setEarningCallData] = useState(initialEarningCalls);

  const [newsIndex, setNewsIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [tab, setTab] = useState<"공시" | "어닝콜">("공시");

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchNewsList()
      .then((res) => setNewsItems(Array.isArray(res.news) ? res.news : []))
      .catch(() => setNewsItems([
        { id: 1, title: "애플, 3분기 실적 발표 예정", time: "2시간 전" },
        { id: 2, title: "엔비디아 메모리 반도체 수요 증가", time: "4시간 전" },
        { id: 3, title: "메타 클라우드 사업 확장", time: "6시간 전" },
      ]));

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

    fetchAssetTrend()
      .then((res) => setAssetTrendData(res.assetTrendData))
      .catch(() => setAssetTrendData({
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
      }));

    fetchDisclosureList()
      .then((res) => setDisclosureData(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDisclosureData([]));

    fetchEarningCallList()
      .then((res) => setEarningCallData(res.earningCalls))
      .catch(() => setEarningCallData([]));
  }, []);

  useEffect(() => {
    if (newsItems.length === 0) return;
    timeoutRef.current = setTimeout(() => handleSlide("up"), 2000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [newsIndex, newsItems.length]);

  const handleSlide = (dir: "up" | "down" | "left" | "right") => {
    if (newsItems.length === 0) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      setNewsIndex((prev) =>
        dir === "up" || dir === "right"
          ? prev === newsItems.length - 1 ? 0 : prev + 1
          : prev === 0 ? newsItems.length - 1 : prev - 1
      );
    }, 300);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <TopNavigation showBackButton title="" />
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        <NewsSlider
          newsItems={newsItems}
          newsIndex={newsIndex}
          isAnimating={isAnimating}
          onClick={() => handleSlide("up")}
        />
        <AssetSummary />
        <StockList stocks={stocks} companyLogos={logos} />
        <AssetChart assetTrendData={assetTrendData} />
        <Card className="mb-2 rounded-xl border-0 w-full" style={{ maxWidth: "800px", margin: "0 auto" }} />
        <InfoTabs
          tab={tab}
          setTab={setTab}
          disclosureData={disclosureData
            .slice(0, 3)
            .map((item) => {
              return {
                id: item.disclosureId,
                title: item.disclosureTitle,
                date: item.disclosureDate,
              };
            })
          }
          earningCallData={earningCallData.slice(0, 3)}
        />
        <Card className="mb-2 rounded-xl border-0 w-full" style={{ maxWidth: "800px", margin: "0 auto" }} />
      </main>
      <BottomNavigation />
    </div>
  );
}
