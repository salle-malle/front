"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { BarChart3, DollarSign, Activity, TrendingUp } from "lucide-react";
import type { OverseasStockDetail } from "@/src/types/ApiResponse";

interface KeyStatsProps {
  stockData: OverseasStockDetail;
}

export function KeyStats({ stockData }: KeyStatsProps) {
  const formatCurrency = (value: string) => {
    const num = Number.parseFloat(value);
    if (isNaN(num)) return "$0.00";
    return `$${num.toFixed(2)}`;
  };

  const formatNumber = (value: string) => {
    const num = Number.parseFloat(value);
    if (isNaN(num)) return "0";
    return num.toLocaleString();
  };

  const formatLargeNumber = (value: string) => {
    const num = Number.parseFloat(value);
    if (isNaN(num)) return "0";

    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const stats = [
    {
      icon: <DollarSign className="h-5 w-5" />,
      title: "시가총액",
      value: formatLargeNumber(stockData.tomv),
      subtitle: "Market Cap",
    },
    {
      icon: <Activity className="h-5 w-5" />,
      title: "거래량",
      value: formatNumber(stockData.pvol),
      subtitle: "Volume",
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-red-500" />,
      title: "52주 최고",
      value: formatCurrency(stockData.h52p),
      subtitle: "52W High",
      valueColor: "text-red-500",
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-blue-500 rotate-180" />,
      title: "52주 최저",
      value: formatCurrency(stockData.l52p),
      subtitle: "52W Low",
      valueColor: "text-blue-500",
    },
  ];

  const ratios = [
    { label: "PER", value: stockData.perx || "-", description: "주가수익비율" },
    {
      label: "PBR",
      value: stockData.pbrx || "-",
      description: "주가순자산비율",
    },
    { label: "EPS", value: stockData.epsx || "-", description: "주당순이익" },
    { label: "BPS", value: stockData.bpsx || "-", description: "주당순자산" },
  ];

  const priceData = [
    {
      label: "시가",
      value: formatCurrency(stockData.base),
      color: "text-gray-900",
    },
    {
      label: "고가",
      value: formatCurrency(stockData.high),
      color: "text-red-500",
    },
    {
      label: "저가",
      value: formatCurrency(stockData.low),
      color: "text-blue-500",
    },
    {
      label: "전일종가",
      value: formatCurrency(stockData.last || stockData.pxprc),
      color: "text-gray-900",
    },
  ];

  return (
    <div className="mx-4 mt-4 space-y-4">
      {/* 핵심 통계 */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-gray-900">
            <BarChart3 className="h-5 w-5 mr-2" />
            핵심 지표
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="p-2 bg-gray-50 rounded-lg">{stat.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {stat.title}
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      stat.valueColor || "text-gray-900"
                    }`}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 가격 정보 */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-gray-900">
            <DollarSign className="h-5 w-5 mr-2" />
            가격 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {priceData.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className={`font-semibold ${item.color}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 투자 비율 */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-gray-900">
            <Activity className="h-5 w-5 mr-2" />
            투자 비율
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {ratios.map((ratio, index) => (
              <div
                key={index}
                className="text-center p-3 bg-gray-50 rounded-lg"
              >
                <p className="text-xs text-gray-500 mb-1">
                  {ratio.description}
                </p>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {ratio.label}
                </p>
                <p className="text-xl font-bold text-gray-900">{ratio.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
