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

export type NewsItem = { id: number; title: string; time: string; };
export type StockItem = { ticker: number; name: string; avgPrice: number; profit_loss_amount: number; profit_loss_rate: number; quantity : number };
export type AssetTrendPoint = number;
export type AssetTrendData = { series: { name: string; data: AssetTrendPoint[] }[]; options: any; };
export type DisclosureItem = { disclosureId: number; disclosureTitle: string; disclosureDate: string; };
export type EarningCallItem = { id: number; title: string; date: string; content: string; };

export type NewsListResponse = { news: NewsItem[]; };
export type StockListResponse = { stocks: StockItem[]; companyLogos: Record<string, string>; summary?: { total_purchase_amount: number } };
export type AssetTrendResponse = { assetTrendData: AssetTrendData; };
export type DisclosureListResponse = { data: DisclosureItem[]; };
export type EarningCallListResponse = { earningCalls: EarningCallItem[]; };

export async function fetchNewsList(): Promise<NewsListResponse> {
  const res = await fetch("/api/news");
  if (!res.ok) throw new Error("뉴스 데이터를 불러오지 못했습니다.");
  return res.json();
}

export async function fetchStockList(): Promise<StockListResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACK_API_URL}/kis/unified-stocks`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("종목 데이터를 불러오지 못했습니다.");
  const jsonResponse = await res.json();
  const stocksRaw = jsonResponse.data?.stocks || jsonResponse.data?.stockList || jsonResponse.data || [];
  const companyLogos = jsonResponse.data?.companyLogos || {};

  const summary = jsonResponse.data?.summary || undefined;

  const stocks: StockItem[] = stocksRaw.slice(0, 6).map((item: any) => ({
    ticker: item.pdno,
    name: item.prdt_name,
    quantity: item.quantity,
    avgPrice: Math.round((Number(item.avg_price) + Number.EPSILON) * 100) / 100,
    profit_loss_amount: Math.round((Number(item.profit_loss_amount) + Number.EPSILON) * 100) / 100,
    profit_loss_rate: Math.round((Number(item.profit_loss_rate) + Number.EPSILON) * 100) / 100,
  }));

  return {
    stocks,
    companyLogos,
    summary,
  };
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

function getCompanyLogosByTicker(stocks: StockItem[]): Record<string, string> {
  const logos: Record<string, string> = {};
  stocks.forEach((stock) => {
    logos[stock.ticker.toString()] = `/ticker-icon/${stock.ticker}.png`;
  });
  return logos;
}

const initialNews: NewsItem[] = [];
const initialStocks: StockItem[] = [];
const initialAssetTrend: AssetTrendData = {
  series: [{ name: "자산", data: [] }],
  options: {},
};
const initialDisclosures: DisclosureItem[] = [];
const initialEarningCalls: EarningCallItem[] = [];

function useStaggeredMount(count: number, delay: number = 60) {
  const [mountedIndexes, setMountedIndexes] = useState<number[]>([]);
  useEffect(() => {
    setMountedIndexes([]);
    let timeouts: NodeJS.Timeout[] = [];
    for (let i = 0; i < count; i++) {
      timeouts.push(
        setTimeout(() => {
          setMountedIndexes((prev) => [...prev, i]);
        }, i * delay)
      );
    }
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [count, delay]);
  return mountedIndexes;
}

export default function HomePage() {
  const [newsItems, setNewsItems] = useState(initialNews);
  const [assetAmount, setAssetAmount] = useState(0);
  const [stocks, setStocks] = useState(initialStocks);
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [assetTrendData, setAssetTrendData] = useState(initialAssetTrend);
  const [disclosureData, setDisclosureData] = useState(initialDisclosures);
  const [earningCallData, setEarningCallData] = useState(initialEarningCalls);
  const [newsIndex, setNewsIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [tab, setTab] = useState<"공시" | "어닝콜">("공시");

  const hasFetched = useRef(false);

  const sectionCount = 5;
  const mountedIndexes = useStaggeredMount(sectionCount, 60);

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
        setLogos(getCompanyLogosByTicker(res.stocks));
        if (res.summary) {
          setAssetAmount(res.summary.total_purchase_amount);
        } else {
          setAssetAmount(0);
        }
      })
      .catch((err) => {
        setStocks([]);
        setLogos({});
        setAssetAmount(0);
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
    timeoutRef.current = setTimeout(() => handleSlide("up"), 2200); // 2000ms -> 2200ms로 약간 여유를 줌
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
    }, 450);
  };

  const getSectionStyle = (idx: number) => ({
    opacity: mountedIndexes.includes(idx) ? 1 : 0,
    transform: mountedIndexes.includes(idx)
      ? "translateY(0px)"
      : "translateY(32px)",
    transition: "all 0.7s cubic-bezier(0.19, 1, 0.22, 1)",
    willChange: "opacity, transform",
  });

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <TopNavigation showBackButton title="" />
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        <div style={getSectionStyle(0)}>
          <NewsSlider
            newsItems={newsItems}
            newsIndex={newsIndex}
            isAnimating={isAnimating}
            onClick={() => handleSlide("up")}
          />
        </div>
        <div style={getSectionStyle(1)}>
          <AssetSummary assetAmount={assetAmount} />
        </div>
        <div style={getSectionStyle(2)}>
          <StockList stocks={stocks} companyLogos={logos} />
        </div>
        <div style={getSectionStyle(3)}>
          <AssetChart assetTrendData={assetTrendData} />
          <Card className="mb-2 rounded-xl border-0 w-full" style={{ maxWidth: "800px", margin: "0 auto" }} />
        </div>
        <div style={getSectionStyle(4)}>
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
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}