"use client";

import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { OverseasStockDetail } from "@/src/types/ApiResponse";
import { FaCircleDot } from "react-icons/fa6";

interface StockHeaderProps {
  stockData: OverseasStockDetail;
  stockCode: string;
  earningCallDday?: string;
}

export function StockHeader({ stockData, stockCode, earningCallDday }: StockHeaderProps) {
  const formatCurrency = (value: string) => {
    const num = Number.parseFloat(value);
    if (isNaN(num)) return "$0.00";
    return `$${num.toFixed(2)}`;
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
    <Card className="w-full mt-4 shadow-sm border-0 border-none bg-white">
      <CardContent className="p-6 w-full">
        <div className="flex items-start justify-between mb-5">
          <div>
            {earningCallDday && (
              <div className="mb-2 flex items-center">
                <span className="ml-[-4px] px-2 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium flex items-center gap-1">
                  <FaCircleDot className="text-xs" />
                  <span className="text-xs">{earningCallDday}</span>
                </span>
              </div>
            )}
            <div className="flex items-center mb-1">
              <h1 className="text-xl font-semibold text-gray-900">
                {stockData.etyp_nm || stockCode}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-normal text-gray-500 tracking-wider">
                {stockCode}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs font-medium">
            {stockData.eicod || "해외주식"}
          </Badge>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2">
            <p className="text-2xl font-semibold text-gray-900 mb-1">
              {formatCurrency(stockData.last || stockData.txprc)}
            </p>
            <span className={`text-base font-medium ${priceChange.colorClass}`}>
              {priceChange.changePercent}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
