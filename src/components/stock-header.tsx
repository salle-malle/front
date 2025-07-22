"use client";

import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { OverseasStockDetail } from "@/src/types/ApiResponse";

interface StockHeaderProps {
  stockData: OverseasStockDetail;
  stockCode: string;
}

export function StockHeader({ stockData, stockCode }: StockHeaderProps) {
  const formatCurrency = (value: string) => {
    const num = Number.parseFloat(value);
    if (isNaN(num)) return "$0.00";
    return `$${num.toFixed(2)}`;
  };

  const formatLargeNumber = (value: string) => {
    const num = Number.parseFloat(value);
    if (isNaN(num)) return "0";

    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const getPriceChangeData = () => {
    const currentPrice = Number.parseFloat(stockData.last);
    const changePercent = Number.parseFloat(stockData.txrat);
    const prevPrice = Number.parseFloat(stockData.base);
    const changeAmount = currentPrice - prevPrice;

    const isPositive = changePercent >= 0;
    const colorClass = isPositive ? "text-red-500" : "text-blue-500";
    const bgColorClass = isPositive ? "bg-red-50" : "bg-blue-50";
    const icon = isPositive ? (
      <TrendingUp className="h-5 w-5" />
    ) : (
      <TrendingDown className="h-5 w-5" />
    );

    return {
      colorClass,
      bgColorClass,
      icon,
      changeAmount: formatCurrency(changeAmount.toString()),
      changePercent: `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(
        2
      )}%`,
    };
  };

  const priceChange = getPriceChangeData();

  return (
    <Card className="mx-4 mt-4 shadow-sm border-0 bg-white">
      <CardContent className="p-6">
        {/* 종목명과 코드 */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {stockData.etyp_nm || stockCode}
            </h1>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {stockCode}
            </p>
          </div>
          <Badge
            variant="secondary"
            className="text-xs font-medium whitespace-nowrap"
          >
            {stockData.eicod || "해외주식"}
          </Badge>
        </div>

        {/* 현재가와 등락 정보 */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {formatCurrency(stockData.last || stockData.txprc)}
            </p>
            <p className="text-sm text-gray-500">현재가</p>
          </div>

          <div
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${priceChange.bgColorClass}`}
          >
            <div
              className={`flex items-center space-x-1 ${priceChange.colorClass}`}
            >
              {priceChange.icon}
              <span className="font-semibold text-lg">
                {priceChange.changePercent}
              </span>
            </div>
          </div>
        </div>

        {/* 등락폭과 거래량 */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">등락폭</p>
              <p className={`font-semibold ${priceChange.colorClass}`}>
                {priceChange.changeAmount}
              </p>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div>
              <p className="text-xs text-gray-500 mb-1">자본금</p>
              <p className="font-semibold text-gray-900">
                {formatLargeNumber(stockData.mcap)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
