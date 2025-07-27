"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import { StockHeader } from "@/src/components/stock-header";
import { KeyStats } from "@/src/components/key-stats";
import { UpcomingEvents } from "@/src/components/upcoming-events";
import { StockChart } from "@/src/components/stock-chart";
import { NewsSection } from "@/src/components/news-section";
import type {
  OverseasStockDetail,
  OverseasStockDetailResponse,
} from "@/src/types/ApiResponse";

export default function EnhancedStockDetailPage() {
  const params = useParams();
  const stockCode = params.code as string;

  const [stockData, setStockData] = useState<OverseasStockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_API_URL}/kis/stock-detail`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ stockCode }),
          }
        );

        if (response.ok) {
          const data: OverseasStockDetailResponse = await response.json();
          if (data.status && data.data.output) {
            setStockData(data.data.output);
          } else {
            setError("주식 데이터를 불러올 수 없습니다.");
          }
        } else {
          setError("API 요청에 실패했습니다.");
        }
      } catch (error) {
        console.error("주식 상세 정보 가져오기 실패:", error);
        setError("네트워크 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (stockCode) {
      fetchStockDetail();
    }
  }, [stockCode]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <TopNavigation showBackButton={true} title="주식 상세" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-500">
            데이터를 불러오는 중...
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (error || !stockData) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <TopNavigation showBackButton={true} title="주식 상세" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500 text-center p-4">
            {error || "데이터를 불러올 수 없습니다."}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopNavigation
        showBackButton={true}
        title={stockData.etyp_nm || stockCode}
      />

      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-[700px] w-full mx-auto px-4">
          {/* Stock Header - 종목명, 현재가, 등락률 */}
          <StockHeader stockData={stockData} stockCode={stockCode} />

          {/* 다가올 주요 이벤트 */}
          <UpcomingEvents stockCode={stockCode} />

          {/* 주가 차트 */}
          <StockChart stockCode={stockCode} />

          {/* 주요 지표 */}
          <KeyStats stockData={stockData} />

          {/* News Section - 관련 뉴스 */}
          <NewsSection stockCode={stockCode} companyName={stockData.etyp_nm} />
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
