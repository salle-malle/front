"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
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
  currentPrice: number;
};
export type DisclosureItem = { id: number; disclosureTitle: string; disclosureDate: string; stockId: string; stockName: string };
export type EarningCallItem = { earningCallId: number; ticker: string; date: string; name: string };
export type NewsListResponse = { news: NewsItem[] };
export type StockListResponse = { stocks: StockItem[]; companyLogos: Record<string, string>; summary?: { total_purchase_amount: number } };
export type DisclosureListResponse = { data: DisclosureItem[] };
export type MemberResponse = { memberName: string; memberNickname: string };
export type EarningCallListResponse = { data: { earningCalls: EarningCallItem[] } };

// 상대 시간 변환 함수
function getRelativeTime(dateString: string) {
  return dayjs(dateString).fromNow();
}

// 로그인 리다이렉트 중복 방지 변수
let hasRedirectedToLogin = false;

// 인증 체크 fetch 함수
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

// API 호출 함수들
const fetchMember = async (router: ReturnType<typeof useRouter>): Promise<MemberResponse> => {
  const jsonResponse = await fetchWithAuthCheck<any>(
    `${process.env.NEXT_PUBLIC_BACK_API_URL}/member/info`,
    {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    },
    router
  );
  return { memberName: jsonResponse.data.memberName, memberNickname: jsonResponse.data.memberNickname };
};

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
    currentPrice: item.current_price,
  }));

  return {
    stocks,
    companyLogos,
    summary,
  };
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

// 티커별 로고 생성 함수
function getCompanyLogosByTicker(stocks: StockItem[]): Record<string, string> {
  const logos: Record<string, string> = {};
  stocks.forEach((stock) => {
    logos[stock.ticker.toString()] = `/ticker-icon/${stock.ticker}.png`;
  });
  return logos;
}

// 초기값 정의
const initialNews: NewsItem[] = [];
const initialStocks: StockItem[] = [];
const initialDisclosures: DisclosureItem[] = [];
const initialEarningCalls: EarningCallItem[] = [];

// 섹션별 staggered mount 효과
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
  const [disclosureData, setDisclosureData] = useState(initialDisclosures);
  const [earningCallData, setEarningCallData] = useState(initialEarningCalls);
  const [newsIndex, setNewsIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tab, setTab] = useState<"공시" | "어닝콜">("공시");
  const [name, setName] = useState("");

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

    fetchMember(router)
      .then((res) => {
        setName(res.memberName);
      })
      .catch(() => {
        setName("");
      });
  }, [router]);

  useEffect(() => {
    if (newsItems.length === 0) return;
    timeoutRef.current = setTimeout(() => handleSlide("up"), 2200);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [newsIndex, newsItems.length]);

  // 슬라이드 핸들러
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

  // 섹션 스타일 반환
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
      <main className="flex-1 overflow-y-auto pb-20 p-0">
        <div className="max-w-[700px] w-full mx-auto px-4" style={getSectionStyle(0)}>
          <NewsSlider
            newsItems={newsItems}
            newsIndex={newsIndex}
            isAnimating={isAnimating}
            onClick={() => handleSlide("up")}
          />
        </div>
        <div className="max-w-[700px] w-full mx-auto px-4" style={getSectionStyle(1)}>
          <AssetSummary assetAmount={assetAmount} />
        </div>
        <div className="max-w-[700px] w-full mx-auto px-4" style={getSectionStyle(2)}>
          <StockList stocks={stocks} companyLogos={logos} />
        </div>
        <div className="max-w-[700px] w-full mx-auto px-4" style={getSectionStyle(3)}>
          <div className="max-w-[700px] w-full mx-auto px-4 mt-5 mb-2 text-semibold text-gray-800" style={getSectionStyle(2)}>
            {name}님을 위한 오늘의 코멘트예요
          </div>
          <AssetChart stocks={stocks} />
        </div>
        <div className="max-w-[700px] w-full mx-auto px-4" style={getSectionStyle(4)}>
          <InfoTabs
            tab={tab}
            setTab={setTab}
            disclosureData={disclosureData
              .slice(0, 3)
              .map((item) => ({
                id: item.id,
                title: item.disclosureTitle,
                date: getRelativeTime(item.disclosureDate),
              }))
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
