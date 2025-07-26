"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import { StockHeader } from "@/src/components/stock-header";
import { KeyStats } from "@/src/components/key-stats";
import { StockChart } from "@/src/components/stock-chart";
import { NewsSection } from "@/src/components/news-section";
import type {
  OverseasStockDetail,
  OverseasStockDetailResponse,
} from "@/src/types/ApiResponse";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";

export default function EnhancedStockDetailPage() {
  const params = useParams();
  const stockCode = params.code as string;

  const [stockData, setStockData] = useState<OverseasStockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [earningCallDday, setEarningCallDday] = useState<string | null>(null);

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

    const fetchEarningCallDday = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_API_URL}/earning-calls/member`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          const earningCalls = data.data || [];
          const currentStockCalls = earningCalls.filter((call: any) => call.stockId === stockCode);
          if (currentStockCalls.length > 0) {
            const sorted = currentStockCalls.sort((a: any, b: any) => new Date(a.earningCallDate).getTime() - new Date(b.earningCallDate).getTime());
            const nextCall = sorted[0];
            const eventDate = new Date(nextCall.earningCallDate);
            const today = new Date();
            const timeDiff = eventDate.getTime() - today.getTime();
            const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));
            setEarningCallDday(`어닝콜 D-${daysUntil > 0 ? daysUntil : 0}`);
          } else {
            setEarningCallDday(null);
          }
        } else {
          setEarningCallDday(null);
        }
      } catch {
        setEarningCallDday(null);
      }
    };

    if (stockCode) {
      fetchStockDetail();
      fetchEarningCallDday();
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
    <div className="flex flex-col h-screen-full bg-gray-50">
      <TopNavigation
        showBackButton={true}
        title={stockData.etyp_nm || stockCode}
      />

      <main className="flex-1 overflow-y-auto pb-20 min-h-full">
        <div
          className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto w-full px-2 flex flex-col"
          style={{ minHeight: "calc(100vh - 56px - 56px)" }}
        >
          <div className="bg-white rounded-none shadow-sm w-full flex-1 flex flex-col min-h-0 p-0">
            <div className="flex items-center gap-2 mb-2 px-4 pt-4">
              <StockHeader stockData={stockData} stockCode={stockCode} earningCallDday={earningCallDday ?? undefined} />
            </div>
            <div className="px-2 pb-4 flex-1 flex flex-col min-h-0">
              <Tabs defaultValue="chart" className="w-full mt-10 flex-1 flex flex-col min-h-0">
                <TabsList className="w-full flex mb-0 bg-transparent">
                  <TabsTrigger
                    value="chart"
                    className="flex-1 w-full bg-transparent !bg-none data-[state=active]:bg-transparent data-[state=active]:border-b-[1.5px] data-[state=active]:border-black data-[state=active]:text-black border-b border-transparent rounded-none py-3 text-base font-semibold"
                  >
                    차트
                  </TabsTrigger>
                  <TabsTrigger
                    value="stats"
                    className="flex-1 w-full bg-transparent !bg-none data-[state=active]:bg-transparent data-[state=active]:border-b-[1.5px] data-[state=active]:border-black data-[state=active]:text-black border-b border-transparent rounded-none py-3 text-base font-semibold"
                  >
                    종목 정보
                  </TabsTrigger>
                  <TabsTrigger
                    value="news"
                    className="flex-1 w-full bg-transparent !bg-none data-[state=active]:bg-transparent data-[state=active]:border-b-[1.5px] data-[state=active]:border-black data-[state=active]:text-black border-b border-transparent rounded-none py-3 text-base font-semibold"
                  >
                    뉴스
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="chart" className="w-full pt-0 mt-0 flex-1 min-h-0">
                  <StockChart stockCode={stockCode} />
                </TabsContent>
                <TabsContent value="stats" className="w-full pt-0 mt-0 flex-1 min-h-0">
                  <KeyStats stockData={stockData} />
                </TabsContent>
                <TabsContent value="news" className="w-full pt-0 mt-0 flex-1 min-h-0">
                  <NewsSection stockCode={stockCode} companyName={stockData.etyp_nm} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
