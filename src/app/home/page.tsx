"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import { Card } from "@/src/components/ui/card";
import AssetChart from "@/src/components/ui/asset-chart";
import NewsSlider from "@/src/components/ui/news-slider";
import StockList from "@/src/components/ui/stock-list";
import InfoTabs from "@/src/components/ui/info-tabs";
import AssetSummary from "@/src/components/ui/asset-summary";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
dayjs.extend(relativeTime);
dayjs.locale("ko");

export type NewsItem = { id: number; title: string; time: string };
export type StockItem = {
  ticker: number;
  name: string;
  avgPrice: number;
  profit_loss_amount: number;
  profit_loss_rate: number;
  quantity: number;
};
export type AssetTrendPoint = number;

export type AssetTrendData = { series: { name: string; data: AssetTrendPoint[] }[]; options: any; };
export type DisclosureItem = { disclosureId: number; disclosureTitle: string; disclosureDate: string; };
export type EarningCallItem = { earningCallId: number; ticker: string; date: string; name: string };
export type NewsListResponse = { news: NewsItem[]; };
export type StockListResponse = { stocks: StockItem[]; companyLogos: Record<string, string>; summary?: { total_purchase_amount: number } };
export type AssetTrendResponse = { assetTrendData: AssetTrendData; };
export type DisclosureListResponse = { data: DisclosureItem[]; };
export type EarningCallListResponse = { data: { earningCalls: EarningCallItem[] } };

function getRelativeTime(dateString: string) {
  return dayjs(dateString).fromNow();
}

let hasRedirectedToLogin = false;

async function fetchWithAuthCheck<T>(
  input: RequestInfo,
  init: RequestInit = {},
  router: ReturnType<typeof useRouter>
): Promise<T> {
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
  }
  if (!res.ok) {
    throw new Error(jsonResponse?.message || "데이터를 불러오지 못했습니다.");
  }
  return jsonResponse;
}

export async function fetchNewsList(router: ReturnType<typeof useRouter>): Promise<NewsListResponse> {
  const jsonResponse = await fetchWithAuthCheck<any>(
    `${process.env.NEXT_PUBLIC_BACK_API_URL}/main-news/current`,
    {},
    router
  );
  const news: NewsItem[] = (jsonResponse.data || []).map((item: any) => ({
    id: item.id,
    title: item.newsTitle,
    time: getRelativeTime(item.newsDate),
  }));
  return { news };
}

export async function fetchStockList(router: ReturnType<typeof useRouter>): Promise<StockListResponse> {
  const jsonResponse = await fetchWithAuthCheck<any>(
    `${process.env.NEXT_PUBLIC_BACK_API_URL}/kis/unified-stocks`,
    {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    },
    router
  );
  const stocksRaw =
    jsonResponse.data?.stocks ||
    jsonResponse.data?.stockList ||
    jsonResponse.data ||
    [];
  const companyLogos = jsonResponse.data?.companyLogos || {};
  const summary = jsonResponse.data?.summary || undefined;

  const stocks: StockItem[] = stocksRaw.slice(0, 6).map((item: any) => ({
    ticker: item.pdno,
    name: item.prdt_name,
    quantity: item.quantity,
    avgPrice: Math.round((Number(item.avg_price) + Number.EPSILON) * 100) / 100,
    profit_loss_amount:
      Math.round((Number(item.profit_loss_amount) + Number.EPSILON) * 100) /
      100,
    profit_loss_rate:
      Math.round((Number(item.profit_loss_rate) + Number.EPSILON) * 100) / 100,
  }));

  return {
    stocks,
    companyLogos,
    summary,
  };
}

export async function fetchAssetTrend(router: ReturnType<typeof useRouter>): Promise<AssetTrendResponse> {
  const jsonResponse = await fetchWithAuthCheck<any>(
    "/api/asset-trend",
    {},
    router
  );
  return jsonResponse;
}

const fetchDisclosureList = async (router: ReturnType<typeof useRouter>): Promise<DisclosureListResponse> => {
  const jsonResponse = await fetchWithAuthCheck<any>(
    `${process.env.NEXT_PUBLIC_BACK_API_URL}/disclosure/my-current-disclosure`,
    {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    },
    router
  );
  if (jsonResponse.code !== "DISCLOSURE-001")
    throw new Error("공시 데이터를 불러오지 못했습니다.");
  return jsonResponse;
};

export async function fetchEarningCallList(router: ReturnType<typeof useRouter>): Promise<EarningCallListResponse> {
  const jsonResponse = await fetchWithAuthCheck<any>(
    `${process.env.NEXT_PUBLIC_BACK_API_URL}/earning-calls/member/upcoming`,
    {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    },
    router
  );
  if (jsonResponse.code !== "EARNING-014") throw new Error("어닝콜 데이터를 불러오지 못했습니다.");

  const mappedData: EarningCallItem[] = (jsonResponse.data || []).map((item: any) => ({
    earningCallId: item.id,
    ticker: item.stockId,
    date: item.earningCallDate,
    name: item.stockName
  }));

  return {
    data: {
      earningCalls: mappedData
    }
  };
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

  const router = useRouter();

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    // 로그인 리다이렉트 중복 방지 초기화
    hasRedirectedToLogin = false;

    fetchNewsList(router)
      .then((res) => setNewsItems(Array.isArray(res.news) ? res.news : []))
      .catch(() => setNewsItems([]));

    fetchStockList(router)
      .then((res) => {
        setStocks(res.stocks);
        setLogos(getCompanyLogosByTicker(res.stocks));
        if (res.summary) {
          setAssetAmount(res.summary.total_purchase_amount);
        } else {
          setAssetAmount(0);
        }
      })
      .catch(() => {
        setStocks([]);
        setLogos({});
        setAssetAmount(0);
      });

    fetchAssetTrend(router)
      .then((res) => setAssetTrendData(res.assetTrendData))
      .catch(() =>
        setAssetTrendData({
          series: [
            { name: "자산", data: [1000, 1200, 1300, 1250, 1400, 1500, 1600] },
          ],
          options: {
            chart: {
              type: "line",
              height: 120,
              toolbar: { show: false },
              sparkline: { enabled: true },
            },
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

    fetchDisclosureList(router)
      .then((res) => setDisclosureData(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDisclosureData([]));

    fetchEarningCallList(router)
      .then((res) => {
        setEarningCallData(Array.isArray(res.data.earningCalls) ? res.data.earningCalls : []);
      })
      .catch(() => {
        setEarningCallData([]);
      });
  }, [router]);

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
          ? prev === newsItems.length - 1
            ? 0
            : prev + 1
          : prev === 0
          ? newsItems.length - 1
          : prev - 1
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
      <TopNavigation title="" />
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
          <Card
            className="mb-2 rounded-xl border-0 w-full"
            style={{ maxWidth: "800px", margin: "0 auto" }}
          />
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
                  date: getRelativeTime(item.disclosureDate),
                };
              })
            }
            earningCallData={earningCallData
              .slice(0, 3)
              .map((item) => ({
                id: item.earningCallId,
                title: item.name,
                date: getRelativeTime(item.date),
              }))
            }
          />
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
