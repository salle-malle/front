"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  BarChart3,
  DollarSign,
  Activity,
} from "lucide-react";
import {
  OverseasStockDetail,
  OverseasStockDetailResponse,
} from "@/src/types/ApiResponse";

export default function StockDetailPage() {
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

  const formatNumber = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0";
    return num.toLocaleString();
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "$0";
    return `$${num.toFixed(3)}`;
  };

  const getPriceChangeColor = (change: string) => {
    const num = parseFloat(change);
    if (isNaN(num)) return "text-gray-600";
    return num >= 0 ? "text-red-500" : "text-blue-500";
  };

  const getPriceChangeIcon = (change: string) => {
    const num = parseFloat(change);
    if (isNaN(num)) return null;
    return num >= 0 ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <TopNavigation showBackButton={true} title="주식 상세" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">데이터를 불러오는 중...</div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (error || !stockData) {
    return (
      <div className="flex flex-col h-screen">
        <TopNavigation showBackButton={true} title="주식 상세" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">
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
        {/* 주가 정보 카드 */}
        <Card className="m-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {stockData.etyp_nm || stockCode}
                </h2>
                <p className="text-sm text-gray-600">{stockCode}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {stockData.eicod || "해외주식"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 현재가 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">현재가</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stockData.base || stockData.txprc)}
                  </p>
                </div>
                <div
                  className={`flex items-center space-x-1 ${getPriceChangeColor(
                    stockData.txrat
                  )}`}
                >
                  {getPriceChangeIcon(stockData.txrat)}
                  <span className="text-lg font-semibold">
                    {stockData.txrat}%
                  </span>
                </div>
              </div>

              {/* 등락폭 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">등락폭</span>
                <span
                  className={`font-semibold ${getPriceChangeColor(
                    stockData.txdif
                  )}`}
                >
                  {(() => {
                    const currentPrice = parseFloat(
                      stockData.base || stockData.txprc
                    );
                    const prevPrice = parseFloat(
                      stockData.last || stockData.pxprc
                    );
                    const change = currentPrice - prevPrice;
                    return formatCurrency(change.toString());
                  })()}
                </span>
              </div>

              {/* 거래량 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">거래량</span>
                <span className="font-semibold">
                  {formatNumber(stockData.pvol)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 가격 정보 카드 */}
        <Card className="m-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              가격 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">시가</p>
                <p className="font-semibold">
                  {formatCurrency(stockData.open)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">고가</p>
                <p className="font-semibold text-red-500">
                  {formatCurrency(stockData.high)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">저가</p>
                <p className="font-semibold text-blue-500">
                  {formatCurrency(stockData.low)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">전일종가</p>
                <p className="font-semibold">
                  {formatCurrency(stockData.last || stockData.pxprc)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 투자 지표 카드 */}
        <Card className="m-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              투자 지표
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">PER</p>
                <p className="font-semibold">{stockData.perx || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">PBR</p>
                <p className="font-semibold">{stockData.pbrx || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">EPS</p>
                <p className="font-semibold">{stockData.epsx || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">BPS</p>
                <p className="font-semibold">{stockData.bpsx || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 52주 정보 카드 */}
        <Card className="m-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              52주 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">52주 최고가</span>
                <span className="font-semibold text-red-500">
                  {formatCurrency(stockData.h52p)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">52주 최저가</span>
                <span className="font-semibold text-blue-500">
                  {formatCurrency(stockData.l52p)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">시가총액</span>
                <span className="font-semibold">
                  {formatNumber(stockData.mcap)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 매매 버튼 */}
        <div className="m-4 space-y-3">
          <Button className="w-full bg-red-500 hover:bg-red-600">매수</Button>
          <Button className="w-full bg-blue-500 hover:bg-blue-600">매도</Button>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
